import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

const isPreviewHost =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com") ||
    window.location.hostname.includes("lovable.dev"));

if (isPreviewHost || isInIframe) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(async (regs) => {
      const hadSW = regs.length > 0;
      await Promise.all(regs.map((r) => r.unregister()));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if (hadSW && navigator.serviceWorker.controller) {
        window.location.reload();
      }
    });
  }
} else if ("serviceWorker" in navigator) {
  import("virtual:pwa-register")
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
