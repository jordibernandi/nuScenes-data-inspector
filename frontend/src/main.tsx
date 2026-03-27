import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./index.css";
import App from "./App";

// Suppress THREE.Clock deprecation warning from camera-controls (drei dependency).
// camera-controls hasn't migrated to THREE.Timer yet — nothing we can do upstream.
const _origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
  _origWarn.apply(console, args);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <App />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
