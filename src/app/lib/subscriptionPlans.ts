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
    id: "starter",
    name: "Starter",
    description: "আপনার প্রথম AI সেলস টিম — ঘুমের মধ্যেও অর্ডার আসবে।",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    limits: {
      conversations: UNLIMITED,
      orders: UNLIMITED,
      products: UNLIMITED,
    },
    features: {
      image_understanding: false,
      advanced_ai: false,
      priority_support: true,
      custom_branding: false,
    },
    highlights: [
      "AI Inbox + RTO Shield",
      "কমেন্ট থেকে অটো-রিপ্লাই",
      "1 Facebook চ্যানেল",
      "অগ্রাধিকার সাপোর্ট",
      "গ্রাহক যাত্রা ট্র্যাক করুন",
    ],
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    description: "সব চ্যানেলে 500+ অর্ডার পরিচালনা করুন প্রতি সপ্তাহে।",
    monthlyPrice: 1499,
    yearlyPrice: 14990,
    limits: {
      conversations: UNLIMITED,
      orders: UNLIMITED,
      products: UNLIMITED,
    },
    features: {
      image_understanding: true,
      advanced_ai: true,
      priority_support: true,
      custom_branding: false,
    },
    highlights: [
      "Auto-Reply + Broadcast",
      "3টি চ্যানেল অন্তর্ভুক্ত (FB, IG, WA)",
      "অতিরিক্ত চ্যানেল ৳200/মাস",
      "Advanced RTO Shield",
      "বিস্তৃত Analytics",
    ],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    description: "প্রফেশনাল মার্চেন্টদের জন্য সব টুলস ও সব চ্যানেল আনলিমিটেড।",
    monthlyPrice: 3499,
    yearlyPrice: 34990,
    limits: {
      conversations: UNLIMITED,
      orders: UNLIMITED,
      products: UNLIMITED,
    },
    features: {
      image_understanding: true,
      advanced_ai: true,
      priority_support: true,
      custom_branding: false,
    },
    highlights: [
      "সব চ্যানেল আনলিমিটেড",
      "API অ্যাক্সেস + Catalog Sync",
      "অ্যাডভান্সড Tone Control",
      "Customer Journey Timeline",
      "নতুন ফিচারে অগ্রাধিকার অ্যাক্সেস",
      "প্রায়রিটি সাপোর্ট",
    ],
  },
  {
    id: "partner",
    name: "Partner",
    description: "শুরু করুন বিনামূল্যে। আমরা শুধু সফল অর্ডারে শেয়ার নিই।",
    monthlyPrice: 0,
    yearlyPrice: 0,
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
      "Zero মাসিক ফি",
      "প্রতিটি ডেলিভারি অর্ডারে মাত্র ৳22",
      "রিটার্ন/RTO অর্ডারে চার্জ নেই",
      "সব ফিচার আনলিমিটেড",
      "সাপ্তাহিক চালান + 14 দিনের পেমেন্ট উইন্ডো",
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
