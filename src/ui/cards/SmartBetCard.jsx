// ==========================================================
// 💡 SMART BET CARD — StatSnap "Bet Slip" Replica
// ----------------------------------------------------------
// ✅ Animated confidence gauge
// ✅ Gradient highlight bar (StatSnap Edge)
// ✅ Compact bullet layout (Projected / Bets / Line Shift)
// ✅ Result footer
// ==========================================================

import React from "react";
import { motion } from "framer-motion";
import "../../styles/components/StatCard.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function SmartBetCard({ bet }) {
  if (!bet) return null;

  const confidenceColor =
    bet.confidence >= 70
      ? "#4AD295"
      : bet.confidence >= 50
      ? "#FFA610"
      : "#FF4D4D";

  return (
    <motion.div
      className="stat-card smart-bet-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* --- Header --- */}
      <div className="bet-header">
        <div className="bet-logo-title">
          <img src={bet.logo} alt={bet.matchup} className="bet-logo" />
          <h3 className="bet-title">{bet.matchup}</h3>
        </div>
        <p className="bet-subtitle">SMART BET SLIP</p>
      </div>

      {/* --- Confidence Gauge --- */}
      <div className="gauge-container">
        <CircularProgressbar
          value={bet.confidence}
          text={`${bet.confidence}%`}
          strokeWidth={10}
          styles={buildStyles({
            textColor: "#ffffff",
            pathColor: confidenceColor,
            trailColor: "#1E293B",
            textSize: "1.5rem",
          })}
        />
        <p className="gauge-label">CONFIDENCE</p>
      </div>

      {/* --- Details --- */}
      <ul className="bet-details">
        <li>
          <span>Projected:</span> {bet.projected}
        </li>
        <li>
          <span>{bet.betsOn}%</span> Bets on: {bet.team}
        </li>
        <li>
          <span>Line Shift:</span> {bet.lineShift}
        </li>
      </ul>

      {/* --- Edge Highlight --- */}
      <div className="edge-banner">
        <p>
          STATSNAP EDGE{" "}
          <span className="edge-value">
            {bet.edge > 0 ? `+${bet.edge}` : bet.edge}
          </span>
        </p>
      </div>

      {/* --- Footer --- */}
      <div className="bet-footer">
        <p className="result-label">
          Result: <span className="result-value">{bet.result}</span>
        </p>
        <p className="footer-link">statsnap.app/betslip</p>
      </div>
    </motion.div>
  );
}
