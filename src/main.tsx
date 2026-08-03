import { createRoot } from "react-dom/client";
import App from "./App";
import LegacyBlueApp from "./LegacyBlueApp";
import { initPremiumOnePager } from "./lib/premium-one-pager";
import "./index.css";
import "./styles/premium-one-pager.css";

const isLegacyBluePage = window.location.pathname.replace(/\/+$/, "") === "/legacy-blue";
document.body.classList.toggle("legacy-blue", isLegacyBluePage);

createRoot(document.getElementById("root")!).render(
  isLegacyBluePage ? <LegacyBlueApp /> : <App />,
);

// Learning tool: selection + scrollbar + prm + light progress on long docs/lists.
// Skip chapter dots / reveal / noise (paper grid already exists; protect LCP).
initPremiumOnePager({
  enableChapters: false,
  enableReveal: false,
  enableProgress: true,
  enableNoise: false,
});
