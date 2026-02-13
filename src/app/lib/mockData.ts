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
  sender: 'customer' | 'agent' | 'ai';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  ai_confidence?: number;
  ai_suggestion?: string;
}

export interface Customer {
  id: string;
  shop_id?: string;
  name: string;
  email?: string;
  number: string;
  channel: 'facebook' | 'whatsapp' | 'telegram' | 'webchat' | 'manual';
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  channel: string;
  createdAt: string;
  updatedAt: string;
}

export const mockChannels: Channel[] = [];
export const mockCustomers: Customer[] = [];
export const mockProducts: Product[] = [];
export const mockConversations: Conversation[] = [];
export const mockMessages: Message[] = [];
export const mockOrders: Order[] = [];
export const mockInsights: Array<{ id: string; title: string; description: string; type: 'info' | 'success' | 'warning' }> = [];
