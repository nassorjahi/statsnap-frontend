// ==========================================================
// 🏀 TODAY'S MATCHUPS — LIVE API EDITION (StatSnap)
// ----------------------------------------------------------
// ✅ Pulls from API-Basketball routes: games, odds, predictions
// ✅ Auto-fallback to upcoming games if no live games today
// ✅ Friendly beginner layout (Spread, Total, Confidence)
// ✅ Keeps debug logs for development
// ==========================================================

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { API_URL } from "../data/teamData";
import "../styles/TodayMatchups.css";

export default function TodayMatchups() {
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // =====================================================
  // 🧠 LOAD LIVE + UPCOMING GAMES (with odds & predictions)
  // =====================================================
  useEffect(() => {
    const loadGames = async () => {
      console.group("🔍 TodayMatchups (Live API Mode)");
      try {
        // --- Fetch live games first ---
        const liveRes = await axios.get(`${API_URL}/api/ab/games/today`)

        let gameList = liveRes.data?.data || [];

        if (!Array.isArray(gameList) || !gameList.length) {
          console.log("⚠️ No live games — fetching upcoming instead...");
          const nextRes = await axios.get(`${API_URL}/ab/games/upcoming`);
          gameList = nextRes.data?.data || [];
          setStatus("Upcoming Games");
        } else {
          setStatus("Today's Games");
        }

        console.log(`📊 Loaded ${gameList.length} games`);

        // --- Fetch odds + predictions ---
        const [oddsRes, predRes] = await Promise.all([
          axios.get(`${API_URL}/ab/odds?bookmaker=FanDuel`),
          axios.get(`${API_URL}/ab/predictions`),
        ]);

        const oddsList = oddsRes.data?.data || [];
        const predList = predRes.data?.data || [];

        console.log(`💰 Odds count: ${oddsList.length}`);
        console.log(`🔮 Predictions count: ${predList.length}`);

        // --- Combine all data ---
        const merged = gameList.map((g) => {
          const home = g.home?.name || g.HomeTeam || g.homeTeam || g.home || "Unknown";
          const away = g.away?.name || g.AwayTeam || g.awayTeam || g.away || "Unknown";
          const date = g.date || g.game_date || g.start || "N/A";

          const odds = oddsList.find(
            (o) => o.teams?.home === home || o.teams?.away === away
          );
          const pred = predList.find(
            (p) => p.home?.name === home || p.away?.name === away
          );

          return {
            home,
            away,
            date,
            spread: odds?.bookmakers?.[0]?.bets?.[0]?.values?.[0]?.odd || "N/A",
            total: odds?.bookmakers?.[0]?.bets?.[1]?.values?.[0]?.odd || "N/A",
            pick: pred?.winner?.name || "N/A",
            confidence: pred?.confidence ? `${pred.confidence}%` : "N/A",
          };
        });

        setGames(merged);
      } catch (err) {
        console.error("❌ Error loading matchups:", err);
        setError("Failed to load NBA data. Please try again later.");
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    loadGames();
  }, []);

  // =====================================================
  // 🧩 Derived helpers
  // =====================================================
  const hasGames = useMemo(() => games && games.length > 0, [games]);

  // =====================================================
  // 🧩 Render
  // =====================================================
  if (loading) {
    return (
      <div className="loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        >
          🏀
        </motion.div>
        <p>{status}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: "red", padding: 20 }}>
        <strong>{error}</strong>
      </div>
    );
  }

  if (!hasGames) {
    return (
      <div className="empty text-center mt-10 text-gray-500">
        No live or upcoming NBA games available right now.
      </div>
    );
  }

  // =====================================================
  // 🏀 Render Table
  // =====================================================
  return (
    <div className="today-matchups p-4">
      <h2 className="text-xl font-bold mb-3">{status}</h2>
      <table className="table-auto w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2">Matchup</th>
            <th className="text-left p-2">Spread</th>
            <th className="text-left p-2">Total</th>
            <th className="text-left p-2">Prediction</th>
            <th className="text-left p-2">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {games.map((g, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td className="p-2">{g.away} @ {g.home}</td>
              <td className="p-2">{g.spread}</td>
              <td className="p-2">{g.total}</td>
              <td className="p-2">{g.pick}</td>
              <td className="p-2">{g.confidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
