import { lazy, createElement, Suspense } from "react";
import { createStaticRouter } from "react-router-dom/server";

const SignIn = lazy(() => import("./components/SignIn"));
const Signup = lazy(() => import("./components/Signup"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const RouteError = lazy(() => import("./components/RouteError"));

const withSuspense = (Component: React.LazyExoticComponent<any>) => (props: any) => (
  <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
    <Component {...props} />
  </Suspense>
);

export const ssrRouter = createStaticRouter([
  {
    path: "/signin",
    Component: withSuspense(SignIn),
    errorElement: createElement(RouteError),
  },
  {
    path: "/forgot-password",
    Component: withSuspense(ForgotPassword),
    errorElement: createElement(RouteError),
  },
  {
    path: "/reset-password",
    Component: withSuspense(ResetPassword),
    errorElement: createElement(RouteError),
  },
  {
    path: "/",
    Component: withSuspense(Signup),
    errorElement: createElement(RouteError),
  },
  {
    path: "/signup",
    Component: withSuspense(Signup),
    errorElement: createElement(RouteError),
  },
]);
