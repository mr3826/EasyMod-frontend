# Frontend Business Logic Validation Strategy

**Objective:** Ensure the frontend faithfully implements all backend business logic, validation rules, and domain constraints, preventing data integrity issues and maintaining feature parity.

---

## Current State Assessment

### What We Have ✅
- **HTTP Client Layer:** Centralized error handling, retry logic, token injection (src/shared/lib/http/)
- **Type Safety Foundation:** Zod validation in auth feature, TypeScript strict mode
- **State Management:** TanStack Query for server state (replaces RTK Query)
- **Error Normalization:** NormalizedApiError with type-safe error handling
- **Auth Feature:** Fully structured with types/queries/mutations/hooks/components (1/21 domains complete)
- **Architecture Enforcement:** ESLint rules prevent regression to old patterns

### What's Missing ❌
- **20 Backend Domains** with UI shells but no structured data layers:
  - Users (critical) - No permission system connected
  - Products/Categories (high priority) - No validation, inventory management
  - Orders (high priority) - No status machine, workflow validation
  - Conversations (high priority) - No message threading validation
  - Subscriptions (high priority) - Plan feature gates not enforced
  - Channels/Integrations (high priority) - No provider-specific credential validation
  - Analytics/Reporting (medium) - Metric aggregation logic missing
  - Knowledge Base, Customers, Delivery, Payments, Settings (medium)
  - API Keys, Webhooks, Audit Logs (low) - Admin features not built yet

- **3 Critical Infrastructure Pieces:**
  - No centralized permission/role guard system
  - No tenant/shop isolation enforcement
  - No plan-based feature gating enforcement

---

## Business Logic Categories & Validation Layers

### 1. Input Validation (Frontend + Backend)
**Goal:** Catch errors early, improve UX with field-level feedback

**Current State:** Only Auth domain has Zod schemas

**What Each Feature Needs:**
```
✅ Extract all Joi validators from backend validator.js
✅ Convert to Zod schemas (ProductInputSchema, OrderStatusUpdateSchema, etc.)
✅ Parse input BEFORE mutation.mutateAsync()
✅ Display field-level errors from 400 responses (error.validationErrors)
```

**Example Gap:** Products feature allows submit without validating:
- Price > 0
- SKU uniqueness per shop
- Category existence
- Weight unit in enum

### 2. Authorization & Permission Checks
**Goal:** Prevent unauthorized access at UI level (backend is authoritative)

**Current State:** Missing entirely

**What's Needed:**
```
✅ User roles from auth context: ADMIN | MODERATOR | REVIEWER | USER
✅ Shop-level roles: OWNER | MANAGER | STAFF
✅ Feature-level permissions: delete_products, view_reports, manage_team, etc.
✅ Hook: useUserPermissions() with can(action, resource) method
✅ Route guards: Block navigation to protected pages
✅ Component guards: Hide/disable buttons based on permission
```

**Gap:** Currently no guards - admin-only pages accessible to non-admins if URL known

### 3. Tenancy / Shop Isolation
**Goal:** Ensure user only sees/modifies data for assigned shop(s)

**Current State:** Partially implemented via middleware, not enforced in frontend

**What's Needed:**
```
✅ Current shop context: useShopId() hook
✅ All queries include ?shopId=X parameter
✅ Shop switcher in UI for multi-shop users
✅ Query invalidation on shop switch
```

**Gap:** Features might show products from another shop if direct URL accessed

### 4. Business Rule Validation (Workflows, State Machines)
**Goal:** Prevent invalid state transitions, enforce business logic

**Current State:** Only basic endpoint validation exists

**Examples of Missing Logic:**
- **Orders:** Status machine (pending → processing → shipped → delivered). Frontend allows invalid transitions.
- **Subscriptions:** Plan changes trigger proration, feature downgrade validation.
- **Products:** Variant management prevents invalid combinations.
- **Conversations:** Assignment routing, escalation rules.

**What's Needed:**
```
✅ State machine per domain (allowedTransitions object or xstate)
✅ Validate transitions before mutation
✅ Disable invalid action buttons in UI
✅ Show clear error if backend rejects transition
```

### 5. Relationship/Foreign Key Validation
**Goal:** Prevent orphaned records, ensure data consistency

**Current State:** Not validated in frontend

**Examples:**
- Can't delete category if products use it
- Can't delete customer if orders exist
- Can't create order without valid customer + shop + products

**What's Needed:**
```
✅ Zod refine() for entity existence checks during mutation
✅ Disable delete buttons if related records exist
✅ Show "In use by X records" warning
```

### 6. Cascading Updates (Cache Invalidation)
**Goal:** Keep UI in sync when operations affect multiple caches

**Current State:** Partially implemented in auth, inconsistent elsewhere

**Pattern:**
```typescript
// Create order → invalidate:
//   - orders list
//   - customer detail (last_order_date changed)
//   - dashboard metrics
//   - inventory (if product stock affected)

onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['orders'] });
  queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['inventory'] });
}
```

**Gap:** Partial invalidation leads to stale data in other features

### 7. Plan-Based Feature Gating
**Goal:** Enforce subscription limits at UI level

**Current State:** useSubscriptionFeatures exists but not enforced consistently

**Examples:**
- Can't use advanced analytics on Free plan
- Can't enable voice processing on Starter plan
- Can't use certain LLM models without Pro+ plan

**What's Needed:**
```
✅ Feature availability matrix per plan
✅ Block UI access to unavailable features
✅ Throw error if user tries to call mutation on gated feature
✅ Show "Upgrade to unlock" prompts
```

---

## Validation Coverage Matrix

| Validation Type | Auth | Products | Orders | Subscriptions | Users | Contacts | Conversations | 15 Others |
|---|---|---|---|---|---|---|---|---|
| Input validation (Zod) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Permission checks | ✅ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| Shop isolation | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| State machine | ✅ | ❌ | ❌ | ❌ | N/A | N/A | ❌ | Many ❌ |
| Relationship validation | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Cache invalidation | ✅⚠️ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| Plan gating | N/A | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Legend:** ✅ Complete | ⚠️ Partial | ❌ Missing

---

## Implementation Roadmap: Phases to Ensure Backend Logic Maintained

### Phase 1: Infrastructure Foundation (DONE) ✅
- ✅ HTTP client with interceptors
- ✅ Error normalization layer
- ✅ Auth feature complete (validation strategy validated)
- ✅ Zod schema infrastructure
- ✅ TanStack Query pattern established

### Phase 2A: Permission & Tenancy System (Week 3-4) 🔴 CRITICAL
**Purpose:** Enable safe multi-shop/multi-user system

**Deliverables:**
1. **useUserPermissions hook** (shared/hooks/)
   - Extract roles from auth context
   - Implement can(action, resource) method
   - Export PERMISSION_MATRIX

2. **useShopId hook** (shared/context/)
   - Current shop ID from context/localStorage
   - Shop switcher component
   - Query invalidation on shop change

3. **Route guards** (/src/app/lib/)
   - ProtectedRoute component
   - Check user.role before rendering
   - Redirect to unauthorized page if needed

4. **Component guards** (shared/components/)
   - PermissionGate component (Hide/disable based on permission)
   - ShopGate component (Hide if shop not selected)

**Validation:** All queries include shopId parameter, only ADMIN can see other shops' data

### Phase 2B: Core Feature Migration (Week 4-6) 🔴 HIGH PRIORITY
**Order:** Users → Subscriptions → Products → Orders → Conversations

**For Each Feature, Follow:**
1. Create types/ with Zod schemas matching backend Joi
2. Create api/queries.ts with TanStack Query hooks
3. Create api/mutations.ts with invalidation strategy
4. Create hooks/ for stateful logic (state machines, conditional rendering)
5. Update components to use new API hooks
6. Write 70% coverage tests
7. Verify with Business Logic Checklist

**Validation:** All features pass BUSINESS-LOGIC-CHECKLIST.md verification before merging

### Phase 3: Advanced Features & Enforcement (Week 7-10)
1. **State Machines** (for domains with workflows)
   - Orders: status transitions
   - Subscriptions: plan changes, downgrades
   - Conversations: assignment, resolution

2. **Relationship Validation** (prevent orphaned records)
   - Zod refine() to check entity existence
   - Disable delete buttons if related records exist

3. **Cache Invalidation Audit**
   - Map all mutations to their cache effects
   - Verify cascading invalidation works
   - React Query DevTools validation

4. **Feature Gating Enforcement**
   - Audit expensive operations against subscription plan
   - Block UI access to gated features
   - Mutation errors if plan insufficient

---

## Business Logic Validation Checklist

**Before deploying ANY feature migration:**

- [ ] **Types:** All Joi validators from backend have Zod equivalents
- [ ] **Validation:** Zod.parse() called in mutation before sending
- [ ] **Error Display:** 400 responses show field-level validation errors
- [ ] **Permissions:** useUserPermissions().can() gates all operations
- [ ] **Shop Isolation:** All queries filtered by currentShopId
- [ ] **State Machines:** No invalid transitions allowed (if applicable)
- [ ] **Relationships:** Foreign key validation prevents orphaned records
- [ ] **Cache Invalidation:** Related caches invalidated (test with DevTools)
- [ ] **Plan Gating:** Premium features blocked on lower plans
- [ ] **Error Handling:** NormalizedApiError used everywhere (not generic errors)
- [ ] **Tests:** 70% coverage including business logic paths
- [ ] **Manual QA:** Test as non-admin user (permission denied scenarios)
- [ ] **Manual QA:** Test on Free plan (feature gating scenarios)
- [ ] **Manual QA:** Test invalid workflows (button disabled, clear error shown)

---

## Real-World Example: Preventing Data Corruption

### Scenario: Product Deletion Bug
**Without proper business logic:**
```typescript
// Components allows delete without checking
const handleDelete = () => {
  await httpClient.delete(`/products/${id}`); // No validation
};
```

**Result:** Product gets deleted, but Orders table still has references → orphaned orders, reports fail

### With Business Logic Implementation:
```typescript
// 1. Zod validates on create/update
const OrderItemSchema = z.object({
  productId: z.string().uuid(), // Must be valid UUID
  // Backend validates product exists + shop ownership
});

// 2. Query checks related records before enabling delete
const { data: relatedOrders } = useQuery({
  queryFn: () => httpClient.get(`/products/${id}/orders`),
});

// 3. Button disabled if orders exist
<button disabled={relatedOrders?.length > 0}>
  Delete Product
</button>

// 4. If user somehow calls mutation on protected product, backend rejects + frontend shows error
const { mutate: deleteProduct } = useMutation({
  mutationFn: (id: string) => httpClient.delete(`/products/${id}`),
  onError: (error) => {
    if (isApiError(error)) {
      toast.error(getErrorMessage(error)); // "Cannot delete product: In use by 5 orders"
    }
  },
});
```

**Result:** Data corruption prevented at UI + API layers

---

## Monitoring & Validation in Production

### Metrics to Track
```
[ ] Error rate for 400 (VALIDATION_ERROR) → Should be low (caught at UI)
[ ] Error rate for 403 (UNAUTHORIZED) → Should approach zero
[ ] Error rate for 404 (NOT_FOUND) → Should be zero (relationships validated)
[ ] Query invalidation latency → Should be <100ms (fast cache updates)
[ ] Feature gate bypasses → Should be zero (checked at mutation entry)
```

### Automated Validation (Post-Merge)
```bash
# New development:
npm run test -- --testPathPattern="features" --coverage
npm run lint -- --config .eslintrc-architecture-rules.js

# Pre-deploy:
npm run type-check  # Ensure Zod types match API responses
npm run build       # Catch tree-shaking issues

# In CI/CD:
- Run Business Logic Checklist via script
- Audit Zod schema version changes
- Check cache invalidation patterns
```

---

## Developer Workflow to Ensure Compliance

Every developer migrating a feature MUST:

1. **Read backend first**
   - Read [feature].validator.js in backend (extract Joi rules)
   - Read [feature].service.js (extract business logic)
   - Read [feature].controller.js (extract error handling)

2. **Use the checklist**
   - Open BUSINESS-LOGIC-CHECKLIST.md
   - Fill out "Extract Backend Business Logic" section
   - Follow all steps sequentially

3. **Create tests FIRST (TDD)**
   - Test Zod validation schema (reject invalid inputs)
   - Test mutation error handling (display field errors, permission denied, etc.)
   - Test state machine transitions (if applicable)

4. **Self-review before PR**
   - Run Business Logic Checklist one more time
   - Verify all 70% coverage gates pass
   - Verify no Zod validation is bypassed

5. **Code review asks**
   - "Can you show me the backend Joi validators?" (in PR description)
   - "Are all Joi rules reflected in Zod schema?"
   - "Do we handle all error types backend can return?"
   - "Is every query scoped to current shop?"
   - "Are dependent caches invalidated?"

---

## Success Criteria: "Backend Logic Maintained" ✅

| Criterion | How to Verify | Target |
|---|---|---|
| **Validation Parity** | Zod schemas match backend Joi 1:1 | 100% of Joi rules in Zod |
| **Error Handling** | All NormalizedApiError types used | 100% mutation errors handled |
| **Permission Enforcement** | Non-admin can't access admin features | 0 permission bypasses |
| **Shop Isolation** | User only sees own shop data | 0 cross-shop data leaks |
| **State Machine Correctness** | No invalid workflow transitions | 0 invalid state transitions |
| **Data Integrity** | No orphaned records | 0 referential integrity violations |
| **Cache Consistency** | UI data matches backend immediately after mutation | <100ms cache update |
| **Feature Gating** | Premium features blocked on lower plans | 100% gating enforcement |
| **Test Coverage** | All business logic paths tested | ≥70% line coverage |
| **Type Safety** | No `any` types | 0 `any` in shared/features |

---

## Timeline & Effort Estimate

| Phase | Effort | Timeline | Blockers |
|---|---|---|---|
| Permission + Tenancy System | 40-50 hours | Week 3-4 | None (foundation done) |
| Core Features (Users, Subscriptions, Products, Orders, Conversations) | 120-150 hours | Week 4-6 | Permission system |
| State Machines + Advanced Rules | 40-60 hours | Week 7-8 | Features migrated |
| Cache Invalidation Audit | 20-30 hours | Week 9 | All features migrated |
| Production Monitoring + Metrics | 10-15 hours | Week 10 | All validation complete |
| **TOTAL** | **230-305 hours** | **~10 weeks (Phase 1-3)** | - |

---

## Next Action: Start Phase 2A

User should now see:
1. Architecture foundation is solid (HTTP client, error handling, Zod pattern established)
2. Auth feature demonstrates the pattern for ALL other 20 domains
3. 3 critical systems need infrastructure (permissions, tenancy, plan gating)
4. Each domain migration follows the same structured process

**Command to get started:**
```bash
# Create Users feature (required before other features)
ts-node scripts/generate-feature.ts user

# Then follow steps in BUSINESS-LOGIC-CHECKLIST.md for User domain
```

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Last Updated:** 2026-03-26  
**Owner:** Frontend Architecture Lead
