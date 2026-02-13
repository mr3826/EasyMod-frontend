import { useEffect, useState } from "react";
import type { BusinessInfo } from "../lib/knowledgeTypes";
import { apiClient } from "../lib/api";
import { authService } from "../lib/auth";

const emptyBusinessInfo: BusinessInfo = {
  shopName: "",
  address: "",
  phone: "",
  openingHours: "",
  deliveryAreas: [],
  paymentMethods: [],
};

const normalizeBusinessInfo = (value?: Partial<BusinessInfo> | null): BusinessInfo => ({
  ...emptyBusinessInfo,
  ...value,
  shopName: value?.shopName ?? "",
  address: value?.address ?? "",
  phone: value?.phone ?? "",
  openingHours: value?.openingHours ?? "",
  deliveryAreas: Array.isArray(value?.deliveryAreas) ? value?.deliveryAreas : [],
  paymentMethods: Array.isArray(value?.paymentMethods) ? value?.paymentMethods : [],
});

export default function BusinessInfoSettings() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(emptyBusinessInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBusinessInfo = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await apiClient.getShopBusinessInfo();
        if (!cancelled) {
          setBusinessInfo(normalizeBusinessInfo(data.businessInfo));
        }
      } catch (error: any) {
        if (!cancelled) {
          setLoadError(error.response?.data?.error?.message || "Failed to load business info.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBusinessInfo();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setNotice(null);
      const updated = await apiClient.updateShopBusinessInfo(businessInfo);
      setBusinessInfo(normalizeBusinessInfo(updated.businessInfo));
      await authService.refreshShops();
      setNotice("Business info updated and indexed.");
    } catch (error: any) {
      setNotice(error.response?.data?.error?.message || "Failed to update business info.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {isLoading && <div className="text-gray-500">Loading business info...</div>}
      {loadError && <div className="text-red-600">{loadError}</div>}
      {notice && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
          <input
            type="text"
            value={businessInfo.shopName}
            onChange={(e) => setBusinessInfo({ ...businessInfo, shopName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="text"
            value={businessInfo.phone}
            onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <input
          type="text"
          value={businessInfo.address}
          onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours</label>
        <input
          type="text"
          value={businessInfo.openingHours}
          onChange={(e) => setBusinessInfo({ ...businessInfo, openingHours: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`px-6 py-3 bg-blue-600 text-white rounded-lg ${
          isSaving ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
