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

export const subscriptionPlans: SubscriptionPlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For new stores validating AI commerce.",
    monthlyPrice: 2900,
    yearlyPrice: 29000,
    limits: {
      conversations: 1500,
      orders: 500,
      products: 1000,
    },
    features: {
      image_understanding: true,
      advanced_ai: false,
      priority_support: false,
      custom_branding: false,
    },
    highlights: [
      "Up to 2 channels",
      "1,500 conversations / month",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    description: "For scaling teams that need automation.",
    monthlyPrice: 7900,
    yearlyPrice: 79000,
    limits: {
      conversations: 10000,
      orders: 2500,
      products: 5000,
    },
    features: {
      image_understanding: true,
      advanced_ai: true,
      priority_support: true,
      custom_branding: false,
    },
    highlights: [
      "Up to 6 channels",
      "10,000 conversations / month",
      "Advanced analytics",
      "Automations + workflows",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    description: "For mature commerce operations.",
    monthlyPrice: 17900,
    yearlyPrice: 179000,
    limits: {
      conversations: 50000,
      orders: 10000,
      products: 20000,
    },
    features: {
      image_understanding: true,
      advanced_ai: true,
      priority_support: true,
      custom_branding: true,
    },
    highlights: [
      "Unlimited channels",
      "50,000 conversations / month",
      "Dedicated success manager",
      "Custom integrations",
      "SLA + security reviews",
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
