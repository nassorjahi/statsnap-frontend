import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const link = ({ isActive }) => ({
    padding: "10px 14px",
    borderRadius: 10,
    textDecoration: "none",
    color: isActive ? "#111" : "#334155",
    background: isActive ? "#f1f5f9" : "transparent",
    fontWeight: 600,
  });

  return (
    <nav style={{
      display: "flex",
      gap: 12,
      alignItems: "center",
      padding: "12px 16px",
      borderBottom: "1px solid #e5e7eb",
      position: "sticky",
      top: 0,
      background: "#fff",
      zIndex: 10
    }}>
      <div style={{ fontWeight: 800, fontSize: 18 }}>🏀 NBA Dashboard</div>
      <div style={{ display: "flex", gap: 8, marginLeft: 12, flexWrap: "wrap" }}>
        <NavLink to="/matchups" style={link}>Today’s Matchups</NavLink>
        <NavLink to="/matchup-deep-dive" style={link}>Matchup Deep Dive</NavLink>
        <NavLink to="/player-dashboard" style={link}>Player Dashboard</NavLink>
        <NavLink to="/team-insights" style={link}>Team Insights</NavLink>
      </div>
    </nav>
  );
}
