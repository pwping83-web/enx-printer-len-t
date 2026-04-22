import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const rootElement = document.getElementById("root");

const renderFatalError = (title: string, detail: string) => {
  if (!rootElement) return;
  rootElement.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 16px; background: #fff7f7; color: #991b1b; min-height: 100vh;">
      <h2 style="margin: 0 0 8px; font-size: 18px;">${title}</h2>
      <pre style="white-space: pre-wrap; font-size: 13px; line-height: 1.5; background: #ffffff; border: 1px solid #fecaca; padding: 12px; border-radius: 8px;">${detail}</pre>
    </div>
  `;
};

window.addEventListener("error", (event) => {
  renderFatalError("Repair Runtime Error", event.message || "Unknown script error");
});

window.addEventListener("unhandledrejection", (event) => {
  const reason =
    typeof event.reason === "string"
      ? event.reason
      : JSON.stringify(event.reason, null, 2);
  renderFatalError("Repair Promise Error", reason || "Unknown promise rejection");
});

if (!rootElement) {
  throw new Error("root element not found");
}

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  renderFatalError("Repair Bootstrap Error", String(error));
}
  