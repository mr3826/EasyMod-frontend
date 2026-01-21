import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronRight, Upload, Plus, Eye, Edit2, Trash2, X } from "lucide-react";

interface Subcategory {
  id: string;
  name: string;
  image: string;
  subSubcategoryCount: number;
  description?: string;
}

const mockSubcategories: Subcategory[] = [
  {
    id: "s1",
    name: "Mobile Phones",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop",
    subSubcategoryCount: 3,
    description: "Smartphones and accessories",
  },
  {
    id: "s2",
    name: "Laptops",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop",
    subSubcategoryCount: 2,
    description: "Laptops and notebooks",
  },
  {
    id: "s3",
    name: "Cameras",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop",
    subSubcategoryCount: 0,
    description: "Digital cameras and equipment",
  },
];

export default function CategoryDetails() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  
  const [categoryName, setCategoryName] = useState("Electronics");
  const [description, setDescription] = useState("Electronic devices and accessories");
  const [categoryImage, setCategoryImage] = useState("https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop");
  const [bannerImage, setBannerImage] = useState("https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1300&h=380&fit=crop");
  const [subcategories, setSubcategories] = useState(mockSubcategories);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCategoryImage(url);
    }
  };

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBannerImage(url);
    }
  };

  const handleUpdate = () => {
    console.log("Updating category...");
    navigate("/categories");
  };

  const handleAddSubcategory = () => {
    setEditingSubcategory(null);
    setShowSubcategoryModal(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setShowSubcategoryModal(true);
  };

  const handleDeleteSubcategory = (subcategory: Subcategory) => {
    setSubcategoryToDelete(subcategory);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (subcategoryToDelete) {
      setSubcategories(subcategories.filter(s => s.id !== subcategoryToDelete.id));
      setShowDeleteModal(false);
      setSubcategoryToDelete(null);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <button onClick={() => navigate("/categories")} className="hover:text-gray-900">
          Categories
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{categoryName}</span>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Category Details</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Update category information and manage subcategories</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel - Category Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Category Information</h2>
          
          <div className="space-y-6">
            {/* Banner Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner / Cover Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                {bannerImage ? (
                  <div className="relative group">
                    <img
                      src={bannerImage}
                      alt="Banner"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Upload banner image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Recommended: 1300 × 380 pixels, max 4MB</p>
            </div>

            {/* Category Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                {categoryImage ? (
                  <div className="relative group">
                    <img
                      src={categoryImage}
                      alt="Category"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCategoryImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Upload category image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Square image (1:1 ratio), max 4MB</p>
            </div>

            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                maxLength={50}
                placeholder="Enter category name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">{categoryName.length}/50 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Brief description of this category"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdate}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Category
            </button>
          </div>
        </div>

        {/* Right Panel - Subcategories */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Subcategories</h2>
            <button
              onClick={handleAddSubcategory}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Subcategory
            </button>
          </div>

          {subcategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subcategories yet</h3>
              <p className="text-gray-600 mb-6">Start organizing your products by adding subcategories</p>
              <button
                onClick={handleAddSubcategory}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add First Subcategory
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <img
                    src={subcategory.image}
                    alt={subcategory.name}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{subcategory.name}</div>
                    {subcategory.description && (
                      <div className="text-sm text-gray-500 truncate">{subcategory.description}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {subcategory.subSubcategoryCount} sub-subcategories
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/categories/${categoryId}/${subcategory.id}`)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditSubcategory(subcategory)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubcategory(subcategory)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <SubcategoryModal
          subcategory={editingSubcategory}
          onClose={() => setShowSubcategoryModal(false)}
          onSave={(data) => {
            if (editingSubcategory) {
              setSubcategories(subcategories.map(s => 
                s.id === editingSubcategory.id ? { ...s, ...data } : s
              ));
            } else {
              setSubcategories([...subcategories, {
                id: `s${Date.now()}`,
                subSubcategoryCount: 0,
                ...data
              }]);
            }
            setShowSubcategoryModal(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && subcategoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Subcategory</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{subcategoryToDelete.name}</strong>"?
              {subcategoryToDelete.subSubcategoryCount > 0 && (
                <span> This will also delete {subcategoryToDelete.subSubcategoryCount} nested subcategories.</span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
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
    </div>
  );
}

// Subcategory Modal Component
function SubcategoryModal({ 
  subcategory, 
  onClose, 
  onSave 
}: { 
  subcategory: Subcategory | null; 
  onClose: () => void; 
  onSave: (data: any) => void;
}) {
  const [name, setName] = useState(subcategory?.name || "");
  const [description, setDescription] = useState(subcategory?.description || "");
  const [image, setImage] = useState(subcategory?.image || "");
  const [banner, setBanner] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBanner(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    onSave({ name, description, image, banner });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {subcategory ? "Edit Subcategory" : "Create Subcategory"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Banner Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner / Cover Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              {banner ? (
                <div className="relative group">
                  <img src={banner} alt="Banner" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100">
                      Change
                      <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload banner</span>
                  <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">1300 × 380 pixels, max 4MB</p>
          </div>

          {/* Category Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden max-w-xs">
              {image ? (
                <div className="relative group">
                  <img src={image} alt="Category" className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100">
                      Change
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter subcategory name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Brief description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {subcategory ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
