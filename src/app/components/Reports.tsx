import { TrendingUp, Users, DollarSign, ShoppingCart, Bot, Brain, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { mockInsights } from "../lib/mockData";
import { mockFAQs, mockKnowledgeGaps } from "../lib/knowledgeTypes";

const salesByChannel = [
  { name: 'WhatsApp', value: 145, percentage: 35 },
  { name: 'Facebook', value: 127, percentage: 30 },
  { name: 'Web Chat', value: 98, percentage: 24 },
  { name: 'Telegram', value: 45, percentage: 11 },
];

const topProducts = [
  { name: 'Water 5L', sales: 89, revenue: 1156 },
  { name: 'Coffee Beans', sales: 67, revenue: 1674 },
  { name: 'Chocolate Bar', sales: 54, revenue: 486 },
  { name: 'Green Tea', sales: 43, revenue: 687 },
  { name: 'Honey', sales: 38, revenue: 722 },
];

const channelPerformance = [
  { channel: 'WhatsApp', messages: 243, conversions: 85, rate: 35 },
  { channel: 'Facebook', messages: 127, conversions: 38, rate: 30 },
  { channel: 'Web Chat', messages: 89, conversions: 21, rate: 24 },
  { channel: 'Telegram', messages: 0, conversions: 0, rate: 0 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export default function Reports() {
  // Knowledge analytics
  const totalKnowledgeUsage = mockFAQs.reduce((sum, faq) => sum + faq.usageCount, 0);
  const avgConfidence = mockFAQs.reduce((sum, faq) => sum + faq.confidence, 0) / mockFAQs.length;
  
  const faqsByCategory = mockFAQs.reduce((acc, faq) => {
    acc[faq.category] = (acc[faq.category] || 0) + faq.usageCount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">AI-powered insights and business intelligence</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: DollarSign, label: 'Total Revenue', value: '$4,725.90', change: '+18.2%', color: 'green' },
          { icon: ShoppingCart, label: 'Total Orders', value: '127', change: '+12.5%', color: 'blue' },
          { icon: Users, label: 'Active Customers', value: '89', change: '+8.1%', color: 'purple' },
          { icon: TrendingUp, label: 'Avg Order Value', value: '$37.21', change: '+5.4%', color: 'orange' },
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 text-${metric.color}-600`} />
                <span className="text-green-600 text-sm font-semibold">{metric.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Knowledge Performance Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Knowledge Base Performance</h2>
            <p className="text-sm text-gray-600">How your AI knowledge is being used</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Total Usage</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalKnowledgeUsage}</p>
            <p className="text-xs text-gray-500 mt-1">Answers provided</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Avg Confidence</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{Math.round(avgConfidence * 100)}%</p>
            <p className="text-xs text-gray-500 mt-1">AI accuracy</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Active FAQs</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockFAQs.filter(f => f.active).length}</p>
            <p className="text-xs text-gray-500 mt-1">Ready to use</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Knowledge Gaps</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockKnowledgeGaps.length}</p>
            <p className="text-xs text-gray-500 mt-1">Need attention</p>
          </div>
        </div>

        {/* Top FAQs */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <h3 className="font-semibold text-gray-900 mb-3">Most Used Knowledge</h3>
          <div className="space-y-2">
            {mockFAQs
              .sort((a, b) => b.usageCount - a.usageCount)
              .slice(0, 5)
              .map((faq, index) => (
                <div key={faq.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl font-bold text-purple-600">#{index + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{faq.question}</p>
                      <p className="text-xs text-gray-500">{faq.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{faq.usageCount} uses</p>
                    <p className="text-xs text-gray-500">{Math.round(faq.confidence * 100)}% confidence</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales by Channel */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Channel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesByChannel}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {salesByChannel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance Analysis</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {channelPerformance.map((channel) => (
                <tr key={channel.channel} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{channel.channel}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{channel.messages}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{channel.conversions}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full ${
                      channel.rate >= 30 ? 'bg-green-100 text-green-700' :
                      channel.rate >= 20 ? 'bg-yellow-100 text-yellow-700' :
                      channel.rate > 0 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {channel.rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${channel.rate}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <Bot className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI-Generated Business Insights</h2>
            <p className="text-sm text-gray-600">Automated analysis from your data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockInsights.map((insight) => {
            const colors = {
              success: 'bg-green-100 border-green-300 text-green-800',
              info: 'bg-blue-100 border-blue-300 text-blue-800',
              warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
            };
            
            return (
              <div key={insight.id} className={`p-4 rounded-lg border-2 ${colors[insight.type as keyof typeof colors]}`}>
                <h3 className="font-semibold mb-2">{insight.title}</h3>
                <p className="text-sm">{insight.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">💡 AI Recommendation</h3>
          <p className="text-sm text-purple-800">
            Based on your data, we recommend prioritizing WhatsApp marketing campaigns and 
            increasing inventory for Premium Water Bottle 5L. The AI predicts a 23% increase 
            in demand over the next week.
          </p>
        </div>
      </div>
    </div>
  );
}