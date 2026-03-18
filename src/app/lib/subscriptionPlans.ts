export type BillingCycle = "monthly" | "yearly";

export interface SubscriptionPlanDefinition {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: {
    conversations: number;
    orders: number;
    products: number;
  };
  features: {
    image_understanding: boolean;
    advanced_ai: boolean;
    priority_support: boolean;
    custom_branding: boolean;
  };
  highlights: string[];
  popular?: boolean;
}

// -1 means unlimited
export const UNLIMITED = -1;

export const subscriptionPlans: SubscriptionPlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    description: "নতুন শপের জন্য বেসিক AI চ্যাট।",
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: {
      conversations: 100,
      orders: 50,
      products: 100,
    },
    features: {
      image_understanding: false,
      advanced_ai: false,
      priority_support: false,
      custom_branding: false,
    },
    highlights: [
      "১০০ AI কথোপকথন / মাস",
      "৫০ অর্ডার / মাস",
      "বেসিক AI চ্যাট",
      "১ চ্যানেল",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    description: "বড় হওয়া শপের জন্য RTO Shield ও Pathao ইন্টিগ্রেশন।",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    limits: {
      conversations: 1000,
      orders: 500,
      products: 1000,
    },
    features: {
      image_understanding: true,
      advanced_ai: true,
      priority_support: false,
      custom_branding: false,
    },
    highlights: [
      "১,০০০ AI কথোপকথন / মাস",
      "৫০০ অর্ডার / মাস",
      "RTO Shield সুরক্ষা",
      "Pathao ডেলিভারি ইন্টিগ্রেশন",
      "ইমেজ আন্ডারস্ট্যান্ডিং",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "সব চ্যানেল ও অ্যানালিটিক্স সহ প্রফেশনাল সমাধান।",
    monthlyPrice: 2499,
    yearlyPrice: 24990,
    limits: {
      conversations: 5000,
      orders: 2000,
      products: 5000,
    },
    features: {
      image_understanding: true,
      advanced_ai: true,
      priority_support: true,
      custom_branding: false,
    },
    highlights: [
      "৫,০০০ AI কথোপকথন / মাস",
      "২,০০০ অর্ডার / মাস",
      "সব চ্যানেল (FB, IG, WhatsApp)",
      "অ্যাডভান্সড অ্যানালিটিক্স",
      "প্রায়রিটি সাপোর্ট",
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "বড় ব্যবসার জন্য White-label ও API অ্যাক্সেস।",
    monthlyPrice: 5999,
    yearlyPrice: 59990,
    limits: {
      conversations: UNLIMITED,
      orders: UNLIMITED,
      products: UNLIMITED,
    },
    features: {
      image_understanding: true,
      advanced_ai: true,
      priority_support: true,
      custom_branding: true,
    },
    highlights: [
      "আনলিমিটেড কথোপকথন",
      "আনলিমিটেড অর্ডার",
      "White-label ব্র্যান্ডিং",
      "API অ্যাক্সেস",
      "ডেডিকেটেড সাপোর্ট ম্যানেজার",
    ],
  },
];

export const findPlanByName = (name: string) =>
  subscriptionPlans.find(
    (plan) => plan.name.toLowerCase() === name.toLowerCase()
  );

export const getPlanPrice = (
  plan: SubscriptionPlanDefinition,
  billingCycle: BillingCycle
) => (billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice);
