import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import { AppProviders } from "./app/AppProviders";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("애플리케이션을 표시할 root 요소를 찾지 못했습니다.");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
