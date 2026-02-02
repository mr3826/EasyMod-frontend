import { useState, useEffect, useRef } from "react";
import { Plus, Upload, Bot, CheckCircle, Edit2, Trash2, AlertCircle, Search, Filter, Download, ChevronDown, X } from "lucide-react";
import { Product } from "../lib/api";
import { authService } from "../lib/auth";
import { apiClient } from "../lib/api";
import { useNavigate } from "react-router";
import AddProduct from "./AddProduct";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [aiGeneratedProducts, setAiGeneratedProducts] = useState<Product[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    category_id: '',
    is_active: '',
    source: '',
    minPrice: '',
    maxPrice: '',
  });
  
  // Applied filters state - only used after clicking Apply
  const [appliedFilters, setAppliedFilters] = useState({
    category_id: '',
    is_active: '',
    source: '',
    minPrice: '',
    maxPrice: '',
  });
  
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Delete confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  // Get unique categories from products (build a map of category name to ID)
  const categoryMap: { [key: string]: string } = {};
  products.forEach(p => {
    if (p.category && p.category_id) {
      categoryMap[p.category] = p.category_id;
    }
  });
  const categories = Object.keys(categoryMap);

  // Fetch products with applied filters
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const shopId = authService.getCurrentShopId();
      if (!shopId) {
        setError('No shop selected');
        return;
      }
      // Build query params from applied filters
      const queryParams: any = {};
      if (appliedSearchQuery) queryParams.search = appliedSearchQuery;
      if (appliedFilters.category_id) queryParams.category_id = appliedFilters.category_id;
      if (appliedFilters.is_active) queryParams.is_active = appliedFilters.is_active === 'active';
      if (appliedFilters.minPrice) queryParams.min_price = appliedFilters.minPrice;
      if (appliedFilters.maxPrice) queryParams.max_price = appliedFilters.maxPrice;

      const fetchedProducts = await apiClient.getProducts(queryParams);
      setProducts(fetchedProducts);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products on mount and when applied filters change
  useEffect(() => {
    fetchProducts();
  }, [appliedSearchQuery, appliedFilters]);

  // Debounce search input - wait 2 seconds after user stops typing
  useEffect(() => {
    // Clear previous timer if exists
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    // Set new timer
    searchDebounceTimer.current = setTimeout(() => {
      setAppliedSearchQuery(searchQuery);
    }, 2000);

    // Cleanup on unmount or when searchQuery changes
    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload and AI processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        // Simulate AI-generated products
        const generated: Product[] = [
          {
            id: Date.now().toString(),
            name: 'Green Tea Extract 100ml',
            sku: 'GT-100-' + Date.now(),
            price: 15.99,
            variants: ['100ml', '200ml'],
            aliases: ['green tea', 'tea extract'],
            category: 'Beverages',
            status: 'pending',
            aiGenerated: true,
            confidence: 0.89,
            stock: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: (Date.now() + 1).toString(),
            name: 'Organic Honey 500g',
            sku: 'HN-ORG-500',
            price: 18.99,
            variants: ['250g', '500g', '1kg'],
            aliases: ['honey', 'organic honey', 'bee honey'],
            category: 'Food',
            status: 'pending',
            aiGenerated: true,
            confidence: 0.94,
            stock: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setAiGeneratedProducts(generated);
        setShowReviewModal(true);
        setShowUploadModal(false);
        setUploadProgress(0);
      }
    }, 300);
  };

  const handleApproveProduct = (product: Product) => {
    setProducts([...products, { ...product, status: 'active' }]);
    setAiGeneratedProducts(aiGeneratedProducts.filter(p => p.id !== product.id));
  };

  const handleEditProduct = (product: Product) => {
    navigate(`/products/${product.id}/edit`);
  };

  const handleRejectProduct = (productId: string) => {
    setAiGeneratedProducts(aiGeneratedProducts.filter(p => p.id !== productId));
  };

  const handleDeleteProduct = async (productId: string) => {
    // Find product to get its name for confirmation dialog
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete({ id: productId, name: product.name });
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await apiClient.deleteProduct(productToDelete.id);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteConfirm(false);
      setProductToDelete(null);
      // Refresh product list
      fetchProducts();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete product');
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const handleDownloadTemplate = () => {
    // Simulate template download
    console.log('Downloading product upload template...');
    // In production, this would trigger actual file download
  };

  const applyFilters = () => {
    setShowFilterPanel(false);
    // Copy filters to applied filters to trigger fetch
    setAppliedFilters({
      category_id: filters.category_id,
      is_active: filters.is_active,
      source: filters.source,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    });
  };

  const clearFilters = () => {
    // Reset both filter states
    setFilters({
      category_id: '',
      is_active: '',
      source: '',
      minPrice: '',
      maxPrice: '',
    });
    setSearchQuery('');
    setAppliedFilters({
      category_id: '',
      is_active: '',
      source: '',
      minPrice: '',
      maxPrice: '',
    });
    setAppliedSearchQuery('');
  };

  return (
    <div className="p-8">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products & Inventory</h1>
              <p className="text-gray-600 mt-1">Manage your product catalog with AI assistance</p>
            </div>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Upload className="w-5 h-5" />
              Upload File for AI
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="absolute -bottom-6 right-0 text-xs text-purple-600 hover:text-purple-700 hover:underline whitespace-nowrap"
            >
              Download Upload Template
            </button>
          </div>
          <button
            onClick={() => navigate('/products/add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Manually
          </button>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            Filter
            {(appliedFilters.category_id || appliedFilters.is_active || appliedFilters.source || appliedFilters.minPrice || appliedFilters.maxPrice) && (
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </button>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filter Products</h3>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category_id}
                    onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(catName => (
                      <option key={categoryMap[catName]} value={categoryMap[catName]}>{catName}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.is_active}
                    onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Source Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source
                  </label>
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sources</option>
                    <option value="ai">AI Generated</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      placeholder="Min"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                    />
                    <span className="text-gray-500">–</span>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      placeholder="Max"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                <td className="px-6 py-4 text-sm text-gray-900">${product.price}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {product.track_quantity ? product.quantity || 0 : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {product.variants && Array.isArray(product.variants) && product.variants.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.variants.map((variant, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {typeof variant === 'object' ? variant.name || variant : variant}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">No variants</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : product.status === 'inactive'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {product.aiGenerated ? (
                    <div className="flex items-center gap-1 text-sm text-purple-600">
                      <Bot className="w-4 h-4" />
                      <span>AI ({Math.round((product.confidence || 0) * 100)}%)</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Manual</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Product File</h2>
            <p className="text-gray-600 mb-6">Upload CSV, Excel, PDF, or text files for AI processing</p>

            {uploadProgress === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Drag and drop or click to upload</p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".csv,.xlsx,.xls,.pdf,.txt,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Choose File
                </label>
                <p className="text-sm text-gray-500 mt-4">Supported: CSV, Excel, PDF, Text</p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Processing with AI...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  AI is extracting product information...
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadProgress(0);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review AI Products Modal */}
      {showReviewModal && aiGeneratedProducts.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 my-8">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Review AI-Generated Products</h2>
                <p className="text-gray-600">Review and approve products extracted by AI</p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {aiGeneratedProducts.map((product) => (
                <div key={product.id} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <span className="px-2 py-1 bg-purple-200 text-purple-700 text-xs rounded">
                          Confidence: {Math.round((product.confidence || 0) * 100)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">SKU:</span>
                          <span className="ml-2 text-gray-900">{product.sku}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <span className="ml-2 text-gray-900">${product.price}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-2 text-gray-900">{product.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Variants:</span>
                          <span className="ml-2 text-gray-900">{product.variants?.join(', ')}</span>
                        </div>
                      </div>
                      {product.aliases && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">Aliases:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.aliases.map((alias, i) => (
                              <span key={i} className="px-2 py-1 bg-white text-gray-700 text-xs rounded border border-purple-200">
                                {alias}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex items-center gap-1 px-3 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleApproveProduct(product)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectProduct(product.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  aiGeneratedProducts.forEach(p => handleApproveProduct(p));
                  setShowReviewModal(false);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{productToDelete.name}"</span>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      </>
      )}
    </div>
  );
}