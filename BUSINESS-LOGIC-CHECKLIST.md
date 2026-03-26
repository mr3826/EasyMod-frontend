# Business Logic Implementation Checklist

**Purpose:** Ensure developers follow this checklist when migrating each backend domain feature to maintain business logic integrity.

---

## Before You Start: Understand Backend Logic

For each feature, you MUST:
1. Read the backend service file (`src/modules/[feature]/[feature].service.js`)
2. Read the backend validator file (`src/modules/[feature]/[feature].validator.js`) - Extract all Joi rules
3. Read the backend controller file - Understand error handling, business rules, side effects
4. Identify: What data validations? Status machines? Computed fields? Cascading operations? Access control?

---

## Checklist: Feature Migration Template

Copy this for each feature you migrate:

### Feature: ___________________

#### Step 1: Extract Backend Business Logic

- [ ] **List all validations from backend Joi schema:**
  ```
  1. [field]: [constraint] (e.g., price: z.number().positive("must be > 0"))
  2. [field]: [constraint]
  3. [field]: [constraint]
  ```

- [ ] **List all conditional logic in service/controller:**
  ```
  1. [scenario]: [action] (e.g., if order.status = 'shipped', prevent edit)
  2. [scenario]: [action]
  ```

- [ ] **List all entities that need permission checks:**
  ```
  1. [entity]: [required role] (e.g., Order: ADMIN or shop owner)
  ```

- [ ] **List all side effects (cascading updates):**
  ```
  1. [trigger]: [effect] (e.g., create order → update customer.last_order_date)
  2. [trigger]: [effect]
  ```

#### Step 2: Create Feature Folder Structure

```bash
cd src/features/
mkdir -p [feature]/{types,api,components,hooks,lib,__tests__}
```

#### Step 3: Implement Types with Zod Validation

**File:** `src/features/[feature]/types/index.ts`

- [ ] Create Zod schema for API input (matches backend Joi)
- [ ] Create Zod schema for API response
- [ ] Create TypeScript type via `z.infer<typeof Schema>`
- [ ] Export all schemas and types
- [ ] Add JSDoc comments explaining validation rules

**Example:**
```typescript
// src/features/products/types/index.ts
import { z } from 'zod';

export const ProductInputSchema = z.object({
  name: z.string().min(1, 'Name required').max(255),
  sku: z.string().min(1, 'SKU required'),
  price: z.number().positive('Price must be > 0'),
  categoryId: z.string().uuid('Invalid category'),
  inventory: z.number().nonnegative('Inventory cannot be negative'),
  weightUnit: z.enum(['kg', 'lb', 'g', 'oz']),
  // ... rest of fields
});

export type ProductInput = z.infer<typeof ProductInputSchema>;

export const ProductResponseSchema = ProductInputSchema.extend({
  id: z.string().uuid(),
  shopId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;
```

#### Step 4: Create API Queries (TanStack Query)

**File:** `src/features/[feature]/api/queries.ts`

- [ ] Create query key factory with feature name
- [ ] For each backend GET endpoint, create a `useQuery` hook
- [ ] Include query parameter validation (filters, pagination)
- [ ] Set appropriate staleTime/gcTime values
- [ ] Add error type narrowing for feature-specific errors
- [ ] Add JSDoc explaining parameters and return types

**Example:**
```typescript
// src/features/products/api/queries.ts
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/shared/lib/http';
import { ProductResponseSchema } from '../types';

export const productQueries = {
  all: () => ['products'] as const,
  lists: () => [...productQueries.all(), 'list'] as const,
  list: (filters: ProductFilters) => [...productQueries.lists(), filters],
  detail: (id: string) => [...productQueries.all(), 'detail', id],
};

export const useListProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: productQueries.list(filters),
    queryFn: async () => {
      const response = await httpClient.get('/products', { params: filters });
      return response.data.map(item => ProductResponseSchema.parse(item));
    },
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000,     // 10 min
    retry: 3,
  });
};

export const useGetProduct = (id: string) => {
  return useQuery({
    queryKey: productQueries.detail(id),
    queryFn: async () => {
      const response = await httpClient.get(`/products/${id}`);
      return ProductResponseSchema.parse(response.data);
    },
    enabled: !!id, // Don't fetch if id is undefined
    staleTime: 10 * 60 * 1000,
  });
};
```

#### Step 5: Create API Mutations (with Validation + Side Effects)

**File:** `src/features/[feature]/api/mutations.ts`

- [ ] For each backend POST/PUT/PATCH/DELETE, create a `useMutation` hook
- [ ] Validate input with Zod schema BEFORE sending
- [ ] Implement query invalidation strategy (invalidate related caches)
- [ ] Handle feature-specific error cases (VALIDATION_ERROR, permission errors)
- [ ] Add optimistic update if high-confidence operation
- [ ] Add JSDoc explaining side effects

**Example:**
```typescript
// src/features/products/api/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient, isApiError, getErrorMessage, getValidationErrors } from '@/shared/lib/http';
import { ProductInputSchema, ProductResponseSchema } from '../types';
import { productQueries } from './queries';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      // Validate input before sending
      const validated = ProductInputSchema.parse(input);
      
      const response = await httpClient.post('/products', validated);
      return ProductResponseSchema.parse(response.data);
    },
    
    onSuccess: (data) => {
      // Invalidate product lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: productQueries.lists() });
      
      // Optional: Update category list cache (if product count affects category stats)
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    
    onError: (error) => {
      if (isApiError(error)) {
        if (error.type === 'VALIDATION_ERROR') {
          // Handle field-level validation errors
          const fieldErrors = getValidationErrors(error);
          console.error('Validation errors:', fieldErrors);
          // UI will show field-level feedback via form library
        } else if (error.type === 'UNAUTHORIZED') {
          // Redirect to login
        } else {
          console.error('Error creating product:', getErrorMessage(error));
        }
      }
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: ProductInput & { id: string }) => {
      const { id, ...data } = input;
      const validated = ProductInputSchema.parse(data);
      
      const response = await httpClient.put(`/products/${id}`, validated);
      return ProductResponseSchema.parse(response.data);
    },
    
    onSuccess: (data) => {
      // Invalidate both list and specific product detail
      queryClient.invalidateQueries({ queryKey: productQueries.lists() });
      queryClient.invalidateQueries({ queryKey: productQueries.detail(data.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Backend validation: only deletable if no orders reference this product
      // Frontend: should check UI state before enabling delete button
      await httpClient.delete(`/products/${id}`);
    },
    
    onSuccess: () => {
      // Cascade invalidation: clear product lists AND any dashboard stats
      queryClient.invalidateQueries({ queryKey: productQueries.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // In case dashboard shows product count
    },
  });
};
```

#### Step 6: Create Feature Business Logic Hooks

**File:** `src/features/[feature]/hooks/index.ts`

- [ ] Extract any stateful logic that doesn't fit in components
- [ ] For features with state machines, create hook to manage transitions
- [ ] For features with conditional rendering, create hooks for permission/gating checks
- [ ] Document any assumptions about backend behavior

**Example (if feature has workflow):**
```typescript
// src/features/orders/hooks/useOrderWorkflow.ts
import { useState } from 'react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// State machine: which transitions are allowed from which status?
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'], // Can't uncancelled once shipped
  delivered: [], // Terminal state
  cancelled: [], // Terminal state
};

export const useOrderWorkflow = () => {
  const [status, setStatus] = useState<OrderStatus>('pending');
  
  const canTransitionTo = (targetStatus: OrderStatus): boolean => {
    return ALLOWED_TRANSITIONS[status].includes(targetStatus);
  };
  
  const transitionTo = (targetStatus: OrderStatus) => {
    if (!canTransitionTo(targetStatus)) {
      throw new Error(`Cannot transition from ${status} to ${targetStatus}`);
    }
    setStatus(targetStatus);
  };
  
  return { status, canTransitionTo, transitionTo };
};
```

#### Step 7: Update Components to Use New API Hooks

**File:** `src/features/[feature]/components/*.tsx`

- [ ] Replace direct `useState` + `useEffect` + fetch with feature hooks
- [ ] Use `isLoading`, `error`, `data` from query hook
- [ ] Connect submit buttons to mutation hooks
- [ ] Display `NormalizedApiError` feedback (field-level errors for forms)
- [ ] Disable submit buttons during loading
- [ ] Show success/error toast on mutation completion

**Example:**
```typescript
// src/features/products/components/ProductForm.tsx
import { useState } from 'react';
import { useCreateProduct, useUpdateProduct } from '../api/mutations';
import { useGetProduct } from '../api/queries';
import { isApiError, getValidationErrors } from '@/shared/lib/http';
import { toast } from '@/components/ui/toast';

export const ProductForm = ({ productId }: { productId?: string }) => {
  const { data: existingProduct, isLoading } = useGetProduct(productId || '');
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const handleSubmit = async (formData: ProductInput) => {
    try {
      setFieldErrors({}); // Clear previous errors
      
      if (productId) {
        await updateMutation.mutateAsync({ id: productId, ...formData });
        toast.success('Product updated');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Product created');
      }
    } catch (error) {
      if (isApiError(error)) {
        if (error.type === 'VALIDATION_ERROR') {
          setFieldErrors(getValidationErrors(error));
        } else {
          toast.error(error.message);
        }
      }
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(/* form data */);
    }}>
      {/* Form fields */}
      {/* Use fieldErrors for field-level validation display */}
      <button disabled={createMutation.isPending || updateMutation.isPending}>
        Save
      </button>
    </form>
  );
};
```

#### Step 8: Implement 70% Test Coverage

**File:** `src/features/[feature]/__tests__/*.test.ts`

- [ ] Test query hooks: data structure, loading state, error handling
- [ ] Test mutation hooks: success path, validation errors, side effects (invalidation)
- [ ] Test business logic hooks: state transitions, permission checks
- [ ] Test components: form submission, error display, disabled states
- [ ] Create integration test for full workflow (e.g., create → fetch → update → delete)

**Example:**
```typescript
// src/features/products/__tests__/api.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useCreateProduct, useUpdateProduct } from '../api/mutations';
import { ProductInput } from '../types';

// Mock httpClient
jest.mock('@/shared/lib/http', () => ({
  httpClient: { post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  isApiError: jest.fn(),
  getErrorMessage: jest.fn(),
}));

describe('Products API', () => {
  it('should create product with validation', async () => {
    const { result } = renderHook(() => useCreateProduct());
    
    const input: ProductInput = {
      name: 'Test Product',
      sku: 'TEST-001',
      price: 99.99, // Validates: price > 0
      categoryId: 'cat-123',
      weightUnit: 'kg',
      inventory: 10,
    };
    
    await waitFor(() => {
      result.current.mutate(input);
    });
    
    expect(result.current.isSuccess).toBe(true);
  });
  
  it('should reject negative price', async () => {
    const { result } = renderHook(() => useCreateProduct());
    
    const invalidInput = {
      ...validProduct,
      price: -10, // Invalid: price must be > 0
    };
    
    await expect(() => 
      result.current.mutate(invalidInput)
    ).toThrow('Price must be > 0');
  });
});
```

#### Step 9: Create Migration Verification Checklist

Run this before merging to `main`:

```
Feature: ________________

Verification Checklist:
[ ] All Joi validators from backend have Zod equivalents in frontend
[ ] All backend error responses handled in frontend (VALIDATION_ERROR, permission, etc.)
[ ] All backend side effects captured in query invalidation strategy
[ ] All permission checks enforced (non-admin users can't see admin-only fields)
[ ] All shop/tenant scoping enforced (queries filtered by shopId)
[ ] All status transitions validated (if applicable)
[ ] All related entity validations (e.g., categoryId exists) handled
[ ] Test coverage >= 70% (npm run test -- --coverage)
[ ] Integration test runs full feature workflow without errors
[ ] Manual QA: Test create/read/update/delete operations
[ ] Manual QA: Test error scenarios (invalid input, missing entity, permission denied)
[ ] Backend response structure matches Zod schema (caught by z.parse at runtime)
[ ] UI shows loading states, error messages, success feedback
[ ] Form validation errors display at field level (from server)
```

---

## Domain-Specific Implementation Guides

### A. Order/Status Machine Features

If your feature has a workflow with status transitions:

1. **Create a state machine** (use `xstate` or simple validator):
```typescript
// src/features/orders/lib/orderStateMachine.ts
export const ALLOWED_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
} as const;

export const canTransition = (from: OrderStatus, to: OrderStatus) => 
  ALLOWED_TRANSITIONS[from].includes(to);
```

2. **Validate in mutation hook before sending**:
```typescript
export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: OrderStatus }) => {
      const order = queryClient.getQueryData(['orders', orderId]); // Get current from cache
      if (order && !canTransition(order.status, newStatus)) {
        throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
      }
      // ... send to backend
    },
  });
};
```

3. **Disable invalid buttons in UI**:
```typescript
const { canTransitionTo } = useOrderWorkflow(order.status);

<button disabled={!canTransitionTo('shipped')}>Ship Order</button>
```

### B. Permission-Gated Features

If your feature requires specific roles:

1. **Create permission hook**:
```typescript
// src/shared/hooks/useUserPermissions.ts
export const useUserPermissions = () => {
  const { user } = useAuth();
  
  const can = (action: string, resource: string) => {
    const permissions = PERMISSION_MATRIX[user.role];
    return permissions?.includes(`${action}:${resource}`);
  };
  
  return { can };
};
```

2. **Gate in components/mutations**:
```typescript
const { can } = useUserPermissions();

if (!can('delete', 'products')) {
  return <div>You don't have permission to delete products</div>;
}
```

### C. Plan-Gated Features

If your feature has subscription plan restrictions:

1. **Create plan gate hook**:
```typescript
// src/shared/hooks/useSubscriptionFeatures.ts (enhance existing)
export const useSubscriptionFeatures = () => {
  const { subscription } = useSubscription();
  
  const isFeatureAvailable = (feature: string) => {
    const PLAN_FEATURES = {
      starter: ['basic_reporting'],
      professional: ['basic_reporting', 'advanced_analytics', 'api_access'],
      enterprise: ['*'],
    };
    return PLAN_FEATURES[subscription.plan].includes(feature);
  };
  
  return { isFeatureAvailable };
};
```

2. **Gate UI + throws on unauthorized API call**:
```typescript
const { isFeatureAvailable } = useSubscriptionFeatures();

if (!isFeatureAvailable('advanced_analytics')) {
  return <UpgradePrompt feature="Advanced Analytics" />;
}
```

### D. Shop/Tenant-Scoped Features

For ALL features, ensure shop isolation:

1. **Automatic shop scoping in queries**:
```typescript
// In query hook:
export const useListProducts = () => {
  const { currentShopId } = useShop(); // Get current shop from context
  
  return useQuery({
    queryFn: async () => {
      const response = await httpClient.get('/products', {
        params: { shopId: currentShopId } // ALWAYS include shopId
      });
      // ...
    },
  });
};
```

2. **Never allow cross-shop data access**:
```typescript
// In mutation:
await httpClient.post('/products', {
  ...data,
  shopId: currentShopId, // Enforced on client + backend
});
```

---

## Quick Reference: Common Validation Patterns

```typescript
// Zod schema patterns matching common backend validations:

// Required string with min/max length
name: z.string().min(1, 'Required').max(255),

// Email format
email: z.string().email('Invalid email'),

// Positive number
price: z.number().positive('Must be positive'),

// Non-negative number
inventory: z.number().nonnegative('Cannot be negative'),

// Enum/choice
status: z.enum(['active', 'inactive', 'pending']),

// UUID format
id: z.string().uuid('Invalid ID'),

// ISO date
createdAt: z.date().or(z.string().datetime()),

// Conditional validation (password + confirm match)
.refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
}),

// Array with min/max items
tags: z.array(z.string()).min(1).max(10),

// Optional field with default
description: z.string().optional().default(''),

// Nullable field
metadata: z.object({}).nullable(),
```

---

## Debugging: Backend Logic Not Reflected

If features seem to work in UI but fail in production consistency:

1. **Check Zod schema matches backend Joi** → Extract backend constraints exactly
2. **Check mutation error handling** → Add console.log(error) to see NormalizedApiError structure
3. **Check query invalidation** → Use React Query DevTools to confirm cache is cleared on mutations
4. **Check shop scoping** → Add console.log(shopId) to verify every query includes it
5. **Check permission checks** → Verify useUserPermissions.can() gates all sensitive operations
6. **Check state machine** → Print allowed transitions on status change mutations
7. **Check cascade effects** → Verify related caches invalidated (not just feature's own)

---

**Template Version:** 1.0  
**Last Updated:** 2026-03-26  
**Author:** Architecture Team
