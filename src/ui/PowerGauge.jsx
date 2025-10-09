import React from "react";

const PowerGauge = ({ value }) => {
  const pct = parseFloat(value) || 0;

  // Choose color dynamically based on win rate
  const color =
    pct >= 70 ? "#16a34a" : pct >= 50 ? "#facc15" : "#ef4444";

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <p style={{ fontWeight: "600", fontSize: "18px", marginBottom: "8px" }}>
        Power Rating
      </p>
      <div
        style={{
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          border: `12px solid ${color}`,
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "28px",
          fontWeight: "700",
          color: color,
        }}
      >
        {pct}%
      </div>
      <p style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
        Win Rate Indicator
      </p>
    </div>
  );
};

export default PowerGauge;
