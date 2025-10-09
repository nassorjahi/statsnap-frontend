// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // ✅ ensure correct .jsx import
import "./index.css"; // ✅ global styles

// 🧱 Create root element and render app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
