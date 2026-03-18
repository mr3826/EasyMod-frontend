import { lazy, createElement, Suspense, type LazyExoticComponent } from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import { authService } from "./lib/auth";

const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const UnifiedInbox = lazy(() => import("./components/UnifiedInbox"));
const Channels = lazy(() => import("./components/Channels"));
const Products = lazy(() => import("./components/Products"));
const Orders = lazy(() => import("./components/Orders"));
const Reports = lazy(() => import("./components/Reports"));
const Knowledge = lazy(() => import("./components/Knowledge"));
const AddProduct = lazy(() => import("./components/AddProduct"));
const ProductDetails = lazy(() => import("./components/ProductDetails"));
const Customers = lazy(() => import("./components/Customers"));
const Categories = lazy(() => import("./components/Categories"));
const CategoryDetails = lazy(() => import("./components/CategoryDetails"));
const SubcategoryDetails = lazy(() => import("./components/SubcategoryDetails"));
const ManageShop = lazy(() => import("./components/ManageShop"));
const ChatSettings = lazy(() => import("./components/ChatSettings"));
const DeliverySettings = lazy(() => import("./components/DeliverySettings"));
const PaymentSettings = lazy(() => import("./components/PaymentSettings"));
const BusinessInfoSettings = lazy(() => import("./components/BusinessInfoSettings"));
const SignIn = lazy(() => import("./components/SignIn"));
const Signup = lazy(() => import("./components/Signup"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const RouteError = lazy(() => import("./components/RouteError"));
const Subscription = lazy(() => import("./components/Subscription"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));

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

const withSuspense = (Component: LazyExoticComponent<any>) => (props: any) =>
	createElement(Suspense, { fallback: createElement("div", { className: "p-8 text-center" }, "Loading...") },
		createElement(Component, props));

export const router = createBrowserRouter([
	{
		path: "/signin",
		Component: withSuspense(SignIn),
		loader: publicLoader,
		errorElement: createElement(RouteError),
	},
	{
		path: "/forgot-password",
		Component: withSuspense(ForgotPassword),
		loader: publicLoader,
		errorElement: createElement(RouteError),
	},
	{
		path: "/reset-password",
		Component: withSuspense(ResetPassword),
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
		path: "/privacy-policy",
		Component: withSuspense(PrivacyPolicy),
		errorElement: createElement(RouteError),
	},
	{
		path: "/",
		Component: withSuspense(Signup),
		loader: publicLoader,
		errorElement: createElement(RouteError),
	},
	{
		path: "/signup",
		Component: withSuspense(Signup),
		loader: publicLoader,
		errorElement: createElement(RouteError),
	},
	{
		path: "/app",
		Component: withSuspense(DashboardLayout),
		loader: protectedLoader,
		errorElement: createElement(RouteError),
		children: [
			{ index: true, Component: withSuspense(Dashboard) },
			{ path: "inbox", Component: withSuspense(UnifiedInbox) },
			{ path: "channels", Component: withSuspense(Channels) },
			{
				path: "manage-shop",
				Component: withSuspense(ManageShop),
				children: [
					{ index: true, Component: withSuspense(BusinessInfoSettings) },
					{ path: "chat-settings", Component: withSuspense(ChatSettings) },
					{ path: "delivery-settings", Component: withSuspense(DeliverySettings) },
					{ path: "payment-settings", Component: withSuspense(PaymentSettings) },
				],
			},
			{ path: "products", Component: withSuspense(Products) },
			{ path: "products/add", Component: withSuspense(AddProduct) },
			{ path: "products/:productId", Component: withSuspense(ProductDetails) },
			{ path: "products/:productId/edit", Component: withSuspense(AddProduct) },
			{ path: "categories", Component: withSuspense(Categories) },
			{ path: "categories/create", Component: withSuspense(CategoryDetails) },
			{ path: "categories/:categoryId", Component: withSuspense(CategoryDetails) },
			{ path: "categories/:categoryId/edit", Component: withSuspense(CategoryDetails) },
			{ path: "categories/:categoryId/:subcategoryId", Component: withSuspense(SubcategoryDetails) },
			{ path: "orders", Component: withSuspense(Orders) },
			{ path: "customers", Component: withSuspense(Customers) },
			{ path: "knowledge", Component: withSuspense(Knowledge) },
			{ path: "reports", Component: withSuspense(Reports) },
			{ path: "subscription", Component: withSuspense(Subscription) },
		],
	},
]);
