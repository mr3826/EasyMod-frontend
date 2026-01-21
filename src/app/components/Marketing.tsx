import { useState } from "react";
import { Users, Send, FileText, Settings } from "lucide-react";
import Audience from "./Audience";
import Campaigns from "./Campaigns";
import Templates from "./Templates";
import MarketingSettings from "./MarketingSettings";

type MarketingTab = 'audience' | 'campaigns' | 'templates' | 'settings';

export default function Marketing() {
  const [activeTab, setActiveTab] = useState<MarketingTab>('campaigns');

  const tabs = [
    { id: 'audience' as MarketingTab, name: 'Audience', icon: Users },
    { id: 'campaigns' as MarketingTab, name: 'Campaigns', icon: Send },
    { id: 'templates' as MarketingTab, name: 'Templates', icon: FileText },
    { id: 'settings' as MarketingTab, name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sub-navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Marketing</h1>
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
        {activeTab === 'campaigns' && <Campaigns />}
        {activeTab === 'templates' && <Templates />}
        {activeTab === 'audience' && <Audience />}
        {activeTab === 'settings' && <MarketingSettings />}
      </div>
    </div>
  );
}
