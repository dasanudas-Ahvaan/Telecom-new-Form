import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./authContext/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/ToastContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ToastProvider>
        <App />
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
