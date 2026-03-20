import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, Package as PackageIcon, XCircle, Eye, Plus, Search, Download, ChevronDown, X, AlertTriangle } from "lucide-react";
import { Order, Product } from "../lib/api";
import { apiClient } from "../lib/api";

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  sku?: string;
}

interface ManualOrder {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  channel: string;
  items: OrderItem[];
  discount: number;
  tax: number;
  delivery: number;
  payment: string;
  notes: string;
  source: 'manual';
  createdBy: 'user';
}

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('last7days');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);

  const resolveDateRange = (value: string): { start_date?: string; end_date?: string } => {
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

  // Manual order form state
  const [manualOrder, setManualOrder] = useState<ManualOrder>({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    channel: 'manual',
    items: [],
    discount: 0,
    tax: 0,
    delivery: 0,
    payment: 'unpaid',
    notes: '',
    source: 'manual',
    createdBy: 'user',
  });

  // Fetch orders and products from backend with server-side filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const dateRange = resolveDateRange(dateFilter);
        const paymentStatus = filterStatus === 'completed' ? 'paid' : undefined;
        const fulfillmentStatus = filterStatus === 'cancelled' ? 'cancelled' : undefined;
        
        // Fetch both orders and products in parallel
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
        
        setOrders(fetchedOrders);
        setProducts(fetchedProducts);
      } catch (error: any) {
        setError(error.response?.data?.message || t('orders.errors.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateFilter, searchQuery, filterStatus]);

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') {
      return true;
    }

    return order.status === filterStatus;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (newStatus === 'confirmed' && order?.rto_risk === 'high') {
        setError(t('orders.errors.highRTO'));
        return;
      }
      let updatedOrder: Order;
      if (newStatus === 'confirmed') {
        updatedOrder = await apiClient.confirmOrder(orderId);
      } else {
        updatedOrder = await apiClient.updateOrder(orderId, { status: newStatus });
      }

      setOrders(orders.map(o => 
        o.id === orderId ? updatedOrder : o
      ));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || t('orders.errors.updateStatus'));
    }
  };

  const buildCsv = (rows: Record<string, string | number>[]) => {
    const headers = Object.keys(rows[0] || {});
    const escapeCsv = (value: string | number) => {
      const text = String(value ?? '');
      if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const lines = [headers.join(',')];
    rows.forEach((row) => {
      lines.push(headers.map((header) => escapeCsv(row[header] ?? '')).join(','));
    });

    return lines.join('\n');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: 'csv' | 'excel') => {
    if (orders.length === 0) {
      setError(t('orders.errors.noExportData'));
      setTimeout(() => setError(null), 2500);
      setShowExportMenu(false);
      return;
    }

    if (format === 'excel') {
      setError(t('orders.errors.excelNotAvailable'));
      setTimeout(() => setError(null), 2500);
    }

    const rows = orders.map((order) => ({
      id: order.id,
      customer: order.customerName,
      total: order.total,
      status: order.status,
      channel: order.channel,
      createdAt: order.createdAt
    }));

    const csv = buildCsv(rows);
    downloadFile(csv, 'orders.csv', 'text/csv');
    setShowExportMenu(false);
  };

  const addProductToOrder = (product: Product, quantity: number = 1) => {
    const existingItem = manualOrder.items.find(item => item.productId === product.id);
    if (existingItem) {
      setManualOrder({
        ...manualOrder,
        items: manualOrder.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      });
    } else {
      setManualOrder({
        ...manualOrder,
        items: [
          ...manualOrder.items,
          {
            productId: product.id,
            productName: product.name,
            quantity,
            price: product.price,
            sku: product.sku,
          }
        ]
      });
    }
    setShowProductSelector(false);
  };

  const removeProductFromOrder = (productId: string) => {
    setManualOrder({
      ...manualOrder,
      items: manualOrder.items.filter(item => item.productId !== productId)
    });
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }
    setManualOrder({
      ...manualOrder,
      items: manualOrder.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    });
  };

  const calculateSubtotal = () => {
    return manualOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - manualOrder.discount + manualOrder.tax + manualOrder.delivery;
  };

  const handleCreateOrder = async () => {
    try {
      // Validate required fields
      if (!manualOrder.customerName.trim()) {
        setError(t('orders.errors.nameRequired'));
        return;
      }
      if (!manualOrder.customerPhone.trim()) {
        setError(t('orders.errors.phoneRequired'));
        return;
      }
      if (!manualOrder.deliveryAddress.trim()) {
        setError(t('orders.errors.addressRequired'));
        return;
      }
      if (manualOrder.items.length === 0) {
        setError(t('orders.errors.itemRequired'));
        return;
      }

      // Transform frontend order data to backend format
      const orderData = {
        customer_name: manualOrder.customerName,
        customer_phone: manualOrder.customerPhone,
        delivery_address: manualOrder.deliveryAddress,
        channel: manualOrder.channel,
        items: manualOrder.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        discount: manualOrder.discount,
        tax: manualOrder.tax,
        delivery_fee: manualOrder.delivery,
        payment_status: manualOrder.payment,
        note: manualOrder.notes
      };

      const newOrder = await apiClient.createOrder(orderData);
      setOrders([newOrder, ...orders]);
      setShowCreateOrder(false);
      
      // Reset form
      setManualOrder({
        customerName: '',
        customerPhone: '',
        deliveryAddress: '',
        channel: 'manual',
        items: [],
        discount: 0,
        tax: 0,
        delivery: 0,
        payment: 'unpaid',
        notes: '',
        source: 'manual',
        createdBy: 'user',
      });
    } catch (error: any) {
      setError(error.response?.data?.message || t('orders.errors.createFailed'));
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('orders.title')}</h1>
          <p className="text-gray-600 mt-1">{t('orders.subtitle')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{t('orders.statusDraft')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'draft').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{t('orders.statusConfirmed')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'confirmed').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <PackageIcon className="w-4 h-4" />
            <span className="text-sm">{t('orders.statusProcessing')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'processing').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{t('orders.statusCompleted')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'completed').length}</p>
        </div>
      </div>

      {/* Order Control Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{t('orders.filterDate')}</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="today">{t('orders.dateToday')}</option>
              <option value="last7days">{t('orders.dateLast7')}</option>
              <option value="last30days">{t('orders.dateLast30')}</option>
              <option value="custom">{t('orders.dateCustom')}</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('orders.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Download className="w-4 h-4" />
              {t('orders.export')}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  {t('orders.exportCSV')}
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-t border-gray-200"
                >
                  {t('orders.exportExcel')}
                </button>
              </div>
            )}
          </div>

          {/* Create Order */}
          <button
            onClick={() => setShowCreateOrder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            {t('orders.createOrder')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-2">
          {[
            { value: 'all', label: t('orders.statusAll') },
            { value: 'draft', label: t('orders.statusDraft') },
            { value: 'confirmed', label: t('orders.statusConfirmed') },
            { value: 'processing', label: t('orders.statusProcessing') },
            { value: 'completed', label: t('orders.statusCompleted') },
            { value: 'cancelled', label: t('orders.statusCancelled') },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterStatus(value)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterStatus === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orders.columns.orderId')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orders.columns.customer')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orders.columns.items')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orders.columns.total')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orders.columns.channel')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orders.columns.status')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orders.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-900">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                      {order.customerName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm text-gray-900">{order.customerName}</span>
                      {order.rto_risk === 'high' && (
                        <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3" /> {t('customers.highRTO')}
                        </span>
                      )}
                      {order.rto_risk === 'medium' && (
                        <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          <AlertTriangle className="w-3 h-3" /> {t('customers.medRTO')}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{t('orders.itemCount', { count: order.items.length })}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 capitalize">{order.channel}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">{t('orders.createModal.title')}</h2>
              <button
                onClick={() => setShowCreateOrder(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('orders.createModal.customerSection')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('orders.createModal.customerName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualOrder.customerName}
                      onChange={(e) => setManualOrder({ ...manualOrder, customerName: e.target.value })}
                      placeholder={t('orders.createModal.customerNamePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('orders.createModal.phone')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={manualOrder.customerPhone}
                      onChange={(e) => setManualOrder({ ...manualOrder, customerPhone: e.target.value })}
                      placeholder={t('orders.createModal.phonePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('orders.createModal.channel')}</label>
                    <select
                      value={manualOrder.channel}
                      onChange={(e) => setManualOrder({ ...manualOrder, channel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="manual">{t('orders.createModal.channelManual')}</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="facebook">Facebook</option>
                      <option value="webchat">Web Chat</option>
                      <option value="telegram">Telegram</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('orders.createModal.address')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={manualOrder.deliveryAddress}
                    onChange={(e) => setManualOrder({ ...manualOrder, deliveryAddress: e.target.value })}
                    placeholder={t('orders.createModal.addressPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{t('orders.createModal.productsSection')}</h3>
                  <button
                    onClick={() => setShowProductSelector(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {t('orders.createModal.addProduct')}
                  </button>
                </div>

                {manualOrder.items.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">{t('orders.createModal.noProducts')}</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {manualOrder.items.map((item, index) => (
                      <div key={index} className="p-4 flex items-center gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500">SKU: {item.sku} • ${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateProductQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateProductQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        <div className="w-24 text-right font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeProductFromOrder(item.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">{t('orders.createModal.orderSummary')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('orders.createModal.subtotal')}:</span>
                    <span className="text-gray-900">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600">{t('orders.createModal.discount')}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        value={manualOrder.discount}
                        onChange={(e) => setManualOrder({ ...manualOrder, discount: parseFloat(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600">{t('orders.createModal.vat')}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        value={manualOrder.tax}
                        onChange={(e) => setManualOrder({ ...manualOrder, tax: parseFloat(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600">{t('orders.createModal.delivery')}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        value={manualOrder.delivery}
                        onChange={(e) => setManualOrder({ ...manualOrder, delivery: parseFloat(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between font-bold">
                    <span className="text-gray-900">{t('orders.createModal.total')}:</span>
                    <span className="text-blue-600 text-lg">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('orders.createModal.paymentStatus')}</label>
                  <select
                    value={manualOrder.payment}
                    onChange={(e) => setManualOrder({ ...manualOrder, payment: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">{t('orders.createModal.payPending')}</option>
                    <option value="paid">{t('orders.createModal.payPaid')}</option>
                    <option value="unpaid">{t('orders.createModal.payUnpaid')}</option>
                    <option value="refunded">{t('orders.createModal.payRefunded')}</option>
                    <option value="partially_paid">{t('orders.createModal.payPartial')}</option>
                  </select>
                  {(manualOrder.payment === 'unpaid' || manualOrder.payment === 'pending') && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-700">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      {t('orders.createModal.rtoWarning')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('orders.createModal.notes')}</label>
                  <input
                    type="text"
                    value={manualOrder.notes}
                    onChange={(e) => setManualOrder({ ...manualOrder, notes: e.target.value })}
                    placeholder={t('orders.createModal.notesPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowCreateOrder(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={
                  !manualOrder.customerName ||
                  !manualOrder.customerPhone ||
                  !manualOrder.deliveryAddress ||
                  manualOrder.items.length === 0
                }
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('orders.createModal.createButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{t('orders.selectProduct.title')}</h3>
              <button
                onClick={() => setShowProductSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProductToOrder(product)}
                    className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <PackageIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku} • {product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-green-600">{product.stock ? 'In Stock' : 'Out of Stock'}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Need to add a new product?
                </p>
                <button
                  onClick={() => {
                    setShowProductSelector(false);
                    setShowCreateOrder(false);
                    window.location.href = '/products/add';
                  }}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Create New Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('orders.detailModal.title')}</h2>
                <p className="text-gray-600 mt-1">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">{t('orders.detailModal.customerSection')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orders.detailModal.name')}:</span>
                  <span className="text-gray-900 font-medium">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orders.detailModal.channel')}:</span>
                  <span className="text-gray-900 font-medium capitalize">{selectedOrder.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orders.detailModal.created')}:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Meta Information */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">{t('orders.detailModal.metaSection')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orders.detailModal.orderSource')}:</span>
                  <span className="text-gray-900 font-medium capitalize">{selectedOrder.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orders.detailModal.createdBy')}:</span>
                  <span className="text-gray-900 font-medium">
                    {selectedOrder.channel === 'manual' ? t('orders.detailModal.createdByManual') : t('orders.detailModal.createdByAI')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orders.detailModal.creationMethod')}:</span>
                  <span className="text-gray-900 font-medium">
                    {selectedOrder.channel === 'manual' ? t('orders.detailModal.methodManual') : t('orders.detailModal.methodAutomated')}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">{t('orders.detailModal.itemsSection')}</h3>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">{t('orders.detailModal.quantity')}: {item.quantity}</p>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-between items-center text-lg font-bold">
                <span>{t('orders.detailModal.total')}:</span>
                <span className="text-blue-600">${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Status */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">{t('orders.detailModal.updateStatus')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'confirmed' as Order['status'], label: t('orders.statusConfirmed') },
                  { value: 'processing' as Order['status'], label: t('orders.statusProcessing') },
                  { value: 'completed' as Order['status'], label: t('orders.statusCompleted') },
                  { value: 'cancelled' as Order['status'], label: t('orders.statusCancelled') },
                ]).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleUpdateStatus(selectedOrder.id, value)}
                    disabled={selectedOrder.status === value}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedOrder.status === value
                        ? statusColors[value] + ' opacity-50 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t('orders.detailModal.close')}
              </button>
              {selectedOrder.status === 'draft' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('orders.detailModal.confirmOrder')}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-2"
                  >
                    {t('orders.detailModal.cancelOrder')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}