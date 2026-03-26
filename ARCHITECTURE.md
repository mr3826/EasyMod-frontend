# EasyMod Frontend Architecture

**Last Updated:** March 26, 2026  
**Status:** In Progress (Phase 1 - Quick Wins)

## Overview

EasyMod Frontend is transitioning from a hybrid/mixed architecture to a **feature-first modular architecture** with centralized API layer and consistent state management using TanStack Query.

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx                    // Root layout + providers
│   ├── error.tsx                     // Global error boundary  
│   ├── routes.ts                     // Route definitions
│   └── App.tsx                       // Router config (minimal)
│
├── features/                         // Feature-driven modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types/
│   │   └── __tests__/
│   ├── dashboard/
│   ├── products/
│   ├── orders/
│   ├── inventory/
│   ├── analytics/
│   └── [feature]/
│       ├── components/               // Feature-local components
│       ├── hooks/                    // useQuery/useMutation hooks
│       ├── api/
│       │   ├── queries.ts            // TanStack Query hooks
│       │   ├── mutations.ts          // TanStack Mutations
│       │   └── types.ts              // Zod schemas + types
│       ├── types/
│       ├── utils/
│       └── __tests__/
│
├── shared/                           // Cross-feature shared code
│   ├── lib/
│   │   ├── http/
│   │   │   ├── client.ts             // Axios + interceptors
│   │   │   ├── errors.ts             // Error normalization
│   │   │   └── index.ts
│   │   ├── config/
│   │   │   ├── app.ts                // App config
│   │   │   ├── api.ts                // API endpoints
│   │   │   └── flags.ts              // Feature flags
│   │   ├── utils/                    // Pure utilities
│   │   └── i18n/
│   ├── ui/                           // shadcn design system
│   ├── hooks/
│   │   ├── useAsync.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── types/
│   │   └── common.ts                 // App-wide types
│   └── __tests__/
│
└── tests/
    ├── e2e/                          // Playwright specs
    ├── fixtures/                     // Test data
    └── helpers/                      // Test utilities
```

## Architecture Principles

### 1. Feature-First Organization
- Each feature is self-contained with its own components, hooks, API layer, and tests
- Features are lazy-loaded via React Router
- Promotes code ownership and parallel team development

### 2. Centralized API Layer
- All HTTP communication goes through `src/shared/lib/http/client.ts`
- Features expose data access via query/mutation hooks (`api/queries.ts`, `api/mutations.ts`)
- Components should **never** call the HTTP client directly
- All API errors automatically normalized via `normalizeApiError()`

### 3. Consistent State Management
- **Server State:** TanStack Query (via feature query/mutation hooks)
- **Auth State:** React Context (`AuthProvider`)
- **App State:** Minimal local component state (prefer URL params)
- **UI State:** Avoid global stores; use local state + URL for filters/UI state

### 4. Type Safety
- 100% TypeScript strict mode
- Zod schemas for API contracts
- TanStack Query strongly typed
- Shared types in `src/shared/types/`

### 5. Testing Strategy
```
Unit Tests (src/features/*/api/*.test.ts)
├── Pure utility functions
├── Query key builders
└── Error mappers

Integration Tests (src/features/*/components/*.test.tsx)
├── Hooks + component trees (renderHook + render)
├── Mock API responses
└── User interactions (fireEvent, userEvent)

E2E Tests (tests/e2e/*)
├── Critical user journeys (auth, payment, admin flows)
├── Cross-feature workflows
└── Real API + database
```

## Phase 1: Quick Wins (Weeks 1-2)

- [x] Create new directory structure
- [x] Implement centralized HTTP client (`src/shared/lib/http/`)
- [x] Create error normalization layer
- [ ] Migrate top 3 features to query hooks pattern
- [ ] Add coverage thresholds to vitest.config.ts
- [ ] Lock down folder conventions in .eslintrc
- [ ] Add route-level lazy loading

## Phase 2: Structural (Weeks 3-6)

- [ ] Consolidate `src/app/lib` → `src/shared/lib`
- [ ] Migrate remaining features to modular structure
- [ ] Build standardized API hooks across all domains
- [ ] Add Zod runtime validation at API boundary
- [ ] Set up `.github/workflows/bundle-analysis.yml`

## Phase 3: Optimization (Weeks 7-10)

- [ ] Lazy-load heavy dependencies
- [ ] Implement image optimization
- [ ] Add performance budget checks to CI
- [ ] Set up Lighthouse CI integration
- [ ] Memoize expensive list renders

## Best Practices

### Creating a New Feature

1. Create folder structure:
   ```bash
   mkdir -p src/features/my-feature/{components,hooks,api,types,__tests__}
   ```

2. Define types (`types/index.ts`):
   ```typescript
   import { z } from 'zod';
   
   export const MyItemSchema = z.object({
     id: z.string(),
     name: z.string(),
   });
   
   export type MyItem = z.infer<typeof MyItemSchema>;
   ```

3. Create API hooks (`api/queries.ts`):
   ```typescript
   import { useQuery } from '@tanstack/react-query';
   import { httpClient } from '@shared/lib/http';
   import { MyItem } from '../types';
   
   export const myQueries = {
     all: () => ['my-feature'],
     lists: () => [...myQueries.all(), 'list'],
     list: (filters) => [...myQueries.lists(), { filters }],
     detail: (id) => [...myQueries.all(), 'detail', id],
   };
   
   export function useMyItems(filters?: any) {
     return useQuery({
       queryKey: myQueries.list(filters),
       queryFn: async () => {
         const { data } = await httpClient.get('/api/my-items');
         return data.data as MyItem[];
       },
     });
   }
   ```

4. Use in components:
   ```typescript
   import { useMyItems } from '../api/queries';
   
   export function MyFeature() {
     const { data, isLoading, error } = useMyItems();
     
     if (isLoading) return <Skeleton />;
     if (error) return <ErrorCard error={error} />;
     
     return <ItemList items={data} />;
   }
   ```

### API Error Handling

All errors are automatically normalized:

```typescript
import { useMyItems } from '../api/queries';
import { getErrorMessage, getValidationErrors } from '@shared/lib/http';

function MyComponent() {
  const { error } = useMyItems();
  
  if (error) {
    console.error(getErrorMessage(error));
    const validationErrors = getValidationErrors(error);
    // { email: ['Email is invalid'], ... }
  }
}
```

### Page Lazy Loading

```typescript
// src/app/routes.ts
const Dashboard = lazy(() => import('@features/dashboard/Dashboard'));
const Products = lazy(() => import('@features/products/Products'));

export const routes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/products', element: <Products /> },
];
```

## Testing Standards

### Unit Tests
```typescript
// src/features/my-feature/api/queries.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useMyItems } from './queries';
import { mockHttpClient } from '@test/mocks';

describe('useMyItems', () => {
  it('fetches items successfully', async () => {
    mockHttpClient.get.mockResolvedValue({ data: { data: [] } });
    const { result } = renderHook(() => useMyItems());
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

### Integration Tests
```typescript
// src/features/my-feature/components/MyList.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MyList } from './MyList';
import { createTestQueryClient } from '@test/helpers';

describe('MyList', () => {
  it('renders items', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MyList />
      </QueryClientProvider>
    );
    
    expect(screen.getByText('My Items')).toBeInTheDocument();
  });
});
```

## Environment Variables

```env
VITE_API_URL=http://localhost:3001
VITE_FEATURE_FLAGS=dashboard,analytics,voice
VITE_LOG_LEVEL=debug
```

## Performance Targets

- Initial Bundle: < 250KB (gzipped)
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Core Web Vitals: All green

## Contributing

1. Create a new feature folder under `src/features/`
2. Follow the folder structure above
3. Always use query/mutation hooks for data access
4. Add unit tests for business logic
5. Add integration tests for components
6. Use TypeScript strict mode
7. Keep components under 200 lines
8. Document complex logic with comments

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Router v7 Docs](https://reactrouter.com)
- [Zod Validation](https://zod.dev)
- [Vitest Testing](https://vitest.dev)
- [Playwright E2E](https://playwright.dev)
