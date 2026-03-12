import { useEffect, useState } from "react";
import { MessageSquare, Instagram, CheckCircle, Clock, X, Copy, Check, AlertCircle, Info, ChevronDown, ChevronUp, Loader2, Shield, Cpu, Lock } from "lucide-react";
import { apiClient } from "../lib/api";
import type { Channel as BackendChannel } from "../lib/api";
import { useSubscriptionFeatures } from "../lib/useSubscriptionFeatures";

interface Channel {
  id: string;
  name: string;
  type: 'facebook' | 'whatsapp' | 'instagram' | 'telegram' | 'webchat';
  logo: React.ReactNode;
  description: string;
  status: 'connected' | 'not_connected' | 'connecting';
  connectedAccount?: string;
  lastSync?: string;
  systemUserToken?: string;
  businessManagerId?: string;
  savedSettings?: {
    aiAutoReply?: boolean;
    requireApproval?: boolean;
    businessHours?: boolean;
    allowOrderCreation?: boolean;
    autoDetectProducts?: boolean;
    draftOrdersOnly?: boolean;
    requireManualConfirmation?: boolean;
  };
}

interface ChannelCredentials {
  systemUserToken: string;
  businessManagerId: string;
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

  // LLM model config state
  const { features: planFeatures } = useSubscriptionFeatures();
  const LLM_MODELS = [
    { id: 'gpt-4o', label: 'GPT-4o', description: 'Best accuracy, slower' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Balanced speed & quality' },
    { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fastest, lower cost' },
  ];
  const [llmModel, setLlmModel] = useState('gpt-4o-mini');
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmSaving, setLlmSaving] = useState(false);

  const [credentials, setCredentials] = useState<Record<Channel['type'], ChannelCredentials>>({
    whatsapp: { systemUserToken: '', businessManagerId: '' },
    facebook: { systemUserToken: '', businessManagerId: '' },
    instagram: { systemUserToken: '', businessManagerId: '' },
    telegram: { systemUserToken: '', businessManagerId: '' },
    webchat: { systemUserToken: '', businessManagerId: '' },
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

        const type = (channel.type || (channel as any).channel_type || 'webchat') as Channel['type'];
        const logo = type === 'instagram'
          ? <Instagram className="w-8 h-8 text-pink-600" />
          : <MessageSquare className={`w-8 h-8 ${type === 'whatsapp' ? 'text-green-600' : 'text-blue-600'}`} />;

        return {
          id: channel.id,
          name: channel.name || type,
          type,
          logo,
          description: descriptionMap[type] || 'Customer messaging channel',
          status,
          connectedAccount: channel.name || undefined,
          lastSync: channel.lastSync || channel.last_sync || undefined,
          systemUserToken: channel.config?.systemUserToken,
          businessManagerId: channel.config?.businessManagerId,
          savedSettings: channel.config?.settings || undefined,
        };
      });

      const defaults: Channel[] = [
        {
          id: 'facebook',
          name: 'Messenger',
          type: 'facebook',
          logo: <MessageSquare className="w-8 h-8 text-blue-600" />,
          description: 'Connect with customers via Facebook Messenger',
          status: 'not_connected'
        },
        {
          id: 'whatsapp',
          name: 'WhatsApp',
          type: 'whatsapp',
          logo: <MessageSquare className="w-8 h-8 text-green-600" />,
          description: 'Direct messaging through WhatsApp for customer support',
          status: 'not_connected'
        },
        {
          id: 'instagram',
          name: 'Instagram',
          type: 'instagram',
          logo: <Instagram className="w-8 h-8 text-pink-600" />,
          description: 'Manage customer inquiries through Instagram Direct Messages',
          status: 'not_connected'
        }
      ];

      const merged = mapped.filter(channel => ['facebook', 'whatsapp', 'instagram'].includes(channel.type));
      defaults.forEach((channel) => {
        if (!merged.find(existing => existing.type === channel.type)) {
          merged.push(channel);
        }
      });

      setChannels(merged);
    } catch (err) {
      console.error('Failed to load channels:', err);
      setLoadError('Failed to load channels from backend');
      setShowToast({
        type: 'error',
        message: 'Failed to load channels from backend'
      });
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
    if (!channelCreds?.systemUserToken) {
      setShowToast({
        type: 'error',
        message: 'Please provide a System User Token before connecting.'
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
        systemUserToken: channelCreds.systemUserToken,
        businessManagerId: channelCreds.businessManagerId || undefined
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
    if (channel.savedSettings) {
      setChannelSettings((prev) => ({ ...prev, ...channel.savedSettings }));
    }
    setManagedChannel({
      ...channel,
      connectedAccount: channel.connectedAccount || '',
      lastSync: channel.lastSync || '',
      systemUserToken: channel.systemUserToken || '',
      businessManagerId: channel.businessManagerId || '',
    });
    setShowManageModal(true);
  };

  const handleCopyToken = () => {
    if (managedChannel?.systemUserToken) {
      navigator.clipboard.writeText(managedChannel.systemUserToken);
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

  // Load LLM config
  useEffect(() => {
    if (!planFeatures.advanced_ai) return;
    setLlmLoading(true);
    apiClient.getLLMConfig()
      .then((cfg) => { if (cfg?.model) setLlmModel(cfg.model); })
      .catch(() => { /* keep default */ })
      .finally(() => setLlmLoading(false));
  }, [planFeatures.advanced_ai]);

  const handleSaveLLMConfig = async () => {
    setLlmSaving(true);
    try {
      await apiClient.updateLLMConfig({ model: llmModel });
      setShowToast({ type: 'success', message: 'AI model updated successfully.' });
    } catch {
      setShowToast({ type: 'error', message: 'Failed to update AI model.' });
    } finally {
      setLlmSaving(false);
    }
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
          <p className="text-gray-600 text-sm">Manage your Messenger, WhatsApp, and Instagram integrations</p>
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

              {/* System User Token Input */}
              {channel.status === 'not_connected' && (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">System User Token</label>
                    <input
                      type="password"
                      value={credentials[channel.type]?.systemUserToken || ''}
                      onChange={(e) => handleCredentialChange(channel.type, 'systemUserToken', e.target.value)}
                      placeholder="Paste System User token"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Business Manager ID (optional)</label>
                    <input
                      type="text"
                      value={credentials[channel.type]?.businessManagerId || ''}
                      onChange={(e) => handleCredentialChange(channel.type, 'businessManagerId', e.target.value)}
                      placeholder="Enter your Business Manager ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    The System User token is sensitive. Treat it like a password and revoke it if you suspect exposure.
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
                    <strong>Privacy notice:</strong> Once connected, customer messages on this channel will be processed by AI to generate automated responses. Data is encrypted and isolated to your shop.
                  </div>
                </div>
              )}

              {/* Setup Instructions (Collapsible) */}
              <details className="mb-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 flex items-center">
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Setup Instructions
                </summary>
                <div className="mt-3 text-xs text-gray-600 space-y-2 ml-6">
                  {channel.type === 'facebook' && (
                    <>
                      <p>1. Go to Meta Business Suite: https://business.facebook.com</p>
                      <p>2. Business Settings → Users → System Users</p>
                      <p>3. Click “Add”, name it “Webhook Manager”, role: Admin</p>
                      <p>4. Open the System User → Generate New Token</p>
                      <p>5. Select your app and permissions:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>whatsapp_business_messaging</li>
                        <li>whatsapp_business_management</li>
                        <li>pages_messaging</li>
                        <li>instagram_manage_messages</li>
                      </ul>
                      <p>6. Paste the token above and connect</p>
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
          <div className="font-semibold mb-2">How this integration works:</div>
          <ul className="space-y-1 text-blue-700">
            <li>• Client grants admin access to their Page/WhatsApp/Instagram</li>
            <li>• You add their assets to your Business Manager</li>
            <li>• You generate a System User token with the required permissions</li>
            <li>• Paste the token here to activate webhooks</li>
          </ul>
          <p className="mt-2 text-xs text-blue-700">
            Tokens are sensitive. Store them securely and rotate if compromised.
          </p>
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
                  {managedChannel.systemUserToken && (
                    <div>
                      <span className="text-gray-600">System User Token:</span>
                      <div className="flex items-center mt-1">
                        <input
                          type="password"
                          value={managedChannel.systemUserToken || ''}
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
                      <p className="mt-1 text-xs text-gray-500">Keep this token private. Revoke it in Meta Business Suite if exposed.</p>
                    </div>
                  )}
                  {managedChannel.businessManagerId && (
                    <div>
                      <span className="text-gray-600">Business Manager ID:</span>
                      <p className="font-medium text-gray-900 mt-1">{managedChannel.businessManagerId}</p>
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
                onClick={async () => {
                  if (!managedChannel) return;
                  try {
                    await apiClient.updateChannel(managedChannel.id, {
                      config: {
                        ...managedChannel,
                        settings: channelSettings,
                      }
                    });
                    setShowManageModal(false);
                    setShowToast({ type: 'success', message: 'Settings saved successfully!' });
                    loadChannels();
                  } catch (error: any) {
                    setShowToast({
                      type: 'error',
                      message: error.response?.data?.error?.message || 'Failed to save settings'
                    });
                  }
                }}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Model Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Cpu className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">AI Model Configuration</h3>
            <p className="text-sm text-gray-500">Choose the language model used for AI auto-replies and suggestions</p>
          </div>
        </div>
        {!planFeatures.advanced_ai ? (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">Available on Growth &amp; Scale plans</p>
              <p className="text-xs text-gray-500 mt-0.5">
                <a href="/subscription" className="text-purple-600 hover:underline">Upgrade your plan</a> to unlock AI model selection and advanced AI features.
              </p>
            </div>
          </div>
        ) : llmLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading current model...
          </div>
        ) : (
          <div className="space-y-3">
            {LLM_MODELS.map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  llmModel === m.id
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="llm-model"
                  value={m.id}
                  checked={llmModel === m.id}
                  onChange={() => setLlmModel(m.id)}
                  className="accent-purple-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.label}</p>
                  <p className="text-xs text-gray-500">{m.description}</p>
                </div>
              </label>
            ))}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveLLMConfig}
                disabled={llmSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors"
              >
                {llmSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Model
              </button>
            </div>
          </div>
        )}
      </div>

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
