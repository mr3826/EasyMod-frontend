export interface Channel {
  id: string;
  shop_id?: string;
  name: string;
  type: 'facebook' | 'whatsapp' | 'telegram' | 'webchat';
  status: 'active' | 'inactive' | 'error';
  connected: boolean;
  config?: any;
  lastSync?: string;
  messageCount: number;
  created_at?: string;
  updated_at?: string;
}

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

export interface Conversation {
  id: string;
  customerName: string;
  channel: string;
  lastMessage: string;
  timestamp: string;
  status: 'new' | 'replied' | 'closed';
  unread: number;
  avatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: 'customer' | 'ai' | 'business';
  timestamp: string;
  aiSuggestion?: string;
  aiConfidence?: number;
}

export interface Customer {
  id: string;
  shop_id?: string;
  name: string;
  email?: string;
  number: string;
  channel: 'facebook' | 'whatsapp' | 'telegram' | 'webchat' | 'manual';
  created_at?: string;
  updated_at?: string;
}

// Mock data
export const mockChannels: Channel[] = [
  {
    id: '1',
    shop_id: 'shop-1',
    name: 'Facebook Page',
    type: 'facebook',
    status: 'active',
    connected: true,
    config: { pageId: '123456789', accessToken: 'token...' },
    lastSync: '2 minutes ago',
    messageCount: 127,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    shop_id: 'shop-1',
    name: 'WhatsApp Business',
    type: 'whatsapp',
    status: 'active',
    connected: true,
    config: { phoneNumber: '+1234567890', apiKey: 'key...' },
    lastSync: '5 minutes ago',
    messageCount: 243,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T10:25:00Z',
  },
  {
    id: '3',
    shop_id: 'shop-1',
    name: 'Telegram Bot',
    type: 'telegram',
    status: 'inactive',
    connected: false,
    config: { botToken: 'token...', chatId: 'chat...' },
    messageCount: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    shop_id: 'shop-1',
    name: 'Website Chat',
    type: 'webchat',
    status: 'active',
    connected: true,
    config: { widgetId: 'widget-123', domain: 'example.com' },
    lastSync: '1 minute ago',
    messageCount: 89,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T10:29:00Z',
  },
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    shop_id: 'shop-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    number: '+1234567890',
    channel: 'whatsapp',
    created_at: '2024-01-15T08:30:00Z',
    updated_at: '2024-01-20T14:22:00Z',
  },
  {
    id: '2',
    shop_id: 'shop-1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    number: '+1234567891',
    channel: 'facebook',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-19T16:45:00Z',
  },
  {
    id: '3',
    shop_id: 'shop-1',
    name: 'Bob Johnson',
    number: '+1234567892',
    channel: 'telegram',
    created_at: '2024-01-18T11:20:00Z',
    updated_at: '2024-01-18T11:20:00Z',
  },
  {
    id: '4',
    shop_id: 'shop-1',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    number: '+1234567893',
    channel: 'manual',
    created_at: '2024-01-05T13:45:00Z',
    updated_at: '2024-01-17T10:30:00Z',
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Water Bottle 5L',
    sku: 'WB-5L-001',
    price: 12.99,
    variants: ['5L', '3L', '1L'],
    aliases: ['big water', '5 liter water', 'large bottle'],
    category: 'Beverages',
    status: 'active',
    aiGenerated: true,
    confidence: 0.95,
    stock: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Organic Coffee Beans 500g',
    sku: 'CF-ORG-500',
    price: 24.99,
    variants: ['500g', '1kg'],
    aliases: ['coffee', 'beans', 'organic coffee'],
    category: 'Beverages',
    status: 'active',
    aiGenerated: false,
    stock: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-14T15:20:00Z',
  },
  {
    id: '3',
    name: 'Artisan Chocolate Bar',
    sku: 'CH-ART-100',
    price: 8.99,
    variants: ['Dark', 'Milk', 'White'],
    aliases: ['chocolate', 'candy bar', 'sweet'],
    category: 'Snacks',
    status: 'pending',
    aiGenerated: true,
    confidence: 0.87,
    stock: true,
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z',
  },
];

export const mockConversations: Conversation[] = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    channel: 'whatsapp',
    lastMessage: 'Hi! Do you have the 5L water bottles in stock?',
    timestamp: '2 min ago',
    status: 'new',
    unread: 1,
  },
  {
    id: '2',
    customerName: 'Michael Chen',
    channel: 'facebook',
    lastMessage: 'Thanks for the quick reply!',
    timestamp: '15 min ago',
    status: 'replied',
    unread: 0,
  },
  {
    id: '3',
    customerName: 'Emma Wilson',
    channel: 'webchat',
    lastMessage: 'Can I get 3 chocolate bars?',
    timestamp: '1 hour ago',
    status: 'new',
    unread: 2,
  },
];

export const mockMessages: Message[] = [
  {
    id: '1',
    conversationId: '1',
    content: 'Hi! Do you have the 5L water bottles in stock?',
    sender: 'customer',
    timestamp: '2024-01-17T16:45:00Z',
    aiSuggestion: 'Yes! We have Premium Water Bottle 5L in stock at $12.99. Would you like to place an order?',
    aiConfidence: 0.92,
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Sarah Johnson',
    items: [
      { productId: '1', productName: 'Premium Water Bottle 5L', quantity: 2, price: 12.99 },
    ],
    total: 25.98,
    status: 'confirmed',
    channel: 'whatsapp',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:05:00Z',
  },
  {
    id: 'ORD-002',
    customerName: 'Michael Chen',
    items: [
      { productId: '2', productName: 'Organic Coffee Beans 500g', quantity: 1, price: 24.99 },
      { productId: '3', productName: 'Artisan Chocolate Bar', quantity: 3, price: 8.99 },
    ],
    total: 51.96,
    status: 'processing',
    channel: 'facebook',
    createdAt: '2024-01-17T09:30:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
  },
  {
    id: 'ORD-003',
    customerName: 'Emma Wilson',
    items: [
      { productId: '3', productName: 'Artisan Chocolate Bar', quantity: 3, price: 8.99 },
    ],
    total: 26.97,
    status: 'draft',
    channel: 'webchat',
    createdAt: '2024-01-17T15:00:00Z',
    updatedAt: '2024-01-17T15:00:00Z',
  },
];

export const mockInsights = [
  {
    id: '1',
    title: 'Top Performing Channel',
    description: 'WhatsApp generates 35% more conversions than Facebook',
    type: 'success',
  },
  {
    id: '2',
    title: 'Product Trend',
    description: 'Premium Water Bottle 5L shows 45% increase in demand',
    type: 'info',
  },
  {
    id: '3',
    title: 'Optimization Suggestion',
    description: 'AI suggests reducing response time on Telegram by 20%',
    type: 'warning',
  },
];
