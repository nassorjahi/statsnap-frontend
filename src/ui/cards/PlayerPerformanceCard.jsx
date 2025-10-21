// ==========================================================
// 🏀 PLAYER PERFORMANCE CARD — StatSnap Unified Edition
// ----------------------------------------------------------
// ✅ Displays player photo, game stats, and FG%
// ✅ Matches layout and styling of all StatSnap cards
// ==========================================================

import React from "react";
import "../../styles/components/StatCard.css";

export default function PlayerPerformanceCard({ player }) {
  if (!player) return null;

  return (
    <div className="stat-card flex flex-col justify-between items-center text-center px-6 py-5">
      <div className="flex flex-col items-center">
        <img
          src={player.image}
          alt={player.name}
          className="w-20 h-20 rounded-full mb-3"
        />
        <h3 className="font-bold text-lg">{player.name}</h3>
        <p className="text-gray-400 text-sm mb-1">{player.matchup}</p>
        <p className="text-gray-400 text-sm">{player.date}</p>
      </div>

      <div className="mt-4 text-sm">
        <p>{player.points} PTS</p>
        <p>{player.rebounds} REB</p>
        <p>{player.assists} AST</p>
        <p className="text-[#4ad295] mt-2">FG% {player.fgPct}</p>
      </div>

      <div className="text-xs text-gray-400 mt-4">Performance Trend</div>
    </div>
  );
}
