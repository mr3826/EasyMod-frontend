import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { apiClient } from "./lib/api";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  useEffect(() => {
    void apiClient.initCsrfToken();
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
