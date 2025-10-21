// ==========================================================
// 🏀 STAT CARD SHOWCASE — StatSnap Unified Edition
// ----------------------------------------------------------
// ✅ Displays Player, Matchup, and Smart Bet cards side-by-side
// ✅ Responsive layout (wraps on mobile)
// ✅ Uses unified StatCard and CardShowcase styles
// ==========================================================

import React from "react";
import { motion } from "framer-motion";
import PlayerPerformanceCard from "../ui/cards/PlayerPerformanceCard";
import MatchupInsightsCard from "../ui/cards/MatchupInsightsCard";
import SmartBetCard from "../ui/cards/SmartBetCard";
import "../styles/components/StatCard.css";
import "../styles/CardShowcase.css";

export default function CardShowcase() {
  // Mock example data (replace with live API data later)
  const playerData = {
    name: "Luka Doncic",
    matchup: "DAL vs SAC",
    date: "Apr 5, 2025",
    points: 31,
    rebounds: 10,
    assists: 7,
    fgPct: 54,
    image: "https://a.espncdn.com/i/headshots/nba/players/full/3945274.png",
  };

  const gameData = {
    homeTeam: "76ers",
    homeRecord: "7-3",
    homeLogo: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png",
    homePoints: 113.3,
    homeAgainst: 109.1,
    awayTeam: "Heat",
    awayRecord: "5-5",
    awayLogo: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png",
    awayPoints: 111.5,
    awayAgainst: 112.4,
    projectedAdvantage: 4.2,
  };

  const smartBet = {
    pick: "OVER 26.5 Points",
    confidence: 90,
    last5Avg: 28.4,
    opponentAllows: 24.1,
    restDays: 2,
  };

  return (
    <div className="card-showcase-container">
      <motion.h2
        className="showcase-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        StatSnap Card Showcase
      </motion.h2>

      <div className="showcase-grid">
        <PlayerPerformanceCard player={playerData} />
        <MatchupInsightsCard game={gameData} />
        <SmartBetCard bet={smartBet} />
      </div>

      <div className="back-btn-wrapper">
        <button
          className="back-btn"
          onClick={() => (window.location.href = "/")}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
