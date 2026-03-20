import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, Package, ShoppingCart, BarChart3,
  Brain, Target, FolderTree, Store, Check, Plus, LogOut, ChevronUp,
  X, AlertCircle, CreditCard, Bell, ChevronLeft, ChevronRight, Menu,
  ChevronDown, User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../features/auth/AuthProvider";
import { toast } from "sonner";
import LanguageToggle from "./LanguageToggle";

const appBasePath = '/app';

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
  const { t } = useTranslation();

  const navigation = [
    { name: t('dashboard.nav.dashboard'),    path: appBasePath,                       icon: LayoutDashboard },
    { name: t('dashboard.nav.inbox'),        path: `${appBasePath}/inbox`,            icon: MessageSquare },
    { name: t('dashboard.nav.products'),     path: `${appBasePath}/products`,         icon: Package },
    { name: t('dashboard.nav.categories'),   path: `${appBasePath}/categories`,       icon: FolderTree },
    { name: t('dashboard.nav.orders'),       path: `${appBasePath}/orders`,           icon: ShoppingCart },
    { name: t('dashboard.nav.customer'),     path: `${appBasePath}/customers`,        icon: Target },
    { name: t('dashboard.nav.manageShop'),   path: `${appBasePath}/manage-shop`,      icon: Store },
    { name: t('dashboard.nav.aiKnowledge'),  path: `${appBasePath}/knowledge`,        icon: Brain },
    { name: t('dashboard.nav.reports'),      path: `${appBasePath}/reports`,          icon: BarChart3 },
    { name: t('dashboard.nav.subscription'), path: `${appBasePath}/subscription`,     icon: CreditCard },
  ];

  const [collapsed, setCollapsed] = useState(false);
  const [showShopPanel, setShowShopPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateShopPopup, setShowCreateShopPopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [createShopName, setCreateShopName] = useState('');
  const [createShopError, setCreateShopError] = useState<string | null>(null);
  const [createShopLoading, setCreateShopLoading] = useState(false);

  const { user, currentShop, allShops, logout, switchShop } = useAuth();

  const shops: Shop[] = allShops.map((shop) => ({
    id: shop.id,
    name: shop.shop_name || shop.unique_code || shop.id,
    logo: '🏪',
    isActive: currentShop?.id === shop.id,
    isDisabled: false,
  }));

  const activeShop = shops.find(shop => shop.isActive);

  // Derive page title from current route
  const activeNav = navigation.find(item =>
    item.path === location.pathname ||
    (item.path !== appBasePath && location.pathname.startsWith(item.path))
  );
  const pageTitle = activeNav?.name ?? 'Easy Moderator';

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
      const { authService } = await import("@/app/lib/auth");
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
        await switchShop(shopId);
      } catch {
        toast.error('Failed to switch shop');
      }
      setShowShopPanel(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutPopup(false);
    setShowShopPanel(false);
    navigate('/signin');
  };

  const sidebarW = collapsed ? 'w-16' : 'w-64';
  const mainML   = collapsed ? 'ml-16' : 'ml-64';

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ─── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={`${sidebarW} bg-white border-r border-gray-200 fixed inset-y-0 left-0 flex flex-col transition-all duration-200 z-30`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shrink-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">EM</span>
            </div>
            {!collapsed && (
              <span className="text-base font-bold text-gray-900 whitespace-nowrap">Easy Moderator</span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== appBasePath && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer: language + privacy */}
        {!collapsed && (
          <div className="px-4 pb-2 flex items-center justify-between shrink-0">
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
            >
              {t('common.privacyPolicy')}
            </a>
            <LanguageToggle variant="dark" />
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="shrink-0 mx-2 mb-2 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors text-xs"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>

      {/* ─── Main area ───────────────────────────────────────────────── */}
      <div className={`flex-1 ${mainML} transition-all duration-200 flex flex-col min-h-screen`}>

        {/* ─── Sticky AppBar ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
          {/* Page title */}
          <h1 className="text-sm font-semibold text-gray-800 flex-1">{pageTitle}</h1>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
            {/* Notification badge — wire up real count when available */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Shop selector */}
          <div className="relative">
            <button
              onClick={() => { setShowShopPanel(p => !p); setShowUserMenu(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs shrink-0">
                {activeShop?.logo || '🏪'}
              </div>
              <span className="max-w-[120px] truncate font-medium">{activeShop?.name || 'Shop'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            </button>

            {showShopPanel && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowShopPanel(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
                  <div className="p-2 max-h-48 overflow-y-auto">
                    {shops.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => handleSwitchShop(shop.id)}
                        disabled={shop.isDisabled}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                          shop.isActive
                            ? 'bg-blue-50 text-blue-600'
                            : shop.isDisabled
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs shrink-0">
                          {shop.logo}
                        </div>
                        <span className="flex-1 text-left truncate">{shop.name}</span>
                        {shop.isActive && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={handleCreateShop}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {t('dashboard.createNewShop')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setShowUserMenu(p => !p); setShowShopPanel(false); }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1">
                  {user?.name && (
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1 px-2">
                    <button
                      onClick={() => { setShowLogoutPopup(true); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('dashboard.logoutTitle')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* ─── Page content ──────────────────────────────────────────── */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* ─── Create Shop Modal ─────────────────────────────────────── */}
      {showCreateShopPopup && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{t('dashboard.createNewShop')}</h2>
                <p className="text-sm text-gray-600">{t('dashboard.addShopDesc')}</p>
              </div>
              <button onClick={() => setShowCreateShopPopup(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-gray-700">{t('dashboard.shopName')}</label>
              <input
                type="text"
                value={createShopName}
                onChange={(e) => setCreateShopName(e.target.value)}
                placeholder={t('dashboard.shopNamePlaceholder')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {createShopError && <p className="text-sm text-red-600">{createShopError}</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateShopPopup(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t('dashboard.cancel')}
              </button>
              <button
                onClick={handleSubmitCreateShop}
                disabled={createShopLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {createShopLoading ? t('dashboard.creating') : t('dashboard.createShop')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Logout Confirmation ───────────────────────────────────── */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{t('dashboard.logoutTitle')}</h2>
                <p className="text-sm text-gray-600">{t('dashboard.logoutConfirm')}</p>
              </div>
              <button onClick={() => setShowLogoutPopup(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t('dashboard.cancel')}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('dashboard.logoutTitle')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
