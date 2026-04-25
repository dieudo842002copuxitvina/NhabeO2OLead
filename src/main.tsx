import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { captureAttribution } from "./lib/tracking";
import { initGA4 } from "./lib/ga4Client";

// Capture ad source attribution on first load (CAPI tracking)
captureAttribution();

// Bootstrap client-side GA4 (gtag.js) — reads measurement_id from public app_settings
initGA4();

createRoot(document.getElementById("root")!).render(<App />);
