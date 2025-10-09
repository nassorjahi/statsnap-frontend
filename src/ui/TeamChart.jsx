import React from "react";

export default function TeamChart({ team }) {
  if (!team) return null;
  return (
    <div style={{ padding: 12, background: "#fafafa", borderRadius: 8 }}>
      <h4>{team} Team Chart</h4>
      <p>Chart visualization will appear here.</p>
    </div>
  );
}
