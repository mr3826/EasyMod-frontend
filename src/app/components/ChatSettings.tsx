import { useState, useEffect } from "react";
import { MessageSquare, Instagram, CheckCircle, X, AlertCircle, Info, Loader2, Shield, Phone } from "lucide-react";
import { apiClient, MetaPlatform, MetaIntegrationStatus } from "../lib/api";

interface MetaChannel {
  id: string;
  name: string;
  platform: MetaPlatform;
  logo: React.ReactNode;
  description: string;
  status: 'connected' | 'not_connected' | 'connecting';
  connectedAccount?: string;
  connectedAt?: string;
}

const statusConfig = {
  connected: { color: 'text-green-600 bg-green-100', label: 'Connected', icon: CheckCircle },
  not_connected: { color: 'text-gray-600 bg-gray-100', label: 'Not Connected', icon: Info },
  connecting: { color: 'text-blue-600 bg-blue-100', label: 'Connecting...', icon: Loader2 },
};

const platformConfig = {
  messenger: {
    name: 'Facebook Messenger',
    logo: <MessageSquare className="w-6 h-6 text-blue-600" />,
    description: 'Connect your Facebook Page to receive and reply to Messenger chats.',
  },
  instagram: {
    name: 'Instagram Direct Messages',
    logo: <Instagram className="w-6 h-6 text-pink-600" />,
    description: 'Manage Instagram DMs and comments from your business account.',
  },
  whatsapp: {
    name: 'WhatsApp Business',
    logo: <Phone className="w-6 h-6 text-green-600" />,
    description: 'Connect your business WhatsApp number using Meta\'s official authorization.',
  },
};

export default function ChatSettings() {
  const [channels, setChannels] = useState<MetaChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<MetaPlatform | null>(null);
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<MetaPlatform | null>(null);
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Load integration status on component mount
  useEffect(() => {
    loadIntegrationStatus();
  }, []);

  // Check for OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const platform = urlParams.get('platform');

    if (success === 'connected' && platform) {
      setShowToast({ type: 'success', message: `${platformConfig[platform as MetaPlatform]?.name || platform} connected successfully!` });
      loadIntegrationStatus();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      let errorMessage = 'Connection failed. Please try again.';
      if (error === 'oauth_failed') errorMessage = 'Meta authorization failed.';
      if (error === 'no_assets') errorMessage = `No ${platform} assets found. Please set up your Meta business account first.`;
      if (error === 'callback_failed') errorMessage = 'Connection setup failed. Please try again.';

      setShowToast({ type: 'error', message: errorMessage });
      loadIntegrationStatus();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadIntegrationStatus = async () => {
    try {
      setLoading(true);
      const status = await apiClient.getMetaIntegrationStatus();

      const updatedChannels: MetaChannel[] = status.map((integration) => {
        const config = platformConfig[integration.platform];
        return {
          id: integration.platform,
          name: config.name,
          platform: integration.platform,
          logo: config.logo,
          description: config.description,
          status: integration.connected ? 'connected' : 'not_connected',
          connectedAccount: integration.display_name || undefined,
          connectedAt: integration.connected_at || undefined,
        };
      });

      setChannels(updatedChannels);
    } catch (error) {
      console.error('Failed to load integration status:', error);
      setShowToast({ type: 'error', message: 'Failed to load connection status.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: MetaPlatform) => {
    try {
      setConnectingPlatform(platform);

      // Update UI to show connecting state
      setChannels(channels.map(ch =>
        ch.platform === platform ? { ...ch, status: 'connecting' as const } : ch
      ));

      // Start OAuth flow (this will redirect)
      await apiClient.connectMetaPlatform(platform);

    } catch (error) {
      console.error('Failed to start OAuth flow:', error);
      setShowToast({ type: 'error', message: 'Failed to start connection process.' });

      // Reset connecting state
      setChannels(channels.map(ch =>
        ch.platform === platform ? { ...ch, status: 'not_connected' as const } : ch
      ));
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platform: MetaPlatform) => {
    if (!confirm(`Are you sure you want to disconnect ${platformConfig[platform].name}?`)) {
      return;
    }

    try {
      setDisconnectingPlatform(platform);
      await apiClient.disconnectMetaPlatform(platform);

      // Update UI
      setChannels(channels.map(ch =>
        ch.platform === platform
          ? { ...ch, status: 'not_connected' as const, connectedAccount: undefined, connectedAt: undefined }
          : ch
      ));

      setShowToast({ type: 'success', message: `${platformConfig[platform].name} disconnected successfully.` });
    } catch (error) {
      console.error('Failed to disconnect:', error);
      setShowToast({ type: 'error', message: 'Failed to disconnect. Please try again.' });
    } finally {
      setDisconnectingPlatform(null);
    }
  };

  const formatConnectedAt = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading connections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Connect Channels via Meta</h2>
          <p className="text-sm text-gray-600">Unified OAuth integration for Messenger, Instagram, and WhatsApp</p>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => {
          const status = statusConfig[channel.status];
          const isConnecting = connectingPlatform === channel.platform;
          const isDisconnecting = disconnectingPlatform === channel.platform;

          return (
            <div key={channel.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {channel.logo}
                  <div>
                    <h3 className="font-medium text-gray-900">{channel.name}</h3>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <status.icon className="w-3 h-3 mr-1" />
                      {status.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{channel.description}</p>

              {/* Connection Details */}
              {channel.status === 'connected' && channel.connectedAccount && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{channel.connectedAccount}</div>
                    {channel.connectedAt && (
                      <div className="text-gray-500">Connected {formatConnectedAt(channel.connectedAt)}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                {channel.status === 'not_connected' && (
                  <button
                    onClick={() => handleConnect(channel.platform)}
                    disabled={isConnecting}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                )}

                {channel.status === 'connected' && (
                  <button
                    onClick={() => handleDisconnect(channel.platform)}
                    disabled={isDisconnecting}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDisconnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                        Disconnecting...
                      </>
                    ) : (
                      'Disconnect'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">How it works:</div>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Click "Connect" to log in with Meta once</li>
              <li>Select your Facebook Page, Instagram account, or WhatsApp number</li>
              <li>System automatically configures webhooks and permissions</li>
              <li>All messages are securely forwarded to your AI assistant</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg ${
          showToast.type === 'success' ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
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
            onClick={() => setShowToast(null)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
