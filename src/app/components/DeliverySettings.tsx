import { useState } from "react";
import { Truck, Plus, X, Package, ChevronDown, ChevronUp, Eye, EyeOff, Trash2 } from "lucide-react";
import pathaoLogo from "figma:asset/41b7d92733e22d8e3b0b9529b78d56c340085602.png";

interface WeightCharge {
  weight: number;
  charge: number;
}

interface CourierCredentials {
  [key: string]: string;
}

interface CourierService {
  id: string;
  name: string;
  logo: string;
  subtitle: string;
  enabled: boolean;
  configured: boolean;
  credentials?: CourierCredentials;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
  }[];
}

export default function DeliverySettings() {
  const [defaultCharge, setDefaultCharge] = useState(60);
  const [defaultCod, setDefaultCod] = useState(true);
  const [chargeRefundable, setChargeRefundable] = useState(false);
  const [insideDhakaCharge, setInsideDhakaCharge] = useState(60);
  const [insideDhakaCod, setInsideDhakaCod] = useState(true);
  const [subDhakaCharge, setSubDhakaCharge] = useState(80);
  const [subDhakaCod, setSubDhakaCod] = useState(true);
  const [outsideDhakaCharge, setOutsideDhakaCharge] = useState(120);
  const [outsideDhakaCod, setOutsideDhakaCod] = useState(true);
  const [weightCharges, setWeightCharges] = useState<WeightCharge[]>([
    { weight: 5, charge: 50 },
    { weight: 10, charge: 80 },
  ]);

  const [courierServices, setCourierServices] = useState<CourierService[]>([
    {
      id: '1',
      name: 'Pathao',
      logo: '🚚',
      subtitle: 'Configure delivery credentials',
      enabled: false,
      configured: false,
      fields: [
        { name: 'storeId', label: 'Store ID', type: 'text', placeholder: 'Store ID' },
        { name: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Client ID' },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' },
        { name: 'username', label: 'Username', type: 'text', placeholder: 'Username' },
      ],
    },
    {
      id: '2',
      name: 'Steadfast',
      logo: '📦',
      subtitle: 'Configure delivery credentials',
      enabled: false,
      configured: false,
      fields: [
        { name: 'apiKey', label: 'API key', type: 'password', placeholder: 'API key' },
        { name: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'App Secret' },
      ],
    },
    {
      id: '3',
      name: 'Redx',
      logo: '🚛',
      subtitle: 'Configure delivery credentials',
      enabled: false,
      configured: false,
      fields: [
        { name: 'apiKey', label: 'API key', type: 'password', placeholder: 'API key' },
      ],
    },
  ]);

  const [expandedCourier, setExpandedCourier] = useState<string | null>(null);
  const [courierFormData, setCourierFormData] = useState<{ [key: string]: CourierCredentials }>({});
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  const addWeightCharge = () => {
    setWeightCharges([...weightCharges, { weight: 0, charge: 0 }]);
  };

  const updateWeightCharge = (index: number, field: 'weight' | 'charge', value: number) => {
    const updated = [...weightCharges];
    updated[index] = { ...updated[index], [field]: value };
    setWeightCharges(updated);
  };

  const removeWeightCharge = (index: number) => {
    setWeightCharges(weightCharges.filter((_, i) => i !== index));
  };

  const toggleCourierService = (id: string) => {
    setCourierServices(courierServices.map(cs =>
      cs.id === id ? { ...cs, enabled: !cs.enabled } : cs
    ));
  };

  const toggleCourierExpand = (id: string) => {
    if (expandedCourier === id) {
      setExpandedCourier(null);
    } else {
      setExpandedCourier(id);
      // Initialize form data if not exists
      const courier = courierServices.find(c => c.id === id);
      if (courier && !courierFormData[id]) {
        const initialData: CourierCredentials = {};
        courier.fields.forEach(field => {
          initialData[field.name] = courier.credentials?.[field.name] || '';
        });
        setCourierFormData({ ...courierFormData, [id]: initialData });
      }
    }
  };

  const updateCourierField = (courierId: string, fieldName: string, value: string) => {
    setCourierFormData({
      ...courierFormData,
      [courierId]: {
        ...(courierFormData[courierId] || {}),
        [fieldName]: value,
      },
    });
  };

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords({
      ...showPasswords,
      [fieldKey]: !showPasswords[fieldKey],
    });
  };

  const addCourier = (courierId: string) => {
    setCourierServices(courierServices.map(cs =>
      cs.id === courierId
        ? { ...cs, configured: true, credentials: courierFormData[courierId], subtitle: 'Configured and active' }
        : cs
    ));
    setExpandedCourier(null);
  };

  const removeCourier = (courierId: string) => {
    setCourierServices(courierServices.map(cs =>
      cs.id === courierId
        ? { ...cs, configured: false, enabled: false, credentials: undefined, subtitle: 'Configure delivery credentials' }
        : cs
    ));
    setCourierFormData({ ...courierFormData, [courierId]: {} });
    setExpandedCourier(null);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Delivery Settings</h1>
        <p className="text-gray-600 mt-1">Configure delivery charges and courier services</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Default Delivery Charge */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Default Delivery Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Delivery Charge
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">৳</span>
                <input
                  type="number"
                  value={defaultCharge}
                  onChange={(e) => setDefaultCharge(parseFloat(e.target.value) || 0)}
                  className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="10"
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Default delivery charge applies unless overridden by district
              </p>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Enable COD for Default Delivery</div>
                <div className="text-sm text-gray-600">Allow cash on delivery for default areas</div>
              </div>
              <button
                onClick={() => setDefaultCod(!defaultCod)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  defaultCod ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    defaultCod ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Delivery Charge Not Refundable</div>
                <div className="text-sm text-gray-600">Delivery charge won't be refunded on returns</div>
              </div>
              <button
                onClick={() => setChargeRefundable(!chargeRefundable)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  chargeRefundable ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    chargeRefundable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Weight-Based Extra Charges */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weight-Based Extra Charges</h2>
          <p className="text-sm text-gray-600 mb-4">Add extra charges based on package weight</p>

          <div className="space-y-3 mb-4">
            {weightCharges.map((wc, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={wc.weight}
                      onChange={(e) => updateWeightCharge(index, 'weight', parseFloat(e.target.value) || 0)}
                      placeholder="Weight (kg)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.5"
                      min="0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">৳</span>
                    <input
                      type="number"
                      value={wc.charge}
                      onChange={(e) => updateWeightCharge(index, 'charge', parseFloat(e.target.value) || 0)}
                      placeholder="Extra charge"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="10"
                      min="0"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeWeightCharge(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addWeightCharge}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Weight Range
          </button>

          <p className="text-xs text-gray-500 mt-3">
            Example: 5kg = ৳50, 10kg = ৳80
          </p>
        </div>

        {/* Specific Delivery Charges */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Specific Delivery Charges</h2>
          <p className="text-sm text-gray-600 mb-4">
            Set custom delivery charges for specific districts. These will override the default charge.
          </p>

          <div className="space-y-3 mb-4">
            {/* Inside Dhaka */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <select
                      disabled
                      value="Dhaka"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    >
                      <option value="Dhaka">Dhaka</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">৳</span>
                    <input
                      type="number"
                      value={insideDhakaCharge}
                      onChange={(e) => setInsideDhakaCharge(parseFloat(e.target.value) || 0)}
                      placeholder="Delivery charge"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="10"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pl-2">
                <span className="text-sm text-gray-700">Enable COD for Inside Dhaka</span>
                <button
                  onClick={() => setInsideDhakaCod(!insideDhakaCod)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    insideDhakaCod ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      insideDhakaCod ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Sub Dhaka */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <select
                      disabled
                      value="Sub Dhaka"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    >
                      <option value="Sub Dhaka">Sub Dhaka (Gazipur, Savar & Narayanganj)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">৳</span>
                    <input
                      type="number"
                      value={subDhakaCharge}
                      onChange={(e) => setSubDhakaCharge(parseFloat(e.target.value) || 0)}
                      placeholder="Delivery charge"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="10"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pl-2">
                <span className="text-sm text-gray-700">Enable COD for Sub Dhaka</span>
                <button
                  onClick={() => setSubDhakaCod(!subDhakaCod)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    subDhakaCod ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      subDhakaCod ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Outside Dhaka */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <select
                      disabled
                      value="Outside Dhaka"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    >
                      <option value="Outside Dhaka">Outside Dhaka</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">৳</span>
                    <input
                      type="number"
                      value={outsideDhakaCharge}
                      onChange={(e) => setOutsideDhakaCharge(parseFloat(e.target.value) || 0)}
                      placeholder="Delivery charge"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="10"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pl-2">
                <span className="text-sm text-gray-700">Enable COD for Outside Dhaka</span>
                <button
                  onClick={() => setOutsideDhakaCod(!outsideDhakaCod)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    outsideDhakaCod ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      outsideDhakaCod ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Update Delivery Charges
          </button>
        </div>

        {/* Courier Services */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Courier Services</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enable and configure third-party courier services
          </p>

          <div className="space-y-4">
            {courierServices.map((courier) => (
              <div key={courier.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Courier Header */}
                <div className="p-4 bg-white flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{courier.logo}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{courier.name}</div>
                    <div className="text-sm text-gray-600">{courier.subtitle}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {courier.configured && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Active
                      </span>
                    )}
                    <button
                      onClick={() => toggleCourierService(courier.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        courier.enabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          courier.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expandable Configuration Panel */}
                {courier.enabled && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => toggleCourierExpand(courier.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {expandedCourier === courier.id ? 'Hide' : 'Show'} Configuration
                        </span>
                      </div>
                      {expandedCourier === courier.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>

                    {expandedCourier === courier.id && (
                      <div className="p-6 bg-white border-t border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                            <span className="text-xl">{courier.logo}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900">Configure {courier.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Please provide your {courier.name} credentials to integrate {courier.name}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {courier.fields.map((field, index) => (
                            <div key={field.name} className={field.name === 'username' ? 'col-span-2' : ''}>
                              <div className="relative">
                                <input
                                  type={field.type === 'password' && !showPasswords[`${courier.id}-${field.name}`] ? 'password' : 'text'}
                                  value={courierFormData[courier.id]?.[field.name] || ''}
                                  onChange={(e) => updateCourierField(courier.id, field.name, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                />
                                {field.type === 'password' && (
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(`${courier.id}-${field.name}`)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    {showPasswords[`${courier.id}-${field.name}`] ? (
                                      <EyeOff className="w-5 h-5" />
                                    ) : (
                                      <Eye className="w-5 h-5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {courier.configured ? (
                          <button
                            onClick={() => removeCourier(courier.id)}
                            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-5 h-5" />
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => addCourier(courier.id)}
                            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            Add
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
