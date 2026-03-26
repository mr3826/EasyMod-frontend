# Security Layer Integration Guide

## Architecture Overview

The EasyMod security layer consists of four integrated components:

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
└─────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓              ↓
    ┌────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────┐
    │   Auth     │ │    RBAC     │ │  Guards  │ │  HTTP    │
    │ Context    │ │  Context    │ │Component │ │ Client   │
    └────────────┘ └─────────────┘ └──────────┘ └──────────┘
         ↓              ↓              ↓              ↓
    ┌───────────────────────────────────────────────────────┐
    │           Backend API (Secured Routes)                 │
    └───────────────────────────────────────────────────────┘
```

---

## Component 1: Authentication (AuthContext)

**Responsibility**: User login, session management, token storage

```tsx
// Setup
<AuthProvider>
  {/* App */}
</AuthProvider>

// Usage
const { user, login, logout, isAuthenticated } = useAuth();

// Result
// - user: { id, email, role: 'ADMIN', shops: [...] }
// - token: stored in localStorage, sent to backend
// - isAuthenticated: boolean
```

---

## Component 2: RBAC (RBACContext)

**Responsibility**: Permission checking, role validation, access control

```tsx
// Setup
<RBACProvider>
  {/* App */}
</RBACProvider>

// Usage
const { can, hasRole, canModerate } = useUserPermissions();

if (can('delete', 'products')) {
  // Can delete products
}

// Result
// - Fine-grained permissions: action + resource
// - Role-based checks (ADMIN, MODERATOR, USER)
// - Composable permission logic
```

**Permission Matrix** (from RBAC):
```
USER:
  - read posts
  - write profile

MODERATOR:
  - ^ + approve posts
  - ^ + ban users

ADMIN:
  - ^ + delete products
  - ^ + manage settings
  - ^ + */* (everything)
```

---

## Component 3: Guards (UI Protection)

**Responsibility**: Hide/disable UI elements, protect pages, show fallbacks

### UI-Level Gates

```tsx
// Simple gate (hides content if no permission)
<PermissionGate action="delete" resource="products">
  <button onClick={deleteProduct}>Delete</button>
</PermissionGate>

// With fallback
<PermissionGate 
  action="manage" 
  resource="settings"
  fallback={<p>Upgrade to Pro</p>}
>
  <SettingsPanel />
</PermissionGate>

// Disable button (visual feedback)
<DisableIfNoPermission action="delete" resource="products">
  <button>Delete Product</button>
</DisableIfNoPermission>
```

### Page-Level Routes

```tsx
// Protect entire page
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminPage />
    </AdminRoute>
  }
/>

// HOC version
export default withRouteGuard(AdminPage, {
  requiredRole: UserRole.ADMIN
});
```

---

## Component 4: HTTP Client (Multi-Tenant)

**Responsibility**: Centralized API communication, automatic auth/shop injection, retry logic

```tsx
// Setup (in App component)
useHttpShopId(); // Syncs shop context → HTTP headers

// Usage
const data = await httpClient.get('/api/products');
// Automatically includes:
// - Authorization: Bearer <token>
// - X-Shop-ID: <shopId>

// Skip shop ID if needed
const config = httpClient.skipShopIdConfig();
const data = await httpClient.get('/api/public', config);
```

---

## Integration Flowchart

### User Login Flow

```
1. User clicks "Login"
   ↓
2. Submit email + password
   ↓
3. POST /api/auth/login → Backend validates
   ↓
4. Backend returns { token, user: { id, role, shops } }
   ↓
5. AuthContext.login() stores token + user
   ↓
6. RBACProvider loads permission matrix for user role
   ↓
7. ShopProvider initializes with user's shops
   ↓
8. useHttpShopId() syncs shop → HTTP headers
   ↓
9. User can now access protected routes/features
```

### Feature Access Flow

```
User attempts action (e.g., delete product)
   ↓
Frontend checks: can('delete', 'products')?
   ↓
NO → Show disabled button / fallback UI
   ↓
YES → Allow click, send request with:
       - Authorization header (token)
       - X-Shop-ID header (shop context)
   ↓
Backend middleware:
  1. Verify JWT token is valid
  2. Extract user from token
  3. Verify user has delete permission
  4. Verify user owns the shop
  5. Execute request or deny (403)
   ↓
Return data or error
```

---

## Complete App Setup

```tsx
// App.tsx - Complete security setup

import { AuthProvider } from '@/shared/lib/auth';
import { RBACProvider } from '@/shared/lib/rbac';
import { ShopProvider } from '@/shared/context';
import { useHttpShopId } from '@/shared/lib/http';
import { Router } from './router';

export default function App() {
  return (
    <AuthProvider>
      <RBACProvider>
        <AppContent />
      </RBACProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  const shops = user?.shops || [];

  return (
    <ShopProvider shops={shops}>
      <HttpSync />
    </ShopProvider>
  );
}

function HttpSync() {
  useHttpShopId(); // ⭐ Critical: sync shop → HTTP client

  return <Router />;
}
```

### Router Setup

```tsx
// router.tsx - Protected routes

import {
  AdminRoute,
  ModeratorRoute,
  PermissionRoute,
  withRouteGuard,
} from '@/shared/components/guards';
import { UserRole } from '@/shared/lib/rbac';

export function Router() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />

      {/* Admin only */}
      <Route
        path="/admin"
        element={
          <AdminRoute redirectTo="/dashboard">
            <AdminPage />
          </AdminRoute>
        }
      />

      {/* Moderator+ */}
      <Route
        path="/moderation"
        element={
          <ModeratorRoute redirectTo="/dashboard">
            <ModerationPage />
          </ModeratorRoute>
        }
      />

      {/* Permission-based */}
      <Route
        path="/reports"
        element={
          <PermissionRoute
            action="read"
            resource="reports"
            redirectTo="/dashboard"
          >
            <ReportsPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
```

---

## Backend Requirements

### 1. JWT Token Structure

```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "role": "ADMIN",
  "shops": ["shop_abc", "shop_xyz"],
  "permissions": [
    { "action": "delete", "resource": "products" },
    { "action": "read", "resource": "posts" }
  ],
  "iat": 1704067200,
  "exp": 1704153600
}
```

### 2. Authentication Middleware

```typescript
// Verify JWT + extract user
export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 3. Shop ID Middleware

```typescript
// Verify user has access to requested shop
export function validateShopAccess(req, res, next) {
  const shopId = req.headers['x-shop-id'];
  const userShops = req.user.shops;

  if (!shopId) {
    return res.status(400).json({ error: 'Missing X-Shop-ID' });
  }

  if (!userShops.includes(shopId)) {
    return res.status(403).json({ error: 'Unauthorized for this shop' });
  }

  req.shopId = shopId;
  next();
}
```

### 4. Permission Middleware

```typescript
// Check user has specific permission
export function requirePermission(action, resource) {
  return (req, res, next) => {
    const hasPermission = req.user.permissions.some(
      (p) => p.action === action && p.resource === resource
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

// Usage
app.delete(
  '/api/products/:id',
  authenticateToken,
  requirePermission('delete', 'products'),
  deleteProductController
);
```

---

## Security Best Practices

### Frontend

✅ **Do:**
- Always validate permissions before showing UI
- Use guards to protect pages
- Include shop ID in all multi-tenant requests
- Store token in localStorage (httpOnly cookies ideal in prod)
- Verify auth errors and redirect to login

❌ **Don't:**
- Rely only on frontend validation (backend MUST validate)
- Show hidden UI in dev tools
- Make API calls without authentication
- Forget to check shop access

### Backend

✅ **Do:**
- Verify JWT signature
- Check user has permission for action
- Validate user owns the shop
- Scope all queries to shop ID
- Log permission denials for audit
- Implement rate limiting
- Use HTTPS only

❌ **Don't:**
- Trust X-Shop-ID header without verification
- Skip permission checks for "trusted" clients
- Return sensitive data without validation
- Allow cross-shop queries
- Expose implementation details in errors

---

## Testing Security

### Frontend Unit Tests

```typescript
test('admin can delete products', () => {
  // Setup: ADMIN user
  renderWithAuth(<PermissionGate action="delete" resource="products">
    <button>Delete</button>
  </PermissionGate>);

  expect(screen.getByText('Delete')).toBeInTheDocument();
});

test('user cannot delete products', () => {
  // Setup: USER role
  renderWithAuth(<PermissionGate action="delete" resource="products">
    <button>Delete</button>
  </PermissionGate>);

  expect(screen.queryByText('Delete')).not.toBeInTheDocument();
});
```

### Backend Tests

```typescript
test('user cannot access other shop', async () => {
  const user = { shops: ['shop_abc'] };
  const request = new Request('/api/products', {
    headers: { 'x-shop-id': 'shop_xyz' }
  });

  const res = await authenticateToken(request);
  expect(res.status).toBe(403);
});
```

---

## Troubleshooting Matrix

| Symptom | Cause | Fix |
|---------|-------|-----|
| UI shows but shouldn't | Frontend check only | Backend validation missing |
| 403 Forbidden on valid shop | Shop not in user.shops | Add shop to user's shop list |
| 401 after login | Token not stored | Check localStorage / auth flow |
| X-Shop-ID missing | useHttpShopId not called | Call at App level |
| Permission denied on valid action | Permission matrix outdated | Update RBAC permissions |
| Can switch to unauthorized shop | No backend validation | Add validateShopAccess middleware |

---

## Documentation References

- [RBAC_USAGE_GUIDE.md](./RBAC_USAGE_GUIDE.md) - Permission & role checking
- [HTTP_CLIENT_GUIDE.md](./HTTP_CLIENT_GUIDE.md) - Multi-tenant API requests
- [ShopContext](../context/ShopContext.tsx) - Shop selection
- [Guards](../components/guards) - UI & route protection
- [AuthContext](../lib/auth/AuthContext.tsx) - Authentication

---

Last Updated: 2024
