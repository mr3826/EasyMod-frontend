import React, { useState } from 'react';
import { FileText, Send, Copy, Truck, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '../../lib/api';

interface CashMemoProps {
  onClose?: () => void;
  orderId?: string;
  buyerName?: string;
  buyerPhone?: string;
  address?: string;
  items?: string;
  total?: string;
}

const CashMemoComposer: React.FC<CashMemoProps> = ({
  onClose,
  orderId,
  buyerName = '',
  buyerPhone = '',
  address = '',
  items = '',
  total = ''
}) => {
  const [activeTab, setActiveTab] = useState<'memo' | 'courier'>('memo');
  const [memoData, setMemoData] = useState({
    items,
    total,
    advance: '0',
    due: total
  });
  const [courierData, setCourierData] = useState({
    name: buyerName,
    phone: buyerPhone,
    address,
    hub: 'outside_dhaka',
    weight: '0.5'
  });

  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const due = Math.max(0, Number(memoData.total) - Number(memoData.advance));

  const generateMemoText = () =>
    `🛍️ ক্যাশ মেমো
পণ্য: ${memoData.items || '—'}
মোট: ৳${memoData.total || '0'}
অগ্রিম: ৳${memoData.advance || '0'}
কুরিয়ারে দেওয়ার পরিমাণ (COD): ৳${due}

আমাদের দোকানে কেনাকাটা করার জন্য ধন্যবাদ! 🙏`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateMemoText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = generateMemoText();
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendAndSave = async () => {
    if (!memoData.items.trim() || !memoData.total) {
      setStatus({ type: 'error', message: 'পণ্যের নাম ও মোট দাম লিখুন' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      await handleCopy();
      // If we have an existing orderId, update it; otherwise create a draft
      if (!orderId) {
        await apiClient.createOrder({
          customer_name: buyerName || 'Customer',
          customer_phone: courierData.phone || buyerPhone,
          delivery_address: courierData.address || address,
          items: memoData.items,
          total: Number(memoData.total),
          advance_payment: Number(memoData.advance),
          note: `CashMemo: ${memoData.items}`
        });
      }
      setStatus({ type: 'success', message: 'মেমো কপি হয়েছে! Messenger-এ পেস্ট করুন 📋' });
    } catch {
      setStatus({ type: 'error', message: 'সেভ হয়নি — আবার চেষ্টা করুন' });
    } finally {
      setLoading(false);
    }
  };

  const handleBookCourier = async () => {
    if (!courierData.phone || !courierData.address) {
      setStatus({ type: 'error', message: 'কাস্টমারের ফোন ও ঠিকানা লিখুন' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      // Create order draft then confirm (auto-triggers courier dispatch on confirm)
      const draftOrder = await apiClient.createOrder({
        customer_name: courierData.name || buyerName || 'Customer',
        customer_phone: courierData.phone,
        delivery_address: courierData.address,
        items: memoData.items,
        total: Number(memoData.total),
        advance_payment: Number(memoData.advance),
        cod_amount: due,
        note: `Hub: ${courierData.hub === 'inside_dhaka' ? 'ঢাকার ভেতর' : courierData.hub === 'dhaka_suburb' ? 'ঢাকার আশেপাশে' : 'ঢাকার বাইরে'}`
      });
      await apiClient.confirmOrder(draftOrder.id);
      setStatus({ type: 'success', message: 'কুরিয়ার বুক হচ্ছে! Steadfast-এ অর্ডার পাঠানো হচ্ছে 🚚' });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'কুরিয়ার বুক হয়নি — আবার চেষ্টা করুন';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 flex flex-col h-full max-h-[80vh] w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 opacity-80" />
          <h2 className="font-bold text-lg leading-none">অর্ডার সম্পন্ন করুন</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 shrink-0">
        <button
          onClick={() => setActiveTab('memo')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'memo' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          <FileText className="w-4 h-4" /> ক্যাশ মেমো
        </button>
        <button
          onClick={() => setActiveTab('courier')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'courier' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
        >
          <Truck className="w-4 h-4" /> কুরিয়ার বুক
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
        {/* Status notice */}
        {status && (
          <div className={`flex items-start gap-2 text-sm p-3 rounded-xl mb-4 font-medium ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {status.type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            {status.message}
          </div>
        )}

        {activeTab === 'memo' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">পণ্যের বিবরণ</label>
              <textarea
                value={memoData.items}
                onChange={e => setMemoData({ ...memoData, items: e.target.value })}
                placeholder="যেমন: ২টি পাঞ্জাবি (XL), ১টি টি-শার্ট"
                className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">মোট দাম (৳)</label>
                <input
                  type="number"
                  value={memoData.total}
                  onChange={e => setMemoData({ ...memoData, total: e.target.value, due: String(Math.max(0, Number(e.target.value) - Number(memoData.advance))) })}
                  className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">অগ্রিম (৳)</label>
                <input
                  type="number"
                  value={memoData.advance}
                  onChange={e => setMemoData({ ...memoData, advance: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-blue-500 text-green-700 font-bold"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800 font-semibold">
              কুরিয়ারে COD: ৳{due} (মোট - অগ্রিম)
            </div>

            {/* Live Preview */}
            <div className="bg-gray-100 p-3 rounded-xl border border-gray-200 font-mono text-xs whitespace-pre-wrap text-gray-700 relative">
              {generateMemoText()}
              <button
                onClick={handleCopy}
                className={`absolute top-2 right-2 p-1.5 shadow-sm border rounded-md transition-colors ${copied ? 'bg-green-100 border-green-300 text-green-600' : 'bg-white border-gray-200 text-gray-500 hover:text-blue-600'}`}
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={handleSendAndSave}
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-md shadow-blue-200 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              কপি করুন ও সেভ করুন
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-purple-100 text-purple-800 p-3 rounded-xl flex items-start gap-2 text-sm font-medium">
              <Truck className="w-5 h-5 shrink-0 mt-0.5 text-purple-600" />
              <p>Steadfast Courier-এ অটো বুক হবে। ঠিকানা ও ফোন নম্বর ঠিক আছে কিনা দেখুন।</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">কাস্টমারের নাম</label>
                <input
                  value={courierData.name}
                  onChange={e => setCourierData({ ...courierData, name: e.target.value })}
                  placeholder="ক্রেতার নাম"
                  className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">মোবাইল নম্বর</label>
                <input
                  value={courierData.phone}
                  onChange={e => setCourierData({ ...courierData, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ডেলিভারির ঠিকানা</label>
                <textarea
                  value={courierData.address}
                  onChange={e => setCourierData({ ...courierData, address: e.target.value })}
                  rows={2}
                  placeholder="বাড়ি/রোড/এলাকা/জেলা"
                  className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">এলাকা</label>
                  <select
                    value={courierData.hub}
                    onChange={e => setCourierData({ ...courierData, hub: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="inside_dhaka">ঢাকার ভেতর</option>
                    <option value="outside_dhaka">ঢাকার বাইরে</option>
                    <option value="dhaka_suburb">ঢাকার আশেপাশে</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">COD পরিমাণ (৳)</label>
                  <input
                    disabled
                    value={due}
                    className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-gray-100 font-bold text-gray-600"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleBookCourier}
              disabled={loading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-md shadow-purple-200 transition-colors mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
              কুরিয়ার বুক করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashMemoComposer;
