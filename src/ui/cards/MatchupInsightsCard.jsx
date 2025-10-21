// ==========================================================
// 🏀 MATCHUP INSIGHTS CARD — StatSnap ESPN Final Replica v3
// ----------------------------------------------------------
// ✅ ESPN broadcast replica (logos above names, compact layout)
// ✅ Balanced stats alignment and projected advantage bar
// ✅ Subtle split-glow and responsive structure
// ==========================================================

import React from "react";
import { motion } from "framer-motion";
import "../../styles/components/StatCard.css";

const TEAM_COLORS = {
  ATL: "#E03A3E", BOS: "#007A33", BKN: "#000000", CHA: "#1D1160",
  CHI: "#CE1141", CLE: "#860038", DAL: "#00538C", DEN: "#0E2240",
  DET: "#C8102E", GSW: "#1D428A", HOU: "#CE1141", IND: "#002D62",
  LAC: "#C8102E", LAL: "#552583", MEM: "#5D76A9", MIA: "#98002E",
  MIL: "#00471B", MIN: "#0C2340", NOP: "#0C2340", NYK: "#F58426",
  OKC: "#007AC1", ORL: "#0077C0", PHI: "#006BB6", PHX: "#E56020",
  POR: "#E03A3E", SAC: "#5A2D81", SAS: "#C4CED4", TOR: "#CE1141",
  UTA: "#002B5C", WAS: "#002B5C",
};

export default function MatchupInsightsCard({ game }) {
  if (!game) return null;

  const homeColor =
    TEAM_COLORS[game.homeTeam?.slice(0, 3).toUpperCase()] || "#0195da";
  const awayColor =
    TEAM_COLORS[game.awayTeam?.slice(0, 3).toUpperCase()] || "#ffa610";

  return (
    <motion.div
      className="stat-card matchup-insights-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: `linear-gradient(90deg, ${homeColor}25 0%, #0f1826 50%, ${awayColor}25 100%)`,
        boxShadow: `0 0 25px ${homeColor}40, 0 0 25px ${awayColor}40 inset`,
      }}
    >
      <div className="matchup-wrapper">
        {/* --- Logos --- */}
        <div className="matchup-logos">
          <img src={game.homeLogo} alt={game.homeTeam} className="team-logo" />
          <span className="vs-text">VS</span>
          <img src={game.awayLogo} alt={game.awayTeam} className="team-logo" />
        </div>

        {/* --- Team Names --- */}
        <div className="matchup-names">
          <p>{game.homeTeam}</p>
          <p>{game.awayTeam}</p>
        </div>

        {/* --- Records --- */}
        <div className="matchup-records">
          <p>{game.homeRecord}</p>
          <p>{game.awayRecord}</p>
        </div>

        {/* --- Avg Points --- */}
        <div className="matchup-stats">
          <div>
            <p className="value">{game.homePoints}</p>
            <p className="label">Avg PTS</p>
          </div>
          <div>
            <p className="value">{game.awayPoints}</p>
            <p className="label">Avg PTS</p>
          </div>
        </div>

        {/* --- Points Against --- */}
        <div className="matchup-points-against">
          <p>{game.homeAgainst} Points</p>
          <p>{game.awayAgainst} Points</p>
        </div>

        {/* --- Projected Advantage --- */}
        <motion.div
          className="matchup-advantage-box"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            boxShadow: `0 0 10px ${homeColor}33, 0 0 10px ${awayColor}33 inset`,
          }}
        >
          <p className="label">Projected Advantage</p>
          <p className="advantage-value">
            {game.projectedAdvantage > 0
              ? `+${game.projectedAdvantage}`
              : game.projectedAdvantage}{" "}
            PTS
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
