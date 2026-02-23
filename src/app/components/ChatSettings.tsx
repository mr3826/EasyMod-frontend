
type ConnectionStatus = "idle" | "loading" | "connected" | "error";

// Add JSX namespace for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface PlatformConnection {
  platform: "facebook" | "instagram" | "whatsapp";
  status: ConnectionStatus;
  info?: {
    pageId?: string;
    instagramId?: string;
    phoneNumberId?: string;
    wabaId?: string;
  };
}
interface ChatSettingsProps {}

interface Channel {
  id: string;
  name: string;
  type: "facebook" | "whatsapp" | "instagram" | "telegram" | "webchat";
  logo: JSX.Element;
  description: string;
  status: "connected" | "not_connected" | "connecting";
  connectedAccount?: string;
  lastSync?: string;
  systemUserToken?: string;
  businessManagerId?: string;
}

interface ChannelCredentials {
  systemUserToken?: string;
  businessManagerId?: string;
}

interface BackendChannel {
  id: string;
  name?: string;
  type?: string;
  channel_type?: string;
  status?: string;
  connected?: boolean;
  lastSync?: string;
  last_sync?: string;
  config?: {
    systemUserToken?: string;
    businessManagerId?: string;
  };
}

interface ChannelSettings {
  aiAutoReply: boolean;
  requireApproval: boolean;
  businessHours: boolean;
  allowOrderCreation: boolean;
  autoDetectProducts: boolean;
  draftOrdersOnly: boolean;
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

interface ManagedChannel extends Channel {}

interface ShowConfirmState {
  platform: "facebook" | "instagram" | "whatsapp";
}

interface DisconnectingState {
  loading: boolean;
}


function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const config = {
    idle: { icon: Clock, label: "Not Connected", color: "bg-gray-100 text-gray-800" },
    loading: { icon: Loader2, label: "Connecting...", color: "bg-blue-100 text-blue-800" },
    connected: { icon: CheckCircle, label: "Connected", color: "bg-green-100 text-green-800" },
    error: { icon: AlertCircle, label: "Error", color: "bg-red-100 text-red-800" },
  };
  const { icon: Icon, label, color } = config[status];
  return (
    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium mb-3 ${color}`}>
      {status === "loading" ? <Icon className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
      <span>{label}</span>
    </div>
  );
}

function OAuthConnectButton({ status, onConnect }: { status: ConnectionStatus; onConnect: () => void }) {
  return (
    <button
      onClick={onConnect}
      disabled={status === "loading"}
      className={`flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors ${status === "loading" ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
      Connect
    </button>
  );
}

function PlatformConnectionCard({ platform, status, info, onConnect, onDisconnect }: {
  platform: "facebook" | "instagram" | "whatsapp";
  status: ConnectionStatus;
  info?: PlatformConnection["info"];
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const iconMap = {
    facebook: <MessageSquare className="w-8 h-8 text-blue-600" />,
    instagram: <Instagram className="w-8 h-8 text-pink-600" />,
    whatsapp: <MessageSquare className="w-8 h-8 text-green-600" />,
  };
  const titleMap = {
    facebook: "Facebook Messenger",
    instagram: "Instagram Messaging",
    whatsapp: "WhatsApp Business",
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-center space-x-3 mb-3">
        {iconMap[platform]}
        <h3 className="font-semibold text-gray-900">{titleMap[platform]}</h3>
      </div>
      <ConnectionStatusBadge status={status} />
      {status === "idle" && <OAuthConnectButton status={status} onConnect={onConnect} />}
      {status === "connected" && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm">
            {platform === "facebook" && info?.pageId && <div>Page ID: <span className="font-medium text-green-900">{info.pageId}</span></div>}
            {platform === "instagram" && (
              <>
                {info?.pageId && <div>Page ID: <span className="font-medium text-green-900">{info.pageId}</span></div>}
                {info?.instagramId && <div>Instagram ID: <span className="font-medium text-green-900">{info.instagramId}</span></div>}
              </>
            )}
            {platform === "whatsapp" && (
              <>
                {info?.phoneNumberId && <div>Phone Number ID: <span className="font-medium text-green-900">{info.phoneNumberId}</span></div>}
                {info?.wabaId && <div>WABA ID: <span className="font-medium text-green-900">{info.wabaId}</span></div>}
              </>
            )}
          </div>
          <button
            onClick={onDisconnect}
            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Disconnect
          }
    }, 1200);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chat Channel Settings</h2>
          <p className="text-gray-600 text-sm">Manage your Messenger, WhatsApp, and Instagram integrations</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.map(conn => (
          <PlatformConnectionCard
            key={conn.platform}
            platform={conn.platform}
            status={conn.status}
            info={conn.info}
            onConnect={() => handleConnect(conn.platform)}
            onDisconnect={() => handleDisconnect(conn.platform)}
          />
        ))}
      </div>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Disconnect {showConfirm.platform.charAt(0).toUpperCase() + showConfirm.platform.slice(1)}?</h3>
              <p className="text-gray-700 mb-6">Are you sure you want to disconnect this platform? This will disable messaging integration.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  disabled={disconnecting?.loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDisconnect(showConfirm.platform as any)}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  disabled={disconnecting?.loading}
                >
                  {disconnecting?.loading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3 mt-8">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <div className="font-semibold mb-2">How this integration works:</div>
          <ul className="space-y-1 text-blue-700">
            <li>• OAuth-based connection for each platform</li>
            <li>• Status badges indicate connection state</li>
            <li>• Disconnect disables messaging integration</li>
          </ul>
          <p className="mt-2 text-xs text-blue-700">
            OAuth is secure. No manual credentials required.
          </p>
        </div>
      </div>
    </div>
  );
}

// Duplicate removed. Only the new OAuth-based ChatSettings function remains.

function ChatSettings(props: ChatSettingsProps) {
  // State hooks
  const [channels, setChannels] = useState<Channel[]>([]);
  const [credentials, setCredentials] = useState<{ [key in Channel['type']]?: ChannelCredentials }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<ToastState | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [managedChannel, setManagedChannel] = useState<ManagedChannel | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [channelSettings, setChannelSettings] = useState<ChannelSettings>({
    aiAutoReply: false,
    requireApproval: false,
    businessHours: false,
    allowOrderCreation: false,
    autoDetectProducts: false,
    draftOrdersOnly: false,
  });

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
          lastSync: channel.lastSync || channel.last_sync,
          systemUserToken: channel.config?.systemUserToken,
          businessManagerId: channel.config?.businessManagerId,
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
