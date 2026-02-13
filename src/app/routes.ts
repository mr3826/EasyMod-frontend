import { createElement } from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import UnifiedInbox from "./components/UnifiedInbox";
import Channels from "./components/Channels";
import Products from "./components/Products";
import Orders from "./components/Orders";
import Reports from "./components/Reports";
import Knowledge from "./components/Knowledge";
import AddProduct from "./components/AddProduct";
import ProductDetails from "./components/ProductDetails";
import Customers from "./components/Customers";
import Categories from "./components/Categories";
import CategoryDetails from "./components/CategoryDetails";
import SubcategoryDetails from "./components/SubcategoryDetails";
import ManageShop from "./components/ManageShop";
import ChatSettings from "./components/ChatSettings";
import DeliverySettings from "./components/DeliverySettings";
import PaymentSettings from "./components/PaymentSettings";
import BusinessInfoSettings from "./components/BusinessInfoSettings";
import SignIn from "./components/SignIn";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import RouteError from "./components/RouteError";

import Subscription from "./components/Subscription";
import { authService } from "./lib/auth";

// Loader function to check authentication
async function protectedLoader() {
  await authService.ensureInitialized();
  if (!authService.isAuthenticated()) {
    return redirect("/");
  }
  return null;
}

async function publicLoader() {
  await authService.ensureInitialized();
  if (authService.isAuthenticated()) {
    return redirect("/app");
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/signin",
    Component: SignIn,
    loader: publicLoader,
    errorElement: createElement(RouteError),
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
    loader: publicLoader,
    errorElement: createElement(RouteError),
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
    loader: publicLoader,
    errorElement: createElement(RouteError),
  },
  {
    path: "/products/add",
    loader: () => {
      if (!authService.isAuthenticated()) {
        return redirect("/");
      }
      return redirect("/app/products/add");
    },
  },
  {
    path: "/products",
    loader: () => redirect("/app/products"),
  },
  {
    path: "/",
    Component: Signup,
    loader: publicLoader,
    errorElement: createElement(RouteError),
  },
  {
    path: "/signup",
    Component: Signup,
    loader: publicLoader,
    errorElement: createElement(RouteError),
  },

  {
    path: "/app",
    Component: DashboardLayout,
    loader: protectedLoader,
    errorElement: createElement(RouteError),
    children: [
      { index: true, Component: Dashboard },
      { path: "inbox", Component: UnifiedInbox },
      { path: "channels", Component: Channels },
      {
        path: "manage-shop",
        Component: ManageShop,
        children: [
          { index: true, Component: BusinessInfoSettings },
          { path: "chat-settings", Component: ChatSettings },
          { path: "delivery-settings", Component: DeliverySettings },
          { path: "payment-settings", Component: PaymentSettings },
        ],
      },
      { path: "products", Component: Products },
      { path: "products/add", Component: AddProduct },
      { path: "products/:productId", Component: ProductDetails },
      { path: "products/:productId/edit", Component: AddProduct },
      { path: "categories", Component: Categories },
      { path: "categories/create", Component: CategoryDetails },
      { path: "categories/:categoryId", Component: CategoryDetails },
      { path: "categories/:categoryId/edit", Component: CategoryDetails },
      { path: "categories/:categoryId/:subcategoryId", Component: SubcategoryDetails },
      { path: "orders", Component: Orders },
      { path: "customers", Component: Customers },
      { path: "knowledge", Component: Knowledge },
      { path: "reports", Component: Reports },
      { path: "subscription", Component: Subscription },
    ],
  },
]);
