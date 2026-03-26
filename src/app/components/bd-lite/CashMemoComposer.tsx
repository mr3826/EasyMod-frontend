import React, { useState } from 'react';
import { FileText, Send, Copy, Path, Truck, X } from 'lucide-react';

interface CashMemoProps {
  onClose?: () => void;
  buyerName?: string;
  buyerPhone?: string;
  address?: string;
  items?: string;
  total?: string;
}

const CashMemoComposer: React.FC<CashMemoProps> = ({ 
  onClose,
  buyerName = "Customer",
  buyerPhone = "",
  address = "",
  items = "",
  total = ""
}) => {
  const [activeTab, setActivePath] = useState<'memo' | 'courier'>('memo');
  const [memoData, setMemoData] = useState({
    items: items,
    total: total,
    advance: "0",
    due: total
  });

  const [courierData, setCourierData] = useState({
    name: buyerName,
    phone: buyerPhone,
    address: address,
    hub: "Inside Dhaka",
    weight: "0.5 kg"
  });

  const generateMemoText = () => {
    return `🛍️ Cash Memo
Items: ${memoData.items}
Total: ৳${memoData.total}
Advance: ৳${memoData.advance}
Due amount to Courier: ৳${memoData.due}

Thanks for shopping with us!`;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 flex flex-col h-full max-h-[80vh] w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 opacity-80" />
          <h2 className="font-bold text-lg leading-none">Complete Order</h2>
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
          onClick={() => setActivePath('memo')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'memo' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          <FileText className="w-4 h-4" /> Cash Memo
        </button>
        <button 
          onClick={() => setActivePath('courier')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'courier' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
        >
          <path className="w-4 h-4" /> Book Courier
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
        {activeTab === 'memo' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Products</label>
              <textarea 
                value={memoData.items}
                onChange={e => setMemoData({...memoData, items: e.target.value})}
                placeholder="Ex: 2x Panjabi, 1x T-Shirt"
                className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Total (৳)</label>
                <input 
                  type="number" 
                  value={memoData.total}
                  onChange={e => setMemoData({...memoData, total: e.target.value})}
                  className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Advance (৳)</label>
                <input 
                  type="number" 
                  value={memoData.advance}
                  onChange={e => setMemoData({...memoData, advance: e.target.value})}
                  className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-blue-500 text-green-700 font-bold" 
                />
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-gray-100 p-3 rounded-xl border border-gray-200 font-mono text-xs whitespace-pre-wrap text-gray-700 relative">
               {generateMemoText()}
               <button className="absolute top-2 right-2 p-1.5 bg-white shadow-sm border border-gray-200 rounded-md text-gray-500 hover:text-blue-600">
                 <Copy className="w-3.5 h-3.5" />
               </button>
            </div>

            <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-md shadow-blue-200 transition-colors">
              <Send className="w-4 h-4" /> Send to Customer & Save
            </button>
          </div>
        ) : (
          <div className="space-y-4">
             {/* Courier Integrated Warning/Status */}
             <div className="bg-purple-100 text-purple-800 p-3 rounded-xl flex items-start gap-2 text-sm font-medium">
               <Truck className="w-5 h-5 shrink-0 mt-0.5 text-purple-600" />
               <p>Will be booked automatically to <strong>Steadfast Courier</strong>. Ensure address is correct.</p>
             </div>

             <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer Phone</label>
                  <input value={courierData.phone} onChange={e => setCourierData({...courierData, phone: e.target.value})} className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-purple-500 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Address</label>
                  <textarea value={courierData.address} onChange={e => setCourierData({...courierData, address: e.target.value})} rows={2} className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-purple-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location</label>
                    <select className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-2 focus:ring-purple-500">
                      <option>Inside Dhaka</option>
                      <option>Outside Dhaka</option>
                      <option>Dhaka Suburb</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">COD Amount (৳)</label>
                    <input disabled value={memoData.due} className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-gray-100 font-bold text-gray-600" />
                  </div>
                </div>
             </div>

             <button className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-md shadow-purple-200 transition-colors mt-2">
              <Truck className="w-4 h-4" /> Book Courier Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashMemoComposer;