# EasyMod RBAC Implementation - Usage Guide

## Overview

The RBAC (Role-Based Access Control) system provides:
- **AuthContext**: Authentication state management
- **RBAC System**: Permission and role checking with permission matrix
- **Guards**: React components for protecting UI elements and pages
- **Hooks**: `useAuth()` and `useUserPermissions()` for component logic

---

## Part 1: Setup

### 1. Wrap App with AuthProvider

```tsx
// App.tsx
import { AuthProvider } from '@/shared/lib/auth/AuthContext';
import { RBACProvider } from '@/shared/lib/rbac/RBACContext';

export default function App() {
  return (
    <AuthProvider>
      <RBACProvider>
        <Routes>
          {/* routes */}
        </Routes>
      </RBACProvider>
    </AuthProvider>
  );
}
```

---

## Part 2: Authentication

### Login
```tsx
import { useAuth } from '@/shared/lib/auth/AuthContext';

function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password); // Sets user, token, role
  };

  return <form onSubmit={handleLogin}>{/* ... */}</form>;
}
```

### Get Current User
```tsx
function Header() {
  const { user, isAuthenticated } = useAuth();

  return isAuthenticated ? <div>Hello {user?.name}</div> : <div>Not logged in</div>;
}
```

### Logout
```tsx
function LogoutButton() {
  const { logout } = useAuth();
  return <button onClick={logout}>Logout</button>;
}
```

---

## Part 3: Permission Checks

### Check if User Can Do Action
```tsx
import { useUserPermissions } from '@/shared/lib/rbac/useUserPermissions';

function DeleteButton() {
  const { can } = useUserPermissions();

  if (can('delete', 'products')) {
    return <button onClick={deleteProduct}>Delete</button>;
  }

  return <button disabled>Delete (no permission)</button>;
}
```

### Check User's Role
```tsx
function AdminPanel() {
  const { hasRole } = useUserPermissions();

  if (hasRole(UserRole.ADMIN)) {
    return <div>Admin Controls</div>;
  }

  return <div>You are not an admin</div>;
}
```

### Multiple Roles
```tsx
function ModeratePost() {
  const { hasRole } = useUserPermissions();

  const isStaff = hasRole(UserRole.ADMIN) || hasRole(UserRole.MODERATOR);

  if (isStaff) {
    return <button>Approve Post</button>;
  }

  return <span>You cannot moderate</span>;
}
```

---

## Part 4: Protecting UI Elements

### Simple Permission Gate
```tsx
import { PermissionGate } from '@/shared/components/guards';

function ProductActions() {
  return (
    <div>
      <PermissionGate action="delete" resource="products">
        <button onClick={deleteProduct}>Delete Product</button>
      </PermissionGate>

      <PermissionGate action="write" resource="products">
        <button onClick={editProduct}>Edit Product</button>
      </PermissionGate>
    </div>
  );
}
```

### With Fallback (shows alternative content)
```tsx
<PermissionGate
  action="manage"
  resource="settings"
  fallback={<p className="text-yellow-600">Upgrade to Pro to manage settings</p>}
>
  <SettingsPanel />
</PermissionGate>
```

### Disable Button If No Permission
```tsx
import { DisableIfNoPermission } from '@/shared/components/guards';

function AdminActions() {
  return (
    <DisableIfNoPermission
      action="delete"
      resource="users"
      tooltip="You must be an admin to delete users"
    >
      <button onClick={deleteUser}>Delete User</button>
    </DisableIfNoPermission>
  );
}
```

### Role-Based Gate
```tsx
import { RoleGate, AdminGate, ModeratorGate } from '@/shared/components/guards';

// Specific role
<RoleGate role={UserRole.ADMIN}>
  <AdminPanel />
</RoleGate>

// Enum multiple roles
<RoleGate role={[UserRole.ADMIN, UserRole.MODERATOR]}>
  <ModPanel />
</RoleGate>

// Shorthand admin gate
<AdminGate>
  <AdminSettings />
</AdminGate>

// Shorthand moderator gate
<ModeratorGate>
  <ModerationQueue />
</ModeratorGate>
```

---

## Part 5: Protecting Pages/Routes

### Using HOC (Higher-Order Component)
```tsx
// AdminPage.tsx
function AdminPage() {
  return <div>Admin Dashboard</div>;
}

export default withRouteGuard(AdminPage, {
  requiredRole: UserRole.ADMIN,
  redirectTo: '/dashboard',
});
```

### Complex Permission Check on Route
```tsx
export default withRouteGuard(ReportsPage, {
  requiredAction: 'read',
  requiredResource: 'reports',
  redirectTo: '/home',
});
```

### Direct Route Component
```tsx
// Router definition
<Routes>
  <Route
    path="/admin"
    element={
      <AdminRoute redirectTo="/home">
        <AdminPage />
      </AdminRoute>
    }
  />

  <Route
    path="/moderate"
    element={
      <ModeratorRoute redirectTo="/home">
        <ModerationPage />
      </ModeratorRoute>
    }
  />

  <Route
    path="/reports"
    element={
      <PermissionRoute action="read" resource="reports" redirectTo="/home">
        <ReportsPage />
      </PermissionRoute>
    }
  />
</Routes>
```

---

## Part 6: Adding Permissions

### Update Permission Matrix (backend)
Edit `RBACService.getPermissions()` to add new actions/resources:

```typescript
private getPermissions(role: UserRole): Permission[] {
  const basePermissions: Permission[] = [
    { action: 'read', resource: 'posts' },
    { action: 'write', resource: 'profile' },
  ];

  if (role === UserRole.ADMIN) {
    basePermissions.push(
      { action: 'delete', resource: 'products' },
      { action: 'manage', resource: 'settings' }
    );
  }

  if (role === UserRole.MODERATOR) {
    basePermissions.push(
      { action: 'approve', resource: 'posts' },
      { action: 'ban', resource: 'users' }
    );
  }

  return basePermissions;
}
```

### Update Frontend RBAC Matrix
Edit `src/shared/lib/rbac/permissions.ts`:

```typescript
export const PERMISSIONS_MATRIX: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    { action: 'read', resource: 'posts' },
    { action: 'write', resource: 'posts' },
  ],
  [UserRole.MODERATOR]: [
    // ... user permissions
    { action: 'approve', resource: 'posts' },
    { action: 'moderate', resource: 'users' },
  ],
  [UserRole.ADMIN]: [
    // ... all permissions
    { action: '*', resource: '*' }, // Full access
  ],
};
```

---

## Part 7: Best Practices

### ✅ Do:
- Use `PermissionGate` for UI elements (buttons, sections)
- Use route guards for entire pages
- Always provide a fallback or disabled state
- Check permissions on backend too (guards prevent unauthorized API calls)
- Log permission denials for security audits

### ❌ Don't:
- Rely only on frontend guards (backend must enforce too)
- Show hidden UI in browser dev tools (backend must verify)
- Create too many custom permission strings (standardize action/resource)
- Hardcode roles in components (use hooks/guards)

---

## Part 8: Common Patterns

### Conditional Action Buttons
```tsx
function UserCard({ userId }: { userId: string }) {
  const { can } = useUserPermissions();

  return (
    <div>
      <div>{/* user info */}</div>

      <div className="flex gap-2">
        <PermissionGate action="read" resource="user_profile">
          <button>View Profile</button>
        </PermissionGate>

        <PermissionGate action="write" resource="users">
          <button>Edit</button>
        </PermissionGate>

        <DisableIfNoPermission
          action="ban"
          resource="users"
          tooltip="Moderators can ban users"
        >
          <button onClick={() => banUser(userId)}>Ban</button>
        </DisableIfNoPermission>
      </div>
    </div>
  );
}
```

### Role-Based Sidebar
```tsx
function Sidebar() {
  const { hasRole } = useUserPermissions();

  return (
    <nav>
      <a href="/dashboard">Dashboard</a>

      {hasRole(UserRole.MODERATOR) && (
        <a href="/moderation">Moderation Queue</a>
      )}

      {hasRole(UserRole.ADMIN) && (
        <>
          <a href="/admin/settings">Settings</a>
          <a href="/admin/users">User Management</a>
        </>
      )}
    </nav>
  );
}
```

### Permission-Based Feature Flags
```tsx
function FeatureFlag({ action, resource, children }: any) {
  const { can } = useUserPermissions();
  return can(action, resource) ? children : null;
}

// Usage
<FeatureFlag action="read" resource="beta_features">
  <BetaFeature />
</FeatureFlag>
```

---

## Part 9: Testing

### Test Permission Check
```typescript
import { renderHook } from '@testing-library/react';
import { useUserPermissions } from '@/shared/lib/rbac/useUserPermissions';

test('admin can delete products', () => {
  // Setup: set user role to ADMIN
  const { result } = renderHook(() => useUserPermissions());
  expect(result.current.can('delete', 'products')).toBe(true);
});
```

### Test Route Guard
```typescript
test('non-admin redirects from admin page', () => {
  // Setup: set user role to USER
  const { navigate } = renderWithRouter(
    <withRouteGuard(AdminPage, { requiredRole: UserRole.ADMIN }) />
  );
  expect(navigate).toHaveBeenCalledWith('/dashboard');
});
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Permission gate always shows fallback | Check that user role is set in AuthContext |
| `useUserPermissions()` returns undefined | Ensure app is wrapped with `RBACProvider` |
| Frontend allows, but backend denies | Backend validation is working (good!) — update permissions matrix |
| Permission denied on valid action | Check permission matrix in `permissions.ts` |
| Route guard not redirecting | Ensure `useNavigate()` hook is available (inside Router) |

---

Last Updated: 2024
