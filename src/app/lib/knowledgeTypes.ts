// Knowledge types for AI training
export interface BusinessInfo {
  shopName: string;
  address: string;
  location?: string;
  phone: string;
  whatsapp?: string;
  openingHours: string;
  deliveryAreas: string[];
  paymentMethods: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  confidence: number;
  source: string;
  active: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrandingRules {
  tone: 'formal' | 'friendly' | 'casual';
  languagePreference: string;
  emojiUsage: 'none' | 'light' | 'moderate' | 'heavy';
  forbiddenPhrases: string[];
  greetingStyle: string;
  closingStyle: string;
}

export interface KnowledgeExtraction {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  status: 'processing' | 'review' | 'approved' | 'rejected';
  extractedData: {
    businessInfo?: Partial<BusinessInfo>;
    faqs?: FAQ[];
    branding?: Partial<BrandingRules>;
  };
  confidence: number;
  errors?: string[];
}

export interface KnowledgeGap {
  id: string;
  question: string;
  frequency: number;
  suggestedAnswer?: string;
  confidence: number;
  firstAsked: string;
  lastAsked: string;
}

// Mock data for business knowledge
export const mockBusinessInfo: BusinessInfo = {
  shopName: 'Fresh Mart Express',
  address: 'Dhanmondi 27, Road 16, Dhaka 1209',
  location: 'https://maps.google.com/...',
  phone: '+880 1712-345678',
  whatsapp: '+880 1712-345678',
  openingHours: '9:00 AM - 9:00 PM (Daily)',
  deliveryAreas: ['Dhanmondi', 'Lalmatia', 'Mohammadpur', 'New Market'],
  paymentMethods: ['Cash on Delivery', 'bKash', 'Nagad', 'Card'],
};

export const mockBrandingRules: BrandingRules = {
  tone: 'friendly',
  languagePreference: 'English',
  emojiUsage: 'light',
  forbiddenPhrases: ['maybe', 'I think', 'not sure'],
  greetingStyle: 'Hi there! 😊 How can I help you today?',
  closingStyle: 'Thank you for choosing us! Have a great day! 🌟',
};

export const mockFAQs: FAQ[] = [
  {
    id: '1',
    question: 'Where are you located?',
    answer: 'We are located at Dhanmondi 27, Road 16, Dhaka 1209. You can find us on Google Maps.',
    category: 'Location',
    confidence: 0.96,
    source: 'about-us.pdf',
    active: true,
    usageCount: 45,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    question: 'What are your delivery hours?',
    answer: 'We deliver from 10:00 AM to 8:00 PM daily. Orders placed after 7:00 PM will be delivered the next day.',
    category: 'Delivery',
    confidence: 0.92,
    source: 'delivery-policy.pdf',
    active: true,
    usageCount: 67,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery, bKash, Nagad, and all major credit/debit cards.',
    category: 'Payment',
    confidence: 0.98,
    source: 'payment-info.txt',
    active: true,
    usageCount: 89,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '4',
    question: 'What is your return policy?',
    answer: 'We accept returns within 24 hours if the product is damaged or defective. Please contact us immediately with photos.',
    category: 'Policy',
    confidence: 0.89,
    source: 'return-policy.pdf',
    active: true,
    usageCount: 34,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '5',
    question: 'Is there a minimum order amount?',
    answer: 'Yes, our minimum order amount is 500 Taka for free delivery. Orders below 500 Taka have a 50 Taka delivery charge.',
    category: 'Policy',
    confidence: 0.94,
    source: 'pricing-policy.pdf',
    active: true,
    usageCount: 56,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
];

export const mockKnowledgeGaps: KnowledgeGap[] = [
  {
    id: '1',
    question: 'Do you offer bulk discounts?',
    frequency: 12,
    suggestedAnswer: 'Based on pricing patterns, consider: "Yes, we offer 10% discount on orders above 5000 Taka."',
    confidence: 0.73,
    firstAsked: '2024-01-15T10:00:00Z',
    lastAsked: '2024-01-17T15:30:00Z',
  },
  {
    id: '2',
    question: 'Can I schedule delivery for tomorrow?',
    frequency: 8,
    confidence: 0.68,
    firstAsked: '2024-01-16T09:00:00Z',
    lastAsked: '2024-01-17T14:20:00Z',
  },
  {
    id: '3',
    question: 'Do you deliver to Uttara?',
    frequency: 15,
    suggestedAnswer: 'Uttara is not in the current delivery areas list. Consider adding it or clarifying delivery zones.',
    confidence: 0.81,
    firstAsked: '2024-01-14T11:00:00Z',
    lastAsked: '2024-01-17T16:45:00Z',
  },
];
