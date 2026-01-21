import { useState } from "react";
import { Plus, History, Package, Edit3, Sparkles, Facebook, Instagram, SquarePlay, Image as ImageIcon, Check, Calendar, Send, RotateCcw, Save, X, Hash, Type, Video } from "lucide-react";
import { mockProducts, Product } from "../lib/mockData";

interface ContentType {
  id: string;
  name: string;
  icon: any;
  description: string;
}

interface GeneratedContent {
  id: string;
  platform: string;
  caption: string;
  hashtags?: string[];
  cta?: string;
  hook?: string;
  scenes?: string[];
  onScreenText?: string[];
}

interface SocialPost {
  id: string;
  productId: string;
  productName: string;
  contentTypes: string[];
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string;
  publishedAt?: string;
  content: GeneratedContent[];
}

const contentTypes: ContentType[] = [
  { id: 'facebook', name: 'Facebook Post', icon: Facebook, description: 'Standard post with image and caption' },
  { id: 'instagram', name: 'Instagram Post', icon: Instagram, description: 'Feed post with hashtags' },
  { id: 'reel', name: 'Instagram Reel', icon: SquarePlay, description: 'Short video script with scenes' },
  { id: 'carousel', name: 'Carousel', icon: ImageIcon, description: 'Multiple images with captions' },
];

export default function SocialContent() {
  const [currentView, setCurrentView] = useState<'entry' | 'create' | 'history'>('entry');
  const [step, setStep] = useState(1);
  
  // Product selection state
  const [productSource, setProductSource] = useState<'existing' | 'new' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProductData, setNewProductData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: null as File | null,
  });
  const [saveNewProduct, setSaveNewProduct] = useState(false);
  
  // Content type selection
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  
  // Generated content state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [activeTab, setActiveTab] = useState<string>('facebook');
  
  // Publishing state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishAction, setPublishAction] = useState<'draft' | 'schedule' | 'publish' | null>(null);
  
  // History state
  const [contentHistory, setContentHistory] = useState<SocialPost[]>([
    {
      id: '1',
      productId: '1',
      productName: 'Premium Water Bottle 5L',
      contentTypes: ['facebook', 'instagram'],
      platforms: ['Facebook', 'Instagram'],
      status: 'published',
      createdAt: '2024-01-15T10:30:00Z',
      publishedAt: '2024-01-15T14:00:00Z',
      content: [],
    },
    {
      id: '2',
      productId: '2',
      productName: 'Organic Coffee Beans 500g',
      contentTypes: ['instagram', 'reel'],
      platforms: ['Instagram'],
      status: 'scheduled',
      createdAt: '2024-01-16T09:00:00Z',
      content: [],
    },
    {
      id: '3',
      productId: '3',
      productName: 'Artisan Chocolate Bar',
      contentTypes: ['facebook'],
      platforms: ['Facebook'],
      status: 'draft',
      createdAt: '2024-01-17T11:00:00Z',
      content: [],
    },
  ]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleContentTypeToggle = (typeId: string) => {
    setSelectedContentTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleGenerateContent = () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const product = selectedProduct || {
        name: newProductData.name,
        price: parseFloat(newProductData.price),
        category: newProductData.category,
      };
      
      const generated: GeneratedContent[] = [];
      
      if (selectedContentTypes.includes('facebook')) {
        generated.push({
          id: 'fb-' + Date.now(),
          platform: 'facebook',
          caption: `✨ Introducing ${product.name}! ✨\n\nPerfect for ${product.category.toLowerCase()} lovers everywhere! Get yours today for just $${product.price}.\n\nLimited stock available - order now!\n\n#${product.category} #Quality #ShopNow`,
          cta: 'Shop Now',
        });
      }
      
      if (selectedContentTypes.includes('instagram')) {
        generated.push({
          id: 'ig-' + Date.now(),
          platform: 'instagram',
          caption: `✨ New Arrival Alert ✨\n\n${product.name} is here! \n\nSwipe to see why everyone's talking about it 👉\n\nPrice: $${product.price} 💫`,
          hashtags: ['NewArrival', product.category, 'ShopLocal', 'QualityProducts', 'InstaShop', 'MustHave'],
        });
      }
      
      if (selectedContentTypes.includes('reel')) {
        generated.push({
          id: 'reel-' + Date.now(),
          platform: 'reel',
          caption: `The ${product.name} you've been waiting for! 🎉`,
          hook: `POV: You just discovered the perfect ${product.category.toLowerCase()}`,
          scenes: [
            'Open with close-up of product',
            'Show product in use',
            'Highlight key features',
            'Price reveal with CTA',
          ],
          onScreenText: [
            'Wait for it...',
            'The secret everyone\'s asking about',
            `${product.name}`,
            'Get yours now! →',
          ],
          hashtags: ['Reels', product.category, 'ProductReview', 'MustWatch'],
        });
      }
      
      if (selectedContentTypes.includes('carousel')) {
        generated.push({
          id: 'carousel-' + Date.now(),
          platform: 'carousel',
          caption: `Discover ${product.name} - Swipe to learn more! →\n\n1️⃣ Premium Quality\n2️⃣ Affordable Price: $${product.price}\n3️⃣ Fast Delivery\n4️⃣ Customer Favorite\n\nReady to order? Link in bio! 🛒`,
          hashtags: [product.category, 'Shopping', 'Quality', 'BestPrice'],
        });
      }
      
      setGeneratedContent(generated);
      setActiveTab(generated[0]?.platform || 'facebook');
      setIsGenerating(false);
      setStep(3);
    }, 2000);
  };

  const handlePublish = () => {
    const product = selectedProduct || {
      id: Date.now().toString(),
      name: newProductData.name,
      price: parseFloat(newProductData.price),
    };
    
    const newPost: SocialPost = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      contentTypes: selectedContentTypes,
      platforms: selectedPlatforms,
      status: publishAction === 'publish' ? 'published' : publishAction === 'schedule' ? 'scheduled' : 'draft',
      createdAt: new Date().toISOString(),
      publishedAt: publishAction === 'publish' ? new Date().toISOString() : undefined,
      content: generatedContent,
    };
    
    setContentHistory([newPost, ...contentHistory]);
    setShowPublishModal(false);
    setCurrentView('history');
    
    // Reset state
    resetState();
  };

  const resetState = () => {
    setStep(1);
    setProductSource(null);
    setSelectedProduct(null);
    setNewProductData({ name: '', price: '', category: '', description: '', image: null });
    setSelectedContentTypes([]);
    setGeneratedContent([]);
    setSelectedPlatforms([]);
  };

  const handleEditContent = (platform: string, field: string, value: any) => {
    setGeneratedContent(prev =>
      prev.map(content =>
        content.platform === platform
          ? { ...content, [field]: value }
          : content
      )
    );
  };

  const renderEntryScreen = () => (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Social Media Content</h1>
        <p className="text-gray-600 mt-1">Generate engaging social media posts for your products with AI</p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-4xl">
        <button
          onClick={() => {
            setCurrentView('create');
            setStep(1);
          }}
          className="group bg-white rounded-xl border-2 border-gray-200 p-8 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Content</h3>
          <p className="text-gray-600">Generate new social media posts for your products using AI</p>
        </button>

        <button
          onClick={() => setCurrentView('history')}
          className="group bg-white rounded-xl border-2 border-gray-200 p-8 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <History className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">View Content History</h3>
          <p className="text-gray-600">Review and manage all your published and draft content</p>
        </button>
      </div>
    </div>
  );

  const renderCreateFlow = () => (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => {
            setCurrentView('entry');
            resetState();
          }}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create Product Content</h1>
        <p className="text-gray-600 mt-1">Follow the steps to generate social media content</p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-4 max-w-3xl">
          {[
            { num: 1, label: 'Product' },
            { num: 2, label: 'Content Type' },
            { num: 3, label: 'Review & Edit' },
            { num: 4, label: 'Publish' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className={`flex items-center gap-3 flex-1 ${idx > 0 ? 'ml-4' : ''}`}>
                {idx > 0 && (
                  <div className={`flex-1 h-1 ${step > s.num - 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
                <div className={`flex items-center gap-2 ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step > s.num ? 'bg-blue-600 text-white' :
                    step === s.num ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">{s.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-5xl">
        {step === 1 && renderProductSelection()}
        {step === 2 && renderContentTypeSelection()}
        {step === 3 && renderContentReview()}
        {step === 4 && renderPublishOptions()}
      </div>
    </div>
  );

  const renderProductSelection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Product Source</h2>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <button
          onClick={() => setProductSource('existing')}
          className={`border-2 rounded-lg p-6 text-left transition-all ${
            productSource === 'existing'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Package className={`w-6 h-6 ${productSource === 'existing' ? 'text-blue-600' : 'text-gray-400'}`} />
            <h3 className="font-semibold text-gray-900">Use Existing Product</h3>
          </div>
          <p className="text-sm text-gray-600">Select from your product catalog</p>
        </button>

        <button
          onClick={() => setProductSource('new')}
          className={`border-2 rounded-lg p-6 text-left transition-all ${
            productSource === 'new'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Edit3 className={`w-6 h-6 ${productSource === 'new' ? 'text-blue-600' : 'text-gray-400'}`} />
            <h3 className="font-semibold text-gray-900">Create New Product</h3>
          </div>
          <p className="text-sm text-gray-600">Manually enter product details</p>
        </button>
      </div>

      {productSource === 'existing' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
          <select
            value={selectedProduct?.id || ''}
            onChange={(e) => {
              const product = mockProducts.find(p => p.id === e.target.value);
              handleProductSelect(product!);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a product...</option>
            {mockProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ${product.price}
              </option>
            ))}
          </select>
          
          {selectedProduct && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">SKU: {selectedProduct.sku}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-lg font-semibold text-blue-600">${selectedProduct.price}</span>
                    <span className="text-sm text-gray-500">{selectedProduct.category}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {productSource === 'new' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              value={newProductData.name}
              onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
              placeholder="Enter product name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
              <input
                type="number"
                value={newProductData.price}
                onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <input
                type="text"
                value={newProductData.category}
                onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })}
                placeholder="e.g., Beverages"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newProductData.description}
              onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
              placeholder="Enter product description (optional)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Click to upload image</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewProductData({ ...newProductData, image: e.target.files?.[0] || null })}
                className="hidden"
                id="product-image"
              />
              <label
                htmlFor="product-image"
                className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer text-sm"
              >
                Choose File
              </label>
              {newProductData.image && (
                <p className="text-sm text-gray-600 mt-2">{newProductData.image.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              checked={saveNewProduct}
              onChange={(e) => setSaveNewProduct(e.target.checked)}
              id="save-product"
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="save-product" className="text-sm text-gray-700">
              Save this product to catalog for future use
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => setStep(2)}
          disabled={!selectedProduct && (!newProductData.name || !newProductData.price || !newProductData.category)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Next: Select Content Type
          <span>→</span>
        </button>
      </div>
    </div>
  );

  const renderContentTypeSelection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Content Types</h2>
      <p className="text-sm text-gray-600 mb-6">Choose one or more content types to generate</p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedContentTypes.includes(type.id);
          
          return (
            <button
              key={type.id}
              onClick={() => handleContentTypeToggle(type.id)}
              className={`border-2 rounded-lg p-6 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                </div>
                {isSelected && <Check className="w-5 h-5 text-blue-600" />}
              </div>
              <p className="text-sm text-gray-600">{type.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <p className="text-sm text-gray-700">
          AI will generate customized content for each selected type based on your product
        </p>
      </div>

      <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={handleGenerateContent}
          disabled={selectedContentTypes.length === 0}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Generate Content with AI
        </button>
      </div>
    </div>
  );

  const renderContentReview = () => {
    if (isGenerating) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Content...</h3>
          <p className="text-gray-600">AI is creating engaging social media posts for your product</p>
        </div>
      );
    }

    const currentContent = generatedContent.find(c => c.platform === activeTab);
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Review & Edit Content</h2>
              <div className="flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <p className="text-sm text-purple-600">AI-generated content - editable</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 -mb-6">
            {generatedContent.map((content) => {
              const type = contentTypes.find(t => t.id === content.platform);
              const Icon = type?.icon || Facebook;
              
              return (
                <button
                  key={content.id}
                  onClick={() => setActiveTab(content.platform)}
                  className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === content.platform
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type?.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {currentContent && (
            <div className="grid grid-cols-2 gap-6">
              {/* Edit Section */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Caption</label>
                    <button
                      onClick={handleGenerateContent}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Regenerate
                    </button>
                  </div>
                  <textarea
                    value={currentContent.caption}
                    onChange={(e) => handleEditContent(activeTab, 'caption', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>

                {currentContent.platform === 'facebook' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action</label>
                    <input
                      type="text"
                      value={currentContent.cta || ''}
                      onChange={(e) => handleEditContent(activeTab, 'cta', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {(currentContent.platform === 'instagram' || currentContent.platform === 'reel' || currentContent.platform === 'carousel') && currentContent.hashtags && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="w-4 h-4 inline mr-1" />
                      Hashtags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {currentContent.hashtags.map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          #{tag}
                          <button
                            onClick={() => {
                              const newTags = currentContent.hashtags!.filter((_, i) => i !== idx);
                              handleEditContent(activeTab, 'hashtags', newTags);
                            }}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add hashtag (press Enter)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          const newTag = e.currentTarget.value.replace('#', '');
                          handleEditContent(activeTab, 'hashtags', [...(currentContent.hashtags || []), newTag]);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                    />
                  </div>
                )}

                {currentContent.platform === 'reel' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hook</label>
                      <input
                        type="text"
                        value={currentContent.hook || ''}
                        onChange={(e) => handleEditContent(activeTab, 'hook', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Video className="w-4 h-4 inline mr-1" />
                        Scenes
                      </label>
                      <div className="space-y-2">
                        {currentContent.scenes?.map((scene, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 w-8">{idx + 1}.</span>
                            <input
                              type="text"
                              value={scene}
                              onChange={(e) => {
                                const newScenes = [...(currentContent.scenes || [])];
                                newScenes[idx] = e.target.value;
                                handleEditContent(activeTab, 'scenes', newScenes);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Type className="w-4 h-4 inline mr-1" />
                        On-Screen Text
                      </label>
                      <div className="space-y-2">
                        {currentContent.onScreenText?.map((text, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={text}
                            onChange={(e) => {
                              const newText = [...(currentContent.onScreenText || [])];
                              newText[idx] = e.target.value;
                              handleEditContent(activeTab, 'onScreenText', newText);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Preview Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  {/* Mock social media preview */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"></div>
                      <div>
                        <div className="font-semibold text-sm">Your Business</div>
                        <div className="text-xs text-gray-500">Just now</div>
                      </div>
                    </div>
                    
                    {/* Image placeholder */}
                    <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-3 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    
                    {/* Caption */}
                    <div className="text-sm whitespace-pre-wrap mb-2">{currentContent.caption}</div>
                    
                    {/* Hashtags */}
                    {currentContent.hashtags && currentContent.hashtags.length > 0 && (
                      <div className="text-sm text-blue-600">
                        {currentContent.hashtags.map(tag => `#${tag}`).join(' ')}
                      </div>
                    )}
                    
                    {/* CTA Button */}
                    {currentContent.cta && (
                      <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                        {currentContent.cta}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setStep(2)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white"
          >
            ← Back
          </button>
          <button
            onClick={() => setStep(4)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            Continue to Publish
            <span>→</span>
          </button>
        </div>
      </div>
    );
  };

  const renderPublishOptions = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Publish Content</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Platforms</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'facebook', name: 'Facebook Page', icon: Facebook, color: 'blue' },
              { id: 'instagram', name: 'Instagram Business', icon: Instagram, color: 'pink' },
            ].map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatforms.includes(platform.id);
              
              return (
                <button
                  key={platform.id}
                  onClick={() => {
                    setSelectedPlatforms(prev =>
                      prev.includes(platform.id)
                        ? prev.filter(p => p !== platform.id)
                        : [...prev, platform.id]
                    );
                  }}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium text-gray-900">{platform.name}</span>
                  {isSelected && <Check className="w-5 h-5 text-blue-600 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Choose Action</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                setPublishAction('draft');
                setShowPublishModal(true);
              }}
              disabled={selectedPlatforms.length === 0}
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-6 h-6 text-gray-600" />
              <span className="font-medium text-gray-900">Save as Draft</span>
              <span className="text-xs text-gray-500">Review later</span>
            </button>

            <button
              onClick={() => {
                setPublishAction('schedule');
                setShowPublishModal(true);
              }}
              disabled={selectedPlatforms.length === 0}
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-gray-900">Schedule</span>
              <span className="text-xs text-gray-500">Post later</span>
            </button>

            <button
              onClick={() => {
                setPublishAction('publish');
                setShowPublishModal(true);
              }}
              disabled={selectedPlatforms.length === 0}
              className="flex flex-col items-center gap-2 p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-6 h-6 text-green-600" />
              <span className="font-medium text-gray-900">Publish Now</span>
              <span className="text-xs text-gray-500">Go live</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => setStep(3)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Back to Edit
        </button>
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {publishAction === 'publish' ? 'Publish Content' :
               publishAction === 'schedule' ? 'Schedule Content' :
               'Save as Draft'}
            </h3>
            <p className="text-gray-600 mb-6">
              {publishAction === 'publish' 
                ? `Your content will be published immediately to ${selectedPlatforms.length} platform(s).`
                : publishAction === 'schedule'
                ? 'Select a date and time to publish your content.'
                : 'Your content will be saved and can be published later.'}
            </p>

            {publishAction === 'schedule' && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className={`flex-1 px-6 py-3 rounded-lg text-white ${
                  publishAction === 'publish' ? 'bg-green-600 hover:bg-green-700' :
                  publishAction === 'schedule' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHistoryView = () => (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => setCurrentView('entry')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Content History</h1>
          <p className="text-gray-600 mt-1">View and manage all your social media content</p>
        </div>
        <button
          onClick={() => {
            setCurrentView('create');
            setStep(1);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create New Content
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content Types</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platforms</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contentHistory.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{post.productName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {post.contentTypes.map((type) => {
                      const contentType = contentTypes.find(t => t.id === type);
                      const Icon = contentType?.icon || Facebook;
                      return (
                        <div key={type} className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center" title={contentType?.name}>
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{post.platforms.join(', ')}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : post.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      {currentView === 'entry' && renderEntryScreen()}
      {currentView === 'create' && renderCreateFlow()}
      {currentView === 'history' && renderHistoryView()}
    </>
  );
}