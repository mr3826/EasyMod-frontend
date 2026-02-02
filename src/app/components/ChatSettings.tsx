import { useState } from "react";
import { MessageSquare, Instagram, CheckCircle, Clock, X, Copy, Check, AlertCircle, Info, ChevronDown, ChevronUp, Loader2, Shield } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  type: 'facebook' | 'whatsapp' | 'instagram';
  logo: React.ReactNode;
  description: string;
  status: 'connected' | 'not_connected' | 'connecting';
  connectedAccount?: string;
  lastSync?: string;
  token?: string;
}

interface ChannelCredentials {
  appId: string;
  appSecret: string;
  assetId: string;
}

export default function ChatSettings() {
  // Mock channels data
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      type: 'whatsapp',
      logo: <MessageSquare className="w-8 h-8 text-green-600" />,
      description: 'Direct messaging through WhatsApp for customer support',
      status: 'connected',
      connectedAccount: 'My Shop (+1234567890)',
      lastSync: '2024-01-20T10:30:00Z',
      token: 'whatsapp_token_abc123def456',
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      type: 'facebook',
      logo: <MessageSquare className="w-8 h-8 text-blue-600" />,
      description: 'Connect with customers via Facebook Messenger',
      status: 'not_connected',
    },
    {
      id: 'instagram',
      name: 'Instagram DM',
      type: 'instagram',
      logo: <Instagram className="w-8 h-8 text-pink-600" />,
      description: 'Manage customer inquiries through Instagram Direct Messages',
      status: 'connecting',
    },
  ]);


  // UI State
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [managedChannel, setManagedChannel] = useState<Channel | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [credentials, setCredentials] = useState<Record<string, ChannelCredentials>>({
    whatsapp: { appId: '', appSecret: '', assetId: '' },
    facebook: { appId: '', appSecret: '', assetId: '' },
    instagram: { appId: '', appSecret: '', assetId: '' },
  });

  // Channel settings
  const [channelSettings, setChannelSettings] = useState({
    aiAutoReply: true,
    requireApproval: false,
    businessHours: false,
    allowOrderCreation: true,
    autoDetectProducts: true,
    draftOrdersOnly: false,
    requireManualConfirmation: true,
  });

  // Status configuration
  const statusConfig = {
    connected: { icon: CheckCircle, label: 'Connected', color: 'bg-green-100 text-green-800' },
    not_connected: { icon: Clock, label: 'Not Connected', color: 'bg-gray-100 text-gray-800' },
    connecting: { icon: Loader2, label: 'Connecting...', color: 'bg-blue-100 text-blue-800' },
  };

  const getAssetLabel = (type: Channel['type']) => {
    if (type === 'whatsapp') return 'WhatsApp Business Account ID';
    if (type === 'facebook') return 'Facebook Page ID';
    return 'Instagram Business Account ID';
  };

  const handleCredentialChange = (channelId: string, field: keyof ChannelCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        [field]: value,
      }
    }));
  };

  // Mock handlers
  const handleConnect = (channelId: string) => {
    const channelCreds = credentials[channelId];
    if (!channelCreds?.appId || !channelCreds?.appSecret || !channelCreds?.assetId) {
      setShowToast({
        type: 'error',
        message: 'Please provide App ID, App Secret, and the channel Asset ID before connecting.'
      });
      return;
    }

    setChannels(channels.map(ch =>
      ch.id === channelId
        ? { ...ch, status: 'connecting' }
        : ch
    ));

    // Simulate connection delay
    setTimeout(() => {
      // 90% success rate for demo
      const success = Math.random() > 0.1;
      setChannels(prev =>
        prev.map(ch =>
          ch.id === channelId
            ? {
              ...ch,
              status: success ? 'connected' : 'not_connected',
              connectedAccount: success ? `Account-${channelId.toUpperCase()}` : undefined,
              lastSync: success ? new Date().toISOString() : undefined,
              token: success ? `token_${channelId}_${Date.now()}` : undefined,
            }
            : ch
        )
      );

      setShowToast({
        type: success ? 'success' : 'error',
        message: success
          ? `${channels.find(c => c.id === channelId)?.name} connected successfully!`
          : 'Connection failed. Please try again.',
      });
    }, 2000);
  };

  const handleDisconnect = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (confirm(`Are you sure you want to disconnect ${channel?.name}?`)) {
      setChannels(channels.map(ch =>
        ch.id === channelId
          ? {
            ...ch,
            status: 'not_connected',
            connectedAccount: undefined,
            lastSync: undefined,
            token: undefined,
          }
          : ch
      ));

      setShowToast({
        type: 'success',
        message: `${channel?.name} disconnected successfully.`,
      });
    }
  };

  const handleManageChannel = (channel: Channel) => {
    setManagedChannel(channel);
    setShowManageModal(true);
  };

  const handleCopyToken = () => {
    if (managedChannel?.token) {
      navigator.clipboard.writeText(managedChannel.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleSettingsChange = (key: keyof typeof channelSettings) => {
    setChannelSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Dismiss toast
  const dismissToast = () => {
    setShowToast(null);
  };


  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chat Channel Settings</h2>
          <p className="text-gray-600 text-sm">Manage your Meta integrations (WhatsApp, Facebook, Instagram)</p>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => {
          const status = statusConfig[channel.status];
          const StatusIcon = status.icon;

          return (
            <div key={channel.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5">
              {/* Channel Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {channel.logo}
                  <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium mb-3 ${status.color}`}>
                {status.icon === Loader2 ? (
                  <StatusIcon className="w-3 h-3 animate-spin" />
                ) : (
                  <StatusIcon className="w-3 h-3" />
                )}
                <span>{status.label}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{channel.description}</p>

              {/* Connected Info */}
              {channel.status === 'connected' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm">
                  <div className="font-medium text-green-900">{channel.connectedAccount}</div>
                  {channel.lastSync && (
                    <div className="text-green-700 text-xs">Last sync: {formatDate(channel.lastSync)}</div>
                  )}
                </div>
              )}

              {/* Manual Credential Inputs */}
              {channel.status === 'not_connected' && (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">App ID</label>
                    <input
                      type="text"
                      value={credentials[channel.id]?.appId || ''}
                      onChange={(e) => handleCredentialChange(channel.id, 'appId', e.target.value)}
                      placeholder="Enter Meta App ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">App Secret</label>
                    <input
                      type="password"
                      value={credentials[channel.id]?.appSecret || ''}
                      onChange={(e) => handleCredentialChange(channel.id, 'appSecret', e.target.value)}
                      placeholder="Enter Meta App Secret"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{getAssetLabel(channel.type)}</label>
                    <input
                      type="text"
                      value={credentials[channel.id]?.assetId || ''}
                      onChange={(e) => handleCredentialChange(channel.id, 'assetId', e.target.value)}
                      placeholder={`Enter ${getAssetLabel(channel.type)}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    User provides IDs/secrets and grants permissions on their Meta side. This is a UI-only mock.
                  </div>
                </div>
              )}

              {/* Setup Instructions (Collapsible) */}
              <details className="mb-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 flex items-center">
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Setup Instructions
                </summary>
                <div className="mt-3 text-xs text-gray-600 space-y-1 ml-6">
                  {channel.type === 'whatsapp' && (
                    <>
                      <p>1. Create a Meta Business Account</p>
                      <p>2. Set up WhatsApp Business Account</p>
                      <p>3. Generate API credentials</p>
                      <p>4. Add your phone number</p>
                      <p>5. Verify business identity</p>
                      <p>6. Connect webhook</p>
                    </>
                  )}
                  {channel.type === 'facebook' && (
                    <>
                      <p>1. Create a Meta App</p>
                      <p>2. Add Messenger product</p>
                      <p>3. Generate page token</p>
                      <p>4. Connect your Facebook Page</p>
                    </>
                  )}
                  {channel.type === 'instagram' && (
                    <>
                      <p>1. Convert to Business Account</p>
                      <p>2. Enable Instagram Direct Messages</p>
                      <p>3. Configure webhook</p>
                      <p>4. Set up AI responses</p>
                    </>
                  )}
                </div>
              </details>

              {/* Automated Features (Collapsible) */}
              <details className="mb-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 flex items-center">
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Automated Features
                </summary>
                <div className="mt-3 text-xs text-gray-600 space-y-2 ml-6">
                  {channel.status === 'connected' ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span>Auto-reply enabled</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span>Order creation enabled</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span>Payment tracking enabled</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">Connect channel to enable features</p>
                  )}
                </div>
              </details>

              {/* Actions */}
              <div className="flex gap-2">
                {channel.status === 'not_connected' && (
                  <button
                    onClick={() => handleConnect(channel.id)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Connect
                  </button>
                )}

                {channel.status === 'connecting' && (
                  <button disabled className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Connecting...
                  </button>
                )}

                {channel.status === 'connected' && (
                  <>
                    <button
                      onClick={() => handleManageChannel(channel)}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => handleDisconnect(channel.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <div className="font-semibold mb-2">How to connect your channels:</div>
          <ul className="space-y-1 text-blue-700">
            <li>• Click "Connect" to initiate OAuth authorization</li>
            <li>• Select your business account or page</li>
            <li>• Grant necessary permissions</li>
            <li>• Messages will be automatically forwarded to your AI assistant</li>
          </ul>
        </div>
      </div>

      {/* Manage Channel Modal */}
      {showManageModal && managedChannel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-semibold text-gray-900">Manage {managedChannel.name}</h3>
              <button
                onClick={() => setShowManageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Connection Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Connection Info</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Account:</span>
                    <p className="font-medium text-gray-900">{managedChannel.connectedAccount}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Sync:</span>
                    <p className="font-medium text-gray-900">{formatDate(managedChannel.lastSync)}</p>
                  </div>
                  {managedChannel.token && (
                    <div>
                      <span className="text-gray-600">API Token:</span>
                      <div className="flex items-center mt-1">
                        <input
                          type="password"
                          value={managedChannel.token}
                          readOnly
                          className="flex-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        />
                        <button
                          onClick={handleCopyToken}
                          className="ml-2 p-1 hover:bg-gray-200 rounded"
                          title="Copy token"
                        >
                          {copiedToken ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Handling */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Message Handling</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelSettings.aiAutoReply}
                      onChange={() => handleSettingsChange('aiAutoReply')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">AI Auto-Reply</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelSettings.requireApproval}
                      onChange={() => handleSettingsChange('requireApproval')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Require Manual Approval</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelSettings.businessHours}
                      onChange={() => handleSettingsChange('businessHours')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Business Hours Only</span>
                  </label>
                </div>
              </div>

              {/* Order Control */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Control</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelSettings.allowOrderCreation}
                      onChange={() => handleSettingsChange('allowOrderCreation')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Allow Order Creation</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelSettings.autoDetectProducts}
                      onChange={() => handleSettingsChange('autoDetectProducts')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Auto-Detect Products</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelSettings.draftOrdersOnly}
                      onChange={() => handleSettingsChange('draftOrdersOnly')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Draft Orders Only</span>
                  </label>
                </div>
              </div>

              {/* Permissions & Safety */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-gray-600">
                    <p className="font-medium text-gray-900">Permissions Granted:</p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>Read messages</li>
                      <li>Send messages</li>
                      <li>Read receipts</li>
                      <li>Manage labels</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowManageModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setShowToast({ type: 'success', message: 'Settings saved successfully!' });
                }}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border ${
          showToast.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {showToast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            showToast.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {showToast.message}
          </span>
          <button
            onClick={dismissToast}
            className={`ml-4 ${showToast.type === 'success' ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
