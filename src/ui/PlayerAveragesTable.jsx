import React from "react";

export default function PlayerAveragesTable({ team }) {
  if (!team) return null;
  return (
    <div
      style={{
        padding: "16px",
        background: "#fafafa",
        borderRadius: "10px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <h4 style={{ marginBottom: "8px" }}>{team} Player Averages</h4>
      <p style={{ color: "#666" }}>Data table coming soon...</p>
    </div>
  );
}
