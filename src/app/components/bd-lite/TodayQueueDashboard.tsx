import React from 'react';
import { MessageCircle, Box, CreditCard, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TodayQueueDashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">{t('bd_lite.todayQueue')}</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">{t('bd_lite.focusAttention')}</p>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Unread Messages */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col items-start gap-3 relative cursor-pointer active:scale-95 transition-transform">
          <div className="bg-blue-500 rounded-full p-2.5 text-white shadow-sm">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">14</div>
            <div className="text-xs font-bold text-blue-700 uppercase mt-0.5">{t('bd_lite.needsReply')}</div>
          </div>
        </div>

        {/* Wait for Payment (bKash/Nagad) */}
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex flex-col items-start gap-3 relative cursor-pointer active:scale-95 transition-transform">
          <div className="bg-orange-500 rounded-full p-2.5 text-white shadow-sm">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">5</div>
            <div className="text-[11px] font-bold text-orange-700 uppercase leading-snug mt-0.5">{t('bd_lite.pendingPayment')}</div>
          </div>
        </div>

        {/* Pending Dispatch */}
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex flex-col items-start gap-3 col-span-2 relative cursor-pointer active:scale-95 transition-transform">
          <div className="flex items-center gap-4 w-full">
            <div className="bg-purple-500 rounded-full p-3 text-white shadow-sm shrink-0">
              <Box className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-black text-gray-900">23</div>
              <div className="text-xs font-bold text-purple-700 uppercase mt-0.5">{t('bd_lite.toCourier')}</div>
            </div>
            <div className="bg-purple-200/50 p-2 rounded-full shrink-0">
              <ArrowRight className="text-purple-600 w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Needed: Potential RTO */}
      <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden mt-6 shadow-sm">
        <div className="p-3.5 border-b border-red-100 flex items-center gap-2 bg-red-100/50">
          <AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={2.5} />
          <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide">{t('bd_lite.actionNeeded')}</h3>
          <span className="ml-auto bg-red-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-sm">{t('bd_lite.riskCount', { count: 2 })}</span>
        </div>
        <div className="divide-y divide-red-100/60">
          <div className="p-4 flex gap-3 justify-between items-center text-sm cursor-pointer hover:bg-red-50/80 transition-colors">
            <div>
              <div className="font-bold text-gray-900">INV-92842</div>
              <div className="text-xs text-red-600 font-semibold mt-1">{t('bd_lite.attemptedDelivery')}</div>
            </div>
            <button className="text-[11px] uppercase tracking-wide bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-bold shadow-sm transition-colors shrink-0">{t('bd_lite.callHub')}</button>
          </div>
          <div className="p-4 flex gap-3 justify-between items-center text-sm cursor-pointer hover:bg-red-50/80 transition-colors">
            <div>
              <div className="font-bold text-gray-900">INV-83711</div>
              <div className="text-xs text-red-600 font-semibold mt-1">{t('bd_lite.phoneUnreachable')}</div>
            </div>
            <button className="text-[11px] uppercase tracking-wide bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-bold shadow-sm transition-colors shrink-0">{t('bd_lite.contactBuyer')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayQueueDashboard;
