// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// ✅ Components
import Navbar from "./components/Navbar";
import MobileFooter from "./components/MobileFooter";

// ✅ Pages
import TodayMatchups from "./pages/TodayMatchups";
import MatchupDeepDive from "./pages/MatchupDeepDive";
import TeamInsights from "./pages/TeamInsights";
import PlayerDashboard from "./pages/PlayerDashboard";

// ✅ Shared Helpers / Data
import { espnLogoCode, teamGradients, posLetter } from "./data/teamData";

// =============================
// 🌐 API CONFIG — Auto-detect environment
// =============================
export const API_URL =
  import.meta.env.MODE === "production"
    ? "https://statsnap-backend.onrender.com/api/player-stats" // Render backend
    : "/api/player-stats"; // Local (Vite proxy handles localhost:5000)

// =============================
// 🧠 MAIN APP COMPONENT
// =============================
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/matchups" replace />} />

        {/* Page routes */}
        <Route path="/matchups" element={<TodayMatchups />} />
        <Route path="/matchup-deep-dive" element={<MatchupDeepDive />} />
        <Route path="/team-insights" element={<TeamInsights />} />
        <Route path="/player-dashboard" element={<PlayerDashboard />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/matchups" replace />} />
      </Routes>

      <MobileFooter />
    </BrowserRouter>
  );
}

// =============================
// ⚙️ UTILITY FUNCTIONS
// =============================

// 🔹 Example: fetch player stats from backend API
export async function fetchPlayerStats() {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return [];
  }
}

// 🔹 Example: safely get a team gradient
export function getTeamGradient(teamName) {
  return teamGradients[teamName] || "radial-gradient(circle at center, #1e293b, #0f172a)";
}

// 🔹 Example: get ESPN-style team slug
export function getTeamLogoSlug(teamName) {
  return espnLogoCode[teamName] || "nba";
}

// 🔹 Example: short format for player position (F/G/C)
export function formatPosition(raw) {
  return posLetter(raw);
}
