import { useState } from "react";
import { MessageSquare, Truck, CreditCard } from "lucide-react";
import ChatSettings from "./ChatSettings";
import DeliverySettings from "./DeliverySettings";
import PaymentSettings from "./PaymentSettings";

type SettingsTab = 'chat' | 'delivery' | 'payment';

export default function ManageShop() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('chat');

  const tabs = [
    { id: 'chat' as SettingsTab, name: 'Chat Settings', icon: MessageSquare },
    { id: 'delivery' as SettingsTab, name: 'Delivery Settings', icon: Truck },
    { id: 'payment' as SettingsTab, name: 'Payment Settings', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sub-navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Manage Shop</h1>
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'chat' && <ChatSettings />}
        {activeTab === 'delivery' && <DeliverySettings />}
        {activeTab === 'payment' && <PaymentSettings />}
      </div>
    </div>
  );
}
