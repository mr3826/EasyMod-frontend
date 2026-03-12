import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Plus, ChevronDown, ChevronUp, Save, Calendar, Package, Tag, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { apiClient, Product } from "../lib/api";

interface AddProductProps {
  editMode?: boolean;
  editProduct?: Product | null;
  onClose?: () => void;
  onSave?: (product: Product) => void;
  isModal?: boolean;
}

export default function AddProduct({ editMode = false, editProduct = null, onClose, onSave, isModal = false }: AddProductProps) {
    // Store object URLs for cleanup
    const [imageObjectUrls, setImageObjectUrls] = useState<string[]>([]);
  const navigate = useNavigate();
  const { productId } = useParams<{ productId?: string }>();
  
  // Determine if this is an edit page based on URL
  const isEditPage = !!productId && !isModal;
  
  // Form state - Product Info
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountable, setDiscountable] = useState(false);
  const [taxable, setTaxable] = useState(false);
  const [productImages, setProductImages] = useState<File[]>([]);

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
      // Revoke previous URLs
      imageObjectUrls.forEach(url => URL.revokeObjectURL(url));
      // Create new URLs for current images
      const urls = productImages.map(file => URL.createObjectURL(file));
      setImageObjectUrls(urls);
      // Cleanup on unmount
      return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    }, [productImages]);
  
  // Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Inventory & Stock
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [stockType, setStockType] = useState<"unlimited" | "limited">("limited");
  const [stockQuantity, setStockQuantity] = useState("");
  const [minStockThreshold, setMinStockThreshold] = useState("");
  const [lowStockAlert, setLowStockAlert] = useState(true);
  
  // Additional Details
  const [productCondition, setProductCondition] = useState<"new" | "used" | "refurbished">("new");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  // Business Rules
  const [minOrderQty, setMinOrderQty] = useState("1");
  const [maxOrderQty, setMaxOrderQty] = useState("");
  const [returnable, setReturnable] = useState(true);
  const [returnWindow, setReturnWindow] = useState("7");
  const [warranty, setWarranty] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  
  // Variants
  const [variants, setVariants] = useState<Array<{name: string; options: string[]; priceAdjustment: string; sku: string}>>([]);
  
  // Shipping
  const [requiresShipping, setRequiresShipping] = useState(true);
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "g" | "lb" | "oz">("kg");
  const [dimensions, setDimensions] = useState({ length: "", width: "", height: "" });
  const [dimensionUnit, setDimensionUnit] = useState<"cm" | "in">("cm");
  const [shippingClass, setShippingClass] = useState<"standard" | "express" | "fragile">("standard");
  const [handlingTime, setHandlingTime] = useState("1-3");
  const [freeShipping, setFreeShipping] = useState(false);
  
  // Collapsible states
  const [showCategories, setShowCategories] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [showBusinessRules, setShowBusinessRules] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showShipping, setShowShipping] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch product data when editing via URL
  useEffect(() => {
    if (isEditPage && productId) {
      const fetchProduct = async () => {
        try {
          const product = await apiClient.getProduct(productId);
          setProductName(product.name || "");
          setDescription(product.description || "");
          setBasePrice(product.price?.toString() || "");
          setSku(product.sku || "");
          setBrand(product.brand || "");
          setDiscountable(product.allow_discounts !== false);
          setTaxable(product.charge_tax !== false);
          setStockQuantity(product.quantity?.toString() || "");
          setMinStockThreshold(product.low_stock_threshold?.toString() || "");
          setLowStockAlert(product.send_low_stock_alert === true);
          // Set stock tracking based on track_quantity
          setStockType(product.track_quantity === false ? "unlimited" : "limited");
          if (product.category_id) {
            setSelectedCategories([product.category_id]);
          }
          if (product.variants) setVariants(product.variants as any);
          if (product.tags) setTags(product.tags);
        } catch (err: any) {
          const message = err.response?.data?.message || 'Failed to load product';
          setError(message);
          toast.error(message);
        }
      };
      fetchProduct();
    }
  }, [isEditPage, productId]);

  // Load product data when in edit mode (modal)
  useEffect(() => {
    if (editMode && editProduct && isModal) {
      setProductName(editProduct.name || "");
      setDescription(editProduct.description || "");
      setBasePrice(editProduct.price?.toString() || "");
      setSku(editProduct.sku || "");
      setBrand(editProduct.brand || "");
      setDiscountable(editProduct.allow_discounts !== false);
      setTaxable(editProduct.charge_tax !== false);
      setStockQuantity(editProduct.quantity?.toString() || "");
      setMinStockThreshold(editProduct.low_stock_threshold?.toString() || "");
      setLowStockAlert(editProduct.send_low_stock_alert === true);
      // Set stock tracking based on track_quantity
      setStockType(editProduct.track_quantity === false ? "unlimited" : "limited");
      // Handle category - use category_id which is the foreign key
      if (editProduct.category_id) {
        setSelectedCategories([editProduct.category_id]);
      }
      if (editProduct.variants) setVariants(editProduct.variants as any);
      if (editProduct.tags) setTags(editProduct.tags);
    }
  }, [editMode, editProduct, isModal]);

  // Fetch categories from server
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const fetchedCategories = await apiClient.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        toast.error('Failed to load categories');
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - productImages.length;
    const filesToAdd = files.slice(0, remainingSlots);
    setProductImages([...productImages, ...filesToAdd]);
  };

  const removeImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const newImages = [...productImages];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      setProductImages(newImages);
    }
  };

  const generateSku = () => {
    const randomSku = `PRD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setSku(randomSku);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", options: [], priceAdjustment: "0", sku: "" }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSave = async (action: "draft" | "publish") => {
    try {
      setError(null);
      
      if (!productName.trim()) {
        setError('Product name is required');
        return;
      }

      const price = parseFloat(basePrice);
      if (isNaN(price) || price <= 0) {
        setError('Valid selling price is required');
        return;
      }

      const productData: any = {
        name: productName.trim(),
        description: description.trim(),
        price,
      };

      if (selectedCategories.length > 0) {
        productData.category_id = selectedCategories[0];
      }

      if (sku) {
        productData.sku = sku;
      }

      if (brand) {
        productData.brand = brand;
      }

      if (tags.length > 0) {
        productData.tags = tags;
      }

      if (variants.length > 0) {
        productData.variants = variants;
      }

      // Add inventory and tax settings
      productData.allow_discounts = discountable;
      productData.charge_tax = taxable;
      productData.send_low_stock_alert = lowStockAlert;
      
      // Set track_quantity based on stockType
      productData.track_quantity = stockType === "limited";
      
      // If not tracking quantity, don't send quantity value
      if (stockType === "limited" && stockQuantity) {
        productData.quantity = parseInt(stockQuantity);
      } else {
        productData.quantity = 0;
      }
      
      if (minStockThreshold) {
        productData.low_stock_threshold = parseInt(minStockThreshold);
      }

      // Add other fields as needed

      if ((editMode && editProduct) || isEditPage) {
        // Update existing product
        const updateId = isEditPage ? productId : editProduct?.id;
        await apiClient.updateProduct(updateId!, productData);
        console.log("Updating product as:", action);
        if (onSave) {
          onSave({ ...editProduct, ...productData });
        }
        if (onClose) {
          onClose();
        } else {
          navigate("/app/products");
        }
      } else {
        // Create new product
        await apiClient.createProduct(productData);
        console.log("Creating product as:", action);
        navigate("/app/products");
      }
    } catch (error: any) {
      // Log the full error for debugging
      console.error("Error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      console.error("Product data sent:", {
        name: productName,
        description,
        price: basePrice,
        category_id: selectedCategories[0],
        sku
      });

      // Extract error message from various possible response structures
      let errorMessage = 'An error occurred while saving the product';
      
      // Check for validation errors with details
      if (error?.response?.data?.error?.details && Array.isArray(error.response.data.error.details)) {
        const details = error.response.data.error.details as any[];
        const messages = details.map(d => `${d.field}: ${d.message}`).join('; ');
        errorMessage = `Validation Error: ${messages}`;
      } else if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = JSON.stringify(error.response.data.error);
      } else if (error?.response?.data?.details) {
        errorMessage = error.response.data.details;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error saving product:", error);
    }
  };

  // Render modal version
  if (isModal && onClose) {
    return (
      <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-white rounded-xl max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{editMode ? 'Edit Product' : 'Add New Product'}</h1>
                <p className="text-gray-600 mt-1">{editMode ? 'Update product details' : 'Add a new product to your store'}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Form Content Grid - Simplified for modal */}
            <div className="grid grid-cols-1 gap-6 max-w-full">
              {/* Product Info Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Info</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="modal-product-name" className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      id="modal-product-name"
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Enter product name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="modal-description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      id="modal-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your product..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="modal-base-price" className="block text-sm font-medium text-gray-700 mb-2">
                        Selling Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="modal-base-price"
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="modal-sku" className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                      <input
                        id="modal-sku"
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="SKU-001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave("publish")}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editMode ? 'Update Product' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full page view for standalone AddProduct route
  return (
    <div className="p-8 pb-24">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/app/products")}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          ← Back to Products
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{isEditPage ? 'Edit Product' : 'Add New Product'}</h1>
        <p className="text-gray-600 mt-1">{isEditPage ? 'Update product details' : 'Add a new product to your store'}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          
          {/* Product Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Product Info <span className="text-red-500">*</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product - features, benefits, specifications..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Pricing */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="selling-price" className="block text-sm font-medium text-gray-700 mb-2">
                        Selling Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          id="selling-price"
                          type="number"
                          value={basePrice}
                          onChange={(e) => setBasePrice(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={discountable}
                        onChange={(e) => setDiscountable(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Allow discounts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={taxable}
                        onChange={(e) => setTaxable(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Charge tax</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Product Images <span className="text-red-500">*</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Upload product images
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {productImages.length}/5 images • PNG, JPG up to 5MB each
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="product-images"
                      disabled={productImages.length >= 5}
                    />
                    <label
                      htmlFor="product-images"
                      className={`inline-block px-4 py-2 rounded-lg cursor-pointer text-sm ${
                        productImages.length >= 5
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {productImages.length >= 5 ? 'Maximum Reached' : 'Choose Files'}
                    </label>
                  </div>

                  {productImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {productImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors">
                            <img
                              src={imageObjectUrls[index]}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">
                              Main
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-40 rounded-lg">
                            {index > 0 && (
                              <button
                                onClick={() => moveImage(index, "left")}
                                className="p-1.5 bg-white text-gray-800 rounded-full mr-1 hover:bg-gray-100"
                                title="Move left"
                              >
                                ←
                              </button>
                            )}
                            {index < productImages.length - 1 && (
                              <button
                                onClick={() => moveImage(index, "right")}
                                className="p-1.5 bg-white text-gray-800 rounded-full hover:bg-gray-100"
                                title="Move right"
                              >
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory & Stock */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Inventory & Stock <span className="text-red-500">*</span>
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="SKU"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={generateSku}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 whitespace-nowrap text-sm"
                    >
                      Auto
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Tracking <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stockType"
                      value="unlimited"
                      checked={stockType === "unlimited"}
                      onChange={(e) => setStockType(e.target.value as "unlimited")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Don't track inventory</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stockType"
                      value="limited"
                      checked={stockType === "limited"}
                      onChange={(e) => setStockType(e.target.value as "limited")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Track quantity</span>
                  </label>
                </div>
              </div>

              {stockType === "limited" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      value={minStockThreshold}
                      onChange={(e) => setMinStockThreshold(e.target.value)}
                      placeholder="5"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get notified when stock is low</p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lowStockAlert}
                      onChange={(e) => setLowStockAlert(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Send low stock email alerts</span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Additional Product Details */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900">Additional Product Details</h2>
              {showAdditionalDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showAdditionalDetails && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Enter brand name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Condition
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["new", "used", "refurbished"] as const).map((condition) => (
                      <button
                        key={condition}
                        onClick={() => setProductCondition(condition)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${
                          productCondition === condition
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Product Tags
                  </label>
                  <div className="space-y-2">
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-blue-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tag (press Enter)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={addTag}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Tags help with search and organization</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Product Categories */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900">Product Categories</h2>
              {showCategories ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showCategories && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">Organize your product by assigning categories</p>
                
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {selectedCategories.map((catId) => {
                      const category = categories.find(c => c.id === catId);
                      return category ? (
                        <span
                          key={catId}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                        >
                          <FolderTree className="w-3 h-3" />
                          {category.name}
                          <button
                            onClick={() => setSelectedCategories(selectedCategories.filter(id => id !== catId))}
                            className="hover:text-blue-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FolderTree className="w-5 h-5" />
                  Assign Categories
                </button>
              </div>
            )}
          </div>

          {/* Product Variants */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowVariants(!showVariants)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
              {showVariants ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showVariants && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">Add variants like size, color, or material</p>
                {variants.map((variant, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Variant Group {index + 1}</span>
                      <button
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variant Name
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, "name", e.target.value)}
                        placeholder="e.g., Size, Color, Material"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options
                      </label>
                      <div className="space-y-2 mb-3">
                        {Array.isArray(variant.options) && variant.options.length > 0 ? (
                          variant.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...variant.options];
                                  newOptions[optionIndex] = e.target.value;
                                  const updated = variants.map((v, i) => 
                                    i === index 
                                      ? { ...v, options: newOptions }
                                      : v
                                  );
                                  setVariants(updated);
                                }}
                                placeholder="e.g., Small"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = variant.options.filter((_, i) => i !== optionIndex);
                                  const updated = variants.map((v, i) => 
                                    i === index 
                                      ? { ...v, options: newOptions }
                                      : v
                                  );
                                  setVariants(updated);
                                }}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No options added yet</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const updated = variants.map((v, i) => 
                            i === index 
                              ? { ...v, options: [...(Array.isArray(v.options) ? v.options : []), ""] }
                              : v
                          );
                          setVariants(updated);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200"
                      >
                        <Plus className="w-4 h-4" />
                        Add Option
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price Adjustment
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={variant.priceAdjustment}
                            onChange={(e) => updateVariant(index, "priceAdjustment", e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Variant SKU
                        </label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, "sku", e.target.value)}
                          placeholder="Optional"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addVariant}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant Group
                </button>
              </div>
            )}
          </div>

          {/* Business Rules */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowBusinessRules(!showBusinessRules)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900">Business Rules</h2>
              {showBusinessRules ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showBusinessRules && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Quantity
                    </label>
                    <input
                      type="number"
                      value={minOrderQty}
                      onChange={(e) => setMinOrderQty(e.target.value)}
                      placeholder="1"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Order Quantity
                    </label>
                    <input
                      type="number"
                      value={maxOrderQty}
                      onChange={(e) => setMaxOrderQty(e.target.value)}
                      placeholder="No limit"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Return Policy
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="returnable"
                          checked={returnable === true}
                          onChange={() => setReturnable(true)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Returnable</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="returnable"
                          checked={returnable === false}
                          onChange={() => setReturnable(false)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Non-returnable</span>
                      </label>
                    </div>
                    
                    {returnable && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Return Window (days)
                        </label>
                        <input
                          type="number"
                          value={returnWindow}
                          onChange={(e) => setReturnWindow(e.target.value)}
                          placeholder="30"
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty Information
                  </label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="e.g., 12 months manufacturer warranty"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry / Best Before Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">For perishable products only</p>
                </div>
              </div>
            )}
          </div>

          {/* Shipping & Delivery */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowShipping(!showShipping)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900">Shipping & Delivery</h2>
              {showShipping ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showShipping && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Physical Product</div>
                    <div className="text-sm text-gray-500">This product requires shipping</div>
                  </div>
                  <button
                    onClick={() => setRequiresShipping(!requiresShipping)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      requiresShipping ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        requiresShipping ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {requiresShipping && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Package Weight
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="0"
                          step="0.01"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={weightUnit}
                          onChange={(e) => setWeightUnit(e.target.value as any)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="kg">Kilograms (kg)</option>
                          <option value="g">Grams (g)</option>
                          <option value="lb">Pounds (lb)</option>
                          <option value="oz">Ounces (oz)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Package Dimensions (L × W × H)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          type="number"
                          value={dimensions.length}
                          onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                          placeholder="L"
                          step="0.1"
                          min="0"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          value={dimensions.width}
                          onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                          placeholder="W"
                          step="0.1"
                          min="0"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          value={dimensions.height}
                          onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                          placeholder="H"
                          step="0.1"
                          min="0"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={dimensionUnit}
                          onChange={(e) => setDimensionUnit(e.target.value as any)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="cm">cm</option>
                          <option value="in">in</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Class
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["standard", "express", "fragile"] as const).map((cls) => (
                          <button
                            key={cls}
                            onClick={() => setShippingClass(cls)}
                            className={`px-3 py-2 rounded-lg border-2 transition-all capitalize text-sm ${
                              shippingClass === cls
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {cls}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Handling Time
                      </label>
                      <input
                        type="text"
                        value={handlingTime}
                        onChange={(e) => setHandlingTime(e.target.value)}
                        placeholder="e.g., 1-3 business days"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Time to prepare and ship</p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={freeShipping}
                        onChange={(e) => setFreeShipping(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Offer free shipping for this product</span>
                    </label>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* FOOTER ACTIONS - Sticky */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-end gap-3 z-10">
        <button
          onClick={() => navigate('/app/products')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSave("publish")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Package className="w-5 h-5" />
          {isEditPage ? 'Update Product' : 'Publish'}
        </button>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Select Categories</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm text-gray-600 mb-4">
                Select one or more categories for this product
              </p>

              {categoriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading categories...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No categories available
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          } else {
                            setSelectedCategories([...selectedCategories, category.id]);
                          }
                        }}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${ 
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                          <FolderTree className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${
                            isSelected ? "text-blue-900" : "text-gray-900"
                          }`}>
                            {category.name}
                          </div>
                        </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Need a new category?
                </p>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    navigate("/app/categories/create");
                  }}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Create New Category
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedCategories.length} {selectedCategories.length === 1 ? "category" : "categories"} selected
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}