// src/ui/ViewToggle.jsx
import React from "react";

const options = [
  { key: "season", label: "Season" },
  { key: "last10", label: "Last 10" },
  { key: "home", label: "Home" },
  { key: "away", label: "Away" },
];

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="toggle">
      {options.map((o) => (
        <button
          key={o.key}
          className={`toggle-btn ${value === o.key ? "active" : ""}`}
          onClick={() => onChange(o.key)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
