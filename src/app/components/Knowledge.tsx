import { useState } from "react";
import { Upload, Bot, CheckCircle, Edit2, Trash2, AlertCircle, FileText, Building2, MessageCircle, TrendingUp, Plus } from "lucide-react";
import { mockBusinessInfo, mockBrandingRules, mockFAQs, mockKnowledgeGaps, FAQ, KnowledgeExtraction } from "../lib/knowledgeTypes";
import { eventBus, EVENTS } from "../lib/events";

export default function Knowledge() {
  const [activeTab, setActiveTab] = useState<'overview' | 'faqs' | 'business' | 'branding' | 'gaps'>('overview');
  const [faqs, setFaqs] = useState(mockFAQs);
  const [businessInfo, setBusinessInfo] = useState(mockBusinessInfo);
  const [brandingRules, setBrandingRules] = useState(mockBrandingRules);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedKnowledge, setExtractedKnowledge] = useState<KnowledgeExtraction | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [showFAQModal, setShowFAQModal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Emit event for file upload
    eventBus.emit(EVENTS.FILE_UPLOADED, { file: file.name });

    // Simulate AI extraction
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Simulate extracted knowledge
        const extracted: KnowledgeExtraction = {
          id: Date.now().toString(),
          fileName: file.name,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          status: 'review',
          confidence: 0.87,
          extractedData: {
            businessInfo: {
              openingHours: '10:00 AM - 8:00 PM (Mon-Sat)',
              deliveryAreas: ['Gulshan', 'Banani', 'Baridhara'],
            },
            faqs: [
              {
                id: Date.now().toString(),
                question: 'Do you offer same-day delivery?',
                answer: 'Yes, we offer same-day delivery for orders placed before 2:00 PM within Dhaka city.',
                category: 'Delivery',
                confidence: 0.91,
                source: file.name,
                active: false,
                usageCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: (Date.now() + 1).toString(),
                question: 'Can I track my order?',
                answer: 'Yes, you will receive a tracking link via SMS once your order is dispatched.',
                category: 'Order Tracking',
                confidence: 0.88,
                source: file.name,
                active: false,
                usageCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            branding: {
              tone: 'friendly',
              emojiUsage: 'moderate',
              greetingStyle: 'Hello! Welcome to Fresh Mart Express! 🛒',
            },
          },
        };

        setExtractedKnowledge(extracted);
        setShowReviewModal(true);
        setShowUploadModal(false);
        setUploadProgress(0);
      }
    }, 300);
  };

  const handleApproveFAQ = (faq: FAQ) => {
    const activeFAQ = { ...faq, active: true };
    setFaqs([...faqs, activeFAQ]);
    eventBus.emit(EVENTS.PRODUCT_APPROVED, { faq: activeFAQ });
    
    if (extractedKnowledge?.extractedData.faqs) {
      setExtractedKnowledge({
        ...extractedKnowledge,
        extractedData: {
          ...extractedKnowledge.extractedData,
          faqs: extractedKnowledge.extractedData.faqs.filter(f => f.id !== faq.id),
        },
      });
    }
  };

  const handleApproveAll = () => {
    if (extractedKnowledge) {
      // Approve FAQs
      if (extractedKnowledge.extractedData.faqs) {
        const newFAQs = extractedKnowledge.extractedData.faqs.map(faq => ({ ...faq, active: true }));
        setFaqs([...faqs, ...newFAQs]);
      }
      
      // Update business info
      if (extractedKnowledge.extractedData.businessInfo) {
        setBusinessInfo({ ...businessInfo, ...extractedKnowledge.extractedData.businessInfo });
      }
      
      // Update branding
      if (extractedKnowledge.extractedData.branding) {
        setBrandingRules({ ...brandingRules, ...extractedKnowledge.extractedData.branding });
      }
      
      setShowReviewModal(false);
      setExtractedKnowledge(null);
    }
  };

  const handleDeleteFAQ = (faqId: string) => {
    setFaqs(faqs.filter(f => f.id !== faqId));
  };

  const handleToggleFAQ = (faqId: string) => {
    setFaqs(faqs.map(f => f.id === faqId ? { ...f, active: !f.active } : f));
  };

  const totalKnowledge = faqs.filter(f => f.active).length + 
    (businessInfo.shopName ? 1 : 0) + 
    (brandingRules.tone ? 1 : 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Knowledge Training</h1>
          <p className="text-gray-600 mt-1">Train your AI with business information and FAQs</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Upload className="w-5 h-5" />
            Upload Knowledge
          </button>
          <button
            onClick={() => {
              setEditingFAQ({
                id: Date.now().toString(),
                question: '',
                answer: '',
                category: '',
                confidence: 1.0,
                source: 'manual',
                active: true,
                usageCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              setShowFAQModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add FAQ
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalKnowledge}</p>
              <p className="text-sm text-gray-600">Active Knowledge</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{faqs.filter(f => f.active).length}</p>
              <p className="text-sm text-gray-600">Active FAQs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {faqs.reduce((sum, faq) => sum + faq.usageCount, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Answers Used</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockKnowledgeGaps.length}</p>
              <p className="text-sm text-gray-600">Knowledge Gaps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'faqs', label: 'FAQs', icon: MessageCircle },
              { id: 'business', label: 'Business Info', icon: Building2 },
              { id: 'branding', label: 'Branding', icon: Bot },
              { id: 'gaps', label: 'Knowledge Gaps', icon: AlertCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-start gap-4">
                  <Bot className="w-12 h-12 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How AI Knowledge Training Works</h3>
                    <p className="text-gray-700 mb-4">
                      Upload documents about your business, and our AI will extract FAQs, business information, 
                      and branding guidelines. You review and approve before anything goes live.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded-full text-sm">
                        Supported: PDF, DOC, TXT, MD
                      </span>
                      <span className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded-full text-sm">
                        AI Confidence: 85-98%
                      </span>
                      <span className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded-full text-sm">
                        Manual Override: Always Available
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Most Used FAQs</h3>
                  <div className="space-y-3">
                    {faqs
                      .filter(f => f.active)
                      .sort((a, b) => b.usageCount - a.usageCount)
                      .slice(0, 5)
                      .map((faq) => (
                        <div key={faq.id} className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{faq.question}</p>
                            <p className="text-xs text-gray-500">{faq.usageCount} times used</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {Math.round(faq.confidence * 100)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Knowledge Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Business Info</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Branding Rules</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active FAQs</span>
                      <span className="text-gray-900 font-semibold">{faqs.filter(f => f.active).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Inactive FAQs</span>
                      <span className="text-gray-500">{faqs.filter(f => !f.active).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Manage FAQs</h3>
                <span className="text-sm text-gray-600">
                  {faqs.filter(f => f.active).length} active / {faqs.length} total
                </span>
              </div>
              
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`border-2 rounded-lg p-4 transition-colors ${
                      faq.active ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{faq.question}</h4>
                          <span className={`px-2 py-1 text-xs rounded ${
                            faq.confidence >= 0.9
                              ? 'bg-green-100 text-green-700'
                              : faq.confidence >= 0.8
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {Math.round(faq.confidence * 100)}% confidence
                          </span>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                            {faq.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{faq.answer}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Source: {faq.source}</span>
                          <span>Used {faq.usageCount} times</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleToggleFAQ(faq.id)}
                          className={`px-3 py-1 text-xs rounded ${
                            faq.active
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                        >
                          {faq.active ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingFAQ(faq);
                            setShowFAQModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Info Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Areas</label>
                <input
                  type="text"
                  value={businessInfo.deliveryAreas.join(', ')}
                  onChange={(e) => setBusinessInfo({ 
                    ...businessInfo, 
                    deliveryAreas: e.target.value.split(',').map(s => s.trim()) 
                  })}
                  placeholder="Dhanmondi, Lalmatia, Mohammadpur"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Methods</label>
                <input
                  type="text"
                  value={businessInfo.paymentMethods.join(', ')}
                  onChange={(e) => setBusinessInfo({ 
                    ...businessInfo, 
                    paymentMethods: e.target.value.split(',').map(s => s.trim()) 
                  })}
                  placeholder="Cash, bKash, Card"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone of Voice</label>
                <select
                  value={brandingRules.tone}
                  onChange={(e) => setBrandingRules({ ...brandingRules, tone: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                  <option value="casual">Casual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emoji Usage</label>
                <select
                  value={brandingRules.emojiUsage}
                  onChange={(e) => setBrandingRules({ ...brandingRules, emojiUsage: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="light">Light (1-2 per message)</option>
                  <option value="moderate">Moderate (3-4 per message)</option>
                  <option value="heavy">Heavy (5+ per message)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Greeting Style</label>
                <input
                  type="text"
                  value={brandingRules.greetingStyle}
                  onChange={(e) => setBrandingRules({ ...brandingRules, greetingStyle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hi! How can I help you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Closing Style</label>
                <input
                  type="text"
                  value={brandingRules.closingStyle}
                  onChange={(e) => setBrandingRules({ ...brandingRules, closingStyle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Thank you!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forbidden Phrases (comma separated)</label>
                <input
                  type="text"
                  value={brandingRules.forbiddenPhrases.join(', ')}
                  onChange={(e) => setBrandingRules({ 
                    ...brandingRules, 
                    forbiddenPhrases: e.target.value.split(',').map(s => s.trim()) 
                  })}
                  placeholder="maybe, I think, not sure"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Preview</h4>
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <p className="text-gray-900">{brandingRules.greetingStyle}</p>
                  <p className="text-gray-700">
                    We're located at {businessInfo.address}. Our opening hours are {businessInfo.openingHours}.
                  </p>
                  <p className="text-gray-900">{brandingRules.closingStyle}</p>
                </div>
              </div>

              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          )}

          {/* Knowledge Gaps Tab */}
          {activeTab === 'gaps' && (
            <div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Unanswered Questions</h3>
                <p className="text-sm text-gray-600">
                  These questions were asked by customers but don't have answers in your knowledge base.
                </p>
              </div>

              <div className="space-y-4">
                {mockKnowledgeGaps.map((gap) => (
                  <div key={gap.id} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{gap.question}</h4>
                          <span className="px-2 py-1 bg-orange-200 text-orange-700 text-xs rounded">
                            Asked {gap.frequency} times
                          </span>
                        </div>
                        {gap.suggestedAnswer && (
                          <div className="bg-white rounded-lg p-3 border border-orange-200">
                            <p className="text-sm text-gray-600 mb-1">AI Suggested Answer:</p>
                            <p className="text-sm text-gray-900">{gap.suggestedAnswer}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Confidence: {Math.round(gap.confidence * 100)}%
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          First asked: {new Date(gap.firstAsked).toLocaleDateString()} • 
                          Last asked: {new Date(gap.lastAsked).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (gap.suggestedAnswer) {
                            setEditingFAQ({
                              id: Date.now().toString(),
                              question: gap.question,
                              answer: gap.suggestedAnswer,
                              category: 'General',
                              confidence: gap.confidence,
                              source: 'ai-suggestion',
                              active: true,
                              usageCount: 0,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                            });
                            setShowFAQModal(true);
                          }
                        }}
                        disabled={!gap.suggestedAnswer}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Create FAQ
                      </button>
                      <button className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Knowledge Document</h2>
            <p className="text-gray-600 mb-6">
              Upload documents containing FAQs, business info, or branding guidelines
            </p>

            {uploadProgress === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Drag and drop or click to upload</p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.md"
                  className="hidden"
                  id="knowledge-upload"
                />
                <label
                  htmlFor="knowledge-upload"
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
                >
                  Choose File
                </label>
                <p className="text-sm text-gray-500 mt-4">
                  Supported: PDF, DOC, DOCX, TXT, MD
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>AI Extracting Knowledge...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Bot className="w-4 h-4 animate-pulse" />
                  <span>Analyzing FAQs, business info, and branding...</span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowUploadModal(false);
                setUploadProgress(0);
              }}
              className="mt-6 w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Review Extracted Knowledge Modal */}
      {showReviewModal && extractedKnowledge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 my-8">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Review Extracted Knowledge</h2>
                <p className="text-gray-600">
                  From: {extractedKnowledge.fileName} • 
                  Confidence: {Math.round(extractedKnowledge.confidence * 100)}%
                </p>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-6">
              {/* Extracted FAQs */}
              {extractedKnowledge.extractedData.faqs && extractedKnowledge.extractedData.faqs.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Extracted FAQs</h3>
                  <div className="space-y-3">
                    {extractedKnowledge.extractedData.faqs.map((faq) => (
                      <div key={faq.id} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{faq.question}</h4>
                              <span className="px-2 py-1 bg-purple-200 text-purple-700 text-xs rounded">
                                {Math.round(faq.confidence * 100)}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{faq.answer}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingFAQ(faq);
                              setShowFAQModal(true);
                            }}
                            className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded text-sm hover:bg-purple-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleApproveFAQ(faq)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Business Info */}
              {extractedKnowledge.extractedData.businessInfo && (
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Extracted Business Info</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(extractedKnowledge.extractedData.businessInfo).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-gray-900 font-medium">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Branding */}
              {extractedKnowledge.extractedData.branding && (
                <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Extracted Branding Rules</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(extractedKnowledge.extractedData.branding).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-gray-900 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setExtractedKnowledge(null);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveAll}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Edit/Create Modal */}
      {showFAQModal && editingFAQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingFAQ.source === 'manual' && !faqs.find(f => f.id === editingFAQ.id) ? 'Add New FAQ' : 'Edit FAQ'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <input
                  type="text"
                  value={editingFAQ.question}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What is your question?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                <textarea
                  value={editingFAQ.answer}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your answer here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={editingFAQ.category}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Delivery, Payment, Policy"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowFAQModal(false);
                  setEditingFAQ(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (faqs.find(f => f.id === editingFAQ.id)) {
                    setFaqs(faqs.map(f => f.id === editingFAQ.id ? editingFAQ : f));
                  } else {
                    setFaqs([...faqs, editingFAQ]);
                  }
                  setShowFAQModal(false);
                  setEditingFAQ(null);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
