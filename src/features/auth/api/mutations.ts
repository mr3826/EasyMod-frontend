/**
 * Auth API mutations - Pilot example
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient, NormalizedApiError } from '@shared/lib/http';
import { 
  LoginInput, 
  RegisterInput, 
  User, 
  LoginResponse, 
  RegisterResponse 
} from '../types';
import { authQueries } from './queries';

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<User, NormalizedApiError, LoginInput>({
    mutationFn: async (input) => {
      const { data } = await httpClient.post<LoginResponse>('/api/auth/login', input);
      
      // Store token
      if (data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
      }
      
      return data.data!.user;
    },
    onSuccess: (user) => {
      // Set profile in cache
      queryClient.setQueryData(authQueries.profile(), user);
    },
    onError: (error) => {
      console.error('Login failed:', error.message);
    },
  });
}

/**
 * Register mutation
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<User, NormalizedApiError, RegisterInput>({
    mutationFn: async (input) => {
      const { data } = await httpClient.post<RegisterResponse>('/api/auth/register', input);
      return data.data!.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authQueries.profile(), user);
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await httpClient.post('/api/auth/logout', {});
    },
    onSuccess: () => {
      // Clear token
      localStorage.removeItem('auth_token');
      
      // Clear cache
      queryClient.removeQueries({ queryKey: authQueries.all() });
    },
  });
}

/**
 * Refresh token mutation
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await httpClient.post<LoginResponse>('/api/auth/refresh', {});
      
      if (data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
      }
      
      return data.data!.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authQueries.profile(), user);
    },
  });
}
