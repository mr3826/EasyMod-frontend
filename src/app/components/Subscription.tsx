import { Receipt, AlertCircle, CheckCircle2, Download, Eye, TrendingUp, Package, ShoppingCart, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { toast } from "sonner";
import { apiClient } from "@/app/lib/api";
import { subscriptionPlans, getPlanPrice, findPlanByName, type BillingCycle } from "@/app/lib/subscriptionPlans";

interface Invoice {
  id: string;
  billingPeriod: string;
  amount: number;
  status: 'pending' | 'paid';
  type: string;
  date: string;
}

export default function Subscription() {
  const [selectedConversationPack, setSelectedConversationPack] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasSubscriptionData, setHasSubscriptionData] = useState(true);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(subscriptionPlans[1]?.id || "starter");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  // State for actual data from API
  const [currentPlan, setCurrentPlan] = useState({
    name: 'Free',
    price: 0,
    cycle: 'Monthly',
    nextBillingDate: '',
    status: 'active',
    features: {
      imageUnderstanding: false,
    }
  });

  const [usage, setUsage] = useState({
    conversations: {
      used: 0,
      limit: 100,
      status: 'safe' as 'safe' | 'warning' | 'exceeded'
    },
    orders: {
      used: 0,
      limit: 50,
      status: 'safe' as 'safe' | 'warning' | 'exceeded'
    },
    products: {
      used: 0,
      limit: 100,
      status: 'safe' as 'safe' | 'warning' | 'exceeded'
    }
  });

  const [extraUsage, setExtraUsage] = useState({
    conversations: 0,
    estimatedCharge: 0
  });

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Load subscription data on mount
  useEffect(() => {
    loadSubscriptionData();
    loadInvoices();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setHasSubscriptionData(true);
      const response = await apiClient.getSubscription();

      if (!response?.success || !response.data) {
        setHasSubscriptionData(false);
        return;
      }

      if (response.success && response.data) {
        const { subscription, usage: usageData, extra_usage } = response.data;
        
        // Update current plan
        setCurrentPlan({
          name: subscription.plan_name,
          price: parseFloat(subscription.plan_price),
          cycle: subscription.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly',
          nextBillingDate: new Date(subscription.next_billing_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          status: subscription.status,
          features: {
            imageUnderstanding: subscription.features?.image_understanding || false
          }
        });

        const matchedPlan = findPlanByName(subscription.plan_name);
        if (matchedPlan) {
          setSelectedPlanId(matchedPlan.id);
        }
        setBillingCycle(subscription.billing_cycle === 'yearly' ? 'yearly' : 'monthly');

        // Update usage
        setUsage({
          conversations: {
            used: usageData.conversations.used,
            limit: usageData.conversations.limit,
            status: usageData.conversations.status
          },
          orders: {
            used: usageData.orders.used,
            limit: usageData.orders.limit,
            status: usageData.orders.status
          },
          products: {
            used: usageData.products.used,
            limit: usageData.products.limit,
            status: usageData.products.status
          }
        });

        // Update extra usage
        setExtraUsage({
          conversations: extra_usage.conversations,
          estimatedCharge: extra_usage.charge
        });
      }
    } catch (error: any) {
      console.error('Failed to load subscription data:', error);
      setError('Failed to load subscription data');
      setHasSubscriptionData(false);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await apiClient.getSubscriptionInvoices();

      if (response?.success && response.data) {
        const mappedInvoices = response.data.map((inv: any) => ({
          id: inv.invoice_number,
          billingPeriod: inv.billing_period,
          amount: parseFloat(inv.amount),
          status: inv.status,
          type: inv.invoice_type,
          date: new Date(inv.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        }));
        setInvoices(mappedInvoices);
      } else {
        setInvoices([]);
      }
    } catch (error: any) {
      console.error('Failed to load invoices:', error);
      toast.error('Failed to load invoices');
      setInvoices([]);
    }
  };

  const planFeatures = [
    'Image-based product understanding',
    'Product question answering',
    'Order draft creation',
    'Cash on Delivery support'
  ];

  const conversationPacks = [
    { amount: 100, price: 250 },
    { amount: 300, price: 675 },
    { amount: 500, price: 1000 }
  ];

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getStatusColor = (status: 'safe' | 'warning' | 'exceeded') => {
    switch (status) {
      case 'safe':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'exceeded':
        return 'text-orange-600 bg-orange-50';
    }
  };

  const getStatusLabel = (status: 'safe' | 'warning' | 'exceeded') => {
    switch (status) {
      case 'safe':
        return 'Safe';
      case 'warning':
        return 'Almost Used';
      case 'exceeded':
        return 'Extra Usage Active';
    }
  };

  const calculateTotalBill = () => {
    let total = currentPlan.price;
    if (usage.conversations.status === 'exceeded') {
      total += extraUsage.estimatedCharge;
    }
    if (selectedConversationPack) {
      const pack = conversationPacks.find(p => p.amount === selectedConversationPack);
      if (pack) total += pack.price;
    }
    return total;
  };

  const handlePlanUpdate = async (planId: string) => {
    const selectedPlan = subscriptionPlans.find((plan) => plan.id === planId);
    if (!selectedPlan) return;

    try {
      setIsUpdatingPlan(true);
      setError(null);
      setSuccess(null);

      const planPrice = getPlanPrice(selectedPlan, billingCycle);

      const response = await apiClient.updateSubscriptionPlan({
        plan_name: selectedPlan.name,
        plan_price: planPrice,
        billing_cycle: billingCycle,
        conversations_limit: selectedPlan.limits.conversations,
        orders_limit: selectedPlan.limits.orders,
        products_limit: selectedPlan.limits.products,
        features: selectedPlan.features,
      });

      if (response?.success) {
        setSuccess(response.message || 'Subscription plan updated successfully');
        loadSubscriptionData();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to update plan');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleRequestInvoice = async () => {
    if (!selectedConversationPack) return;

    try {
      setError(null);
      setSuccess(null);
      
      const pack = conversationPacks.find(p => p.amount === selectedConversationPack);
      if (!pack) return;

      const response = await apiClient.purchaseConversationPack({
        amount: selectedConversationPack,
        price: pack.price
      });

      if (response.success) {
        setSuccess(response.message);
        setSelectedConversationPack(null);
        // Reload invoices to show new one
        loadInvoices();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to request invoice');
      setTimeout(() => setError(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading subscription details...</div>
        </div>
      </div>
    );
  }

  if (!hasSubscriptionData) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No subscription data yet</h2>
          <p className="text-gray-600 mb-6">
            This shop doesn’t have any subscription details available. Try reloading or check back later.
          </p>
          <button
            onClick={() => loadSubscriptionData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Plan & Billing</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and view usage details</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Section 1: Current Plan Overview */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{currentPlan.name} Plan</h2>
              <Badge className={`${currentPlan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {currentPlan.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
              {currentPlan.features.imageUnderstanding && (
                <Badge className="bg-blue-100 text-blue-700">Image Understanding Enabled</Badge>
              )}
            </div>
            <div className="space-y-1 text-gray-600">
              <p className="text-lg">৳{currentPlan.price.toLocaleString()} BDT / {currentPlan.cycle}</p>
              <p className="text-sm">Next billing: {currentPlan.nextBillingDate}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Add More Conversations
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Available Plans */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Plans</h2>
            <p className="text-sm text-gray-500">Switch billing cycles or change your package.</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className={billingCycle === 'monthly' ? 'font-semibold text-gray-900' : ''}>
              Monthly
            </span>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(value) => setBillingCycle(value ? 'yearly' : 'monthly')}
              aria-label="Toggle annual billing"
            />
            <span className={billingCycle === 'yearly' ? 'font-semibold text-gray-900' : ''}>
              Annual
            </span>
            <Badge className="bg-emerald-100 text-emerald-700">2 months free</Badge>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {subscriptionPlans.map((plan) => {
            const isActive = plan.name.toLowerCase() === currentPlan.name.toLowerCase();
            const price = getPlanPrice(plan, billingCycle);

            return (
              <div
                key={plan.id}
                className={`flex h-full flex-col rounded-xl border p-5 ${
                  plan.id === selectedPlanId
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{plan.name}</p>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  {plan.popular && (
                    <Badge className="bg-purple-100 text-purple-700">Popular</Badge>
                  )}
                </div>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-900">৳{price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">/mo</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  {plan.highlights.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-1 text-xs text-gray-500">
                  <div>Conversations: {plan.limits.conversations.toLocaleString()}</div>
                  <div>Orders: {plan.limits.orders.toLocaleString()}</div>
                  <div>Products: {plan.limits.products.toLocaleString()}</div>
                </div>
                <div className="mt-auto pt-5">
                  {isActive ? (
                    <button className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600" disabled>
                      Current plan
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        handlePlanUpdate(plan.id);
                      }}
                      disabled={isUpdatingPlan}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {isUpdatingPlan && plan.id === selectedPlanId ? 'Updating...' : 'Switch plan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* AI Conversations */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">AI Conversations</h3>
          </div>
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{usage.conversations.used.toLocaleString()}</span>
              <span className="text-gray-500">/ {usage.conversations.limit.toLocaleString()} per month</span>
            </div>
          </div>
          <Progress 
            value={getUsagePercentage(usage.conversations.used, usage.conversations.limit)} 
            className="h-2 mb-3"
          />
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(usage.conversations.status)}>
              {getStatusLabel(usage.conversations.status)}
            </Badge>
          </div>
          {usage.conversations.status === 'exceeded' && (
            <p className="text-xs text-gray-500 mt-3">
              Extra usage will be added to next bill
            </p>
          )}
        </div>

        {/* Orders Created */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Orders Created</h3>
          </div>
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{usage.orders.used.toLocaleString()}</span>
              <span className="text-gray-500">/ {usage.orders.limit.toLocaleString()} per month</span>
            </div>
          </div>
          <Progress 
            value={getUsagePercentage(usage.orders.used, usage.orders.limit)} 
            className="h-2 mb-3"
          />
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(usage.orders.status)}>
              {getStatusLabel(usage.orders.status)}
            </Badge>
          </div>
        </div>

        {/* Products Used */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Products Used</h3>
          </div>
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{usage.products.used.toLocaleString()}</span>
              <span className="text-gray-500">/ {usage.products.limit.toLocaleString()} per month</span>
            </div>
          </div>
          <Progress 
            value={getUsagePercentage(usage.products.used, usage.products.limit)} 
            className="h-2 mb-3"
          />
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(usage.products.status)}>
              {getStatusLabel(usage.products.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Section 3: Extra Usage Notice (Conditional) */}
      {usage.conversations.status === 'exceeded' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your AI is still running</h3>
              <p className="text-gray-700 mb-4">
                You have used {extraUsage.conversations} extra AI conversations. Your service is not stopped.
              </p>
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Extra usage count:</span>
                  <span className="font-semibold text-gray-900">{extraUsage.conversations} conversations</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated extra charge:</span>
                  <span className="font-semibold text-gray-900">৳{extraUsage.estimatedCharge.toLocaleString()} BDT</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                This amount will be added to your next invoice.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Section 4: Add More Conversations */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add More AI Conversations</h3>
          <div className="space-y-3 mb-6">
            {conversationPacks.map((pack) => (
              <button
                key={pack.amount}
                onClick={() => setSelectedConversationPack(pack.amount)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedConversationPack === pack.amount
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">+{pack.amount} conversations</p>
                    <p className="text-xs text-gray-500 mt-1">Added to your current plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">৳{pack.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">BDT</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={handleRequestInvoice}
            disabled={!selectedConversationPack}
            className={`w-full px-4 py-3 rounded-lg transition-colors ${
              selectedConversationPack
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Request Invoice
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">
            Conversations will be available immediately after invoice approval.
          </p>
        </div>

        {/* Section 5: Feature Access */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Plan Includes</h3>
          <div className="space-y-3">
            {planFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 6: Billing Summary */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Base Plan Price</span>
            <span className="font-semibold text-gray-900">৳{currentPlan.price.toLocaleString()} BDT</span>
          </div>
          {usage.conversations.status === 'exceeded' && (
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Extra Usage Charge</span>
              <span className="font-semibold text-gray-900">৳{extraUsage.estimatedCharge.toLocaleString()} BDT</span>
            </div>
          )}
          {selectedConversationPack && (
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Added Conversations ({selectedConversationPack})</span>
              <span className="font-semibold text-gray-900">
                ৳{conversationPacks.find(p => p.amount === selectedConversationPack)?.price.toLocaleString()} BDT
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Estimated Next Invoice</span>
              <span className="text-2xl font-bold text-gray-900">৳{calculateTotalBill().toLocaleString()} BDT</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Final invoice will be issued before billing date.
        </p>
      </div>

      {/* Section 7: Invoice History */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoices</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Billing Period</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{invoice.id}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{invoice.billingPeriod}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{invoice.type}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900">৳{invoice.amount.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
