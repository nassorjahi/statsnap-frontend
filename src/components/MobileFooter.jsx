import React from "react";
import { NavLink } from "react-router-dom";

export default function MobileFooter() {
  const wrap = {
    position: "sticky",
    bottom: 0,
    background: "#fff",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0",
    zIndex: 10
  };
  const link = ({ isActive }) => ({
    textDecoration: "none",
    color: isActive ? "#111" : "#64748b",
    fontSize: 12,
    fontWeight: 700,
  });
  return (
    <footer style={wrap}>
      <NavLink to="/matchups" style={link}>Matchups</NavLink>
      <NavLink to="/matchup-deep-dive" style={link}>Deep Dive</NavLink>
      <NavLink to="/player-dashboard" style={link}>Players</NavLink>
      <NavLink to="/team-insights" style={link}>Teams</NavLink>
    </footer>
  );
}
