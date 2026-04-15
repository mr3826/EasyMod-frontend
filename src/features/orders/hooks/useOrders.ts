import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../app/lib/api';

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  total: number;
  status: 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: string;
  fulfillmentStatus: string;
  channel: string;
  createdAt: string;
  rto_risk?: 'low' | 'medium' | 'high';
  items?: OrderItem[];
  deliveryAddress?: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  sku?: string;
  category?: string;
  stock?: boolean;
}

export interface DateRange {
  start_date?: string;
  end_date?: string;
}

export type DateFilter = 'today' | 'last7days' | 'last30days' | 'all';
export type StatusFilter = 'all' | 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

interface UseOrdersReturn {
  orders: Order[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => Promise<void>;
  updatingOrderId: string | null;
}

const TIMEOUTS = {
  DEBOUNCE_MS: 300,
} as const;

const resolveDateRange = (value: DateFilter): DateRange => {
  const now = new Date();

  if (value === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { start_date: start.toISOString(), end_date: now.toISOString() };
  }

  if (value === 'last7days') {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { start_date: start.toISOString(), end_date: now.toISOString() };
  }

  if (value === 'last30days') {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { start_date: start.toISOString(), end_date: now.toISOString() };
  }

  return {};
};

export const useOrders = (
  dateFilter: DateFilter,
  searchQuery: string,
  filterStatus: StatusFilter
): UseOrdersReturn => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  
  // AbortController ref for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsLoading(true);
      setError(null);

      const dateRange = resolveDateRange(dateFilter);
      const paymentStatus = filterStatus === 'completed' ? 'paid' : undefined;
      const fulfillmentStatus = filterStatus === 'cancelled' ? 'cancelled' : undefined;

      const [fetchedOrders, fetchedProducts] = await Promise.all([
        apiClient.getOrders({
          search: searchQuery || undefined,
          ...dateRange,
          payment_status: paymentStatus,
          fulfillment_status: fulfillmentStatus,
          page: 1,
          limit: 100,
        }),
        apiClient.getProducts()
      ]);

      // Only update state if request wasn't aborted
      if (!controller.signal.aborted) {
        setOrders(fetchedOrders);
        setProducts(fetchedProducts);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Silently handle abort
      }
      
      if (!abortControllerRef.current?.signal.aborted) {
        setError(
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          t('orders.errors.loadFailed')
        );
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [dateFilter, filterStatus, searchQuery, t]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
    
    try {
      const order = orders.find(o => o.id === orderId);
      if (newStatus === 'confirmed' && order?.rto_risk === 'high') {
        throw new Error(t('orders.errors.highRTO'));
      }

      let updatedOrder: Order;
      if (newStatus === 'confirmed') {
        updatedOrder = await apiClient.confirmOrder(orderId);
      } else {
        updatedOrder = await apiClient.updateOrder(orderId, { status: newStatus });
      }

      setOrders(prevOrders =>
        prevOrders.map(o => (o.id === orderId ? updatedOrder : o))
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error.message ||
        t('orders.errors.updateStatus');
      throw new Error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  }, [orders, t]);

  // Debounced effect for data fetching
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchData();
    }, TIMEOUTS.DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [dateFilter, searchQuery, filterStatus, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    orders,
    products,
    isLoading,
    error,
    refetch,
    updateOrderStatus,
    updatingOrderId,
  };
};
