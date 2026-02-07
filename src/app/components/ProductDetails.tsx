import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, Share2, Heart } from "lucide-react";
import { Product } from "../lib/api";
import { authService } from "../lib/auth";
import { apiClient } from "../lib/api";
import AddProduct from "./AddProduct";

export default function ProductDetails() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!productId) {
          setError('Product ID not found');
          return;
        }
        const shopId = authService.getCurrentShopId();
        if (!shopId) {
          setError('No shop selected');
          return;
        }
        const fetchedProduct = await apiClient.getProduct(productId);
        setProduct(fetchedProduct);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleDeleteProduct = async () => {
    if (!product) return;
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiClient.deleteProduct(product.id);
      navigate('/products');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSaveEdit = (updatedProduct: Product) => {
    setProduct(updatedProduct);
    setShowEditModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate('/products')}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Product not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/products')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDeleteProduct}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center">
                <span className="text-gray-500">No images</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700">{product.description || 'No description provided'}</p>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
            <div className="space-y-3">
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU</span>
                  <span className="text-gray-900 font-medium">{product.sku}</span>
                </div>
              )}
              {product.brand && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand</span>
                  <span className="text-gray-900 font-medium">{product.brand}</span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight</span>
                  <span className="text-gray-900 font-medium">{product.weight} {product.weight_unit}</span>
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <span className="text-gray-600 block mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Selling Price</span>
                <div className="text-3xl font-bold text-gray-900">${product.price}</div>
              </div>
              {product.compare_at_price && (
                <div>
                  <span className="text-sm text-gray-600">Compare at Price</span>
                  <div className="text-xl text-gray-500 line-through">${product.compare_at_price}</div>
                </div>
              )}
              {product.cost_per_item && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Cost per Item</span>
                  <div className="text-lg text-gray-900">${product.cost_per_item}</div>
                </div>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Quantity</span>
                <div className="text-2xl font-bold text-gray-900">{product.quantity || 0}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-700">{product.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              {product.low_stock_threshold && (
                <div className="text-sm text-gray-600">
                  Low stock alert: {product.low_stock_threshold} units
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Created</span>
                <div className="text-sm text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Last Updated</span>
                <div className="text-sm text-gray-900">{new Date(product.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <AddProduct
          isModal={true}
          editMode={true}
          editProduct={product}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
