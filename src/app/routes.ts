import { createBrowserRouter, redirect } from "react-router";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import UnifiedInbox from "./components/UnifiedInbox";
import Channels from "./components/Channels";
import Products from "./components/Products";
import Orders from "./components/Orders";
import Reports from "./components/Reports";
import Knowledge from "./components/Knowledge";
import AddProduct from "./components/AddProduct";
import ConversationIntelligence from "./components/ConversationIntelligence";
import Categories from "./components/Categories";
import CategoryDetails from "./components/CategoryDetails";
import SubcategoryDetails from "./components/SubcategoryDetails";
import ManageShop from "./components/ManageShop";
import Marketing from "./components/Marketing";
import CreateCampaign from "./components/CreateCampaign";
import SignIn from "./components/SignIn";
import { authService } from "./lib/auth";

// Loader function to check authentication
function protectedLoader() {
  if (!authService.isAuthenticated()) {
    return redirect("/signin");
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/signin",
    Component: SignIn,
  },
  {
    path: "/",
    Component: DashboardLayout,
    loader: protectedLoader,
    children: [
      { index: true, Component: Dashboard },
      { path: "inbox", Component: UnifiedInbox },
      { path: "channels", Component: Channels },
      { path: "manage-shop", Component: ManageShop },
      { path: "products", Component: Products },
      { path: "products/add", Component: AddProduct },
      { path: "categories", Component: Categories },
      { path: "categories/create", Component: CategoryDetails },
      { path: "categories/:categoryId", Component: CategoryDetails },
      { path: "categories/:categoryId/edit", Component: CategoryDetails },
      { path: "categories/:categoryId/:subcategoryId", Component: SubcategoryDetails },
      { path: "orders", Component: Orders },
      { path: "intelligence", Component: ConversationIntelligence },
      { path: "marketing", Component: Marketing },
      { path: "marketing/create-campaign", Component: CreateCampaign },
      { path: "knowledge", Component: Knowledge },
      { path: "reports", Component: Reports },
    ],
  },
]);
