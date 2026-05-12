import { createRoot } from "react-dom/client";
import App from "./App";
import LegacyBlueApp from "./LegacyBlueApp";
import "./index.css";

const isLegacyBluePage = window.location.pathname.replace(/\/+$/, "") === "/legacy-blue";
document.body.classList.toggle("legacy-blue", isLegacyBluePage);

createRoot(document.getElementById("root")!).render(
  isLegacyBluePage ? <LegacyBlueApp /> : <App />,
);
