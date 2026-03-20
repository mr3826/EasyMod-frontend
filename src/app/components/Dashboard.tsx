import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ArrowUp, ArrowDown, MessageSquare, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient } from "../lib/api";


export default function Dashboard() {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiClient.getDashboardMetrics();
        setDashboardData(data);
      } catch (error: any) {
        setError(error.response?.data?.error?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="text-red-600">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900">{t('dashboard.home.error')}</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  const metrics = dashboardData ? [
    {
      name: t('dashboard.home.metrics.totalMessages'),
      value: dashboardData.metrics.totalMessages.toString(),
      change: null as string | null,
      trend: null as 'up' | 'down' | null,
      icon: MessageSquare,
      color: 'blue',
    },
    {
      name: t('dashboard.home.metrics.activeProducts'),
      value: dashboardData.metrics.activeProducts.toString(),
      change: null as string | null,
      trend: null as 'up' | 'down' | null,
      icon: Package,
      color: 'purple',
    },
    {
      name: t('dashboard.home.metrics.ordersToday'),
      value: dashboardData.metrics.ordersToday.toString(),
      change: `${dashboardData.metrics.weeklyChange >= 0 ? '+' : ''}${dashboardData.metrics.weeklyChange.toFixed(1)}%`,
      trend: dashboardData.metrics.weeklyChange >= 0 ? 'up' : 'down',
      icon: ShoppingCart,
      color: 'green',
    },
    {
      name: t('dashboard.home.metrics.conversionRate'),
      value: `${dashboardData.metrics.conversionRate}%`,
      change: null as string | null,
      trend: null as 'up' | 'down' | null,
      icon: TrendingUp,
      color: 'orange',
    },
  ] : [];

  const insights = dashboardData ? [
    {
      id: '1',
      title: t('dashboard.home.insights.performance'),
      description: t('dashboard.home.insights.performanceMsg', { products: dashboardData.metrics.activeProducts, orders: dashboardData.metrics.ordersToday }),
      type: 'info' as const,
    },
    {
      id: '2',
      title: t('dashboard.home.insights.channelActivity'),
      description: t('dashboard.home.insights.channelMsg', { active: dashboardData.channels.active, total: dashboardData.channels.total }),
      type: 'success' as const,
    },
    {
      id: '3',
      title: t('dashboard.home.insights.weeklyTrend'),
      description: t('dashboard.home.insights.weeklyMsg', { percent: Math.abs(dashboardData.metrics.weeklyChange), direction: dashboardData.metrics.weeklyChange >= 0 ? t('dashboard.home.insights.increased') : t('dashboard.home.insights.decreased') }),
      type: 'warning' as const,
    },
  ] : [];

  const realChartData = dashboardData?.chartData ?? [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.home.title')}</h1>
        <p className="text-gray-600 mt-1">{t('dashboard.home.subtitle')}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-6 border border-gray-200 text-center text-gray-500">
            {t('dashboard.home.noMetrics')}
          </div>
        ) : (
          metrics.map((metric) => {
            const Icon = metric.icon;
            const bgColor = `bg-${metric.color}-100`;
            const textColor = `text-${metric.color}-600`;
            
            return (
              <div key={metric.name} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${textColor}`} />
                  </div>
                  {metric.change && metric.trend && (
                    <div className={`flex items-center gap-1 text-sm ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      <span>{metric.change}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                <p className="text-gray-600 text-sm mt-1">{metric.name}</p>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Orders Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.home.ordersChart')}</h2>
          {realChartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              {t('dashboard.home.noChartData')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={realChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Channel Status */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.home.channelStatus')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t('dashboard.home.activeChannels')}</span>
              <span className="text-2xl font-bold text-gray-900">{dashboardData?.channels?.active || 0}/{dashboardData?.channels?.total || 0}</span>
            </div>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📡</div>
              <p className="text-gray-600 text-sm">
                {(dashboardData?.channels?.active || 0) > 0
                  ? t('dashboard.home.channelsActive', { active: dashboardData.channels.active, total: dashboardData.channels.total })
                  : t('dashboard.home.noActiveChannels')
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.home.aiInsights')}</h2>
          <span className="text-sm text-gray-500">{t('dashboard.home.updatedAgo')}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              No insights available from the backend.
            </div>
          ) : (
            insights.map((insight) => {
              const colors = {
                success: 'bg-green-50 border-green-200 text-green-700',
                info: 'bg-blue-50 border-blue-200 text-blue-700',
                warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
              };
              
              return (
                <div key={insight.id} className={`p-4 rounded-lg border ${colors[insight.type]}`}>
                  <h3 className="font-semibold mb-1">{insight.title}</h3>
                  <p className="text-sm opacity-80">{insight.description}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
