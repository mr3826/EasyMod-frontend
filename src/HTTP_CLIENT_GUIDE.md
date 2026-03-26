# HTTP Client Integration Guide

## Overview

The HTTP client provides:
- ✅ Centralized API communication
- ✅ Automatic auth token injection
- ✅ **Multi-tenant shop ID injection** (NEW)
- ✅ Automatic retry with exponential backoff
- ✅ Error normalization
- ✅ 401 Unauthorized handling

---

## Setup

### 1. Initialize App with Providers

```tsx
// main.tsx or App.tsx root
import { AuthProvider } from '@/shared/lib/auth/AuthContext';
import { RBACProvider } from '@/shared/lib/rbac/RBACContext';
import { ShopProvider } from '@/shared/context/ShopContext';
import { useHttpShopId } from '@/shared/lib/http';
import { Router } from './router';

function App() {
  // Must be inside AuthProvider (for user data)
  return (
    <AuthProvider>
      <RBACProvider>
        <AppContent />
      </RBACProvider>
    </AuthProvider>
  );
}

// Separate component to use ShopProvider and sync HTTP client
function AppContent() {
  // Get user shops from auth (pseudo-code)
  const { user } = useAuth();
  const shops = user?.shops || [];

  return (
    <ShopProvider shops={shops} defaultShopId={shops[0]?.id}>
      <HttpSyncComponent />
    </ShopProvider>
  );
}

// Hook up HTTP client with shop context
function HttpSyncComponent() {
  useHttpShopId(); // ⭐ Syncs shop changes to HTTP client

  return <Router />;
}
```

### 2. Basic Usage

```tsx
import { httpClient } from '@/shared/lib/http';

// All requests automatically include:
// - Authorization: Bearer <token>
// - X-Shop-ID: <currentShopId>

async function fetchProducts() {
  const response = await httpClient.get('/api/products');
  // Request headers include X-Shop-ID automatically
  return response.data;
}

async function createProduct(data: any) {
  const response = await httpClient.post('/api/products', data);
  // Shop ID is automatically injected
  return response.data;
}
```

---

## Multi-Tenant Features

### Automatic Shop ID Injection

When `useHttpShopId()` is called in your app, all requests automatically include the shop ID:

```
Request headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Shop-ID: shop_123abc
Content-Type: application/json
```

### Switch Shops

```tsx
import { useShop } from '@/shared/context/ShopContext';

function ShopSwitcher() {
  const { currentShop, shops, switchShop } = useShop();

  return (
    <div>
      <p>Current: {currentShop?.name}</p>
      
      <select onChange={(e) => switchShop(e.target.value)}>
        {shops.map((shop) => (
          <option key={shop.id} value={shop.id}>
            {shop.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// When user selects a different shop:
// 1. ShopContext updates currentShopId
// 2. useHttpShopId hook detects change
// 3. httpClient.setShopId() is called
// 4. All subsequent requests use new shop ID
```

### Skip Shop ID for Specific Requests

Some endpoints don't require shop scoping:

```tsx
// Skip shop ID injection for this request
const config = httpClient.skipShopIdConfig();
const response = await httpClient.get('/api/public/info', config);

// Or with additional config
const config = httpClient.skipShopIdConfig({
  headers: { 'X-Custom-Header': 'value' }
});
const response = await httpClient.get('/api/endpoint', config);
```

---

## Backend Integration

### Middleware to Extract Shop ID

```typescript
// backend/middleware/shopIdInjector.ts
import { Request, Response, NextFunction } from 'express';

export function shopIdInjector(req: Request, res: Response, next: NextFunction) {
  const shopId = req.headers['x-shop-id'] as string;

  if (!shopId) {
    return res.status(400).json({ error: 'Missing X-Shop-ID header' });
  }

  // Attach to request for use in controllers
  req.shopId = shopId;

  // Verify user has access to this shop (from auth token)
  // This is critical for security!
  const userId = req.user?.id;
  const userShops = req.user?.shops || [];

  if (!userShops.find((s: any) => s.id === shopId)) {
    return res.status(403).json({ error: 'Unauthorized for this shop' });
  }

  next();
}

// Apply to all protected routes
app.use('/api/*', authenticate, shopIdInjector);
```

### Query Scoping

```typescript
// Automatically scope queries to current shop
app.get('/api/products', (req: Request, res: Response) => {
  const shopId = req.shopId; // From middleware

  // ⭐ Always scope queries to shop
  const products = Product.where({ shopId });
  
  res.json(products);
});
```

---

## Error Handling

### 401 Unauthorized

```tsx
// Automatic handling:
// 1. Clears auth token from localStorage
// 2. Redirects to /login
// No additional code needed
```

### Network Errors - Auto Retry

```tsx
// Automatic retry with exponential backoff:
// Request 1: fails immediately
// Request 2: retry after 1000ms
// Request 3: retry after 2000ms
// Request 4: retry after 4000ms
// If all fail: throw normalized error

try {
  const data = await httpClient.get('/api/products');
} catch (error) {
  const normalizedError = error as NormalizedApiError;
  console.error(normalizedError.message);
}
```

### Validation Errors

```tsx
import { getValidationErrors } from '@/shared/lib/http';

try {
  await httpClient.post('/api/products', { name: '' });
} catch (error) {
  const validationErrors = getValidationErrors(error);
  // { name: ['Name is required'] }
  
  validationErrors.forEach((field, errors) => {
    console.error(`${field}: ${errors.join(', ')}`);
  });
}
```

---

## Advanced Usage

### Custom Headers & Config

```tsx
// Pass config to any request
const response = await httpClient.post(
  '/api/products',
  { name: 'New Product' },
  {
    headers: { 'X-Custom-Header': 'value' },
    timeout: 60000, // 60 seconds
  }
);

// Config is merged with default headers (shopId, auth, content-type)
```

### Direct Axios Access

```tsx
// For advanced use cases, access raw axios instance
const axios = httpClient.getAxiosInstance();

// Add custom interceptors
axios.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => Promise.reject(error)
);
```

### Get Current Shop ID

```tsx
// From HTTP client
const shopId = httpClient.getShopId();
console.log('Current shop:', shopId);

// From context (inside React component)
const { currentShopId } = useShop();
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `X-Shop-ID` header is missing | Ensure `useHttpShopId()` is called at app level inside ShopProvider |
| Shop ID not updating after switch | Verify `useHttpShopId()` hook is active (check React DevTools) |
| 403 Forbidden on shop endpoints | Backend middleware may be denying shop access — check user permissions |
| Retry not working | Verify network error code is in: ECONNABORTED, ENOTFOUND, ETIMEDOUT |
| Auth token not injected | Check localStorage has `auth_token` key from login |
| Can't skip shop ID | Use `skipShopIdConfig()` method when creating request |

---

## File Structure

```
src/shared/lib/http/
├── client.ts                 # Main HTTP client (singleton)
├── useHttpShopId.ts          # Hook to sync ShopContext with HTTP client
├── errors.ts                 # Error normalization
└── index.ts                  # Exports

src/shared/context/
├── ShopContext.tsx           # Shop selection + provider
├── ShopProvider              # Provider component
├── useShop()                 # Get full shop context
├── useShopId()               # Get current shop ID only
└── useShopRole()             # Get user's role in shop
```

---

## Best Practices

✅ **Do:**
- Call `useHttpShopId()` in App component (inside ShopProvider)
- Always validate shop access on backend
- Scope all database queries to shop ID
- Use TypeScript for type safety
- Test with multiple shops

❌ **Don't:**
- Rely only on frontend shop scoping (backend MUST validate)
- Forget to check user has access to shop
- Store sensitive data in API response without backend validation
- Make cross-shop queries possible

---

Last Updated: 2024
