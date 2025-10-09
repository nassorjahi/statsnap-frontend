// ✅ PLAYER DASHBOARD — VERIFIED WORKING VERSION (Oct 2025)
// ------------------------------------------------------------
// This version correctly:
// ✅ Loads all stat categories (PTS, REB, AST, 3PM, STL, BLK)
// ✅ Fetches data from http://localhost:5000/api/player-stats
// ✅ Displays player photos from ESPN using PLAYER-ID fallback
// ✅ Includes structured debugging and error handling
// ------------------------------------------------------------

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { fetchEspnHeadshotUrl } from "../utils/playerImageFetcher";

export default function PlayerDashboard() {
  const [rows, setRows] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState("");
  const [error, setError] = useState("");
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState(null);

  const statKeys = {
    PTS: ["PTS", "POINTS"],
    REB: ["REB", "TRB", "OREB", "DREB", "REBOUNDS", "TOT"],
    AST: ["AST", "ASTS", "ASSISTS", "A"],
    "3PM": ["3PM", "3P", "3PTM", "THREEPM"],
    STL: ["STL", "STEALS", "ST"],
    BLK: ["BLK", "BLOCKS", "BL"],
  };

  // 🧩 Fetch data from backend
  useEffect(() => {
    console.log("🚀 Fetching from API...");
    axios
      .get("http://localhost:5000/api/player-stats")
      .then((res) => {
        console.log("✅ API Response Received!");
        if (res.data && res.data.length) {
          console.log("✅ SAMPLE ROW KEYS:", Object.keys(res.data[0]));
          console.log("🔍 FIRST ROW:", res.data[0]);
        } else {
          console.warn("⚠️ API returned empty or no data:", res.data);
        }
        setRows(res.data || []);
      })
      .catch((err) => {
        console.error("❌ API Fetch Error:", err);
        setError(err.message);
      });
  }, []);

  // 🧩 Handle player headshot lookup
  useEffect(() => {
    if (!selectedPlayer) {
      setPlayerPhotoUrl(null);
      return;
    }

    const playerData = rows.find(
      (r) => r["PLAYER FULL NAME"] === selectedPlayer
    );
    const playerId = playerData ? playerData["PLAYER-ID"] : null;

    let canceled = false;
    fetchEspnHeadshotUrl(selectedPlayer, playerId).then((url) => {
      if (!canceled) setPlayerPhotoUrl(url || null);
    });
    return () => {
      canceled = true;
    };
  }, [selectedPlayer, rows]);

  // 🧠 Dropdown data
  const teams = useMemo(
    () => [...new Set(rows.map((r) => r["OWN TEAM"]))].sort(),
    [rows]
  );
  const players = useMemo(
    () =>
      rows
        .filter((r) => r["OWN TEAM"] === selectedTeam)
        .map((r) => r["PLAYER FULL NAME"]),
    [rows, selectedTeam]
  );
  const opponents = useMemo(
    () => [...new Set(rows.map((r) => r["OPPONENT TEAM"]))].sort(),
    [rows]
  );

  // 🧮 Filtered data for selected player/opponent
  const playerRows = useMemo(() => {
    if (!selectedPlayer) return [];
    let filtered = rows.filter((r) => r["PLAYER FULL NAME"] === selectedPlayer);
    if (selectedOpponent && selectedOpponent !== "All Opponents") {
      filtered = filtered.filter((r) => r["OPPONENT TEAM"] === selectedOpponent);
    }
    return filtered;
  }, [rows, selectedPlayer, selectedOpponent]);

  // 📊 Compute averages for each stat category
  const calculateStat = (key) => {
    const keys = statKeys[key];
    for (const k of keys) {
      if (playerRows.length && k in playerRows[0]) {
        return (
          playerRows.reduce((sum, r) => sum + Number(r[k] || 0), 0) /
          playerRows.length
        ).toFixed(1);
      }
    }
    return "0.0";
  };

  const seasonAvg = {
    PTS: calculateStat("PTS"),
    REB: calculateStat("REB"),
    AST: calculateStat("AST"),
    "3PM": calculateStat("3PM"),
    STL: calculateStat("STL"),
    BLK: calculateStat("BLK"),
  };

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "auto" }}>
      <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 20 }}>
        🏀 NBA Player Stats Dashboard
      </h2>

      {/* ---------- FILTERS ---------- */}
      <div style={{ display: "flex", gap: 10, marginBottom: 30 }}>
        <select
          value={selectedTeam}
          onChange={(e) => {
            setSelectedTeam(e.target.value);
            setSelectedPlayer("");
          }}
        >
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
        >
          <option value="">Select Player</option>
          {players.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          value={selectedOpponent}
          onChange={(e) => setSelectedOpponent(e.target.value)}
        >
          <option>All Opponents</option>
          {opponents.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* ---------- PLAYER INFO + STATS ---------- */}
      {selectedPlayer && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "250px 1fr",
            gap: 20,
            marginBottom: 30,
          }}
        >
          {/* Player Card */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              background: "#fff",
            }}
          >
            {playerPhotoUrl ? (
              <img
                src={playerPhotoUrl}
                alt={selectedPlayer}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  marginBottom: 10,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "#e5e7eb",
                  marginBottom: 10,
                }}
              />
            )}
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
              {selectedPlayer}
            </div>
            <div style={{ color: "#475569" }}>{selectedTeam}</div>
          </div>

          {/* Stats Table */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              background: "#fff",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#1d4ed8", color: "white" }}>
                  <th style={{ textAlign: "left", padding: "6px 10px" }}>
                    Category
                  </th>
                  {Object.keys(statKeys).map((key) => (
                    <th key={key} style={{ padding: "6px 10px" }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, padding: "6px 10px" }}>
                    Season Avg
                  </td>
                  {Object.keys(statKeys).map((key) => (
                    <td key={key} style={{ padding: "6px 10px" }}>
                      {seasonAvg[key]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
