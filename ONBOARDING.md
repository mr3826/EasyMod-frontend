# Architecture Onboarding Guide

This guide helps new developers get up to speed with the new frontend architecture.

---

## 🎯 Learning Path (30 minutes)

### 1. Quick Overview (5 min)
Read the **5 Core Principles** in [ARCHITECTURE.md](./ARCHITECTURE.md#core-principles):
- Feature-first organization
- Centralized API layer
- Consistent state management
- Type safety with Zod
- Testing strategy

### 2. File Structure Tour (5 min)
```
src/
├── shared/                    # Shared across all features
│   ├── lib/
│   │   ├── http/             # HTTP client (centralized)
│   │   └── utils.ts          # Utility functions
│   ├── types/
│   │   └── common.ts         # Global types
│   ├── hooks/                # Reusable hooks
│   └── ui/                   # Shared components
│
├── features/                  # Feature modules (self-contained)
│   ├── auth/                 # ✨ Example: Complete auth feature
│   │   ├── types/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── __tests__/
│   │   └── index.ts
│   │
│   ├── dashboard/            # (To migrate in Phase 2)
│   └── [feature-name]/       # Pattern repeats for each feature
```

### 3. Auth Feature Walkthrough (10 min)
Study `src/features/auth/` as your reference implementation:

**types/index.ts** - Data contracts
```typescript
// Zod schemas (validation)
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// TypeScript types (from Zod)
export type LoginInput = z.infer<typeof LoginSchema>;
```

**api/queries.ts** - Data fetching
```typescript
export function useProfile() {
  return useQuery({
    queryKey: authQueries.profile(),
    queryFn: async () => {
      const { data } = await httpClient.get('/api/auth/me');
      return data.data;
    },
  });
}
```

**api/mutations.ts** - Data mutations
```typescript
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input) => {
      const { data } = await httpClient.post('/api/auth/login', input);
      return data.data!.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authQueries.profile(), user);
    },
  });
}
```

**hooks/index.ts** - Custom hooks
```typescript
export function useAuth() {
  const { data: user, isLoading, error } = useProfile();
  return { user, isAuthenticated: !!user, isLoading, error };
}
```

**components/** - React components
```typescript
export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  return <form onSubmit={(e) => login(formData)}>...</form>;
}
```

### 4. Key Patterns (10 min)

#### Pattern 1: HTTP Client (centralized)
```typescript
// ✅ DO: Use centralized HTTP client
import { httpClient } from '@shared/lib/http';
const { data } = await httpClient.get('/api/users');

// ❌ DON'T: Direct axios or fetch
import axios from 'axios';
const { data } = await axios.get('/api/users');
```

#### Pattern 2: TanStack Query (all data fetching)
```typescript
// ✅ DO: Use TanStack Query hooks
export function useUsers() {
  return useQuery({
    queryKey: userQueries.all(),
    queryFn: () => httpClient.get('/api/users'),
  });
}

// In component:
const { data: users } = useUsers();

// ❌ DON'T: useState + useEffect
const [users, setUsers] = useState([]);
useEffect(() => {
  fetch('/api/users').then(r => r.json()).then(setUsers);
}, []);
```

#### Pattern 3: Type Safety (Zod)
```typescript
// ✅ DO: Validate API responses
import { z } from 'zod';
export const UserSchema = z.object({ id: z.string(), email: z.string().email() });
export type User = z.infer<typeof UserSchema>;

// ❌ DON'T: Assume API response shape
const user = response.data; // What if this changes?
```

#### Pattern 4: Error Handling (normalized)
```typescript
// ✅ DO: Handle normalized errors
import { isApiError, getErrorMessage } from '@shared/lib/http';

try {
  await httpClient.post('/api/users', payload);
} catch (error) {
  if (isApiError(error)) {
    console.log(error.statusCode); // 400, 401, 500, etc.
    console.log(error.message);    // "Invalid email format"
  }
}

// ❌ DON'T: Inconsistent error shapes
catch (error: any) {
  console.log(error.data?.message || error.message || 'Unknown error');
}
```

---

## 📋 Your First Feature: Step-by-Step

### Step 1: Create Feature Scaffold
```bash
npm run generate:feature my-feature
# Creates: src/features/my-feature/ with all templates
```

### Step 2: Define Types (types/index.ts)
Copy auth types pattern, adapt to your API:
```typescript
import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

export type Item = z.infer<typeof ItemSchema>;
```

### Step 3: Create Queries (api/queries.ts)
```typescript
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@shared/lib/http';

export const itemQueries = {
  all: () => ['items'] as const,
  list: () => [...itemQueries.all(), 'list'] as const,
};

export function useItems() {
  return useQuery({
    queryKey: itemQueries.list(),
    queryFn: async () => {
      const { data } = await httpClient.get('/api/items');
      return data.data;
    },
  });
}
```

### Step 4: Create Mutations (api/mutations.ts)
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@shared/lib/http';

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => httpClient.post('/api/items', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemQueries.list() });
    },
  });
}
```

### Step 5: Use in Component
```typescript
import { useItems, useCreateItem } from '@features/my-feature';

export function ItemsPage() {
  const { data: items, isLoading } = useItems();
  const { mutate: createItem, isPending } = useCreateItem();

  return (
    <div>
      {items?.map(item => <ItemCard key={item.id} item={item} />)}
      <button onClick={() => createItem({ title: 'New' })}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </div>
  );
}
```

### Step 6: Write Tests (__tests__/my-feature.test.ts)
```typescript
import { renderWithProviders } from '@test/testing-library';
import ItemsPage from '../components/ItemsPage';

describe('ItemsPage', () => {
  it('displays items', async () => {
    const { getByText } = renderWithProviders(<ItemsPage />);
    expect(getByText('Items')).toBeInTheDocument();
  });
});
```

### Step 7: Export from Feature (index.ts)
```typescript
export * from './types';
export * from './api';
export * from './components';
export * from './hooks';
```

### Step 8: Use in Router
```typescript
// OLD: import ComponentPage from '@/app/pages/ComponentPage';
// NEW:
import { ItemsPage } from '@features/my-feature';

const routes = [
  { path: '/items', element: <ItemsPage /> },
];
```

---

## 🧪 Testing Quick Start

```bash
# Run all tests
npm test

# Run tests for one feature
npm test -- src/features/my-feature

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# View coverage report
open coverage/index.html
```

**Coverage Thresholds:**
- Lines: 70%
- Functions: 70%
- Statements: 70%
- Branches: 60%

Coverage is enforced on all PRs. Tests will fail if below threshold.

---

## 🔗 Import Aliases

Use these import paths throughout your code:

```typescript
// ✅ Recommended
import { httpClient } from '@shared/lib/http';
import { Button } from '@shared/ui';
import { cn } from '@shared/lib/utils';
import { useAuth } from '@features/auth';
import { renderWithProviders } from '@test/testing-library';

// ❌ Avoid
import { httpClient } from '../../../../shared/lib/http';
import Button from '../../../../shared/ui/Button';
```

---

## ❌ ESLint Rules (Anti-patterns)

The following will fail ESLint checks:

```typescript
// ❌ DON'T: Import from old patterns
import { api } from '@/lib/api';           // Use @shared/lib/http
import { helper } from '@/app/lib/helper'; // Use @shared/lib/utils

// ❌ DON'T: Components > 250 lines
export function HugePage() {
  // ... 500 lines of code ...
}

// ❌ DON'T: Direct httpClient in components
export function UserCard() {
  const handleClick = async () => {
    const user = await httpClient.get('/api/users/1'); // ❌
  };
}
// Instead: Create api/queries.ts and use useQuery hook

// ❌ DON'T: Mix API calls and state management
const [user, setUser] = useState();
useEffect(() => {
  fetch('/api/user').then(setUser);
}, []); // ❌ Use TanStack Query instead
```

---

## 📚 Documentation Reference

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture principles, patterns, best practices | 20 min |
| [FEATURE-MIGRATION-GUIDE.md](./FEATURE-MIGRATION-GUIDE.md) | Step-by-step migration of existing features | 15 min |
| [PHASE-1-COMPLETE.md](./PHASE-1-COMPLETE.md) | What's been built, what's next | 10 min |
| `src/features/auth/` | Working reference implementation | 10 min |
| `TEMPLATE-queries.ts` | Query hook template | 5 min |
| `TEMPLATE-mutations.ts` | Mutation hook template | 5 min |

---

## 🚀 Common Tasks

### Build a new feature from scratch
```bash
npm run generate:feature new-feature
# Edit types/ → api/ → components/ → index.ts
npm test  # Verify coverage
npm run lint  # Check: ESLint passes
```

### Migrate old feature to new architecture
See [FEATURE-MIGRATION-GUIDE.md](./FEATURE-MIGRATION-GUIDE.md) (10-step process with examples)

### Fix ESLint violations
```bash
npm run lint -- --fix
# If auto-fix doesn't work:
# 1. Check .eslintrc-architecture-rules.js for rule
# 2. Update imports or structure accordingly
```

### Debug test failures
```bash
npm test -- src/features/my-feature --reporter=verbose
# Or run single test file:
npm test -- src/features/my-feature/__tests__/component.test.tsx
```

---

## 🤔 FAQ

**Q: Why TanStack Query instead of Redux/Zustand?**
A: TanStack Query specializes in server state (API data). It handles caching, background refetching, and synchronization better than Redux. Redux is for client state (UI state, preferences).

**Q: Do I have to use Zod?**
A: Yes. Zod provides runtime validation of API responses. If backend schema changes unexpectedly, Zod catches it early. Manual type definitions don't catch these issues.

**Q: Can I use fetch instead of httpClient?**
A: No. httpClient provides centralized retry logic, auth token injection, and error normalization. Direct fetch/axios bypasses these.

**Q: What if my feature is huge (500+ lines)?**
A: Split it into smaller components (<200 lines each) and multiple files. Each component should have 1-2 responsibilities. Use complex component hierarchies if needed, but each component stays small.

**Q: How do I share code between two features?**
A: If it's UI, put it in `src/shared/ui/`. If it's logic, put it in `src/shared/hooks/` or `src/shared/lib/`. If it's deeply tied to both features, reconsider the feature boundaries.

**Q: How do I test async code?**
A: Use `renderWithProviders()` which includes a test QueryClient. Mock httpClient in tests. See `src/test/testing-library.ts` for examples.

---

## 💡 Pro Tips

1. **Use query key factory pattern** - Keeps query keys consistent, enables bulk invalidation
2. **Colocate tests** - `.test.ts` files go in the same folder as code
3. **Use barrel exports** - Import from `@features/auth` instead of `@features/auth/hooks`
4. **Keep components pure** - Move side effects to hooks/queries
5. **Validate early** - Use Zod/TypeScript to catch errors at boundaries, not in components

---

## 🆘 Need Help?

1. **"How do I structure this?"** → Read ARCHITECTURE.md
2. **"How do I migrate my feature?"** → Read FEATURE-MIGRATION-GUIDE.md
3. **"How do I write tests?"** → Look at auth feature tests
4. **"What patterns should I use?"** → Read code examples in this guide
5. **"My ESLint is failing"** → Check rule in `.eslintrc-architecture-rules.js` and fix violation

---

**You're ready! Pick a feature and start building.** 🚀

For questions, refer to the documentation above. Welcome to the new architecture!
