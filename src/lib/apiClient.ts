// src/lib/apiClient.ts

// Example implementation, replace with your actual API logic

// Mock channels for WhatsApp and Instagram, Facebook will use OAuth
const mockChannels = [
  {
    id: "facebook",
    name: "Facebook Page",
    type: "facebook",
    connected: false,
    status: "not_connected",
    config: {},
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    type: "whatsapp",
    connected: false,
    status: "not_connected",
    config: {},
  },
  {
    id: "instagram",
    name: "Instagram",
    type: "instagram",
    connected: false,
    status: "not_connected",
    config: {},
  },
];

const apiClient = {
  async getChannels() {
    // Simulate async fetch
    return Promise.resolve(mockChannels);
  },
  async connectChannel(payload) {
    // Facebook: Simulate OAuth redirect
    if (payload.type === "facebook") {
      // Redirect to Facebook OAuth with App ID from env
      const appId = import.meta.env.VITE_META_APP_ID;
      const redirectUri = window.location.origin + window.location.pathname + "?fb_oauth=1";
      window.location.href = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_messaging`;
      return { success: true };
    }
    // WhatsApp/Instagram: Mock connect
    return { success: true };
  },
  async disconnectChannel(id) {
    // Mock disconnect
    return { success: true };
  },
};

export default apiClient;
