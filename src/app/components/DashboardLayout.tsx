import { Link, Outlet, useLocation } from "react-router";
import { LayoutDashboard, MessageSquare, Radio, Package, ShoppingCart, BarChart3, Brain, Target, FolderTree, Store, Megaphone, User, Check, Plus, LogOut, ChevronUp, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { logout } from "@/app/lib/auth";

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Inbox', path: '/inbox', icon: MessageSquare },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Categories', path: '/categories', icon: FolderTree },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
  { name: 'Customer', path: '/intelligence', icon: Target },
  { name: 'Manage Shop', path: '/manage-shop', icon: Store },
  { name: 'Marketing', path: '/marketing', icon: Megaphone },
  { name: 'AI Knowledge', path: '/knowledge', icon: Brain },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
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
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Mock data - replace with actual data from your state management
  const userPlan = 'free'; // 'free' or 'premium'
  const maxShopsAllowed = userPlan === 'free' ? 1 : 10;

  const [shops] = useState<Shop[]>([
    {
      id: '1',
      name: 'My Fashion Store',
      logo: '🛍️',
      isActive: true,
      isDisabled: false,
    },
    {
      id: '2',
      name: 'Electronics Shop',
      logo: '⚡',
      isActive: false,
      isDisabled: true,
    },
  ]);

  const activeShop = shops.find(shop => shop.isActive);

  const handleCreateShop = () => {
    const activeShopsCount = shops.filter(s => !s.isDisabled).length;
    if (activeShopsCount >= maxShopsAllowed) {
      setShowUpgradePopup(true);
    } else {
      // Open create shop modal
      console.log('Open create shop modal');
      setShowShopPanel(false);
    }
  };

  const handleSwitchShop = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (shop && !shop.isDisabled) {
      console.log('Switch to shop:', shopId);
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
            <span className="text-xl font-bold">CommerceAI</span>
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

      {/* Upgrade Plan Popup */}
      {showUpgradePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Upgrade Required</h2>
                <p className="text-gray-600">
                  Your current plan allows only 1 shop. Upgrade your plan to create and manage multiple shops.
                </p>
              </div>
              <button
                onClick={() => setShowUpgradePopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradePopup(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUpgradePopup(false);
                  // Redirect to billing page
                  console.log('Redirect to billing');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Popup */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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