import { useEffect, useState } from "react";
import { MessageSquare, Instagram, CheckCircle, Clock, X, Copy, Check, AlertCircle, Info, ChevronDown, ChevronUp, Loader2, Shield } from "lucide-react";
import { apiClient } from "../lib/api";
import type { Channel as BackendChannel } from "../lib/api";

interface Channel {
  id: string;
  name: string;
  type: 'facebook' | 'whatsapp' | 'instagram' | 'telegram' | 'webchat';
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
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);


  // UI State
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [managedChannel, setManagedChannel] = useState<Channel | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [credentials, setCredentials] = useState<Record<Channel['type'], ChannelCredentials>>({
    whatsapp: { appId: '', appSecret: '', assetId: '' },
    facebook: { appId: '', appSecret: '', assetId: '' },
    instagram: { appId: '', appSecret: '', assetId: '' },
    telegram: { appId: '', appSecret: '', assetId: '' },
    webchat: { appId: '', appSecret: '', assetId: '' },
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

  const handleCredentialChange = (channelType: Channel['type'], field: keyof ChannelCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [channelType]: {
        ...prev[channelType],
        [field]: value,
      }
    }));
  };

  const loadChannels = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const backendChannels = await apiClient.getChannels();
      const mapped = backendChannels.map((channel: BackendChannel): Channel => {
        const descriptionMap: Record<string, string> = {
          whatsapp: 'Direct messaging through WhatsApp for customer support',
          facebook: 'Connect with customers via Facebook Messenger',
          instagram: 'Manage customer inquiries through Instagram Direct Messages',
          telegram: 'Engage customers through Telegram',
          webchat: 'Website live chat support',
        };

        const status = channel.connected || channel.status === 'active'
          ? 'connected'
          : channel.status === 'error'
            ? 'not_connected'
            : 'not_connected';

        const type = (channel.type || 'webchat') as Channel['type'];
        const logo = type === 'instagram'
          ? <Instagram className="w-8 h-8 text-pink-600" />
          : <MessageSquare className={`w-8 h-8 ${type === 'whatsapp' ? 'text-green-600' : 'text-blue-600'}`} />;

        return {
          id: channel.id,
          name: channel.name || channel.type,
          type,
          logo,
          description: descriptionMap[type] || 'Customer messaging channel',
          status,
          connectedAccount: channel.name || undefined,
          lastSync: channel.lastSync || channel.last_sync,
        };
      });

      const defaults: Channel[] = [
        {
          id: 'whatsapp',
          name: 'WhatsApp Business',
          type: 'whatsapp',
          logo: <MessageSquare className="w-8 h-8 text-green-600" />,
          description: 'Direct messaging through WhatsApp for customer support',
          status: 'not_connected'
        },
        {
          id: 'facebook',
          name: 'Messenger',
          type: 'facebook',
          logo: <MessageSquare className="w-8 h-8 text-blue-600" />,
          description: 'Connect with customers via Facebook Messenger',
          status: 'not_connected'
        },
        {
          id: 'instagram',
          name: 'Instagram DM',
          type: 'instagram',
          logo: <Instagram className="w-8 h-8 text-pink-600" />,
          description: 'Manage customer inquiries through Instagram Direct Messages',
          status: 'not_connected'
        }
      ];

      const merged = [...mapped];
      defaults.forEach((channel) => {
        if (!merged.find(existing => existing.type === channel.type)) {
          merged.push(channel);
        }
      });

      setChannels(merged);
    } catch (err) {
      console.error('Failed to load channels:', err);
      setLoadError('Failed to load channels from backend');
      setChannels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  const handleConnect = async (channel: Channel) => {
    const channelCreds = credentials[channel.type];
    if (!channelCreds?.appId || !channelCreds?.appSecret || !channelCreds?.assetId) {
      setShowToast({
        type: 'error',
        message: 'Please provide App ID, App Secret, and the Asset/Page ID before connecting.'
      });
      return;
    }

    setChannels(prev => prev.map(ch =>
      ch.type === channel.type ? { ...ch, status: 'connecting' } : ch
    ));

    try {
      await apiClient.connectChannel({
        type: channel.type,
        name: channel.name,
        appId: channelCreds.appId,
        appSecret: channelCreds.appSecret,
        assetId: channelCreds.assetId
      });

      await loadChannels();
      setShowToast({
        type: 'success',
        message: `${channel.name} connected successfully!`
      });
    } catch (error: any) {
      setShowToast({
        type: 'error',
        message: error.response?.data?.error?.message || 'Connection failed. Please try again.'
      });
      setChannels(prev => prev.map(ch =>
        ch.type === channel.type ? { ...ch, status: 'not_connected' } : ch
      ));
    }
  };

  const handleDisconnect = async (channel: Channel) => {
    if (channel.id === channel.type) {
      setShowToast({
        type: 'error',
        message: 'This channel is not connected yet.'
      });
      return;
    }

    try {
      await apiClient.disconnectChannel(channel.id);
      await loadChannels();
      setShowToast({
        type: 'success',
        message: `${channel.name} disconnected successfully.`
      });
    } catch (error: any) {
      setShowToast({
        type: 'error',
        message: error.response?.data?.error?.message || 'Disconnect failed.'
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
        {isLoading && (
          <div className="col-span-full text-center text-gray-500 py-8">Loading channels from backend...</div>
        )}
        {loadError && (
          <div className="col-span-full text-center text-red-600 py-8">{loadError}</div>
        )}
        {!isLoading && !loadError && channels.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">No channels found.</div>
        )}
        {!isLoading && !loadError && channels.map((channel) => {
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
                      value={credentials[channel.type]?.appId || ''}
                      onChange={(e) => handleCredentialChange(channel.type, 'appId', e.target.value)}
                      placeholder="Enter Meta App ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">App Secret</label>
                    <input
                      type="password"
                      value={credentials[channel.type]?.appSecret || ''}
                      onChange={(e) => handleCredentialChange(channel.type, 'appSecret', e.target.value)}
                      placeholder="Enter Meta App Secret"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{getAssetLabel(channel.type)}</label>
                    <input
                      type="text"
                      value={credentials[channel.type]?.assetId || ''}
                      onChange={(e) => handleCredentialChange(channel.type, 'assetId', e.target.value)}
                      placeholder={`Enter ${getAssetLabel(channel.type)}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    User provides IDs/secrets and grants permissions on their Meta side. Backend integration required.
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
                    onClick={() => handleConnect(channel)}
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
                      onClick={() => handleDisconnect(channel)}
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
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
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
