import { useState, useEffect } from 'react';
import { Truck, Check, X, AlertCircle, Loader2, Power, TestTube } from 'lucide-react';
import { 
  apiClient, 
  DeliveryProvider, 
  DeliveryProviderStatus, 
  PathaoCredentials, 
  SteadfastCredentials 
} from '../lib/api';

interface ProviderConfig {
  provider: DeliveryProvider;
  display_name: string;
  description: string;
  logo: string;
  fields: {
    name: keyof PathaoCredentials | keyof SteadfastCredentials;
    label: string;
    type: 'text' | 'password' | 'email';
    placeholder: string;
    required: boolean;
  }[];
}

const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    provider: 'pathao',
    display_name: 'Pathao Courier',
    description: 'Fast and reliable delivery across Bangladesh',
    logo: '🚚',
    fields: [
      {
        name: 'client_id',
        label: 'Client ID',
        type: 'text',
        placeholder: 'Enter your Pathao Client ID',
        required: true
      },
      {
        name: 'client_secret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Enter your Pathao Client Secret',
        required: true
      },
      {
        name: 'username',
        label: 'Username (Email)',
        type: 'email',
        placeholder: 'merchant@example.com',
        required: true
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your Pathao account password',
        required: true
      }
    ]
  },
  {
    provider: 'steadfast',
    display_name: 'Steadfast Courier',
    description: 'Trusted delivery partner for e-commerce',
    logo: '📦',
    fields: [
      {
        name: 'api_key',
        label: 'API Key',
        type: 'text',
        placeholder: 'Enter your Steadfast API Key',
        required: true
      },
      {
        name: 'secret_key',
        label: 'Secret Key',
        type: 'password',
        placeholder: 'Enter your Steadfast Secret Key',
        required: true
      }
    ]
  }
];

export default function DeliverySettings() {
  const [providers, setProviders] = useState<DeliveryProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<DeliveryProvider | null>(null);
  const [disconnectingProvider, setDisconnectingProvider] = useState<DeliveryProvider | null>(null);
  const [testingProvider, setTestingProvider] = useState<DeliveryProvider | null>(null);
  const [togglingProvider, setTogglingProvider] = useState<DeliveryProvider | null>(null);
  const [showCredentialsForm, setShowCredentialsForm] = useState<DeliveryProvider | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isSandbox, setIsSandbox] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load delivery settings on mount
  useEffect(() => {
    loadDeliverySettings();
  }, []);

  const loadDeliverySettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const settings = await apiClient.getDeliverySettings();
      setProviders(settings.providers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load delivery settings');
      console.error('Failed to load delivery settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: DeliveryProvider) => {
    try {
      setConnectingProvider(provider);
      setError(null);
      setSuccessMessage(null);

      const config = PROVIDER_CONFIGS.find(c => c.provider === provider);
      if (!config) return;

      // Validate all required fields
      for (const field of config.fields) {
        if (field.required && !credentials[field.name]) {
          throw new Error(`${field.label} is required`);
        }
      }

      await apiClient.connectDeliveryProvider({
        provider,
        credentials: credentials as any,
        is_sandbox: isSandbox
      });

      setSuccessMessage(`${config.display_name} connected successfully!`);
      setShowCredentialsForm(null);
      setCredentials({});
      await loadDeliverySettings();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to connect provider');
      console.error('Failed to connect provider:', err);
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (provider: DeliveryProvider) => {
    const config = PROVIDER_CONFIGS.find(c => c.provider === provider);
    if (!confirm(`Are you sure you want to disconnect ${config?.display_name}? This will deactivate the provider.`)) {
      return;
    }

    try {
      setDisconnectingProvider(provider);
      setError(null);
      setSuccessMessage(null);

      await apiClient.disconnectDeliveryProvider({ provider });

      setSuccessMessage(`${config?.display_name} disconnected successfully`);
      await loadDeliverySettings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disconnect provider');
      console.error('Failed to disconnect provider:', err);
    } finally {
      setDisconnectingProvider(null);
    }
  };

  const handleToggle = async (provider: DeliveryProvider, currentStatus: boolean) => {
    try {
      setTogglingProvider(provider);
      setError(null);
      setSuccessMessage(null);

      await apiClient.toggleDeliveryProvider({
        provider,
        is_active: !currentStatus
      });

      const config = PROVIDER_CONFIGS.find(c => c.provider === provider);
      setSuccessMessage(`${config?.display_name} ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      await loadDeliverySettings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle provider');
      console.error('Failed to toggle provider:', err);
    } finally {
      setTogglingProvider(null);
    }
  };

  const handleTest = async (provider: DeliveryProvider) => {
    try {
      setTestingProvider(provider);
      setError(null);
      setSuccessMessage(null);

      await apiClient.testDeliveryConnection(provider);

      const config = PROVIDER_CONFIGS.find(c => c.provider === provider);
      setSuccessMessage(`${config?.display_name} connection test successful!`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Connection test failed');
      console.error('Connection test failed:', err);
    } finally {
      setTestingProvider(null);
    }
  };

  const openCredentialsForm = (provider: DeliveryProvider) => {
    setShowCredentialsForm(provider);
    setCredentials({});
    setIsSandbox(false);
    setError(null);
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Truck className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-semibold text-gray-900">Delivery Settings</h1>
        </div>
        <p className="text-sm text-gray-600">
          Configure your delivery providers for automated order fulfillment
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-green-600 hover:text-green-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Provider Cards */}
      <div className="space-y-4">
        {PROVIDER_CONFIGS.map((config) => {
          const providerStatus = providers.find(p => p.provider === config.provider);
          const isConnected = providerStatus?.is_connected || false;
          const isActive = providerStatus?.is_active || false;
          const isConnecting = connectingProvider === config.provider;
          const isDisconnecting = disconnectingProvider === config.provider;
          const isTesting = testingProvider === config.provider;
          const isToggling = togglingProvider === config.provider;
          const showingForm = showCredentialsForm === config.provider;

          return (
            <div key={config.provider} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              {/* Provider Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-2xl">
                      {config.logo}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{config.display_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                      {isConnected && (
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-gray-600">Connected</span>
                          </div>
                          {providerStatus.last_validated_at && (
                            <span className="text-xs text-gray-500">
                              Last tested: {new Date(providerStatus.last_validated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isActive && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                    {isConnected && !isActive && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Inactive
                      </span>
                    )}
                    {!isConnected && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        Not Connected
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6">
                  {!isConnected && (
                    <button
                      onClick={() => openCredentialsForm(config.provider)}
                      disabled={isConnecting}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Connect
                    </button>
                  )}

                  {isConnected && (
                    <>
                      <button
                        onClick={() => handleToggle(config.provider, isActive)}
                        disabled={isToggling}
                        className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                          isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isToggling && <Loader2 className="w-4 h-4 animate-spin" />}
                        {!isToggling && <Power className="w-4 h-4" />}
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleTest(config.provider)}
                        disabled={isTesting}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isTesting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {!isTesting && <TestTube className="w-4 h-4" />}
                        Test Connection
                      </button>

                      <button
                        onClick={() => handleDisconnect(config.provider)}
                        disabled={isDisconnecting}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isDisconnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {!isDisconnecting && <X className="w-4 h-4" />}
                        Disconnect
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Credentials Form */}
              {showingForm && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Enter {config.display_name} Credentials
                  </h4>

                  <div className="space-y-4">
                    {config.fields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                          type={field.type}
                          value={credentials[field.name] || ''}
                          onChange={(e) => setCredentials({ ...credentials, [field.name]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ))}

                    {config.provider === 'pathao' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sandbox"
                          checked={isSandbox}
                          onChange={(e) => setIsSandbox(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="sandbox" className="text-sm text-gray-700">
                          Use Sandbox/Test Environment
                        </label>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleConnect(config.provider)}
                        disabled={isConnecting}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save & Connect
                      </button>
                      <button
                        onClick={() => {
                          setShowCredentialsForm(null);
                          setCredentials({});
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
