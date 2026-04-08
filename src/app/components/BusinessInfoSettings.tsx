import { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import type { BusinessInfo } from "../lib/knowledgeTypes";
import type { ShopAISettings } from "../lib/api";
import { apiClient } from "../lib/api";
import { authService } from "../lib/auth";

// ── defaults ──────────────────────────────────────────────────────────────────

const emptyBusinessInfo: BusinessInfo = {
  shopName: "",
  address: "",
  phone: "",
  openingHours: "",
  deliveryAreas: [],
  paymentMethods: [],
};

const defaultAISettings: ShopAISettings = {
  automation_mode: "DRAFT",
  confidence_threshold: 60,
  auto_reply_enabled: true,
  max_auto_order_value: 5000,
  ask_email: false,
  primary_language: "mixed",
  required_fields: {
    customer_name: true,
    mobile_number: true,
    delivery_address: true,
    payment_method: true,
    email_address: false,
    special_instructions: false,
  },
  handoff_settings: {
    trigger_keywords: ["complain", "problem", "issue"],
    notification_channel: "in_app",
    cooldown_minutes: 30,
  },
};

// ── helpers ───────────────────────────────────────────────────────────────────

const normalizeBusinessInfo = (value?: Partial<BusinessInfo> | null): BusinessInfo => ({
  ...emptyBusinessInfo,
  ...value,
  shopName: value?.shopName ?? "",
  address: value?.address ?? "",
  phone: value?.phone ?? "",
  openingHours: value?.openingHours ?? "",
  deliveryAreas: Array.isArray(value?.deliveryAreas) ? value.deliveryAreas : [],
  paymentMethods: Array.isArray(value?.paymentMethods) ? value.paymentMethods : [],
});

const mergeAISettings = (loaded?: Partial<ShopAISettings> | null): ShopAISettings => ({
  ...defaultAISettings,
  ...loaded,
  required_fields: { ...defaultAISettings.required_fields, ...(loaded?.required_fields || {}) },
  handoff_settings: { ...defaultAISettings.handoff_settings, ...(loaded?.handoff_settings || {}) },
});

// ── tag-input helper ──────────────────────────────────────────────────────────

function TagInput({
  label, values, onChange, placeholder,
}: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:text-blue-600">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={add}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function BusinessInfoSettings() {
  const { t } = useTranslation();

  // Business info state
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(emptyBusinessInfo);
  const [savedBusinessInfo, setSavedBusinessInfo] = useState<BusinessInfo>(emptyBusinessInfo);

  // AI settings state
  const [aiSettings, setAISettings] = useState<ShopAISettings>(defaultAISettings);
  const [savedAISettings, setSavedAISettings] = useState<ShopAISettings>(defaultAISettings);
  const [showHandoffSection, setShowHandoffSection] = useState(false);

  // Loading / saving
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [isSavingAutomation, setIsSavingAutomation] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Automation (n8n) settings
  const [automationSettings, setAutomationSettings] = useState({ workflow_webhook_url: '', workflow_webhook_secret: '' });
  const [automationNotice, setAutomationNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Notices
  const [infoNotice, setInfoNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [aiNotice, setAINotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const infoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showInfoNotice = (type: "success" | "error", message: string) => {
    if (infoTimerRef.current) clearTimeout(infoTimerRef.current);
    setInfoNotice({ type, message });
    if (type === "success") infoTimerRef.current = setTimeout(() => setInfoNotice(null), 3000);
  };

  const showAINotice = (type: "success" | "error", message: string) => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setAINotice({ type, message });
    if (type === "success") aiTimerRef.current = setTimeout(() => setAINotice(null), 3000);
  };

  // Dirty-state tracking
  const infoIsDirty = JSON.stringify(businessInfo) !== JSON.stringify(savedBusinessInfo);
  const aiIsDirty = JSON.stringify(aiSettings) !== JSON.stringify(savedAISettings);

  // Load on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [infoData, aiData, automationData] = await Promise.all([
          apiClient.getShopBusinessInfo(),
          apiClient.getShopAISettings(),
          apiClient.getAutomationSettings().catch(() => ({ data: null })),
        ]);
        if (!cancelled) {
          const bi = normalizeBusinessInfo(infoData.businessInfo);
          const ai = mergeAISettings(aiData);
          setBusinessInfo(bi);
          setSavedBusinessInfo(bi);
          setAISettings(ai);
          setSavedAISettings(ai);
          if (automationData?.data) {
            setAutomationSettings({
              workflow_webhook_url: automationData.data.workflow_webhook_url || '',
              workflow_webhook_secret: ''
            });
          }
        }
      } catch (error: any) {
        if (!cancelled) {
          setLoadError(error.response?.data?.error?.message || t('manageShop.businessInfo.errorLoad'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Save business info
  const handleSaveInfo = async () => {
    try {
      setIsSavingInfo(true);
      const updated = await apiClient.updateShopBusinessInfo(businessInfo);
      const bi = normalizeBusinessInfo(updated.businessInfo);
      setBusinessInfo(bi);
      setSavedBusinessInfo(bi);
      await authService.refreshShops();
      showInfoNotice("success", t('manageShop.businessInfo.successMsg'));
    } catch (error: any) {
      showInfoNotice("error", error.response?.data?.error?.message || t('manageShop.businessInfo.errorUpdate'));
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Save AI settings
  const handleSaveAI = async () => {
    try {
      setIsSavingAI(true);
      const updated = await apiClient.updateShopAISettings(aiSettings);
      const ai = mergeAISettings(updated);
      setAISettings(ai);
      setSavedAISettings(ai);
      showAINotice("success", "AI settings saved.");
    } catch (error: any) {
      showAINotice("error", error.response?.data?.error?.message || "Failed to save AI settings.");
    } finally {
      setIsSavingAI(false);
    }
  };

  // ── render helpers ──────────────────────────────────────────────────────────

  const noticeClass = (type: "success" | "error") =>
    type === "success"
      ? "bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm"
      : "bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm";

  if (isLoading) return <div className="p-6 text-gray-500">{t('manageShop.businessInfo.loading')}</div>;
  if (loadError) return <div className="p-6 text-red-600">{loadError}</div>;

  return (
    <div className="space-y-8 p-6">

      {/* ── Business Info Section ─────────────────────────────────────────── */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Business Information</h3>

        {infoNotice && <div className={noticeClass(infoNotice.type)}>{infoNotice.message}</div>}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('manageShop.businessInfo.shopName')}</label>
              <input
                type="text"
                value={businessInfo.shopName}
                onChange={(e) => setBusinessInfo({ ...businessInfo, shopName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('manageShop.businessInfo.phone')}</label>
              <input
                type="text"
                value={businessInfo.phone}
                onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('manageShop.businessInfo.address')}</label>
            <input
              type="text"
              value={businessInfo.address}
              onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('manageShop.businessInfo.openingHours')}</label>
            <input
              type="text"
              value={businessInfo.openingHours}
              onChange={(e) => setBusinessInfo({ ...businessInfo, openingHours: e.target.value })}
              placeholder="e.g. Sat–Thu 9am–9pm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <TagInput
              label="Delivery Areas"
              values={businessInfo.deliveryAreas}
              onChange={(v) => setBusinessInfo({ ...businessInfo, deliveryAreas: v })}
              placeholder="e.g. Dhaka, Chittagong"
            />
            <TagInput
              label="Payment Methods"
              values={businessInfo.paymentMethods}
              onChange={(v) => setBusinessInfo({ ...businessInfo, paymentMethods: v })}
              placeholder="e.g. bKash, Nagad, COD"
            />
          </div>
        </div>

        <button
          onClick={handleSaveInfo}
          disabled={isSavingInfo || !infoIsDirty}
          className={`mt-6 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
            isSavingInfo || !infoIsDirty
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSavingInfo ? t('manageShop.businessInfo.saving') : t('manageShop.businessInfo.saveChanges')}
        </button>
      </section>

      <hr className="border-gray-200" />

      {/* ── AI Behaviour Settings Section ─────────────────────────────────── */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">AI Behaviour Settings</h3>
        <p className="text-sm text-gray-500 mb-4">
          Control how the AI chatbot operates across all connected channels.
        </p>

        {aiNotice && <div className={`mb-4 ${noticeClass(aiNotice.type)}`}>{aiNotice.message}</div>}

        <div className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">বট কিভাবে কাজ করবে?</label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {([
                {
                  mode: 'AUTO' as const,
                  title: '🤖 সম্পূর্ণ অটো',
                  desc: 'বট নিজেই রিপ্লাই পাঠাবে',
                },
                {
                  mode: 'DRAFT' as const,
                  title: '👁️ দেখে পাঠান (Draft)',
                  desc: 'পাঠানোর আগে আপনাকে দেখাবে',
                },
                {
                  mode: 'MANUAL' as const,
                  title: '✋ আমিই পাঠাব',
                  desc: 'বট নিজে থেকে কিছু পাঠাবে না',
                },
              ]).map((option) => {
                const active = aiSettings.automation_mode === option.mode;
                return (
                  <button
                    key={option.mode}
                    type="button"
                    onClick={() => setAISettings({ ...aiSettings, automation_mode: option.mode })}
                    className={`min-h-24 rounded-xl border p-4 text-left transition-colors ${
                      active ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="mb-1 text-sm font-bold text-gray-900">{option.title}</p>
                    <p className="text-xs text-gray-600">{option.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">বট কিভাবে কথা বলবে?</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {([
                { value: 'mixed' as const, label: 'বন্ধুত্বপূর্ণ বাংলিশ (ডিফল্ট)' },
                { value: 'bn' as const, label: 'সাধারণ বাংলা' },
                { value: 'en' as const, label: 'ইংরেজি' },
              ]).map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setAISettings({ ...aiSettings, primary_language: lang.value })}
                  className={`min-h-12 rounded-lg border px-3 text-sm font-medium ${
                    aiSettings.primary_language === lang.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row: confidence + max order value */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                বট কতটা নিশ্চিত হলে নিজে উত্তর পাঠাবে? <span className="font-semibold text-blue-700">{aiSettings.confidence_threshold}%</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">আরও সতর্ক ◀━━━●━━━▶ আরও স্বাধীন</p>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={aiSettings.confidence_threshold}
                onChange={(e) => setAISettings({ ...aiSettings, confidence_threshold: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>সতর্ক</span><span>মাঝামাঝি</span><span>স্বাধীন</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Auto-Order Value (৳)</label>
              <p className="text-xs text-gray-500 mb-2">Orders above this amount require manual approval.</p>
              <input
                type="number"
                min={0}
                step={100}
                value={aiSettings.max_auto_order_value}
                onChange={(e) => setAISettings({ ...aiSettings, max_auto_order_value: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            {([
              { key: "auto_reply_enabled", label: "Auto-reply enabled" },
              { key: "ask_email",          label: "Ask customer for email" },
            ] as const).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setAISettings({ ...aiSettings, [key]: !aiSettings[key] })}
                  className={`relative w-10 h-6 rounded-full transition-colors ${aiSettings[key] ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${aiSettings[key] ? "translate-x-4" : ""}`} />
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Required order fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required Order Fields</label>
            <p className="text-xs text-gray-500 mb-3">The AI will ask for these fields before confirming an order.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(aiSettings.required_fields) as Array<keyof ShopAISettings['required_fields']>).map((field) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSettings.required_fields[field]}
                    onChange={(e) => setAISettings({
                      ...aiSettings,
                      required_fields: { ...aiSettings.required_fields, [field]: e.target.checked }
                    })}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-700 capitalize">{field.replace(/_/g, " ")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Handoff settings (collapsible) */}
          <div className="border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => setShowHandoffSection(!showHandoffSection)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>Human Handoff Settings</span>
              {showHandoffSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showHandoffSection && (
              <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notification Channel</label>
                    <select
                      value={aiSettings.handoff_settings.notification_channel}
                      onChange={(e) => setAISettings({
                        ...aiSettings,
                        handoff_settings: { ...aiSettings.handoff_settings, notification_channel: e.target.value as 'in_app' | 'email' | 'sms' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="in_app">In-app notification</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cooldown (minutes)</label>
                    <input
                      type="number"
                      min={0}
                      max={1440}
                      value={aiSettings.handoff_settings.cooldown_minutes}
                      onChange={(e) => setAISettings({
                        ...aiSettings,
                        handoff_settings: { ...aiSettings.handoff_settings, cooldown_minutes: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <TagInput
                  label="Trigger Keywords"
                  values={aiSettings.handoff_settings.trigger_keywords}
                  onChange={(v) => setAISettings({ ...aiSettings, handoff_settings: { ...aiSettings.handoff_settings, trigger_keywords: v } })}
                  placeholder="e.g. complain, refund"
                />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSaveAI}
          disabled={isSavingAI || !aiIsDirty}
          className={`mt-6 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
            isSavingAI || !aiIsDirty
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSavingAI ? "Saving…" : "Save AI Settings"}
        </button>
      </section>

      {/* Automation / n8n Integration */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base font-semibold text-gray-900">Automation Webhook</h2>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">n8n / Make.com</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Connect your n8n workflow at <strong>n8n.hexabyte.tech</strong> to receive message events and trigger BD F-commerce automations (order notifications, Google Sheets sync, etc).
        </p>
        {automationNotice && (
          <div className={`mb-3 px-3 py-2 rounded text-sm ${automationNotice.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {automationNotice.message}
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">n8n Webhook URL</label>
            <input
              type="url"
              value={automationSettings.workflow_webhook_url}
              onChange={(e) => setAutomationSettings(s => ({ ...s, workflow_webhook_url: e.target.value }))}
              placeholder="https://n8n.hexabyte.tech/webhook/xxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-xs text-gray-400 mt-1">Paste the Webhook Trigger URL from your n8n workflow here.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret (optional)</label>
            <input
              type="password"
              value={automationSettings.workflow_webhook_secret}
              onChange={(e) => setAutomationSettings(s => ({ ...s, workflow_webhook_secret: e.target.value }))}
              placeholder="Leave blank to keep existing secret"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-xs text-gray-400 mt-1">Sent as <code>X-Internal-Webhook-Secret</code> header — set the same value in your n8n workflow.</p>
          </div>
          <button
            onClick={async () => {
              try {
                setIsSavingAutomation(true);
                const payload: any = { workflow_webhook_url: automationSettings.workflow_webhook_url };
                if (automationSettings.workflow_webhook_secret) payload.workflow_webhook_secret = automationSettings.workflow_webhook_secret;
                await apiClient.updateAutomationSettings(payload);
                setAutomationSettings(s => ({ ...s, workflow_webhook_secret: '' }));
                setAutomationNotice({ type: "success", message: "Automation settings saved." });
                setTimeout(() => setAutomationNotice(null), 3000);
              } catch (err: any) {
                setAutomationNotice({ type: "error", message: err?.response?.data?.error?.message || "Failed to save automation settings." });
              } finally {
                setIsSavingAutomation(false);
              }
            }}
            disabled={isSavingAutomation}
            className="px-5 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSavingAutomation ? "Saving…" : "Save Automation Settings"}
          </button>
        </div>
      </section>
    </div>
  );
}
