import React from "react";
import "./leaderCard.css";

function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const num = Number(n);
  return Math.round(num * 10) / 10; // one decimal
}

export default function LeaderCard({
  category,
  player,
  pos,
  haAvg,            // home/away avg (already selected upstream)
  vsOppAvg,         // average vs opponent
  isHomeTeam,       // boolean for label "Home Avg" / "Away Avg"
  opponentLabel,    // string like "Denver" or "Denver Nuggets"
  photo,
  logo,
}) {
  const haLabel = isHomeTeam ? "Home Avg" : "Away Avg";

  return (
    <div className="lc-card">
      <img className="lc-badge" src={logo} alt="team logo" />
      <div className="lc-cat">{category}</div>

      <img className="lc-headshot" src={photo} alt={player} />

      <div className="lc-player" title={player}>{player}</div>
      <div className="lc-pos">{pos || "—"}</div>

      <div className="lc-stats">
        <div className="lc-statRow">
          <span className="lc-statLabel">{haLabel}</span>
          <span className="lc-statValue">{fmt(haAvg)}</span>
        </div>
        <div className="lc-statRow">
          <span className="lc-statLabel">vs. {opponentLabel}</span>
          <span className="lc-statValue">{fmt(vsOppAvg)}</span>
        </div>
      </div>
    </div>
  );
}
