import axios, { AxiosInstance, AxiosResponse } from 'axios';
import config from './config';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
  };
}

export interface ApiError {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
  };
}

// Auth types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  profile_picture?: string;
}

export interface Shop {
  id: string;
  unique_code: string;
  shop_name?: string;
  role: 'owner' | 'admin' | 'staff';
}

export interface AuthResponse {
  user: User;
  currentShop: Shop;
  allShops: Shop[];
  accessToken: string;
  refreshToken: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

// Product types (based on mockData.ts but aligned with backend)
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  variants?: string[];
  aliases?: string[];
  category: string;
  status: 'active' | 'inactive' | 'pending';
  aiGenerated: boolean;
  confidence?: number;
  stock: boolean;
  createdAt: string;
  updatedAt: string;
}

// Channel types (aligned with backend entity)
export interface Channel {
  id: string;
  shop_id: string;
  name: string;
  type: 'facebook' | 'whatsapp' | 'telegram' | 'webchat';
  status: 'active' | 'inactive' | 'error';
  connected: boolean;
  config?: any; // JSONB field for channel-specific configuration
  last_sync?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

// Customer types (aligned with backend entity)
export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  email?: string;
  number: string;
  channel: 'facebook' | 'whatsapp' | 'telegram' | 'webchat' | 'manual';
  created_at: string;
  updated_at: string;
}

// Customer filters for listing
export interface CustomerFilters {
  search?: string;
  email?: string;
  number?: string;
  channel?: 'facebook' | 'whatsapp' | 'telegram' | 'webchat' | 'manual';
  start_date?: string;
  end_date?: string;
}

// Dashboard metrics types (aligned with backend service)
export interface DashboardMetrics {
  metrics: {
    totalMessages: number;
    activeProducts: number;
    ordersToday: number;
    conversionRate: number;
    weeklyChange: number;
  };
  channels: {
    active: number;
    total: number;
  };
  chartData: Array<{
    date: string;
    orders: number;
  }>;
}

// Order types
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  channel: string;
  createdAt: string;
  updatedAt: string;
}

// Transform backend order data to frontend format
function transformOrderFromBackend(backendOrder: any): Order {
  return {
    id: backendOrder.id,
    customerName: backendOrder.customer_name || backendOrder.customer?.name || 'Walk-in Customer',
    items: backendOrder.items?.map((item: any) => ({
      productId: item.product_id || item.productId,
      productName: item.product?.name || item.productName,
      quantity: item.quantity,
      price: item.price
    })) || [],
    total: parseFloat(backendOrder.total),
    status: backendOrder.order_status || backendOrder.status,
    channel: backendOrder.channel,
    createdAt: backendOrder.created_at || backendOrder.createdAt,
    updatedAt: backendOrder.updated_at || backendOrder.updatedAt
  };
}

// Audit log types
export interface AuditLog {
  id: string;
  user_id: string;
  shop_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'CHANNEL_CONNECT' | 'CHANNEL_DISCONNECT' | 'ORDER_CONFIRM' | 'ORDER_CANCEL' | 'PAYMENT_PROCESS' | 'EXPORT_DATA' | 'DASHBOARD_ACCESS';
  resource_type: 'USER' | 'SHOP' | 'CHANNEL' | 'CUSTOMER' | 'PRODUCT' | 'ORDER' | 'CATEGORY' | 'CONVERSATION' | 'MESSAGE' | 'PAYMENT' | 'DASHBOARD';
  resource_id: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  idempotency_key?: string;
  created_at: string;
  user?: User; // Populated when including user data
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Idempotency types
export interface IdempotencyConfig {
  key: string; // UUID v4 or similar unique identifier
}

// API request options with idempotency
export interface ApiRequestOptions {
  idempotencyKey?: string;
}
export interface Conversation {
  id: string;
  customer_id: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  channel: 'whatsapp' | 'telegram' | 'messenger' | 'instagram' | 'web';
  title?: string;
  status: 'active' | 'closed' | 'archived';
  lastMessage?: string;
  unreadCount?: number;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender: 'customer' | 'agent' | 'ai';
  message_type: 'text' | 'image' | 'file' | 'location';
  metadata?: any;
  ai_suggestion?: string;
  ai_confidence?: number;
  created_at: string;
  updated_at: string;
}

// Meta Integration types
export type MetaPlatform = 'messenger' | 'instagram' | 'whatsapp';

export interface MetaIntegrationStatus {
  platform: MetaPlatform;
  connected: boolean;
  display_name: string | null;
  connected_at: string | null;
}

// Delivery provider types
export type DeliveryProvider = 'pathao' | 'steadfast';

export interface DeliveryProviderStatus {
  provider: DeliveryProvider;
  display_name: string;
  is_connected: boolean;
  is_active: boolean;
  metadata?: Record<string, any>;
  last_validated_at: string | null;
  connected_at: string | null;
}

export interface DeliverySettings {
  providers: DeliveryProviderStatus[];
}

export interface PathaoCredentials {
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
}

export interface SteadfastCredentials {
  api_key: string;
  secret_key: string;
}

export type DeliveryCredentials = PathaoCredentials | SteadfastCredentials;

export interface ConnectDeliveryProviderRequest {
  provider: DeliveryProvider;
  credentials: DeliveryCredentials;
  is_sandbox?: boolean;
  metadata?: Record<string, any>;
}

export interface DisconnectDeliveryProviderRequest {
  provider: DeliveryProvider;
}

export interface ToggleDeliveryProviderRequest {
  provider: DeliveryProvider;
  is_active: boolean;
}

// API Client class
class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearTokens();
          // TODO: Trigger logout or token refresh
          window.location.href = '/signin';
        }
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  private clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Auth endpoints
  async signin(credentials: SigninRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post('/auth/signin', credentials);
    const { data } = response.data;
    this.setAccessToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post('/auth/signup', userData);
    const { data } = response.data;
    this.setAccessToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response: AxiosResponse<ApiResponse<{ accessToken: string }>> = await this.client.post('/auth/refresh', {
      refreshToken,
    });
    const { data } = response.data;
    this.setAccessToken(data.accessToken);
    return data;
  }

  // Dashboard endpoints
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response: AxiosResponse<ApiResponse<DashboardMetrics>> = await this.client.get('/dashboard/metrics');
    return response.data.data;
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    const response: AxiosResponse<ApiResponse<Product[]>> = await this.client.get('/product');
    return response.data.data;
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.client.post('/product', product);
    return response.data.data;
  }

  async updateProduct(productId: string, product: Partial<Product>): Promise<Product> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.client.patch(`/product/${productId}`, product);
    return response.data.data;
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.client.delete(`/product/${productId}`);
  }

  // Channel endpoints
  async getChannels(): Promise<Channel[]> {
    const response: AxiosResponse<ApiResponse<Channel[]>> = await this.client.get('/channel');
    return response.data.data;
  }

  async getChannel(channelId: string): Promise<Channel> {
    const response: AxiosResponse<ApiResponse<Channel>> = await this.client.get(`/channel/${channelId}`);
    return response.data.data;
  }

  async createChannel(channel: Omit<Channel, 'id' | 'shop_id' | 'created_at' | 'updated_at' | 'message_count'>, options?: ApiRequestOptions): Promise<Channel> {
    const config: any = {};
    if (options?.idempotencyKey) {
      config.headers = { 'Idempotency-Key': options.idempotencyKey };
    }
    const response: AxiosResponse<ApiResponse<Channel>> = await this.client.post('/channel', channel, config);
    return response.data.data;
  }

  async updateChannel(channelId: string, updates: Partial<Omit<Channel, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>, options?: ApiRequestOptions): Promise<Channel> {
    const config: any = {};
    if (options?.idempotencyKey) {
      config.headers = { 'Idempotency-Key': options.idempotencyKey };
    }
    const response: AxiosResponse<ApiResponse<Channel>> = await this.client.patch(`/channel/${channelId}`, updates, config);
    return response.data.data;
  }

  async deleteChannel(channelId: string, options?: ApiRequestOptions): Promise<{ message: string }> {
    const config: any = {};
    if (options?.idempotencyKey) {
      config.headers = { 'Idempotency-Key': options.idempotencyKey };
    }
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.delete(`/channel/${channelId}`, config);
    return response.data.data;
  }

  // Customer endpoints
  async getCustomers(filters?: CustomerFilters): Promise<Customer[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const response: AxiosResponse<ApiResponse<Customer[]>> = await this.client.get(`/customer?${params}`);
    return response.data.data;
  }

  async getCustomer(customerId: string): Promise<Customer> {
    const response: AxiosResponse<ApiResponse<Customer>> = await this.client.get(`/customer/${customerId}`);
    return response.data.data;
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'shop_id' | 'created_at' | 'updated_at'>, options?: ApiRequestOptions): Promise<Customer> {
    const config: any = {};
    if (options?.idempotencyKey) {
      config.headers = { 'Idempotency-Key': options.idempotencyKey };
    }
    const response: AxiosResponse<ApiResponse<Customer>> = await this.client.post('/customer', customer, config);
    return response.data.data;
  }

  async updateCustomer(customerId: string, updates: Partial<Omit<Customer, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>, options?: ApiRequestOptions): Promise<Customer> {
    const config: any = {};
    if (options?.idempotencyKey) {
      config.headers = { 'Idempotency-Key': options.idempotencyKey };
    }
    const response: AxiosResponse<ApiResponse<Customer>> = await this.client.patch(`/customer/${customerId}`, updates, config);
    return response.data.data;
  }

  async deleteCustomer(customerId: string, options?: ApiRequestOptions): Promise<{ message: string }> {
    const config: any = {};
    if (options?.idempotencyKey) {
      config.headers = { 'Idempotency-Key': options.idempotencyKey };
    }
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.delete(`/customer/${customerId}`, config);
    return response.data.data;
  }

  async getOrders(): Promise<Order[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.client.get('/order');
    return response.data.data.map(transformOrderFromBackend);
  }

  async createOrder(order: any): Promise<Order> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.post('/order/draft', order);
    return transformOrderFromBackend(response.data.data);
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    const backendUpdates = {
      ...updates,
      order_status: updates.status
    };
    delete backendUpdates.status;
    
    const response: AxiosResponse<ApiResponse<any>> = await this.client.post('/order/update', { orderId, ...backendUpdates });
    return transformOrderFromBackend(response.data.data);
  }

  async confirmOrder(orderId: string): Promise<Order> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.post('/order/confirm', { orderId });
    return transformOrderFromBackend(response.data.data);
  }

  async getOrder(orderId: string): Promise<Order> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get(`/order/${orderId}`);
    return transformOrderFromBackend(response.data.data);
  }

  // Conversation endpoints
  async getConversations(options?: { page?: number; limit?: number; status?: string; channel?: string }): Promise<{ conversations: Conversation[]; pagination: any }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.status) params.append('status', options.status);
    if (options?.channel) params.append('channel', options.channel);

    const response: AxiosResponse<ApiResponse<{ conversations: Conversation[]; pagination: any }>> = await this.client.get(`/conversation?${params}`);
    return response.data.data;
  }

  async getMessages(conversationId: string, options?: { page?: number; limit?: number }): Promise<{ messages: Message[]; pagination: any }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const response: AxiosResponse<ApiResponse<{ messages: Message[]; pagination: any }>> = await this.client.get(`/conversation/${conversationId}/messages?${params}`);
    return response.data.data;
  }

  // Audit log endpoints
  async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response: AxiosResponse<ApiResponse<AuditLog[]>> = await this.client.get(`/audit/logs?${params}`);
    return response.data.data;
  }

  async getResourceAuditLogs(resourceType: string, resourceId: string, options?: { limit?: number; offset?: number }): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response: AxiosResponse<ApiResponse<AuditLog[]>> = await this.client.get(`/audit/resource/${resourceType}/${resourceId}?${params}`);
    return response.data.data;
  }

  async cleanupIdempotencyKeys(): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.post('/audit/cleanup');
    return response.data.data;
  }

  // Meta Integration methods
  async getMetaIntegrationStatus(): Promise<MetaIntegrationStatus[]> {
    const response: AxiosResponse<ApiResponse<MetaIntegrationStatus[]>> = await this.client.get('/integrations/meta/status');
    return response.data.data;
  }

  async connectMetaPlatform(platform: MetaPlatform): Promise<void> {
    // This will redirect to Meta OAuth
    window.location.href = `${config.apiBaseUrl}/integrations/meta/connect?platform=${platform}`;
  }

  async disconnectMetaPlatform(platform: MetaPlatform): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.post('/integrations/meta/disconnect', { platform });
    return response.data.data;
  }

  // ============================================
  // Delivery Provider Management
  // ============================================

  async getDeliverySettings(): Promise<DeliverySettings> {
    const response: AxiosResponse<ApiResponse<DeliverySettings>> = await this.client.get('/shop/delivery/settings');
    return response.data.data;
  }

  async connectDeliveryProvider(request: ConnectDeliveryProviderRequest): Promise<{ message: string; provider: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string; provider: string }>> = await this.client.post('/shop/delivery/connect', request);
    return response.data.data || { message: response.data.message || 'Connected successfully', provider: request.provider };
  }

  async disconnectDeliveryProvider(request: DisconnectDeliveryProviderRequest): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.post('/shop/delivery/disconnect', request);
    return response.data.data || { message: response.data.message || 'Disconnected successfully' };
  }

  async toggleDeliveryProvider(request: ToggleDeliveryProviderRequest): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.post('/shop/delivery/toggle', request);
    return response.data.data || { message: response.data.message || 'Provider toggled successfully' };
  }

  async testDeliveryConnection(provider: DeliveryProvider): Promise<{ message: string; valid: boolean }> {
    const response: AxiosResponse<ApiResponse<{ message: string; valid: boolean }>> = await this.client.post('/shop/delivery/test', { provider });
    return response.data.data || { message: response.data.message || 'Test successful', valid: true };
  }

  async getPathaoStores(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<{ stores: any[] }>> = await this.client.get('/shop/delivery/pathao/stores');
    return response.data.data?.stores || [];
  }

  async updateDeliveryMetadata(provider: DeliveryProvider, metadata: Record<string, any>): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.put(`/shop/delivery/${provider}/metadata`, { metadata });
    return response.data.data || { message: response.data.message || 'Metadata updated successfully' };
  }

  // Subscription endpoints
  async getSubscription(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get('/subscription');
    return response.data;
  }

  async getSubscriptionInvoices(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get('/subscription/invoices');
    return response.data;
  }

  async purchaseConversationPack(data: any): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.post('/subscription/conversation-pack', data);
    return response.data;
  }

  // Payment endpoints
  async getPaymentConfig(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get('/payment/config');
    return response.data;
  }

  async updatePaymentConfig(config: any): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.post('/payment/config', config);
    return response.data;
  }
}

// Utility function to generate idempotency keys
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

// Export singleton instance
export const apiClient = new ApiClient();

// Initialize token from storage
const storedToken = localStorage.getItem('accessToken');
if (storedToken) {
  apiClient.setAccessToken(storedToken);
}