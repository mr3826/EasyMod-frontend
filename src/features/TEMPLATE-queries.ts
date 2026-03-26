/**
 * Template: Feature API Queries
 * 
 * Copy this template and customize for your feature
 * Location: src/features/[feature]/api/queries.ts
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { httpClient, getErrorMessage } from '@shared/lib/http';

// ============================================================================
// STEP 1: Define Zod schemas for type safety
// ============================================================================

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Item = z.infer<typeof ItemSchema>;

export const ItemListSchema = z.object({
  items: z.array(ItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type ItemList = z.infer<typeof ItemListSchema>;

// ============================================================================
// STEP 2: Define query keys (for caching and invalidation)
// ============================================================================

export const itemQueries = {
  all: () => ['items'] as const,
  lists: () => [...itemQueries.all(), 'list'] as const,
  list: (filters?: any) => [...itemQueries.lists(), { filters }] as const,
  infinite: (filters?: any) => [...itemQueries.lists(), 'infinite', { filters }] as const,
  detail: (id: string) => [...itemQueries.all(), 'detail', id] as const,
  search: (query: string) => [...itemQueries.all(), 'search', query] as const,
};

// ============================================================================
// STEP 3: Define query hooks (replace /api/items with your endpoint)
// ============================================================================

export interface ListItemsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useListItems(params?: ListItemsParams) {
  return useQuery({
    queryKey: itemQueries.list(params),
    queryFn: async () => {
      const { data } = await httpClient.get<ItemList>('/api/items', {
        params: params || {},
      });
      return data.data || data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // garbage collection after 10 minutes
  });
}

export function useInfiniteItems(params?: Omit<ListItemsParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: itemQueries.infinite(params),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await httpClient.get<ItemList>('/api/items', {
        params: { ...params, page: pageParam },
      });
      return data.data || data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      return lastPage.page < Math.ceil(lastPage.total / lastPage.limit) ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useItemDetail(id: string) {
  return useQuery({
    queryKey: itemQueries.detail(id),
    queryFn: async () => {
      const { data } = await httpClient.get<Item>(`/api/items/${id}`);
      return data.data || data;
    },
    enabled: !!id, // Don't fetch if id is not provided
    staleTime: 10 * 60 * 1000,
  });
}

export function useSearchItems(query: string) {
  return useQuery({
    queryKey: itemQueries.search(query),
    queryFn: async () => {
      const { data } = await httpClient.get<ItemList>('/api/items/search', {
        params: { q: query },
      });
      return data.data || data;
    },
    enabled: query.length > 2, // Only search if query is at least 3 chars
    staleTime: 2 * 60 * 1000,
  });
}
