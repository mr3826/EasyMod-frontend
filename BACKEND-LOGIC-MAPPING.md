# Backend Logic → Frontend Implementation Mapping

**Purpose:** Ensure all backend business logic is properly maintained and represented in the frontend architecture. This document tracks which backend domains have structured API integration vs UI-only shells.

---

## Executive Summary

| Status | Domains | Count |
|--------|---------|-------|
| ✅ **Fully Structured** | Auth (with TypeScript types, Zod validation, TanStack Query hooks) | 1 |
| 🟡 **Partially Implemented** | Products, Categories, Orders, Customers, Channels, Inbox, Reports, Dashboard, Settings, Shop, Subscription, Knowledge, Support | 13 |
| ❌ **Missing/Underrepresented** | Moderation Rules, Conversation Automation, Audit Logs, Webhooks/Integrations, Billing Invoices, Admin RBAC, Analytics Deep Layer | 7 |
| **TOTAL** | 21 Backend Domains | 21 |

---

## Backend Domains → Frontend Architecture Mapping

### 1. **Auth** ✅ FULLY STRUCTURED
**Backend:** [src/modules/auth](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/auth)

**Frontend Implementation:**
- ✅ **Types (Zod):** [src/features/auth/types/index.ts](d:/hexabyte/easy-moderator/EasyMod-frontend/src/features/auth/types/index.ts) - LoginInput, RegisterInput, TokenResponse, SessionUser
- ✅ **API Queries:** [src/features/auth/api/queries.ts](d:/hexabyte/easy-moderator/EasyMod-frontend/src/features/auth/api/queries.ts) - useGetCurrentUser, useRefreshToken
- ✅ **API Mutations:** [src/features/auth/api/mutations.ts](d:/hexabyte/easy-moderator/EasyMod-frontend/src/features/auth/api/mutations.ts) - useLogin, useRegister, useLogout
- ✅ **Hooks:** useAuth context hook for session access
- ✅ **Components:** SignIn, Signup, ForgotPassword, ResetPassword
- ✅ **Error Handling:** Uses NormalizedApiError (401 → UNAUTHORIZED, validation errors captured)
- ✅ **Business Logic:** Session state + role-based access control

**Backend Validation Rules Maintained:**
- Email format + required (Joi schema)
- Password min length (6 chars)
- Password confirmation match on register
- TOTP if enabled on account
- Session token expiry

**Status:** READY FOR PRODUCTION ✅

---

### 2. **User Management** 🟡 PARTIAL
**Backend:** [src/modules/user](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/user), [src/modules/user-shop](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/user-shop)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/...](pending reference)
- ❌ **Types (Zod):** Not found - should validate user profile, permissions, shop access
- ❌ **API Queries:** No structured queries module - should include useGetUser, useListUsers, useGetPermissions
- ❌ **API Mutations:** No mutations module - should include useUpdateUserProfile, useChangePassword, useSetUserShopAccess
- ❌ **Business Logic:** Tenancy/shop access control scattered, not centralized

**Backend Validation Rules MISSING:**
- ❌ User role enum (ADMIN, MODERATOR, REVIEWER, USER)
- ❌ Shop permission matrix validation
- ❌ User status (active, suspended, archived)
- ❌ Multi-shop access control

**Action Required:** Create src/features/user/ with full API structure → See Migration Plan

---

### 3. **Products** 🟡 PARTIAL
**Backend:** [src/modules/product](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/product)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/Products](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/Products.tsx)
- ❌ **Types (Zod):** Not found - should validate Product, ProductVariant, pricing, SKU
- ❌ **API Queries:** No structured module - should include useListProducts, useGetProduct, useSearchProducts
- ❌ **API Mutations:** No mutations module - should include useCreateProduct, useUpdateProduct, useDeleteProduct, useBulkImport
- ❌ **Business Logic:** Price validation, variant management, SKU uniqueness

**Backend Validation Rules MISSING:**
- ❌ Price > 0 (positive number)
- ❌ SKU uniqueness per shop
- ❌ Variant option validation (color, size, etc.)
- ❌ Category association validation
- ❌ Tax rate applicability
- ❌ Weight unit enum (kg, lb, g, oz)
- ❌ Image upload size/format limits

**Action Required:** Create src/features/products/ with full API structure → See Migration Plan

---

### 4. **Categories** 🟡 PARTIAL
**Backend:** [src/modules/category](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/category)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/Categories](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/Categories.tsx)
- ❌ **Types (Zod):** Not found - should validate Category, parent-child hierarchy
- ❌ **API Queries:** No structured module
- ❌ **API Mutations:** No mutations module
- ❌ **Business Logic:** Hierarchy validation, cyclical reference prevention

**Backend Validation Rules MISSING:**
- ❌ Category name required, unique per shop
- ❌ Parent category existence validation
- ❌ Prevent self-referencing or circular hierarchies
- ❌ Sort order management

**Action Required:** Create src/features/categories/ → See Migration Plan

---

### 5. **Orders** 🟡 PARTIAL
**Backend:** [src/modules/order](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/order)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/Orders](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/Orders.tsx)
- ❌ **Types (Zod):** Not found - should validate Order, OrderItem, status transitions
- ❌ **API Queries:** No structured module - useListOrders, useGetOrder, useGetOrderStats
- ❌ **API Mutations:** No mutations module - useCreateOrder, useUpdateOrderStatus, useAddOrderNote, useAssignDriver
- ❌ **Business Logic:** Status machine (pending → processing → shipped → delivered → cancelled), workflow state validation

**Backend Validation Rules MISSING:**
- ❌ Order status enum (pending, processing, shipped, delivered, cancelled, refunded)
- ❌ Status transition validation (can't go from shipped → pending)
- ❌ Delivery provider assignment constraints
- ❌ Payment status alignment with order status
- ❌ Customer + shop association validation

**Action Required:** Create src/features/orders/ with state machine → See Migration Plan

---

### 6. **Customers** 🟡 PARTIAL
**Backend:** [src/modules/customer](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/customer)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/Customers](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/Customers.tsx)
- ❌ **Types (Zod):** Not found
- ❌ **API Queries:** No structured module
- ❌ **API Mutations:** No mutations module
- ❌ **Business Logic:** Customer segmentation, purchase history, lifetime value

**Backend Validation Rules MISSING:**
- ❌ Email format, phone format validation
- ❌ Duplicate customer detection (same phone/email)
- ❌ Customer status (active, blocked, deleted)

**Action Required:** Create src/features/customers/ → See Migration Plan

---

### 7. **Conversations/Messaging** 🟡 PARTIAL
**Backend:** [src/modules/conversation](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/conversation)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/UnifiedInbox](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/UnifiedInbox.tsx)
- ❌ **Types (Zod):** Not found
- ❌ **API Queries:** No structured module
- ❌ **API Mutations:** No mutations module
- ❌ **Business Logic:** Conversation state, message threading, assignment routing

**Backend Validation Rules MISSING:**
- ❌ Message content validation
- ❌ Conversation status (open, in-progress, resolved, archived)
- ❌ Assignment permission validation

**Action Required:** Create src/features/conversations/ → See Migration Plan

---

### 8. **AI/Intent Analysis** 🟡 PARTIAL
**Backend:** [src/modules/ai](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/ai), [src/modules/sentiment](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/sentiment)

**Frontend Implementation:**
- ❌ **Page Component:** No dedicated UI found for AI configuration
- ❌ **Types (Zod):** Not found
- ❌ **API Queries:** No structured module - useGetSentimentAnalysis, useGetIntentAnalysis
- ❌ **API Mutations:** Not found
- ❌ **Business Logic:** AI model selection, confidence thresholds, guardrails

**Backend Validation Rules MISSING:**
- ❌ AI model tier selection based on subscription plan
- ❌ Confidence threshold validation (0-1 range)
- ❌ Intent category constraints
- ❌ Model availability rules (language, regions)

**Action Required:** Create src/features/ai/ → See Migration Plan

---

### 9. **Templates/Response Automation** 🟡 PARTIAL
**Backend:** [src/modules/template](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/template)

**Frontend Implementation:**
- 🟡 **Page Component:** Likely part of ChatSettings or Dashboard
- ❌ **Types (Zod):** Not found
- ❌ **API Queries:** No structured module - useListTemplates, useGetTemplate
- ❌ **API Mutations:** No mutations module - useCreateTemplate, useUpdateTemplate, useDeleteTemplate, useRenderTemplate
- ❌ **Business Logic:** Template variable substitution, preview generation

**Backend Validation Rules MISSING:**
- ❌ Template name required, unique per shop
- ❌ Variable placeholder format validation
- ❌ Max template length (2000000 bytes per validator)
- ❌ Render validation (variables provided)

**Action Required:** Create src/features/templates/ → See Migration Plan

---

### 10. **Knowledge Base/FAQ** 🟡 PARTIAL
**Backend:** [src/modules/knowledge](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/knowledge)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/Knowledge](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/Knowledge.tsx)
- ❌ **Types (Zod):** Not found
- ❌ **API Queries:** No structured module
- ❌ **API Mutations:** No mutations module
- ❌ **Business Logic:** FAQ hierarchy, search/filters, knowledge gap analysis

**Backend Validation Rules MISSING:**
- ❌ FAQ/Document title, content required
- ❌ Search indexing logic
- ❌ Knowledge gap detection from unanswered questions
- ❌ Language normalization rules

**Action Required:** Create src/features/knowledge/ → See Migration Plan

---

### 11. **Channels/Integrations** 🟡 PARTIAL
**Backend:** [src/modules/channel](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/channel), [src/modules/integration](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/integration)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/Channels](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/Channels.tsx)
- ❌ **Types (Zod):** Not found
- ❌ **API Queries:** No structured module
- ❌ **API Mutations:** No mutations module
- ❌ **Business Logic:** Connection lifecycle, credential validation, provider-specific config

**Backend Validation Rules MISSING:**
- ❌ Channel type enum validation
- ❌ Provider-specific credentials (Pathao: client_id, client_secret, username, password; Steadfast: api_key, secret_key)
- ❌ Connection status machine (pending, connected, disconnected, failed)
- ❌ Config validation per provider

**Action Required:** Create src/features/channels/ with conditional validation → See Migration Plan

---

### 12. **Delivery Management** 🟡 PARTIAL
**Backend:** [src/modules/delivery](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/delivery), [src/modules/delivery-rag](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/delivery-rag)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/DeliverySettings](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/DeliverySettings.tsx)
- ❌ **Types (Zod):** Not found
- ❌ **API Queries:** No structured module
- ❌ **API Mutations:** No mutations module
- ❌ **Business Logic:** Provider credential validation, RAG-assisted delivery matching

**Backend Validation Rules MISSING:**
- ❌ Provider-specific credential validation (Pathao vs Steadfast)
- ❌ Area/zone coverage validation
- ❌ Cost calculation logic
- ❌ Coverage area hierarchy validation

**Action Required:** Create src/features/delivery/ with provider-specific validation → See Migration Plan

---

### 13. **Payments** 🟡 PARTIAL
**Backend:** [src/modules/payment](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/payment)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/PaymentSettings](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/PaymentSettings.tsx)
- ❌ **Types (Zod):** Not found
- ❌ **API Queries:** No structured module
- ❌ **API Mutations:** No mutations module
- ❌ **Business Logic:** Payment method management, processing rules

**Backend Validation Rules MISSING:**
- ❌ Payment method types (credit card, bank transfer, digital wallet)
- ❌ Gateway credential validation
- ❌ Transaction status tracking

**Action Required:** Create src/features/payments/ → See Migration Plan

---

### 14. **Subscriptions/Billing** 🟡 PARTIAL
**Backend:** [src/modules/subscription](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/subscription), [src/modules/invoice](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/invoice)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/Subscription](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/Subscription.tsx)
- 🟡 **Hooks:** [src/app/lib/useSubscriptionFeatures.ts](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/lib/useSubscriptionFeatures.ts) - Feature gating exists
- ❌ **Types (Zod):** Not found - should validate Plan, Invoice, subscription transitions
- ❌ **API Queries:** No structured module - useGetSubscription, useListPlans, useGetInvoices
- ❌ **API Mutations:** No mutations module - useUpgradePlan, useDowngradePlan, useCancelSubscription
- ❌ **Business Logic:** Plan feature gate enforcement, billing cycle, renewal automation

**Backend Validation Rules MISSING:**
- ❌ Plan tier enum (free, starter, professional, enterprise)
- ❌ Feature availability by plan (LLM models, automation modes, languages)
- ❌ Billing date + renewal cycle validation
- ❌ Proration calculation for mid-cycle changes
- ❌ Invoice generation triggers

**Action Required:** Create src/features/subscriptions/ → See Migration Plan

---

### 15. **Dashboard & Analytics** 🟡 PARTIAL
**Backend:** [src/modules/dashboard](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/dashboard), [src/modules/analytics](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/analytics)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/Dashboard](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/Dashboard.tsx)
- 🟡 **Page Component:** [src/app/components/Reports](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/Reports.tsx)
- ❌ **Types (Zod):** Not found - should validate metrics schema, chart data
- ❌ **API Queries:** No structured module - useGetDashboardMetrics, useGetChartData, useGetAnalytics
- ❌ **API Mutations:** Not needed (read-only)
- ❌ **Business Logic:** Metric calculation, chart aggregation, time range filtering

**Backend Validation Rules MISSING:**
- ❌ Metric definition schema
- ❌ Time range constraints (date picker limits)
- ❌ Segmentation/filter validation (by LLM model, intent type, response time, etc.)

**Action Required:** Create src/features/analytics/ → See Migration Plan

---

### 16. **API Key Management** ❌ MISSING
**Backend:** [src/modules/api-access](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/api-access)

**Frontend Implementation:**
- ❌ **Page Component:** Not found
- ❌ **Types (Zod):** Not found
- ❌ **API Queries:** Not found - should useListApiKeys, useGetApiKey, useGetApiScopes
- ❌ **API Mutations:** Not found - useCreateApiKey, useRevokeApiKey, useRotateApiKey
- ❌ **Business Logic:** Key generation, scope management, usage tracking

**Backend Validation Rules NOT IMPLEMENTED:**
- ❌ API scope enum validation
- ❌ Secret key masking (never show full key after creation)
- ❌ Rate limit configuration per key
- ❌ Expiry date validation

**Action Required:** Create src/features/api-keys/ → See Migration Plan

---

### 17. **Webhooks** ❌ MISSING
**Backend:** [src/modules/webhook](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/webhook)

**Frontend Implementation:**
- ❌ **Page Component:** Not found
- ❌ **Types (Zod):** Not found
- ❌ **API Queries:** Not found - useListWebhooks, useGetWebhook, useGetWebhookLogs
- ❌ **API Mutations:** Not found - useCreateWebhook, useUpdateWebhook, useDeleteWebhook, useTestWebhook
- ❌ **Business Logic:** Event routing, retry logic, delivery status

**Backend Validation Rules NOT IMPLEMENTED:**
- ❌ Webhook URL validation (HTTPS)
- ❌ Event type enum (order.placed, conversation.received, etc.)
- ❌ Payload schema per event type
- ❌ Signature/secret key management

**Action Required:** Create src/features/webhooks/ → See Migration Plan

---

### 18. **Audit Logs** ❌ MISSING
**Backend:** [src/modules/audit](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/audit)

**Frontend Implementation:**
- ❌ **Page Component:** Not found
- ❌ **Types (Zod):** Not found - should validate AuditLog schema
- ❌ **API Queries:** Not found - useListAuditLogs, useGetAuditLog
- ❌ **API Mutations:** Not needed (read-only)
- ❌ **Business Logic:** Filtering by action type, user, date range, entity

**Backend Validation Rules NOT IMPLEMENTED:**
- ❌ Audit action enum (CREATE, UPDATE, DELETE, etc.)
- ❌ Entity type validation
- ❌ Timestamp/date filtering
- ❌ User action attribution

**Action Required:** Create src/features/audit-logs/ → See Migration Plan

---

### 19. **User Tenant/Shop Access Control** ❌ PARTIALLY REPRESENTED
**Backend:** [src/middleware/shop-access.middleware.js](d:/hexabyte/easy-moderator/EasyMod-backend/src/middleware/shop-access.middleware.js)

**Frontend Implementation:**
- ❌ **Centralized Guard:** No explicit feature guard/middleware layer created yet
- 🟡 **FeatureGate Component:** [src/app/components/FeatureGate.tsx](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/FeatureGate.tsx) exists but is subscription-based, not tenant/shop based
- ❌ **Shop Context:** No Redux/Context store for current shop selection

**Backend Validation Rules NOT FULLY REFLECTED:**
- ❌ User → Shop access matrix validation
- ❌ Multi-shop selection/switching UI
- ❌ Shop-scoped data isolation (filters all queries by active shop)

**Action Required:** Create src/shared/hooks/useShopAccess.ts + context provider → See Migration Plan

---

### 20. **System Settings & Automation** 🟡 PARTIAL
**Backend:** [src/modules/shop](d:/hexabyte/easy-moderator/EasyMod-backend/src/modules/shop) (shop controller has plan/feature rules)

**Frontend Implementation:**
- 🟡 **Page Component:** [src/app/components/ManageShop](d:/hexabyte/easy-moderator/EasyMod-frontend/src/app/components/ManageShop.tsx), ChatSettings
- ❌ **Types (Zod):** Not found - should validate shop config, automation mode, LLM model selection
- ❌ **API Queries:** No structured module
- ❌ **API Mutations:** No mutations module
- ❌ **Business Logic:** Automation mode selection, LLM model scoping by plan, language restrictions

**Backend Validation Rules MISSING:**
- ❌ Automation mode enum (MANUAL, AUTO, HYBRID)
- ❌ LLM model availability by subscription plan
- ❌ Language support matrix
- ❌ Allowed mode/model/language combinations per plan

**Action Required:** Create src/features/shop-settings/ with conditional validation → See Migration Plan

---

## Feature Implementation Status Summary Table

| Backend Domain | Frontend Page | API Queries | API Mutations | Zod Types | Status | Priority |
|---|---|---|---|---|---|---|
| Auth | ✅ SignIn/Signup | ✅ | ✅ | ✅ | ✅ Ready | - |
| Users | ✅ (pending) | ❌ | ❌ | ❌ | 🟡 Partial | 🔴 HIGH |
| Products | ✅ Products | ❌ | ❌ | ❌ | 🟡 Partial | 🔴 HIGH |
| Categories | ✅ Categories | ❌ | ❌ | ❌ | 🟡 Partial | 🔴 HIGH |
| Orders | ✅ Orders | ❌ | ❌ | ❌ | 🟡 Partial | 🔴 HIGH |
| Customers | ✅ Customers | ❌ | ❌ | ❌ | 🟡 Partial | 🟡 MEDIUM |
| Conversations | ✅ UnifiedInbox | ❌ | ❌ | ❌ | 🟡 Partial | 🔴 HIGH |
| AI/Intent | ❌ (embedded) | ❌ | ❌ | ❌ | ❌ Missing | 🟡 MEDIUM |
| Templates | 🟡 (embedded) | ❌ | ❌ | ❌ | 🟡 Partial | 🟡 MEDIUM |
| Knowledge Base | ✅ Knowledge | ❌ | ❌ | ❌ | 🟡 Partial | 🟡 MEDIUM |
| Channels | ✅ Channels | ❌ | ❌ | ❌ | 🟡 Partial | 🔴 HIGH |
| Delivery | ✅ DeliverySettings | ❌ | ❌ | ❌ | 🟡 Partial | 🟡 MEDIUM |
| Payments | ✅ PaymentSettings | ❌ | ❌ | ❌ | 🟡 Partial | 🟡 MEDIUM |
| Subscriptions | ✅ Subscription | ✅ (basic) | ❌ | ❌ | 🟡 Partial | 🔴 HIGH |
| Analytics | ✅ Dashboard/Reports | ❌ | ❌ | ❌ | 🟡 Partial | 🟡 MEDIUM |
| API Keys | ❌ | ❌ | ❌ | ❌ | ❌ Missing | 🟢 LOW |
| Webhooks | ❌ | ❌ | ❌ | ❌ | ❌ Missing | 🟢 LOW |
| Audit Logs | ❌ | ❌ | ❌ | ❌ | ❌ Missing | 🟢 LOW |
| Shop Access Control | 🟡 (embedded) | ❌ | ❌ | ❌ | 🟡 Partial | 🔴 HIGH |
| System Settings | 🟡 (embedded) | ❌ | ❌ | ❌ | 🟡 Partial | 🟡 MEDIUM |

---

## Critical Business Logic Gaps

### 🔴 **HIGH PRIORITY** - Core System Functionality
1. **User Permission System** - No centralized role/permission validation
   - Backend enforces roles (ADMIN, MODERATOR, REVIEWER, USER) but frontend has no guard layer
   - **Fix:** Create src/shared/hooks/useUserPermissions.ts + role-based route guards

2. **Shop/Tenant Isolation** - Current features don't enforce shop scoping
   - Backend enforces shop-access middleware but frontend might be loading cross-shop data
   - **Fix:** Create src/shared/context/ShopContext.ts, force all queries to include `shopId`

3. **Order Status State Machine** - No workflow validation
   - Backend allows only valid status transitions, frontend might allow invalid ones
   - **Fix:** Create src/features/orders/lib/orderStateMachine.ts (xstate or simple validator)

4. **Subscription Plan Gating** - Feature availability not fully enforced
   - Backend has plan-specific LLM models, languages, automation modes
   - Frontend has basic FeatureGate but doesn't prevent UI access to disabled features
   - **Fix:** Enhance src/app/lib/useSubscriptionFeatures.ts to throw/block on feature access

### 🟡 **MEDIUM PRIORITY** - Data Integrity
5. **Validation Schemas Consistency** - Zod schemas only in auth, missing everywhere else
   - Backend Joi validators not mirrored in frontend
   - **Fix:** Create Zod for all features (priority: Products, Orders, Subscriptions)

6. **API Error Handling** - NormalizedApiError exists but not used consistently
   - Some features might fall back to generic error display
   - **Fix:** Audit all feature mutations to use isApiError + getErrorMessage

7. **Cross-Domain Validation** - No enforcement of entity relationships
   - Example: Can frontend create Order without valid Customer + Shop?
   - **Fix:** Add relationship validation to query/mutation hooks

### 🟢 **LOW PRIORITY** - Admin/Reporting
8. **Audit Trail** - No frontend access to audit logs
9. **Webhooks** - No management UI
10. **API Keys** - No management UI

---

## Migration Strategy to Ensure Business Logic Maintained

### Phase 1: Foundation (DONE) ✅
- ✅ HTTP client with error handling
- ✅ Shared types + interfaces
- ✅ Auth feature fully structured (template for all others)
- ✅ Feature scaffold generator

### Phase 2: Core Features (NEXT - Weeks 4-6)
**Objective:** Migrate 5-7 core features to ensure business logic is captured

**Order of Migration** (dependencies-first):
1. **Users** (required by all other features for permissions/tenancy)
2. **Subscriptions** (required by Shop Settings for plan gating)
3. **Products** (required by Orders for item details)
4. **Categories** (required by Products)
5. **Orders** (requires Products + Users + Shop context)
6. **Customers** (required by Orders)
7. **Conversations** (independent, high user value)

**For Each Feature Migration:**
- ✅ Create types/ with Zod schemas matching backend Joi validators
- ✅ Create api/queries.ts with all fetch operations using TanStack Query
- ✅ Create api/mutations.ts with all mutations + query invalidation
- ✅ Create hooks/ for stateful logic (status machine, conditional rendering)
- ✅ Update existing components to use new API hooks
- ✅ Create 70% coverage tests
- ✅ Document validation rules specific to that domain

### Phase 3: Specialized Systems (Weeks 7-10)
- **Shop/Tenant Isolation:** Create ShopContext + useShopId hook, force shop-scoping on all queries
- **Permission System:** Create useUserPermissions + route guards
- **Order Workflow:** Create orderStateMachine with allowed transitions
- **Plan Gating:** Enhance useSubscriptionFeatures to prevent UI access to blocked features
- **Admin Features:** Add Audit Logs, Webhooks, API Keys management UIs

---

## Validation Matrix: Backend Rules → Frontend Implementation

### Example: Product Domain
**Backend Validation (Joi):**
```javascript
// price > 0, sku unique per shop, category exists, weight_unit in enum
```

**Frontend Implementation Needed:**
```typescript
// src/features/products/types/index.ts
const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  sku: z.string().min(1), // Validated per shop in mutation
  price: z.number().positive('Price must be > 0'),
  weight: z.number().nonnegative(),
  weight_unit: z.enum(['kg', 'lb', 'g', 'oz']),
  categoryId: z.string().uuid() // Validated exists in mutation
});

// src/features/products/api/mutations.ts
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      const validated = ProductSchema.parse(input);
      const response = await httpClient.post('/products', validated);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productQueries.lists() });
    },
    onError: (error) => {
      if (isApiError(error) && error.type === 'VALIDATION_ERROR') {
        // Field-level validation feedback
        console.log(error.validationErrors); // { sku: ['SKU already exists'] }
      }
    }
  });
};
```

---

## Checklist: Ensuring Backend Logic in Frontend

- [ ] **Type Safety:** Every API endpoint has a Zod schema (input + response)
- [ ] **Validation:** Frontend validates before submission + handles 400 field errors
- [ ] **Authorization:** User permissions checked before rendering/enabling features
- [ ] **Tenancy:** All queries filtered by current shop/tenant
- [ ] **Relationships:** Entity relationships validated (e.g., Order.customerId exists)
- [ ] **State Machines:** Workflow/status transitions validated via state machine
- [ ] **Plan Gating:** Subscription plan restrictions enforced in UI + queries
- [ ] **Error Handling:** All mutations use NormalizedApiError + consistent UI feedback
- [ ] **Cascading Updates:** Create/Update/Delete mutations invalidate dependent caches
- [ ] **Immutability Patterns:** Read-only operations don't mutate state
- [ ] **Audit Trail:** User actions logged (email, timestamp, action) in frontend events
- [ ] **Optimistic Updates:** High-confidence mutations show instant UI updates
- [ ] **Offline Support:** Cache strategy preserves data if connection lost (optional)
- [ ] **Testing:** 70% code coverage, including business logic tests (not just component render)

---

## Action Items Summary

| Action | Owner | Timeline | Blocks |
|---|---|---|---|
| Migrate Users feature to new architecture | Dev | Week 4 | All other features |
| Migrate Subscriptions with plan gating enforcement | Dev | Week 4 | Shop Settings |
| Migrate Products → Categories → Orders | Dev | Week 5-6 | Order workflow |
| Create ShopContext + useShopId hook | Dev | Week 7 | Shop isolation guarantee |
| Create useUserPermissions + route guards | Dev | Week 7 | Permission enforcement |
| Create orderStateMachine in x-state | Dev | Week 8 | Order workflow validation |
| Audit validation coverage for all domains | QA | Week 6 | Demo readiness |
| Create deployment integration tests | QA | Week 9 | Production release |

---

**Last Updated:** 2026-03-26  
**Owner:** Frontend Architecture Lead  
**Status:** In Progress - Phase 2 Pending User Initiation
