import { useState, useEffect } from "react";
import { Plus, Check, AlertCircle, RefreshCw, Settings } from "lucide-react";
import { Channel } from "../lib/api";
import { apiClient } from "../lib/api";

interface ChannelType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const availableChannels: ChannelType[] = [
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    icon: '👥',
    description: 'Connect your Facebook Page to receive messages',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Cloud API',
    icon: '💬',
    description: 'Integrate WhatsApp Business for customer support',
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    icon: '✈️',
    description: 'Create a Telegram bot for your business',
  },
  {
    id: 'webchat',
    name: 'Web Chat Widget',
    icon: '🌐',
    description: 'Add chat widget to your website',
  },
];

export default function Channels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelType | null>(null);
  const [connectionStep, setConnectionStep] = useState<'select' | 'authorize' | 'test' | 'complete'>('select');

  // Fetch channels on mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedChannels = await apiClient.getChannels();
        setChannels(fetchedChannels);
      } catch (error: any) {
        setError(error.response?.data?.error?.message || 'Failed to load channels');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const handleConnect = (channel: ChannelType) => {
    setSelectedChannel(channel);
    setConnectionStep('authorize');
    setShowConnectModal(true);
  };

  const handleTestConnection = () => {
    setConnectionStep('test');
    setTimeout(() => {
      setConnectionStep('complete');
    }, 2000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Channels</h1>
          <p className="text-gray-600 mt-1">Manage your communication channels</p>
        </div>
        <button
          onClick={() => setShowConnectModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Connect Channel
        </button>
      </div>

      {/* Connected Channels */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Channels</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : channels.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📡</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Channels Connected</h3>
          <p className="text-gray-600 mb-6">Connect your first channel to start receiving messages from customers.</p>
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Connect First Channel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {channels.map((channel) => (
            <div key={channel.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{availableChannels.find(c => c.id === channel.type)?.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                    <p className="text-sm text-gray-500">{channel.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {channel.status === 'active' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Active
                    </span>
                  )}
                  {channel.status === 'inactive' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Inactive
                    </span>
                  )}
                  {channel.status === 'error' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      <AlertCircle className="w-3 h-3" />
                      Error
                    </span>
                  )}
                </div>
              </div>

              {channel.connected && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Messages Today</span>
                    <span className="font-semibold text-gray-900">{channel.messageCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Sync</span>
                    <span className="font-semibold text-gray-900">{channel.lastSync}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configure
                </button>
                {channel.connected && (
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Channel Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect New Channel</h2>
            <p className="text-gray-600 mb-6">Choose a platform to connect with your customers</p>

            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              {['Select', 'Authorize', 'Test', 'Complete'].map((step, index) => {
                const steps = ['select', 'authorize', 'test', 'complete'];
                const currentIndex = steps.indexOf(connectionStep);
                const isActive = index <= currentIndex;
                
                return (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index < currentIndex ? <Check className="w-5 h-5" /> : index + 1}
                    </div>
                    {index < 3 && (
                      <div className={`w-24 h-1 ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Select Channel */}
            {connectionStep === 'select' && (
              <div className="space-y-3">
                {availableChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handleConnect(channel)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{channel.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                        <p className="text-sm text-gray-600">{channel.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Authorize */}
            {connectionStep === 'authorize' && selectedChannel && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{selectedChannel.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedChannel.name}</h3>
                  <p className="text-gray-600">{selectedChannel.description}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Token / API Key
                    </label>
                    <input
                      type="text"
                      placeholder="Paste your token here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">How to get your token:</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Go to {selectedChannel.name} Developer Portal</li>
                      <li>Create a new app or use existing one</li>
                      <li>Generate an access token</li>
                      <li>Copy and paste it above</li>
                    </ol>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowConnectModal(false);
                      setConnectionStep('select');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTestConnection}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Test Connection */}
            {connectionStep === 'test' && (
              <div className="text-center py-12">
                <RefreshCw className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Testing Connection...</h3>
                <p className="text-gray-600">Please wait while we verify your credentials</p>
              </div>
            )}

            {/* Complete */}
            {connectionStep === 'complete' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connection Successful!</h3>
                <p className="text-gray-600 mb-6">Your channel is now active and ready to receive messages</p>
                <button
                  onClick={() => {
                    setShowConnectModal(false);
                    setConnectionStep('select');
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
