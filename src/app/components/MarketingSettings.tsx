import { useState } from "react";
import { Mail, MessageSquare, Save } from "lucide-react";

export default function MarketingSettings() {
  const [settings, setSettings] = useState({
    // Email Settings
    senderName: 'My Shop',
    replyToEmail: 'reply@myshop.com',
    // SMS Settings
    smsSenderId: 'MYSHOP',
    dailySendLimit: '1000',
  });

  const handleSave = () => {
    console.log('Saving settings...', settings);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Marketing Settings</h1>
        <p className="text-gray-600 mt-1">Configure your email and SMS settings</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Email Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Email Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sender Name
              </label>
              <input
                type="text"
                value={settings.senderName}
                onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                placeholder="e.g., My Shop"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will appear in the "From" field of your emails
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reply-to Email
              </label>
              <input
                type="email"
                value={settings.replyToEmail}
                onChange={(e) => setSettings({ ...settings, replyToEmail: e.target.value })}
                placeholder="reply@myshop.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Customer replies will be sent to this email address
              </p>
            </div>
          </div>
        </div>

        {/* SMS Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">SMS Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMS Sender ID
              </label>
              <input
                type="text"
                value={settings.smsSenderId}
                onChange={(e) => setSettings({ ...settings, smsSenderId: e.target.value })}
                placeholder="MYSHOP"
                maxLength={11}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum 11 characters. This will appear as the sender name in SMS
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Send Limit
              </label>
              <input
                type="number"
                value={settings.dailySendLimit}
                onChange={(e) => setSettings({ ...settings, dailySendLimit: e.target.value })}
                placeholder="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum number of SMS messages to send per day
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
}