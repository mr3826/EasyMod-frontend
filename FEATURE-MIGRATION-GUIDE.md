/**
 * Feature Migration Guide - Step-by-step process
 * 
 * This guide walks through migrating an existing feature to the new architecture.
 * Example: Migrating the "Dashboard" feature
 */

// ============================================================================
// STEP 1: Identify Feature Boundaries
// ============================================================================

/*
Before starting migration, identify what belongs to your feature:

Dashboard Feature:
├── Components:
│   ├── DashboardPage.tsx (main page component)
│   ├── StatCard.tsx (reusable component)
│   ├── ChartWidget.tsx (reusable component)
├── Types:
│   ├── statsTypes.ts (or extract from components)
├── API:
│   ├── getDashboardStats (currently in src/lib/api.ts)
│   ├── getRecentActivity (currently in src/lib/api.ts)
├── Hooks:
│   ├── useDashboardData (if exists, needs refactor)
├── State:
│   ├── dashboardStore (if using Zustand/Redux)
├── Tests:
│   ├── DashboardPage.test.tsx (if exists)
├── Styles:
│   ├── dashboard.css (if not using Tailwind)

Current location: scattered across src/, src/app/, src/lib/
*/

// ============================================================================
// STEP 2: Create Feature Structure
// ============================================================================

/*
Create directory structure:

src/features/dashboard/
├── api/
│   ├── queries.ts          (TanStack Query hooks)
│   ├── mutations.ts         (if any write operations)
│   └── index.ts
├── components/
│   ├── DashboardPage.tsx
│   ├── StatCard.tsx
│   ├── ChartWidget.tsx
│   └── index.ts            (barrel export)
├── hooks/
│   ├── useDashboard.ts     (custom hooks)
│   └── index.ts
├── types/
│   ├── index.ts            (all types + Zod schemas)
├── __tests__/
│   ├── queries.test.ts
│   ├── DashboardPage.test.tsx
│   └── setup.ts
├── index.ts               (feature barrel export)
└── README.md              (feature documentation)

Run: npm run generate:feature dashboard
*/

// ============================================================================
// STEP 3: Extract & Create Types (src/features/dashboard/types/index.ts)
// ============================================================================

/*
Before: src/lib/api.ts
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
}

After: src/features/dashboard/types/index.ts
import { z } from 'zod';

export const DashboardStatsSchema = z.object({
  totalUsers: z.number().int().positive(),
  activeUsers: z.number().int().positive(),
  revenue: z.number().positive(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

// Also define API request/response shapes
export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}
*/

// ============================================================================
// STEP 4: Create API Layer (src/features/dashboard/api/queries.ts)
// ============================================================================

/*
Before: Component with direct API call
function DashboardPage() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setStats);
  }, []);
  
  return ...
}

After: Centralized queries
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@shared/lib/http';
import { DashboardStats } from '../types';

export const dashboardQueries = {
  all: () => ['dashboard'] as const,
  stats: () => [...dashboardQueries.all(), 'stats'] as const,
  activity: () => [...dashboardQueries.all(), 'activity'] as const,
};

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: dashboardQueries.stats(),
    queryFn: async () => {
      const { data } = await httpClient.get('/api/dashboard/stats');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardQueries.activity(),
    queryFn: async () => {
      const { data } = await httpClient.get('/api/dashboard/activity');
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
*/

// ============================================================================
// STEP 5: Refactor Components (src/features/dashboard/components/DashboardPage.tsx)
// ============================================================================

/*
Before: Monolithic component (600+ lines, mixed concerns)
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      // 200+ lines of UI
    </div>
  );
}

After: Separated concerns (150 lines)
import { useDashboardStats, useRecentActivity } from '../api/queries';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: activity } = useRecentActivity();
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div className="space-y-4">
      <StatsGrid stats={stats} />
      <ActivityWidget activity={activity} />
    </div>
  );
}

Sub-component: StatCard.tsx (max 100 lines)
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="text-2xl font-bold mt-2">{value}</div>
      {trend && <TrendBadge value={trend} />}
    </div>
  );
}
*/

// ============================================================================
// STEP 6: Create Hook Wrappers (src/features/dashboard/hooks/useDashboard.ts)
// ============================================================================

/*
Combine queries + state logic:

import { useDashboardStats, useRecentActivity } from '../api/queries';

export function useDashboard() {
  const stats = useDashboardStats();
  const activity = useRecentActivity();
  
  const isLoading = stats.isLoading || activity.isLoading;
  const error = stats.error || activity.error;
  
  return {
    stats: stats.data,
    activity: activity.data,
    isLoading,
    error,
  };
}
*/

// ============================================================================
// STEP 7: Create Tests (src/features/dashboard/__tests__/DashboardPage.test.tsx)
// ============================================================================

/*
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, waitFor } from '@test/testing-library';
import DashboardPage from '../components/DashboardPage';
import { dashboardQueries } from '../api/queries';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays stats when loaded', async () => {
    const mockStats = { totalUsers: 1000, activeUsers: 500, revenue: 50000 };
    
    const { getByText, queryClient } = renderWithProviders(<DashboardPage />, {
      queryClient: createTestQueryClient(),
    });
    
    queryClient.setQueryData(dashboardQueries.stats(), mockStats);
    
    await waitFor(() => {
      expect(getByText('1000')).toBeInTheDocument();
    });
  });

  it('shows error state on failure', async () => {
    const { getByText, queryClient } = renderWithProviders(<DashboardPage />);
    
    queryClient.setQueryData(
      dashboardQueries.stats(),
      () => {
        throw new Error('Failed to fetch');
      }
    );
  });
});
*/

// ============================================================================
// STEP 8: Create Barrel Export (src/features/dashboard/index.ts)
// ============================================================================

/*
export * from './types';
export * from './api';
export * from './components';
export * from './hooks';

Usage in other features:
import { DashboardPage, useDashboard } from '@features/dashboard';
*/

// ============================================================================
// STEP 9: Update ESLint & Verify
// ============================================================================

/*
1. Run: npm run lint
   - Should no errors about importing from src/lib (old pattern)
   
2. Run: npm test
   - Dashboard tests should pass
   - Coverage should meet 70% threshold

3. Verify no direct API calls: grep -r "fetch\|axios" src/features/dashboard/components/
   - Should return nothing
   - All API calls must go through api/queries.ts
*/

// ============================================================================
// STEP 10: Delete Old Code
// ============================================================================

/*
Once verified working:
1. Remove old DashboardPage.tsx from src/app/
2. Remove old dashboard API functions from src/lib/api.ts
3. Update old route imports if using React Router

OLD: import { DashboardPage } from '@/app/pages/DashboardPage';
NEW: import { DashboardPage } from '@features/dashboard';

Then commit:
git add src/features/dashboard/
git rm src/app/pages/DashboardPage.tsx  # removes old
git commit -m "refactor(dashboard): migrate to feature-first architecture"
*/

// ============================================================================
// CHECKLIST
// ============================================================================

/*
Migration Checklist:

□ Step 1: Identified all feature components/types/API calls
□ Step 2: Created directory structure (8 folders)
□ Step 3: Extracted types and created Zod schemas
□ Step 4: Created queries.ts with TanStack Query hooks
□ Step 5: Created mutations.ts (if feature has writes)
□ Step 6: Refactored components to use query hooks
□ Step 7: Components under 200 lines each
□ Step 8: Created unit tests (70% coverage)
□ Step 9: Created barrel export (index.ts)
□ Step 10: ESLint passes (new rules enforced)
□ Step 11: All tests pass
□ Step 12: Updated Router imports to new location
□ Step 13: Deleted old code
□ Step 14: Created PR, verified no regressions
□ Step 15: Deployed to staging, validated e2e tests

Estimated effort: 1-2 sprint stories per small feature (3-5 days)
                  2-3 sprint stories per medium feature (5-10 days)
                  3-5 sprint stories per large feature (10-15 days)
*/
