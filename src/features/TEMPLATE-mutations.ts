/**
 * Template: Feature API Mutations
 * 
 * Copy this template and customize for your feature
 * Location: src/features/[feature]/api/mutations.ts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient, NormalizedApiError } from '@shared/lib/http';
import { itemQueries } from './queries';

// ============================================================================
// STEP 1: Define mutation functions
// ============================================================================

interface CreateItemInput {
  name: string;
  description?: string;
}

interface UpdateItemInput extends Partial<CreateItemInput> {}

async function createItem(input: CreateItemInput) {
  const { data } = await httpClient.post('/api/items', input);
  return data.data;
}

async function updateItem(id: string, input: UpdateItemInput) {
  const { data } = await httpClient.patch(`/api/items/${id}`, input);
  return data.data;
}

async function deleteItem(id: string) {
  await httpClient.delete(`/api/items/${id}`);
  return { id };
}

// ============================================================================
// STEP 2: Define mutation hooks with query invalidation
// ============================================================================

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation<any, NormalizedApiError, CreateItemInput>({
    mutationFn: createItem,
    onSuccess: (newItem) => {
      // Invalidate list queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: itemQueries.lists() });
      // Optionally set the detail query cache
      queryClient.setQueryData(itemQueries.detail(newItem.id), newItem);
    },
    onError: (error) => {
      // Error is already normalized, just log it
      console.error('Failed to create item:', error.message);
    },
  });
}

export function useUpdateItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation<any, NormalizedApiError, UpdateItemInput>({
    mutationFn: (input) => updateItem(id, input),
    onSuccess: (updatedItem) => {
      // Update the detail query
      queryClient.setQueryData(itemQueries.detail(id), updatedItem);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: itemQueries.lists() });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, NormalizedApiError, string>({
    mutationFn: deleteItem,
    onSuccess: (result) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: itemQueries.detail(result.id) });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: itemQueries.lists() });
    },
  });
}

export function useBulkDeleteItems() {
  const queryClient = useQueryClient();

  return useMutation<void, NormalizedApiError, string[]>({
    mutationFn: async (ids) => {
      await httpClient.post('/api/items/bulk-delete', { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemQueries.all() });
    },
  });
}
