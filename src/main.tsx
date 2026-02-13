
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { ErrorBoundary } from "./app/components/ErrorBoundary.tsx";
import { Toaster } from "sonner";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
    <Toaster position="bottom-right" richColors closeButton duration={3000} />
  </ErrorBoundary>
);
  