import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { CreditCard, Wallet, DollarSign, Upload, ChevronDown, ChevronUp, TestTube, X, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/app/lib/api";
import { authService } from "@/app/lib/auth";

interface PaymentGateway {
  id: string;
  name: string;
  logo: React.ReactNode;
  description: string;
  enabled: boolean;
  config?: any;
  requiresContact?: boolean;
}

const isMfsGateway = (gatewayId: string) => ['bkash', 'nagad', 'rocket'].includes(gatewayId);

const toCanonicalGateway = (gatewayId: string) => (isMfsGateway(gatewayId) ? 'self-mfs' : gatewayId);

export default function PaymentSettings() {
  const { t } = useTranslation();
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: 'cod',
      name: t('manageShop.paymentSettings.codName'),
      logo: <DollarSign className="w-6 h-6 text-green-600" />,
      description: t('manageShop.paymentSettings.codDesc'),
      enabled: true,
    },
    {
      id: 'bkash',
      name: t('manageShop.paymentSettings.bkashName'),
      logo: <Wallet className="w-6 h-6 text-pink-600" />,
      description: t('manageShop.paymentSettings.bkashDesc'),
      enabled: false,
      config: { phone: '', accountType: 'self' },
    },
    {
      id: 'nagad',
      name: t('manageShop.paymentSettings.nagadName'),
      logo: <Wallet className="w-6 h-6 text-orange-600" />,
      description: t('manageShop.paymentSettings.nagadDesc'),
      enabled: false,
      config: { phone: '', accountType: 'self' },
    },
    {
      id: 'rocket',
      name: t('manageShop.paymentSettings.rocketName'),
      logo: <Wallet className="w-6 h-6 text-purple-600" />,
      description: t('manageShop.paymentSettings.rocketDesc'),
      enabled: false,
      config: { phone: '', accountType: 'self' },
    },
    {
      id: 'aamarpay',
      name: t('manageShop.paymentSettings.aamarName'),
      logo: <Lock className="w-6 h-6 text-gray-400" />,
      description: t('manageShop.paymentSettings.aamarDesc'),
      enabled: false,
      requiresContact: true,
    },
    {
      id: 'sslcommerz',
      name: t('manageShop.paymentSettings.sslCommerzName'),
      logo: <Lock className="w-6 h-6 text-gray-400" />,
      description: t('manageShop.paymentSettings.sslCommerzDesc'),
      enabled: false,
      requiresContact: true,
    },
  ]);

  const [expandedGateway, setExpandedGateway] = useState<string | null>(null);
  const [advancePaymentRule, setAdvancePaymentRule] = useState<'none' | 'full' | 'delivery' | 'percentage' | 'fixed'>('none');
  const [advancePercentage, setAdvancePercentage] = useState(50);
  const [advanceFixed, setAdvanceFixed] = useState(100);
  const [paymentMessage, setPaymentMessage] = useState(t('manageShop.paymentSettings.defaultPaymentMessage'));
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingGateway, setSavingGateway] = useState<string | null>(null);
  const [testingGateway, setTestingGateway] = useState<string | null>(null);
  const [disconnectingGateway, setDisconnectingGateway] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savedGateways, setSavedGateways] = useState<Set<string>>(new Set());

  // Load payment configurations on mount
  useEffect(() => {
    loadPaymentConfigs();
  }, []);

  const loadPaymentConfigs = async () => {
    try {
      setLoading(true);
      
      // Load payment gateway configs
      const response = await apiClient.getPaymentConfig();
      
      if (response.success && response.data) {
        // Update gateways with loaded configurations
        const loadedConfigs = response.data;
        const savedSet = new Set<string>();
        
        setGateways(prev => prev.map(gw => {
          const config = loadedConfigs.find((c: any) => c.gateway === gw.id);
          const mfsConfig = loadedConfigs.find((c: any) => c.gateway === 'self-mfs' && c.credentials?.mfs_type === gw.id);
          const matched = config || mfsConfig;
          if (matched) {
            savedSet.add(gw.id); // Mark gateway as having saved config
            return {
              ...gw,
              enabled: matched.is_enabled,
              // Don't overwrite config if credentials exist but keep UI fields empty for security
            };
          }
          return gw;
        }));
        
        setSavedGateways(savedSet);
      }

      // Load shop payment settings
      try {
        const shopResponse = await apiClient.getShop();
        if (shopResponse.success && shopResponse.data?.payment_methods) {
          const settings = JSON.parse(shopResponse.data.payment_methods);
          if (settings.advancePaymentRule) setAdvancePaymentRule(settings.advancePaymentRule);
          if (settings.advancePercentage !== undefined) setAdvancePercentage(settings.advancePercentage);
          if (settings.advanceFixed !== undefined) setAdvanceFixed(settings.advanceFixed);
          if (settings.paymentMessage) setPaymentMessage(settings.paymentMessage);
        }
      } catch (shopError) {
        // Shop settings are optional, so don't fail if they don't exist
        console.log('No existing payment settings found');
      }
    } catch (error: any) {
      console.error('Failed to load payment configs:', error);
      setError(t('manageShop.paymentSettings.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const saveGatewayConfig = async (gatewayId: string) => {
    try {
      setSavingGateway(gatewayId);
      setError(null);
      setSuccess(null);

      const gateway = gateways.find(gw => gw.id === gatewayId);
      if (!gateway) return;

      // Skip saving for contact-required gateways
      if (gateway.requiresContact) {
        setError(t('manageShop.paymentSettings.errors.contactRequired'));
        return;
      }

      let credentials: any = null;
      const canonicalGateway = toCanonicalGateway(gatewayId);

      // Prepare credentials based on gateway type
      if (isMfsGateway(gatewayId) && gateway.config) {
        if (!gateway.config.phone) {
          setError(t('manageShop.paymentSettings.errors.phoneRequired', 'MFS phone number is required'));
          return;
        }
        credentials = {
          mfs_type: gatewayId,
          mfs_number: gateway.config.phone,
          mfs_mode: gateway.config.accountType || 'self'
        };
      } else if (gatewayId === 'aamarpay' && gateway.config) {
        if (!gateway.config.storeId || !gateway.config.secretKey) {
          setError(t('manageShop.paymentSettings.errors.credentialsRequiredAamarPay'));
          return;
        }
        credentials = {
          store_id: gateway.config.storeId,
          secret_key: gateway.config.secretKey
        };
      } else if (gatewayId === 'sslcommerz' && gateway.config) {
        if (!gateway.config.storeId || !gateway.config.storePassword) {
          setError(t('manageShop.paymentSettings.errors.credentialsRequiredSSLCommerz'));
          return;
        }
        credentials = {
          store_id: gateway.config.storeId,
          store_password: gateway.config.storePassword
        };
      } else if (gatewayId === 'self-mfs' && gateway.config) {
        if (!gateway.config.phone) {
          setError(t('manageShop.paymentSettings.errors.phoneRequired', 'MFS phone number is required'));
          return;
        }
        credentials = {
          mfs_type: gateway.config.type || 'bkash',
          mfs_number: gateway.config.phone,
          mfs_mode: gateway.config.accountType === 'personal' ? 'self' : 'business'
        };
      }

      // First, test the connection
      const testPayload = {
        gateway: canonicalGateway,
        credentials
      };

      const testResponse = await apiClient.testPaymentConnection(testPayload);

      if (!testResponse.success) {
        setError(t('manageShop.paymentSettings.errors.testFailed'));
        return;
      }

      // If test successful, save the configuration
      const payload = {
        gateway: canonicalGateway,
        credentials,
        config: gatewayId === 'aamarpay' 
          ? { environment: gateway.config?.environment }
          : gatewayId === 'sslcommerz' 
          ? { environment: gateway.config?.environment }
          : {}
        // is_enabled not needed here - defaults to false on backend
      };

      const response = await apiClient.updatePaymentConfig(payload);

      if (response.success) {
        setSuccess(`✓ ${gateway.name} credentials verified and saved! Now use the toggle to activate this payment method.`);
        
        // Mark gateway as saved
        setSavedGateways(prev => new Set(prev).add(gatewayId));
        
        // Clear sensitive fields after save for security
        if (gatewayId === 'aamarpay' || gatewayId === 'sslcommerz') {
          setGateways(prev => prev.map(gw => 
            gw.id === gatewayId 
              ? { ...gw, config: { ...gw.config, storeId: '', secretKey: '', storePassword: '' } }
              : gw
          ));
        }

        // Keep success message longer so user sees it
        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (error: any) {
      console.error('Failed to save gateway config:', error);
      setError(error.response?.data?.message || t('manageShop.paymentSettings.errors.saveConfigFailed'));
    } finally {
      setSavingGateway(null);
    }
  };

  const disconnectGateway = async (gatewayId: string) => {
    try {
      setDisconnectingGateway(gatewayId);
      setError(null);
      setSuccess(null);

      const gateway = gateways.find(gw => gw.id === gatewayId);
      if (!gateway) return;

      const canonicalGateway = toCanonicalGateway(gatewayId);
      const response = await apiClient.deletePaymentConfig(canonicalGateway);

      if (response.success) {
        setSuccess(`✓ ${gateway.name} disconnected successfully!`);
        
        // Remove from saved gateways
        setSavedGateways(prev => {
          const newSet = new Set(prev);
          newSet.delete(gatewayId);
          return newSet;
        });

        // Update gateway state to disabled
        setGateways(prev => prev.map(gw =>
          gw.id === gatewayId ? { ...gw, enabled: false } : gw
        ));

        setTimeout(() => setSuccess(null), 2500);
      }
    } catch (error: any) {
      console.error('Failed to disconnect gateway:', error);
      setError(error.response?.data?.message || t('manageShop.paymentSettings.errors.disconnectFailed'));
    } finally {
      setDisconnectingGateway(null);
    }
  };

  const toggleGateway = async (id: string) => {
    const gateway = gateways.find(gw => gw.id === id);
    if (!gateway) return;

    // For COD, allow toggle without saved credentials
    // For others, require saved credentials first
    if (id !== 'cod' && !savedGateways.has(id)) {
      setError(t('manageShop.paymentSettings.errors.credentialsSaveFirst'));
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setError(null);
      setSavingGateway(id);

      const payload = {
        gateway: toCanonicalGateway(id),
        is_enabled: !gateway.enabled
      };

      const response = await apiClient.updatePaymentConfig(payload);

      if (response.success) {
        // Update local state
        setGateways(prev => prev.map(gw =>
          gw.id === id ? { ...gw, enabled: !gw.enabled } : gw
        ));
        
        const newStatus = !gateway.enabled ? 'activated' : 'deactivated';
        setSuccess(`✓ ${gateway.name} ${newStatus} for payments!`);
        setTimeout(() => setSuccess(null), 2500);
      }
    } catch (error: any) {
      console.error('Failed to toggle gateway:', error);
      setError(error.response?.data?.message || t('manageShop.paymentSettings.errors.toggleFailed'));
    } finally {
      setSavingGateway(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedGateway(expandedGateway === id ? null : id);
  };

  const updateGatewayConfig = (id: string, field: string, value: any) => {
    setGateways(gateways.map(gw =>
      gw.id === id && gw.config
        ? { ...gw, config: { ...gw.config, [field]: value } }
        : gw
    ));
  };

  const savePaymentSettings = async () => {
    try {
      setSavingSettings(true);
      setError(null);
      setSuccess(null);

      const shopId = authService.getCurrentShopId();
      if (!shopId) {
        setError(t('manageShop.paymentSettings.errors.shopNotFound'));
        return;
      }

      // Prepare payment settings data
      const paymentSettings = {
        advancePaymentRule,
        advancePercentage,
        advanceFixed,
        paymentMessage
      };

      // Save to shop's payment_methods field as JSON
      await apiClient.updateShop(shopId, {
        payment_methods: JSON.stringify(paymentSettings)
      });

      setSuccess('✓ Payment settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Failed to save payment settings:', error);
      setError(error.response?.data?.message || t('manageShop.paymentSettings.errors.saveSettingsFailed'));
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('manageShop.paymentSettings.title')}</h1>
        <p className="text-gray-600 mt-1">{t('manageShop.paymentSettings.subtitle')}</p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="max-w-4xl mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="max-w-4xl mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="max-w-4xl space-y-6">
        {/* Payment Gateways */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('manageShop.paymentSettings.gatewaysTitle')}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {t('manageShop.paymentSettings.gatewaysSubtitle')}
          </p>

          <div className="space-y-3">
            {gateways.map((gateway) => (
              <div key={gateway.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    {gateway.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{gateway.name}</div>
                    <div className="text-sm text-gray-600">{gateway.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {gateway.requiresContact ? (
                      <a
                        href="mailto:support@easymod.ai?subject=Integrate AamarPay or SSLCommerz"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Contact us for enterprise integration"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">Contact us</span>
                      </a>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleGateway(gateway.id)}
                          disabled={(gateway.id !== 'cod' && !savedGateways.has(gateway.id)) || savingGateway === gateway.id}
                          title={gateway.id !== 'cod' && !savedGateways.has(gateway.id) ? 'Save configuration first' : 'Click to activate/deactivate'}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                            gateway.enabled ? 'bg-blue-600' : 'bg-gray-300'
                          } ${(gateway.id !== 'cod' && !savedGateways.has(gateway.id)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              gateway.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        {gateway.config && (
                          <button
                            onClick={() => toggleExpand(gateway.id)}
                            className="p-2 text-gray-600 hover:text-gray-900"
                          >
                            {expandedGateway === gateway.id ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Configuration Forms */}
                {expandedGateway === gateway.id && gateway.config && !gateway.requiresContact && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {/* AamarPay Config */}
                    {gateway.id === 'aamarpay' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('manageShop.paymentSettings.storeId')}
                          </label>
                          <input
                            type="text"
                            value={gateway.config.storeId}
                            onChange={(e) => updateGatewayConfig(gateway.id, 'storeId', e.target.value)}
                            placeholder="Enter Store ID"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('manageShop.paymentSettings.secretKey')}
                          </label>
                          <input
                            type="password"
                            value={gateway.config.secretKey}
                            onChange={(e) => updateGatewayConfig(gateway.id, 'secretKey', e.target.value)}
                            placeholder="Enter Secret Key"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('manageShop.paymentSettings.environment')}
                          </label>
                          <select
                            value={gateway.config.environment || 'sandbox'}
                            onChange={(e) => updateGatewayConfig(gateway.id, 'environment', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="sandbox">{t('manageShop.paymentSettings.sandbox')}</option>
                            <option value="live">{t('manageShop.paymentSettings.live')}</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">{t('manageShop.paymentSettings.environmentHint')}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-900">
                            {t('manageShop.paymentSettings.applyNow')}: <a href="https://aamarpay.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AamarPay</a>
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => saveGatewayConfig('aamarpay')}
                            disabled={savingGateway === 'aamarpay'}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {savingGateway === 'aamarpay' ? (
                              <>{t('manageShop.paymentSettings.saving')}</>
                            ) : (
                              <>
                                <TestTube className="w-4 h-4" />
                                {t('manageShop.paymentSettings.testSave')}
                              </>
                            )}
                          </button>
                          {savedGateways.has('aamarpay') && (
                            <button
                              onClick={() => disconnectGateway('aamarpay')}
                              disabled={disconnectingGateway === 'aamarpay'}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {disconnectingGateway === 'aamarpay' ? (
                                <>{t('manageShop.paymentSettings.disconnecting')}</>
                              ) : (
                                <>
                                  <X className="w-4 h-4" />
                                  {t('manageShop.paymentSettings.disconnect')}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SSLCommerz Config */}
                    {gateway.id === 'sslcommerz' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('manageShop.paymentSettings.storeId')}
                          </label>
                          <input
                            type="text"
                            value={gateway.config.storeId}
                            onChange={(e) => updateGatewayConfig(gateway.id, 'storeId', e.target.value)}
                            placeholder="Enter Store ID"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('manageShop.paymentSettings.storePassword')}
                          </label>
                          <input
                            type="password"
                            value={gateway.config.storePassword}
                            onChange={(e) => updateGatewayConfig(gateway.id, 'storePassword', e.target.value)}
                            placeholder="Enter Store Password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('manageShop.paymentSettings.environment')}
                          </label>
                          <select
                            value={gateway.config.environment}
                            onChange={(e) => updateGatewayConfig(gateway.id, 'environment', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="sandbox">{t('manageShop.paymentSettings.sandbox')}</option>
                            <option value="live">{t('manageShop.paymentSettings.live')}</option>
                          </select>
                        </div>
                        <button
                          onClick={() => saveGatewayConfig('sslcommerz')}
                          disabled={savingGateway === 'sslcommerz'}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {savingGateway === 'sslcommerz' ? t('manageShop.paymentSettings.saving') : t('manageShop.paymentSettings.testSave')}
                        </button>
                      </div>
                    )}

                    {/* Self MFS Config */}
                    {gateway.id === 'self-mfs' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('manageShop.paymentSettings.mfsType')}
                            </label>
                            <select
                              value={gateway.config.type}
                              onChange={(e) => updateGatewayConfig(gateway.id, 'type', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="bkash">bKash</option>
                              <option value="nagad">Nagad</option>
                              <option value="rocket">Rocket</option>
                              <option value="upay">Upay</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('manageShop.paymentSettings.accountType')}
                            </label>
                            <select
                              value={gateway.config.accountType}
                              onChange={(e) => updateGatewayConfig(gateway.id, 'accountType', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="personal">{t('manageShop.paymentSettings.personal')}</option>
                              <option value="agent">{t('manageShop.paymentSettings.agent')}</option>
                              <option value="merchant">{t('manageShop.paymentSettings.merchant')}</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('manageShop.paymentSettings.phoneNumber')}
                          </label>
                          <input
                            type="tel"
                            value={gateway.config.phone}
                            onChange={(e) => updateGatewayConfig(gateway.id, 'phone', e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('manageShop.paymentSettings.qrCode')}
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {gateway.config.qrPreview ? (
                              <div className="mb-2">
                                <img src={gateway.config.qrPreview} alt="QR Code" className="w-32 h-32 mx-auto rounded-lg object-contain" />
                              </div>
                            ) : (
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            )}
                            <p className="text-sm text-gray-600 mb-2">
                              {gateway.config.qrPreview ? t('manageShop.paymentSettings.qrUploaded') : t('manageShop.paymentSettings.qrUploadHint')}
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="qr-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    updateGatewayConfig(gateway.id, 'qrPreview', ev.target?.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                  toast.success('QR code image selected');
                                }
                              }}
                            />
                            <label
                              htmlFor="qr-upload"
                              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm"
                            >
                              {gateway.config.qrPreview ? t('manageShop.paymentSettings.changeFile') : t('manageShop.paymentSettings.chooseFile')}
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('manageShop.paymentSettings.paymentInstructions')}
                          </label>
                          <textarea
                            value={gateway.config.instructions}
                            onChange={(e) => updateGatewayConfig(gateway.id, 'instructions', e.target.value)}
                            placeholder={t('manageShop.paymentSettings.paymentInstructionsPlaceholder')}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {t('manageShop.paymentSettings.paymentInstructionsHint')}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            if (!gateway.config.phone) {
                              toast.error('Please enter your MFS phone number');
                              return;
                            }
                            saveGatewayConfig('self-mfs');
                          }}
                          disabled={savingGateway === 'self-mfs'}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {savingGateway === 'self-mfs' ? t('manageShop.paymentSettings.saving') : t('manageShop.paymentSettings.saveMFS')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Advance Payment Rules */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('manageShop.paymentSettings.advanceTitle')}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {t('manageShop.paymentSettings.advanceSubtitle')}
          </p>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="radio"
                name="advance-payment"
                value="none"
                checked={advancePaymentRule === 'none'}
                onChange={(e) => setAdvancePaymentRule(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{t('manageShop.paymentSettings.noPayment')}</div>
                <div className="text-sm text-gray-600">{t('manageShop.paymentSettings.noPaymentDesc')}</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="radio"
                name="advance-payment"
                value="full"
                checked={advancePaymentRule === 'full'}
                onChange={(e) => setAdvancePaymentRule(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{t('manageShop.paymentSettings.fullPayment')}</div>
                <div className="text-sm text-gray-600">{t('manageShop.paymentSettings.fullPaymentDesc')}</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="radio"
                name="advance-payment"
                value="delivery"
                checked={advancePaymentRule === 'delivery'}
                onChange={(e) => setAdvancePaymentRule(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{t('manageShop.paymentSettings.deliveryOnly')}</div>
                <div className="text-sm text-gray-600">{t('manageShop.paymentSettings.deliveryOnlyDesc')}</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="radio"
                name="advance-payment"
                value="percentage"
                checked={advancePaymentRule === 'percentage'}
                onChange={(e) => setAdvancePaymentRule(e.target.value as any)}
                className="w-4 h-4 text-blue-600 mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-2">{t('manageShop.paymentSettings.percentage')}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={advancePercentage}
                    onChange={(e) => setAdvancePercentage(parseFloat(e.target.value) || 0)}
                    disabled={advancePaymentRule !== 'percentage'}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    min="0"
                    max="100"
                  />
                  <span className="text-gray-600">{t('manageShop.paymentSettings.percentageSuffix')}</span>
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="radio"
                name="advance-payment"
                value="fixed"
                checked={advancePaymentRule === 'fixed'}
                onChange={(e) => setAdvancePaymentRule(e.target.value as any)}
                className="w-4 h-4 text-blue-600 mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-2">{t('manageShop.paymentSettings.fixedAmount')}</div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">৳</span>
                  <input
                    type="number"
                    value={advanceFixed}
                    onChange={(e) => setAdvanceFixed(parseFloat(e.target.value) || 0)}
                    disabled={advancePaymentRule !== 'fixed'}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    min="0"
                    step="10"
                  />
                  <span className="text-gray-600">{t('manageShop.paymentSettings.fixedSuffix')}</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Process Message */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('manageShop.paymentSettings.paymentMessage')}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {t('manageShop.paymentSettings.paymentMessageSubtitle')}
          </p>

          <textarea
            value={paymentMessage}
            onChange={(e) => setPaymentMessage(e.target.value)}
            placeholder={t('manageShop.paymentSettings.paymentMessagePlaceholder')}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />

          <button
            onClick={savePaymentSettings}
            disabled={savingSettings}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {savingSettings ? t('manageShop.paymentSettings.saving') : t('manageShop.paymentSettings.updatePayment')}
          </button>
        </div>
      </div>
    </div>
  );
}