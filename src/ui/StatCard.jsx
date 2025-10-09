// src/ui/StatCard.jsx
import React from "react";

export default function StatCard({ label, value, sub }) {
  return (
    <div className="card center">
      <div className="muted text-xs">{label}</div>
      <div className="stat-value">{value}</div>
      {sub ? <div className={`delta ${sub.includes("+") ? "pos" : sub.includes("-") ? "neg" : ""}`}>{sub}</div> : null}
    </div>
  );
}

