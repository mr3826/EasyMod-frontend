/**
 * Dashboard Component (Phase 3 - Modernized with Animations)
 * 
 * Updated Dashboard with:
 * ✅ Animated counters (0 → final value)
 * ✅ Staggered loader animation
 * ✅ Animated metric cards (hover lift)
 * ✅ 60 FPS smooth interactions
 * ✅ Respects prefers-reduced-motion
 */

import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ArrowUp, ArrowDown, MessageSquare, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient } from "../lib/api";
import { motion } from "motion/react";

// Import new animated components
import {
  AnimatedCard,
  AnimatedCardGroup,
  AnimatedCardLoader,
  AnimatedCounter,
  AnimatedButton,
} from "@/components/motion";
import { useStaggerAnimation } from "@/lib/useMotionHooks";


export default function Dashboard() {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { containerVariants, itemVariants } = useStaggerAnimation({
    staggerDelay: 0.05,
    itemDuration: 0.3,
  });

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

  // Loading state with animated skeleton
  if (isLoading) {
    return (
      <div className="p-8">
        <motion.div
          className="mb-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
        </motion.div>
        <AnimatedCardLoader count={4} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-3">
            <div className="text-red-600">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">{t('dashboard.home.error')}</h3>
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
          <AnimatedButton
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="primary"
          >
            {t('common.retry')}
          </AnimatedButton>
        </motion.div>
      </div>
    );
  }

  const metrics = dashboardData ? [
    {
      name: t('dashboard.home.metrics.totalMessages'),
      value: dashboardData.metrics.totalMessages,
      change: null as string | null,
      trend: null as 'up' | 'down' | null,
      icon: MessageSquare,
      color: 'blue',
    },
    {
      name: t('dashboard.home.metrics.activeProducts'),
      value: dashboardData.metrics.activeProducts,
      change: null as string | null,
      trend: null as 'up' | 'down' | null,
      icon: Package,
      color: 'purple',
    },
    {
      name: t('dashboard.home.metrics.ordersToday'),
      value: dashboardData.metrics.ordersToday,
      change: `${dashboardData.metrics.weeklyChange >= 0 ? '+' : ''}${dashboardData.metrics.weeklyChange.toFixed(1)}%`,
      trend: dashboardData.metrics.weeklyChange >= 0 ? 'up' : 'down',
      icon: ShoppingCart,
      color: 'green',
    },
    {
      name: t('dashboard.home.metrics.conversionRate'),
      value: dashboardData.metrics.conversionRate,
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
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.home.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.home.subtitle')}</p>
      </motion.div>

      {/* Metrics Grid with Animated Counters */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {metrics.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center text-gray-500">
            {t('dashboard.home.noMetrics')}
          </div>
        ) : (
          metrics.map((metric) => {
            const Icon = metric.icon;
            const bgColorClasses = {
              blue: 'bg-blue-100 dark:bg-blue-950',
              purple: 'bg-purple-100 dark:bg-purple-950',
              green: 'bg-green-100 dark:bg-green-950',
              orange: 'bg-orange-100 dark:bg-orange-950',
            };
            const textColorClasses = {
              blue: 'text-blue-600 dark:text-blue-400',
              purple: 'text-purple-600 dark:text-purple-400',
              green: 'text-green-600 dark:text-green-400',
              orange: 'text-orange-600 dark:text-orange-400',
            };

            return (
              <motion.div key={metric.name} variants={itemVariants}>
                <AnimatedCard
                  elevation="md"
                  isClickable
                  className="h-full"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${bgColorClasses[metric.color as keyof typeof bgColorClasses]} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${textColorClasses[metric.color as keyof typeof textColorClasses]}`} />
                    </div>
                    {metric.change && metric.trend && (
                      <motion.div
                        className={`flex items-center gap-1 text-sm ${
                          metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        <span>{metric.change}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Animated Counter */}
                  <motion.h3
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    <AnimatedCounter
                      from={0}
                      to={typeof metric.value === 'number' ? metric.value : parseInt(metric.value) || 0}
                      duration={1500}
                    />
                  </motion.h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{metric.name}</p>
                </AnimatedCard>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Charts & Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Orders Chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <AnimatedCard elevation="md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.home.ordersChart')}</h2>
            {realChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                {t('dashboard.home.noChartData')}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
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
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatedCard>
        </motion.div>

        {/* Insights */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.home.insights.title')}</h2>
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
            >
              <AnimatedCard elevation="sm">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{insight.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">{insight.description}</p>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
