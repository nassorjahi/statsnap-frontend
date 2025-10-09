import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function PlayerDashboard() {
  const [rows, setRows] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState("");
  const [error, setError] = useState("");

  // Fetch data
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/player-stats")
      .then((res) => setRows(res.data || []))
      .catch((err) => setError(err.message));
  }, []);

  // --- Helper: safe get stat ---
  const getStat = (row, keys) => {
    for (let k of keys) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
        const val = parseFloat(row[k]);
        return isNaN(val) ? 0 : val;
      }
    }
    return 0;
  };

  // --- Compute averages ---
  const calcAvg = (data, keys) => {
    if (!data.length) return 0;
    const total = data.reduce((sum, d) => sum + getStat(d, keys), 0);
    return (total / data.length).toFixed(1);
  };

  // --- Build dropdown lists ---
  const teams = useMemo(
    () => Array.from(new Set(rows.map((r) => r["OWN TEAM"]))).sort(),
    [rows]
  );
  const players = useMemo(() => {
    if (!selectedTeam) return [];
    return Array.from(
      new Set(
        rows
          .filter((r) => r["OWN TEAM"] === selectedTeam)
          .map((r) => r["PLAYER FULL NAME"])
      )
    ).sort();
  }, [rows, selectedTeam]);
  const opponents = useMemo(
    () => Array.from(new Set(rows.map((r) => r["OPPONENT TEAM"]))).sort(),
    [rows]
  );

  // --- Player games ---
  const playerGames = useMemo(() => {
    if (!selectedPlayer) return [];
    return rows.filter(
      (r) =>
        r["PLAYER FULL NAME"] === selectedPlayer &&
        (!selectedOpponent || r["OPPONENT TEAM"] === selectedOpponent)
    );
  }, [rows, selectedPlayer, selectedOpponent]);

  // Sort by date (latest first)
  const sortedGames = useMemo(() => {
    return [...playerGames].sort(
      (a, b) => new Date(b["DATE"]) - new Date(a["DATE"])
    );
  }, [playerGames]);

  const last3 = sortedGames.slice(0, 3);
  const last10 = sortedGames.slice(0, 10);
  const last5 = sortedGames.slice(0, 5);
  const lastGame = sortedGames[0];

  // --- Calculate averages ---
  const statKeys = {
    PTS: ["PTS", "POINTS"],
    REB: ["REB", "TRB", "REBOUNDS"],
    AST: ["AST", "ASSISTS"],
    "3PM": ["3PM", "3P", "THREEPM", "3PTM"],
    STL: ["STL", "STEALS"],
    BLK: ["BLK", "BLOCKS"],
  };

  const seasonAvg = useMemo(() => {
    const playerRows = rows.filter((r) => r["PLAYER FULL NAME"] === selectedPlayer);
    const result = {};
    Object.keys(statKeys).forEach(
      (k) => (result[k] = calcAvg(playerRows, statKeys[k]))
    );
    return result;
  }, [rows, selectedPlayer]);

  const getPlayerPhoto = (playerName) => {
    if (!playerName) return "";
    // Normalize player name for search-friendly format
    const formatted = playerName
      .replace(/[^a-zA-Z\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    // Try NBA CDN > ESPN fallback > placeholder
    return (
      `https://cdn.nba.com/headshots/nba/latest/1040x760/${formatted}.png` ||
      `https://a.espncdn.com/i/headshots/nba/players/full/${formatted}.png` ||
      "https://via.placeholder.com/150?text=No+Image"
    );
  };

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "auto" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
        🏀 NBA Player Stats Dashboard
      </h1>

      {error && (
        <div style={{ color: "red", marginBottom: 12 }}>
          ⚠️ Failed to load: {error}
        </div>
      )}

      {/* --- Dropdowns --- */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <select
          value={selectedTeam}
          onChange={(e) => {
            setSelectedTeam(e.target.value);
            setSelectedPlayer("");
          }}
          style={{ padding: 8, borderRadius: 8 }}
        >
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          disabled={!selectedTeam}
          style={{ padding: 8, borderRadius: 8 }}
        >
          <option value="">Select Player</option>
          {players.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={selectedOpponent}
          onChange={(e) => setSelectedOpponent(e.target.value)}
          style={{ padding: 8, borderRadius: 8 }}
        >
          <option value="">All Opponents</option>
          {opponents.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {/* --- Player card and averages --- */}
      {selectedPlayer && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "250px 1fr",
            gap: 20,
            marginBottom: 30,
            alignItems: "center",
          }}
        >
          {/* Player Info */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              background: "#fff",
            }}
          >
            <img
              src={getPlayerPhoto(selectedPlayer)}
              alt={selectedPlayer}
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                marginBottom: 10,
                objectFit: "cover",
              }}
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/120")}
            />
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
              {selectedPlayer}
            </div>
            <div style={{ color: "#475569" }}>{selectedTeam}</div>
          </div>

          {/* Stat Table */}
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
                <tr style={{ background: "#1e40af", color: "#fff" }}>
                  <th style={{ padding: 8, textAlign: "left" }}>Category</th>
                  {Object.keys(statKeys).map((h) => (
                    <th key={h} style={{ padding: 8 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: 8, fontWeight: 600 }}>Season Avg</td>
                  {Object.keys(statKeys).map((k) => (
                    <td key={k} style={{ textAlign: "center" }}>
                      {seasonAvg[k]}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: 8, fontWeight: 600 }}>Last 3 Games</td>
                  {Object.keys(statKeys).map((k) => (
                    <td key={k} style={{ textAlign: "center" }}>
                      {calcAvg(last3, statKeys[k])}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: 8, fontWeight: 600 }}>Last 10 Games</td>
                  {Object.keys(statKeys).map((k) => (
                    <td key={k} style={{ textAlign: "center" }}>
                      {calcAvg(last10, statKeys[k])}
                    </td>
                  ))}
                </tr>
                {lastGame && (
                  <tr>
                    <td style={{ padding: 8, fontWeight: 600 }}>Last Game</td>
                    {Object.keys(statKeys).map((k) => (
                      <td key={k} style={{ textAlign: "center" }}>
                        {getStat(lastGame, statKeys[k])}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Last 5 games table --- */}
      {selectedPlayer && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            background: "#fff",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 16,
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Last 5 {selectedOpponent ? `vs ${selectedOpponent}` : "Games"}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1e3a8a", color: "#fff" }}>
                {["Date", "Opponent", ...Object.keys(statKeys)].map((h) => (
                  <th key={h} style={{ padding: 8, textAlign: "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {last5.map((g, i) => (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#f8fafc",
                  }}
                >
                  <td style={{ padding: 8 }}>{g["DATE"]}</td>
                  <td style={{ padding: 8 }}>{g["OPPONENT TEAM"]}</td>
                  {Object.keys(statKeys).map((k) => (
                    <td key={k} style={{ textAlign: "center", padding: 8 }}>
                      {getStat(g, statKeys[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
