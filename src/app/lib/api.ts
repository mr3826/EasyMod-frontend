import axios, { AxiosInstance, AxiosResponse } from 'axios';
import config from './config';
import type { BusinessInfo, BrandingRules, FAQ, KnowledgeGap } from './knowledgeTypes';

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

export interface CreateShopRequest {
  shop_name?: string;
}

// Product types (based on mockData.ts but aligned with backend)
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  description?: string;
  category?: string;
  category_id?: string;
  status?: 'active' | 'inactive' | 'pending';
  variants?: any[];
  aliases?: string[];
  aiGenerated?: boolean;
  confidence?: number;
  stock?: boolean;
  images?: string[];
  brand?: string;
  weight?: number;
  weight_unit?: string;
  tags?: string[];
  compare_at_price?: number;
  cost_per_item?: number;
  quantity?: number;
  is_active?: boolean;
  low_stock_threshold?: number;
  track_quantity?: boolean;
  allow_discounts?: boolean;
  charge_tax?: boolean;
  send_low_stock_alert?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Channel types (aligned with backend entity)
export interface Channel {
  id: string;
  shop_id?: string;
  name?: string;
  type?: 'facebook' | 'whatsapp' | 'telegram' | 'webchat' | 'instagram';
  status?: 'active' | 'inactive' | 'error';
  connected?: boolean;
  config?: any; // JSONB field for channel-specific configuration
  last_sync?: string | null;
  message_count?: number;
  created_at?: string;
  updated_at?: string;
  lastSync?: string;
  messageCount?: number;
  channel_type?: string;
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

export interface DeliveryAreaPricing {
  zone: 'inside_dhaka' | 'sub_dhaka' | 'outside_dhaka';
  charge: number;
  cod_enabled: boolean;
}

export interface DeliveryWeightTier {
  from_kg: number;
  to_kg: number;
  extra_charge: number;
}

export interface DeliveryShopSettings {
  default_delivery_charge: number;
  cod_enabled: boolean;
  cod_charge: number;
  non_refundable: boolean;
  area_pricing: DeliveryAreaPricing[];
  weight_tiers: DeliveryWeightTier[];
}

export interface DeliverySettings {
  providers: DeliveryProviderStatus[];
  settings: DeliveryShopSettings;
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

const mapFaqFromBackend = (faq: any): FAQ => ({
  id: String(faq.id),
  question: faq.question ?? faq.category ?? '',
  answer: faq.answer ?? faq.template_en ?? '',
  category: faq.category ?? faq.question ?? 'General',
  confidence: Number.isFinite(faq.confidence) ? faq.confidence : 0.9,
  source: faq.source ?? 'manual',
  active: faq.active ?? faq.is_active ?? true,
  usageCount: Number.isFinite(faq.usageCount) ? faq.usageCount : 0,
  createdAt: faq.createdAt ?? faq.created_at ?? new Date().toISOString(),
  updatedAt: faq.updatedAt ?? faq.updated_at ?? faq.created_at ?? new Date().toISOString()
});

// API Client class
class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private csrfToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 10000,
      withCredentials: true, // send httpOnly cookies automatically
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor — cookies are sent automatically,
    // but keep Bearer header as fallback for backward compat
    this.client.interceptors.request.use(
      (config) => {
        const method = (config.method || 'get').toUpperCase();
        if (this.csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
          config.headers['X-CSRF-Token'] = this.csrfToken;
        }
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
          this.clearTokens();
          // Emit an unauthorized event instead of redirecting
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('UNAUTHORIZED'));
          }
        }
        if (error.response?.status === 403 && error.response.data?.error?.message === 'invalid csrf token') {
          // If CSRF fails, clear it so it can be re-initialized
          this.csrfToken = null;
        }
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    // No longer persist tokens in localStorage — httpOnly cookies handle this
  }

  private clearTokens() {
    this.accessToken = null;
    this.csrfToken = null;
  }

  async initCsrfToken(): Promise<void> {
    if (this.csrfToken) {
      return;
    }

    try {
      const response = await this.client.get('/csrf');
      this.csrfToken = response.data?.csrfToken || null;
    } catch {
      // Best-effort; CSRF token will be retried on next call.
    }
  }

  // Auth endpoints
  async signin(credentials: SigninRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post('/auth/signin', credentials);
    const { data } = response.data;
    // Tokens are now set as httpOnly cookies by the backend.
    this.setAccessToken(null);
    // Refresh CSRF token for the new authenticated session
    this.csrfToken = null;
    await this.initCsrfToken();
    return data;
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post('/auth/signup', userData);
    const { data } = response.data;
    const normalizedData: AuthResponse = {
      user: data.user,
      currentShop: data.currentShop ?? data.shop,
      allShops: data.allShops ?? (data.shop ? [data.shop] : [])
    };
    this.setAccessToken(null);
    // Refresh CSRF token for the new authenticated session
    this.csrfToken = null;
    await this.initCsrfToken();
    return normalizedData;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.post('/auth/forgot-password', { email });
    return response.data.data || { message: response.data.message || 'If an account exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.post('/auth/reset-password', { token, password });
    return response.data.data || { message: response.data.message || 'Password reset successfully.' };
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch {
      // Best-effort — even if the server call fails, clear local state
    }
    this.clearTokens();
  }

  async getAuthContext(): Promise<{ user: User; currentShop: Shop; allShops: Shop[] }> {
    const response: AxiosResponse<ApiResponse<{ user: User; currentShop: Shop; allShops: Shop[] }>> = await this.client.get('/auth/me');
    return response.data.data;
  }

  // Shop endpoints
  async getShops(): Promise<Shop[]> {
    const response: AxiosResponse<ApiResponse<Shop[]>> = await this.client.get('/shop/list');
    return response.data.data;
  }

  async createShop(payload: CreateShopRequest): Promise<Shop> {
    const response: AxiosResponse<ApiResponse<Shop>> = await this.client.post('/shop/create', payload);
    return response.data.data;
  }

  async switchShop(shopId: string): Promise<{ currentShop: Shop }> {
    const response: AxiosResponse<ApiResponse<{ currentShop: Shop }>> = await this.client.post('/shop/switch', { shopId });
    const { data } = response.data;
    this.setAccessToken(null);
    return data;
  }

  async refreshToken(): Promise<{ refreshed: boolean }> {
    // Refresh token is sent automatically via httpOnly cookie.
    // No need to read from localStorage.
    const response: AxiosResponse<ApiResponse<{ refreshed: boolean }>> = await this.client.post('/auth/refresh', {});
    const { data } = response.data;
    this.setAccessToken(null);
    return data;
  }

  // Dashboard endpoints
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response: AxiosResponse<ApiResponse<DashboardMetrics>> = await this.client.get('/dashboard/metrics');
    return response.data.data;
  }

  // Product endpoints
  async getProducts(params?: any): Promise<Product[]> {
    const response: AxiosResponse<ApiResponse<Product[]>> = await this.client.get('/product', { params });
    return response.data.data;
  }

  async extractProductsFromUpload(payload: { filename?: string; content_type?: string; content: string }): Promise<{ products: Product[]; stats: { total: number; parsed: number; skipped: number } }> {
    const response: AxiosResponse<ApiResponse<{ products: Product[]; stats: { total: number; parsed: number; skipped: number } }>> = await this.client.post('/product/ai-extract', payload);
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

  async getProduct(productId: string): Promise<Product> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.client.get(`/product/${productId}`);
    return response.data.data;
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<ApiResponse<Category[]>> = await this.client.get('/category');
    return response.data.data;
  }

  async getCategory(categoryId: string): Promise<Category> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.client.get(`/category/${categoryId}`);
    return response.data.data;
  }

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.client.post('/category', category);
    return response.data.data;
  }

  async updateCategory(categoryId: string, category: Partial<Category>): Promise<Category> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.client.patch(`/category/${categoryId}`, category);
    return response.data.data;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.client.delete(`/category/${categoryId}`);
  }

  async getSubcategoryDetails(categoryId: string, subcategoryId: string): Promise<Category> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.client.get(`/category/${categoryId}/subcategory/${subcategoryId}`);
    return response.data.data;
  }

  // Knowledge endpoints
  async getKnowledgeSummary(): Promise<KnowledgeSummary> {
    const response: AxiosResponse<ApiResponse<KnowledgeSummary>> = await this.client.get('/knowledge');
    const data = response.data.data;
    return {
      ...data,
      faqs: (data?.faqs || []).map(mapFaqFromBackend)
    } as KnowledgeSummary;
  }

  async updateKnowledgeBusinessInfo(businessInfo: BusinessInfo): Promise<KnowledgeSummary> {
    const response: AxiosResponse<ApiResponse<KnowledgeSummary>> = await this.client.put('/knowledge/business-info', businessInfo);
    return response.data.data;
  }

  async updateKnowledgeBrandingRules(brandingRules: BrandingRules): Promise<KnowledgeSummary> {
    const response: AxiosResponse<ApiResponse<KnowledgeSummary>> = await this.client.put('/knowledge/branding', brandingRules);
    return response.data.data;
  }

  async listKnowledgeFaqs(): Promise<FAQ[]> {
    const response: AxiosResponse<ApiResponse<FAQ[]>> = await this.client.get('/knowledge/faqs');
    return (response.data.data || []).map(mapFaqFromBackend);
  }

  async createKnowledgeFaq(faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<FAQ> {
    const response: AxiosResponse<ApiResponse<FAQ>> = await this.client.post('/knowledge/faqs', faq);
    return mapFaqFromBackend(response.data.data);
  }

  async updateKnowledgeFaq(faqId: string, updates: Partial<FAQ>): Promise<FAQ> {
    const response: AxiosResponse<ApiResponse<FAQ>> = await this.client.patch(`/knowledge/faqs/${faqId}`, updates);
    return mapFaqFromBackend(response.data.data);
  }

  async deleteKnowledgeFaq(faqId: string): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.delete(`/knowledge/faqs/${faqId}`);
    return response.data.data;
  }

  async listKnowledgeGaps(): Promise<KnowledgeGap[]> {
    const response: AxiosResponse<ApiResponse<KnowledgeGap[]>> = await this.client.get('/knowledge/gaps');
    return response.data.data;
  }

  async updateKnowledgeGaps(gaps: KnowledgeGap[]): Promise<KnowledgeGap[]> {
    const response: AxiosResponse<ApiResponse<KnowledgeGap[]>> = await this.client.put('/knowledge/gaps', gaps);
    return response.data.data;
  }

  async listKnowledgeDocuments(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.client.get('/knowledge/documents');
    return response.data.data;
  }

  async createKnowledgeDocument(document: {
    name: string;
    contentType?: string;
    size?: number;
    url?: string;
    text?: string;
    tags?: string[];
    source?: string;
  }): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.post('/knowledge/documents', document);
    return response.data.data;
  }

  async deleteKnowledgeDocument(documentId: string): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.delete(`/knowledge/documents/${documentId}`);
    return response.data.data;
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

  async connectChannel(payload: { type: Channel['type']; name?: string; systemUserToken: string; businessManagerId?: string; config?: any }): Promise<Channel> {
    const response: AxiosResponse<ApiResponse<Channel>> = await this.client.post('/channel/connect', payload);
    return response.data.data;
  }

  async disconnectChannel(channelId: string): Promise<Channel> {
    const response: AxiosResponse<ApiResponse<Channel>> = await this.client.post(`/channel/${channelId}/disconnect`);
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

    const response: AxiosResponse<ApiResponse<any>> = await this.client.post('/order/update', { order_id: orderId, ...backendUpdates });
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

  async createMessage(
    conversationId: string,
    payload: { content: string; sender: 'customer' | 'agent' | 'ai'; message_type?: 'text' | 'image' | 'file' | 'location'; metadata?: any; ai_suggestion?: string; ai_confidence?: number }
  ): Promise<Message> {
    const response: AxiosResponse<ApiResponse<Message>> = await this.client.post(`/conversation/${conversationId}/messages`, payload);
    return response.data.data as Message;
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
    throw new Error('Meta OAuth flow has been removed. Use system user token manual connect instead.');
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

  async updateDeliverySettings(settings: DeliveryShopSettings): Promise<DeliveryShopSettings> {
    const response: AxiosResponse<ApiResponse<DeliveryShopSettings>> = await this.client.put('/shop/delivery/settings', settings);
    return response.data.data || settings;
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

  async updateSubscriptionPlan(payload: {
    plan_name: string;
    plan_price: number;
    billing_cycle: 'monthly' | 'yearly';
    conversations_limit: number;
    orders_limit: number;
    products_limit: number;
    features?: Record<string, boolean>;
  }): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.put('/subscription/plan', payload);
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

  async testPaymentConnection(config: any): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.post('/payment/config/test', config);
    return response.data;
  }

  async deletePaymentConfig(gateway: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.delete(`/payment/config/${gateway}`);
    return response.data;
  }

  // Shop endpoints
  async getShopBusinessInfo(): Promise<KnowledgeSummary> {
    const response: AxiosResponse<ApiResponse<KnowledgeSummary>> = await this.client.get('/shop/business-info');
    return response.data.data as KnowledgeSummary;
  }

  async updateShopBusinessInfo(businessInfo: BusinessInfo): Promise<KnowledgeSummary> {
    await this.initCsrfToken();
    const response: AxiosResponse<ApiResponse<KnowledgeSummary>> = await this.client.put('/shop/business-info', businessInfo);
    return response.data.data as KnowledgeSummary;
  }

  async updateShop(shopId: string, updates: any): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.post('/shop/update', {
      shopId,
      ...updates
    });
    return response.data;
  }

  async getShop(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get('/shop/me');
    return response.data;
  }
}

// Utility function to generate idempotency keys
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

// Export singleton instance
export const apiClient = new ApiClient();

export interface KnowledgeSummary {
  businessInfo: BusinessInfo;
  brandingRules: BrandingRules;
  faqs: FAQ[];
  gaps: KnowledgeGap[];
}