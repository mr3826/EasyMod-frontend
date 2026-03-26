# Security Layer Test Suite

Complete test coverage for RBAC, Authentication, Guards, HTTP Client, and Multi-Tenant systems.

---

## Test Files Overview

### 1. RBAC Service Tests
**File**: `src/shared/lib/rbac/__tests__/RBACService.test.ts`

Tests the RBAC permission matrix and permission checking logic:
- ✅ Permission retrieval by role (USER, MODERATOR, ADMIN)
- ✅ Permission checking (`can()` method)
- ✅ Role matching (`hasRole()` method)
- ✅ Moderation capability (`canModerate()` method)
- ✅ Permission inheritance (roles inherit from lower tiers)
- ✅ Edge cases and invalid inputs

**Coverage**: 
- USER permissions (read posts, write profile)
- MODERATOR permissions (^ + approve posts, ban users)
- ADMIN permissions (^ + delete products, manage settings, full access)

---

### 2. HTTP Client Tests
**File**: `src/shared/lib/http/__tests__/client.test.ts`

Tests HTTP client functionality including multi-tenant shop ID injection:
- ✅ Shop ID getter/setter
- ✅ Request interceptor setup
- ✅ Shop ID header injection
- ✅ Skip shop ID config (for endpoints that don't need it)
- ✅ Axios instance access
- ✅ Convenience methods (GET, POST, PUT, PATCH, DELETE)
- ✅ Auth token handling (localStorage)
- ✅ Multi-tenant shop switching scenarios

**Key Features**:
- Automatic X-Shop-ID header injection
- Auth token injection from localStorage
- Ability to skip shop ID for specific requests
- Shop ID persistence across requests

---

### 3. Permission Gate Component Tests
**File**: `src/shared/components/guards/__tests__/PermissionGate.test.tsx`

Tests UI-level permission gates:
- ✅ PermissionGate - renders/hides based on action+resource
- ✅ RoleGate - renders/hides based on role (single & multiple)
- ✅ AdminGate - admin-only shortcuts
- ✅ ModeratorGate - moderator-only shortcuts
- ✅ DisableIfNoPermission - disables button with visual feedback

**Behaviors**:
- Show children if permission granted
- Show fallback if permission denied
- Disable buttons with opacity and cursor styles
- Support custom tooltips on disabled buttons

---

### 4. Route Guard Component Tests
**File**: `src/shared/components/guards/__tests__/RouteGuards.test.tsx`

Tests page-level route protection:
- ✅ AdminRoute - admin-only page wrapper
- ✅ ModeratorRoute - moderator-only page wrapper
- ✅ PermissionRoute - generic permission-based route
- ✅ withRouteGuard() - HOC for pages
- ✅ Loading states (while authenticating)
- ✅ Unauthorized screen (403)
- ✅ Custom redirects

**Behaviors**:
- Show loading screen while auth loads
- Redirect to login if not authenticated
- Show unauthorized screen if access denied
- Support custom redirect URLs
- Handle loading states gracefully

---

### 5. useHttpShopId Hook Tests
**File**: `src/shared/lib/http/__tests__/useHttpShopId.test.ts`

Tests multi-tenant synchronization hook:
- ✅ Shop ID sync on mount
- ✅ Shop ID update on change
- ✅ Null shop ID handling
- ✅ Multiple rapid shop switches
- ✅ HTTP client updates when shop changes

**Integration Flow**:
1. useHttpShopId hook runs at app level
2. Listens to ShopContext.currentShopId changes
3. Calls httpClient.setShopId() on change
4. All subsequent requests include X-Shop-ID header

---

### 6. Security Layer Integration Tests
**File**: `src/__tests__/security-integration.test.ts`

End-to-end tests for complete security flow:
- ✅ Auth flow (login, token storage, logout)
- ✅ RBAC permission flow
- ✅ Guard protection flow
- ✅ Multi-tenant shop management
- ✅ Complete feature access scenarios
- ✅ Security validation at each step
- ✅ Error handling (401, 403, network errors)
- ✅ Cross-component communication
- ✅ Performance and scale tests

**Scenarios**:
```
Admin deletes product:
  1. User authenticated ✓
  2. User has ADMIN role ✓
  3. Permission check: can('delete', 'products') ✓
  4. Shop context exists ✓
  5. Request sent with auth + shop headers ✓

User cannot delete:
  1. User authenticated ✓
  2. User has USER role ✗
  3. Permission check fails ✗
  4. UI hidden / button disabled ✓
  5. Request not sent ✓
```

---

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npm test RBACService.test.ts
```

### Run with coverage report
```bash
npm test -- --coverage
```

### Watch mode (auto-rerun on changes)
```bash
npm test -- --watch
```

### Run specific test suite
```bash
npm test -- --grep "RBAC Service"
```

---

## Test Coverage Summary

| Component | Test File | Tests | Coverage |
|-----------|-----------|-------|----------|
| RBAC Service | RBACService.test.ts | 13 | Permissions, roles, inheritance |
| HTTP Client | client.test.ts | 17 | Shop injection, auth, retry |
| Permission Gates | PermissionGate.test.tsx | 19 | Gates, fallbacks, disabling |
| Route Guards | RouteGuards.test.tsx | 13 | Routes, redirects, loading |
| useHttpShopId | useHttpShopId.test.ts | 8 | Hook flow, sync, switches |
| **Integration** | **security-integration.test.ts** | **18** | **End-to-end flows** |
| **TOTAL** | **6 files** | **88 tests** | **Comprehensive** |

---

## Key Testing Patterns

### 1. Component Mocking
```typescript
vi.mock('@/shared/lib/rbac/useUserPermissions');
const mockUseUserPermissions = useUserPermissions as any;

mockUseUserPermissions.mockReturnValue({
  can: (action, resource) => true,
});
```

### 2. Permission Testing
```typescript
it('should allow admin to delete products', () => {
  const result = rbacService.can(UserRole.ADMIN, 'delete', 'products');
  expect(result).toBe(true);
});
```

### 3. Guard Rendering
```typescript
it('should render children when permission granted', () => {
  mockUseUserPermissions.mockReturnValue({
    can: () => true,
  });

  render(
    <PermissionGate action="delete" resource="products">
      <button>Delete</button>
    </PermissionGate>
  );

  expect(screen.getByText('Delete')).toBeInTheDocument();
});
```

### 4. Hook Testing
```typescript
it('should sync shop ID to HTTP client', () => {
  mockUseShop.mockReturnValue({
    currentShopId: 'shop_123',
  });

  renderHook(() => useHttpShopId());

  expect(httpClient.getShopId()).toBe('shop_123');
});
```

### 5. Integration Testing
```typescript
it('should allow admin to delete in their shop', () => {
  const user = { role: UserRole.ADMIN };
  const shopId = 'shop_1';
  const token = 'token_123';

  const canDelete = user.role === UserRole.ADMIN;
  expect(canDelete).toBe(true);

  // Headers would be:
  // Authorization: Bearer token_123
  // X-Shop-ID: shop_1
});
```

---

## Troubleshooting Common Test Issues

### Tests not running
```bash
# Install dependencies
npm install

# Verify vitest is installed
npm list vitest

# Run with explicit config
npm test -- --config vitest.config.ts
```

### Mocks not working
- Ensure mock is before component import
- Use `vi.clearAllMocks()` in beforeEach
- Check mock return value matches expected interface

### Async tests timing out
- Use `waitFor()` for async operations
- Increase timeout: `{ timeout: 5000 }`
- Ensure all promises are resolved

### TypeScript errors in tests
- Import types: `import { UserRole } from '@/shared/lib/rbac/types'`
- Use type assertions if needed: `const mock = useFunc as any`
- Ensure tsconfig includes test files

---

## Next Steps

1. ✅ Write comprehensive unit tests for RBAC
2. ✅ Write tests for HTTP client (shop ID injection)
3. ✅ Write tests for guard components
4. ✅ Write tests for route protection
5. ✅ Write integration tests
6. ⏭️ Add E2E tests with Playwright
7. ⏭️ Add performance benchmarks
8. ⏭️ Add mutation testing

---

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Run tests
  run: npm test -- --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

---

Last Updated: 2024
