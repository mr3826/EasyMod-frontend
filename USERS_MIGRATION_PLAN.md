# Users Feature Migration Plan

## Epic: Admin Users Management

As an admin, I need to manage system users (create, view, edit, delete) with role-based access control, so that I can maintain user permissions and shop assignments across the EasyMod platform.

---

## User Stories

### US-1: View Users List (Read Permission)

**User Story:**
```
As an admin,
I want to view a paginated list of all users in my shop,
So that I can see who has access to the system and their roles.
```

**Acceptance Criteria:**
```gherkin
Given I am logged in as an admin with "read:users" permission,
When I navigate to /admin/users,
Then I should see a table of users for my current shop.

Given I am a moderator without "read:users" permission,
When I try to access /admin/users,
Then I should see an unauthorized message and not access the page.

Given the users list has data,
When the page loads,
Then I should see user name, email, role, and created date columns.

Given there are more than 10 users,
When the page loads,
Then I should see pagination controls or infinite scroll.
```

**Acceptance Criteria (Technical):**
- Uses AdminRoute guard to restrict access
- Queries GET /api/users with X-Shop-ID header injected automatically
- Displays users scoped to currentShop
- Shows loading state while fetching
- Shows error state with retry button if API fails
- Implements proper table layout with sorting/filtering

---

### US-2: Create New User

**User Story:**
```
As an admin,
I want to create new users and assign them roles,
So that I can grant access to team members.
```

**Acceptance Criteria:**
```gherkin
Given I am viewing the users list,
When I click the "Create User" button,
Then a modal dialog should open with a form.

Given the create user form is open,
When I enter email, name, and select a role,
Then the form should validate required fields.

Given I submit the form with valid data,
When the API call succeeds,
Then the new user should appear in the list and modal should close.

Given I do not have "write:users" permission,
When I view the users list,
Then the "Create User" button should be disabled or hidden.

Given the API returns an error,
When I submit the form,
Then an error message should display and the user should remain in the form.
```

**Acceptance Criteria (Technical):**
- PermissionGate wraps "Create User" button with action="write" resource="users"
- POST /api/users with X-Shop-ID header
- Validates email, name, role fields
- Shows loading spinner during submit
- Error toast alerting on failure
- Refreshes users list on success

---

### US-3: Edit User Role/Permissions

**User Story:**
```
As an admin,
I want to change a user's role or permissions,
So that I can adjust access levels as team responsibilities change.
```

**Acceptance Criteria:**
```gherkin
Given I am viewing the users list and have "write:users" permission,
When I click the edit button on a user row,
Then an edit modal should open with the user's current role.

Given the edit form is open,
When I change the role and click save,
Then the API should update the user and the list should refresh.

Given I do not have "write:users" permission,
When I view the users list,
Then the edit button should not appear on each user row.

Given I submit the edit form,
When the API fails,
Then an error message should display.
```

**Acceptance Criteria (Technical):**
- Edit button wrapped in DisableIfNoPermission with action="write" resource="users"
- PUT /api/users/{id} with X-Shop-ID header
- Fetches current user data if not already present
- Updates table in-place on success
- Shows optimistic UI updates during loading

---

### US-4: Delete User

**User Story:**
```
As an admin,
I want to remove users who no longer need access,
So that I can maintain a secure and accurate system.
```

**Acceptance Criteria:**
```gherkin
Given I am viewing the users list and have "delete:users" permission,
When I click the delete button on a user row,
Then a confirmation dialog should appear.

Given the confirmation dialog is open,
When I click "Confirm Delete",
Then the user should be deleted from the list.

Given I do not have "delete:users" permission,
When I view the users list,
Then the delete button should not appear or be disabled.

Given the delete API call fails,
When I confirm deletion,
Then an error message should display and user should remain in list.
```

**Acceptance Criteria (Technical):**
- Delete button wrapped in PermissionGate with action="delete" resource="users"
- DELETE /api/users/{id} with X-Shop-ID header
- Shows confirmation modal before delete
- Shows spinner during delete
- Removes user from table on success
- Error toast on failure

---

### US-5: Multi-Tenant Shop Scoping

**User Story:**
```
As an admin of multiple shops,
I want users to be automatically scoped to my current shop,
So that I only see and manage users within my current context.
```

**Acceptance Criteria:**
```gherkin
Given I am logged in with access to multiple shops,
When I switch shops via the shop switcher,
Then the users list should immediately reflect users for the new shop.

Given I am viewing users for Shop A,
When I switch to Shop B,
Then the table should update to show only Shop B users.

Given I navigate to /admin/users for Shop A,
When the page loads,
Then the X-Shop-ID header should contain Shop A's ID.
```

**Acceptance Criteria (Technical):**
- useAuthHttpShopId() hook automatically updates httpClient when currentShop changes
- All API calls include X-Shop-ID header
- Queries respect shop context automatically
- No manual shop filtering needed in component

---

## Implementation Strategy

### Phase 1: Setup & Routing (RED)
1. Create failing tests for Users page route protection
2. Create tests for API integration
3. Create tests for permission gates

### Phase 2: Components (GREEN)
1. Implement UsersPage component
2. Implement UsersTable component
3. Implement CreateUserModal, EditUserModal
4. Implement API service/hooks

### Phase 3: Validation (REFACTOR)
1. Run full test suite
2. Verify all guards work
3. Test shop switching
4. Verify permission inheritance
5. Performance testing with large user lists

---

## File Structure

```
src/app/
  features/
    users/
      api/
        useUsersApi.ts          # API hooks for CRUD operations
      components/
        UsersPage.tsx           # Main page component
        UsersTable.tsx          # Table with sorting/filtering
        CreateUserModal.tsx     # Create dialog
        EditUserModal.tsx       # Edit dialog
        DeleteConfirmDialog.tsx # Confirmation dialog
      __tests__/
        UsersPage.test.tsx      # Route & permission tests
        UsersTable.test.tsx     # Table rendering tests
        useUsersApi.test.ts     # API hook tests
        CreateUserModal.test.tsx
        EditUserModal.test.tsx
      types.ts                  # User, UserRole types
      index.ts                  # Exports
  routes.ts                     # Add /admin/users route
```

---

## Permission Matrix for Users Feature

| Role | Read | Create | Edit | Delete |
|------|------|--------|------|--------|
| USER | - | - | - | - |
| MODERATOR | ✓ | - | - | - |
| ADMIN | ✓ | ✓ | ✓ | ✓ |

---

## API Endpoints (Backend Integration)

```
GET    /api/users                    # List users (shop-scoped)
POST   /api/users                    # Create user
GET    /api/users/:id                # Get user details
PUT    /api/users/:id                # Update user
DELETE /api/users/:id                # Delete user
```

**All endpoints:** Automatically scoped to X-Shop-ID header

---

## Test Coverage Goals

- Route guard tests: Users page only accessible by ADMIN
- Permission gate tests: CRUD buttons hidden/disabled for non-admins
- API integration tests: X-Shop-ID injected, correct URLs
- Component tests: Forms validate, tables render, modals show/hide
- Multi-tenant tests: Shop switching updates users list
- Error handling: API failures show errors, retries work

**Target:** 85%+ coverage on Users feature

---

## Success Criteria

- ✓ AdminRoute blocks non-admins from /admin/users
- ✓ All CRUD operations gated by permission checks
- ✓ Users list refreshes on shop switch
- ✓ All 88+ new tests passing
- ✓ Form validation prevents invalid submissions
- ✓ Error messages user-friendly and actionable
- ✓ Permissions inherited correctly (ADMIN > MODERATOR > USER)
- ✓ X-Shop-ID header present on all API calls
