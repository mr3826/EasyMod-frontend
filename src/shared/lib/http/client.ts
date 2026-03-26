/**
 * Centralized HTTP Client with Interceptors
 * Single source of truth for all API communication
 * 
 * Features:
 * - Auth token injection
 * - Shop ID injection (for multi-tenant)
 * - Automatic retry with exponential backoff
 * - Error normalization
 * 
 * Usage:
 * import { httpClient } from '@shared/lib/http/client';
 * const response = await httpClient.get('/api/endpoint');
 * 
 * Multi-tenant setup:
 * import { useShopId } from '@/shared/context/ShopContext';
 * import { useHttpShopId } from '@/shared/lib/http/useHttpShopId';
 * 
 * function App() {
 *   useHttpShopId(); // Syncs ShopContext with HTTP client
 *   return <Routes>...</Routes>;
 * }
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { normalizeApiError, ApiErrorType } from './errors';

// Extend axios config to track retry count and exclude shopId injection
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  __retryCount?: number;
  __skipShopId?: boolean; // Flag to skip shopId injection for specific requests
}

class HttpClient {
  private client: AxiosInstance;
  private maxRetries = 3;
  private retryDelay = 1000; // ms
  private currentShopId: string | null = null; // Multi-tenant shop ID

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token and shop ID
    this.client.interceptors.request.use(
      (config: ExtendedAxiosRequestConfig) => {
        // Inject auth token
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Inject shop ID (if available and not explicitly skipped)
        if (this.currentShopId && !config.__skipShopId) {
          config.headers['X-Shop-ID'] = this.currentShopId;
        }

        config.__retryCount = config.__retryCount || 0;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as ExtendedAxiosRequestConfig;

        // Retry logic for network errors
        if (
          error.code === 'ECONNABORTED' ||
          error.code === 'ENOTFOUND' ||
          error.code === 'ETIMEDOUT'
        ) {
          if ((config.__retryCount ?? 0) < this.maxRetries) {
            config.__retryCount = (config.__retryCount ?? 0) + 1;
            
            // Exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, this.retryDelay * Math.pow(2, config.__retryCount! - 1))
            );
            return this.client(config);
          }
        }

        // Handle 401 Unauthorized - Redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }

        // Normalize and re-throw error
        throw normalizeApiError(error);
      }
    );
  }

  // Convenience methods
  async get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }

  /**
   * Set current shop ID for multi-tenant requests
   * Called by useHttpShopId hook when shop changes
   * 
   * @param shopId - The shop ID to use in all subsequent requests
   */
  setShopId(shopId: string | null): void {
    this.currentShopId = shopId;
  }

  /**
   * Get current shop ID
   */
  getShopId(): string | null {
    return this.currentShopId;
  }

  /**
   * Get raw axios instance for advanced use cases or custom interceptors
   * Note: ShopId is automatically injected via headers, no need for manual setup
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Create request config that skips shopId injection
   * Useful for endpoints that don't require shop scoping
   * 
   * @example
   * const config = httpClient.skipShopIdConfig();
   * httpClient.get('/api/public-endpoint', config);
   */
  skipShopIdConfig(config?: any): ExtendedAxiosRequestConfig {
    return {
      ...config,
      __skipShopId: true,
    } as ExtendedAxiosRequestConfig;
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
