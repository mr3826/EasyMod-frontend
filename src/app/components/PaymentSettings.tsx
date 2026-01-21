import { useState } from "react";
import { CreditCard, Wallet, DollarSign, Upload, ChevronDown, ChevronUp } from "lucide-react";

interface PaymentGateway {
  id: string;
  name: string;
  logo: React.ReactNode;
  description: string;
  enabled: boolean;
  config?: any;
}

export default function PaymentSettings() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: 'cod',
      name: 'Cash on Delivery',
      logo: <DollarSign className="w-6 h-6 text-green-600" />,
      description: 'Accept cash payment on delivery',
      enabled: true,
    },
    {
      id: 'aamarpay',
      name: 'AamarPay',
      logo: <CreditCard className="w-6 h-6 text-orange-600" />,
      description: 'Accept card payments, mobile banking & more',
      enabled: false,
      config: { storeId: '', secretKey: '' },
    },
    {
      id: 'sslcommerz',
      name: 'SSLCommerz',
      logo: <CreditCard className="w-6 h-6 text-blue-600" />,
      description: 'Leading payment gateway in Bangladesh',
      enabled: false,
      config: { storeId: '', storePassword: '', environment: 'sandbox' },
    },
    {
      id: 'self-mfs',
      name: 'Self MFS',
      logo: <Wallet className="w-6 h-6 text-purple-600" />,
      description: 'Use your personal/agent mobile banking account',
      enabled: false,
      config: { type: 'bkash', accountType: 'personal', phone: '', qr: null, instructions: '' },
    },
  ]);

  const [expandedGateway, setExpandedGateway] = useState<string | null>(null);
  const [advancePaymentRule, setAdvancePaymentRule] = useState<'full' | 'delivery' | 'percentage' | 'fixed'>('full');
  const [advancePercentage, setAdvancePercentage] = useState(50);
  const [advanceFixed, setAdvanceFixed] = useState(100);
  const [paymentMessage, setPaymentMessage] = useState('Payment instructions will be sent after order confirmation.');

  const toggleGateway = (id: string) => {
    setGateways(gateways.map(gw =>
      gw.id === id ? { ...gw, enabled: !gw.enabled } : gw
    ));
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
        <p className="text-gray-600 mt-1">Configure payment methods and advance payment rules</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Payment Gateways */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Gateways</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enable and configure payment methods for your customers
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
                    <button
                      onClick={() => toggleGateway(gateway.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        gateway.enabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
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
                  </div>
                </div>

                {/* Configuration Forms */}
                {expandedGateway === gateway.id && gateway.config && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {/* AamarPay Config */}
                    {gateway.id === 'aamarpay' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Store ID
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
                            Secret Key
                          </label>
                          <input
                            type="password"
                            value={gateway.config.secretKey}
                            onChange={(e) => updateGatewayConfig(gateway.id, 'secretKey', e.target.value)}
                            placeholder="Enter Secret Key"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-900">
                            Don't have an account? <a href="https://aamarpay.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Apply Now</a>
                          </p>
                        </div>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Save Configuration
                        </button>
                      </div>
                    )}

                    {/* SSLCommerz Config */}
                    {gateway.id === 'sslcommerz' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Store ID
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
                            Store Password
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
                            Environment
                          </label>
                          <select
                            value={gateway.config.environment}
                            onChange={(e) => updateGatewayConfig(gateway.id, 'environment', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="sandbox">Sandbox (Testing)</option>
                            <option value="live">Live (Production)</option>
                          </select>
                        </div>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Save Configuration
                        </button>
                      </div>
                    )}

                    {/* Self MFS Config */}
                    {gateway.id === 'self-mfs' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              MFS Type
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
                              Account Type
                            </label>
                            <select
                              value={gateway.config.accountType}
                              onChange={(e) => updateGatewayConfig(gateway.id, 'accountType', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="personal">Personal</option>
                              <option value="agent">Agent</option>
                              <option value="merchant">Merchant</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
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
                            QR Code (Optional)
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-2">Upload QR code for easy payments</p>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="qr-upload"
                            />
                            <label
                              htmlFor="qr-upload"
                              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm"
                            >
                              Choose File
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Instructions
                          </label>
                          <textarea
                            value={gateway.config.instructions}
                            onChange={(e) => updateGatewayConfig(gateway.id, 'instructions', e.target.value)}
                            placeholder="Enter instructions for customers on how to make payment..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            These instructions will be shown to customers after order confirmation
                          </p>
                        </div>

                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Save Self MFS
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Advance Payment Rules</h2>
          <p className="text-sm text-gray-600 mb-4">
            Set how much customers need to pay in advance
          </p>

          <div className="space-y-3">
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
                <div className="font-medium text-gray-900">Full Payment</div>
                <div className="text-sm text-gray-600">Customer pays the full order amount</div>
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
                <div className="font-medium text-gray-900">Delivery Charge Only</div>
                <div className="text-sm text-gray-600">Customer pays only the delivery charge upfront</div>
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
                <div className="font-medium text-gray-900 mb-2">Percentage</div>
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
                  <span className="text-gray-600">% of total order amount</span>
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
                <div className="font-medium text-gray-900 mb-2">Fixed Amount</div>
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
                  <span className="text-gray-600">fixed advance amount</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Process Message */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Process Message</h2>
          <p className="text-sm text-gray-600 mb-4">
            Customize the payment instructions shown to customers
          </p>

          <textarea
            value={paymentMessage}
            onChange={(e) => setPaymentMessage(e.target.value)}
            placeholder="Enter payment instructions for customers..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />

          <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Update Payment Info
          </button>
        </div>
      </div>
    </div>
  );
}