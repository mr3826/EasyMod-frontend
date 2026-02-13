import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Radio, Package, ShoppingCart, BarChart3, Brain, Target, FolderTree, Store, User, Check, Plus, LogOut, ChevronUp, X, AlertCircle, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService, logout } from "@/app/lib/auth";
import type { Shop as BackendShop } from "@/app/lib/api";
import { toast } from "sonner";

const appBasePath = '/app';

const navigation = [
  { name: 'Dashboard', path: appBasePath, icon: LayoutDashboard },
  { name: 'Inbox', path: `${appBasePath}/inbox`, icon: MessageSquare },
  { name: 'Products', path: `${appBasePath}/products`, icon: Package },
  { name: 'Categories', path: `${appBasePath}/categories`, icon: FolderTree },
  { name: 'Orders', path: `${appBasePath}/orders`, icon: ShoppingCart },
  { name: 'Customer', path: `${appBasePath}/customers`, icon: Target },
  { name: 'Manage Shop', path: `${appBasePath}/manage-shop`, icon: Store },
  { name: 'AI Knowledge', path: `${appBasePath}/knowledge`, icon: Brain },
  { name: 'Reports', path: `${appBasePath}/reports`, icon: BarChart3 },
  { name: 'Subscription', path: `${appBasePath}/subscription`, icon: CreditCard },
];

interface Shop {
  id: string;
  name: string;
  logo: string;
  isActive: boolean;
  isDisabled: boolean;
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showShopPanel, setShowShopPanel] = useState(false);
  const [showCreateShopPopup, setShowCreateShopPopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [createShopName, setCreateShopName] = useState('');
  const [createShopError, setCreateShopError] = useState<string | null>(null);
  const [createShopLoading, setCreateShopLoading] = useState(false);

  const [authState, setAuthState] = useState(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authState.isAuthenticated) return;
    authService.refreshShops().catch((error) => {
      console.error('Failed to refresh shops:', error);
      toast.error('Failed to refresh shops');
    });
  }, [authState.isAuthenticated]);

  const shops: Shop[] = authState.allShops.map((shop: BackendShop) => ({
    id: shop.id,
    name: shop.shop_name || shop.unique_code || shop.id,
    logo: '🏪',
    isActive: authState.currentShop?.id === shop.id,
    isDisabled: false,
  }));

  const activeShop = shops.find(shop => shop.isActive);

  const handleCreateShop = () => {
    setCreateShopName('');
    setCreateShopError(null);
    setShowCreateShopPopup(true);
    setShowShopPanel(false);
  };

  const handleSubmitCreateShop = async () => {
    if (createShopLoading) return;

    const trimmedName = createShopName.trim();
    if (trimmedName && trimmedName.length < 2) {
      setCreateShopError('Shop name must be at least 2 characters.');
      return;
    }

    try {
      setCreateShopLoading(true);
      setCreateShopError(null);
      await authService.createShop({ shop_name: trimmedName || undefined });
      setShowCreateShopPopup(false);
    } catch (error) {
      setCreateShopError(error instanceof Error ? error.message : 'Failed to create shop.');
    } finally {
      setCreateShopLoading(false);
    }
  };

  const handleSwitchShop = async (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (shop && !shop.isDisabled) {
      try {
        await authService.switchShop(shopId);
      } catch (error) {
        console.error('Failed to switch shop:', error);
        toast.error('Failed to switch shop');
      }
      setShowShopPanel(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutPopup(false);
    setShowShopPanel(false);
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold">Easy Moderator</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Shop Profile at bottom */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => setShowShopPanel(!showShopPanel)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
              {activeShop?.logo || '🏪'}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm">{activeShop?.name || 'Shop Profile'}</div>
              <div className="text-xs text-gray-500">Active Shop</div>
            </div>
            <ChevronUp className={`w-4 h-4 transition-transform ${showShopPanel ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </aside>

      {/* Shop Profile Panel */}
      {showShopPanel && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowShopPanel(false)}
          />
          <div className="fixed bottom-20 left-4 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
            {/* Active Shop Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg">
                  {activeShop?.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{activeShop?.name}</div>
                  <div className="text-xs text-gray-500">Active Shop</div>
                </div>
              </div>
            </div>

            {/* Shop List */}
            <div className="p-2 max-h-48 overflow-y-auto">
              {shops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => handleSwitchShop(shop.id)}
                  disabled={shop.isDisabled}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    shop.isActive
                      ? 'bg-blue-50 text-blue-600'
                      : shop.isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    shop.isActive
                      ? 'bg-blue-100'
                      : shop.isDisabled
                      ? 'bg-gray-100'
                      : 'bg-gray-100'
                  }`}>
                    {shop.logo}
                  </div>
                  <span className="flex-1 text-left text-sm truncate">{shop.name}</span>
                  {shop.isActive && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Create New Shop */}
            <div className="p-2 border-t border-gray-200">
              <button
                onClick={handleCreateShop}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Create New Shop
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Logout */}
            <div className="p-2">
              <button
                onClick={() => setShowLogoutPopup(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Shop Popup */}
      {showCreateShopPopup && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Create New Shop</h2>
                <p className="text-gray-600">
                  Add a name for your new shop. You can update details later.
                </p>
              </div>
              <button
                onClick={() => setShowCreateShopPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium text-gray-700">Shop name</label>
              <input
                type="text"
                value={createShopName}
                onChange={(event) => setCreateShopName(event.target.value)}
                placeholder="e.g. Downtown Store"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {createShopError && (
                <p className="text-sm text-red-600">{createShopError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateShopPopup(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCreateShop}
                disabled={createShopLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {createShopLoading ? 'Creating...' : 'Create Shop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Popup */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Logout</h2>
                <p className="text-gray-600">
                  Are you sure you want to log out from this project?
                </p>
              </div>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}