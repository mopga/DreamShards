import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { LocaleProvider } from "./state/LocaleContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <LocaleProvider>
    <App />
  </LocaleProvider>,
);
