// ==========================================================
// 🏀 StatSnap — Index Entry Point
// ----------------------------------------------------------
// ✅ Wraps app in ThemeProvider + BrowserRouter
// ✅ Removes duplicate render calls
// ✅ Clean structure for React 18+
// ==========================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App /> {/* ✅ App now handles all routes */}
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
