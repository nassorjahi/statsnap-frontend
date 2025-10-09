// ✅ PLAYER DASHBOARD — FINAL VERIFIED VERSION (Oct 2025)
// ------------------------------------------------------------
// Features:
// ✅ Team → Player → Opponent filters
// ✅ Season averages, last 3/10/1 games, and projections
// ✅ Trend chart (PTS/REB/AST/3PM)
// ✅ Vs Opponent table (on selection)
// ✅ Last 5 games history
// ✅ Team summary toggle (top 5 scorers)
// ✅ Clean, light theme styling
// ------------------------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchEspnHeadshotUrl } from "../utils/playerImageFetcher";
import "../styles/PlayerDashboard.css";

export default function PlayerDashboard() {
  const [rows, setRows] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState("");
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState(null);
  const [error, setError] = useState("");
  const [showTeamSummary, setShowTeamSummary] = useState(false);

  const STAT_KEYS = ["PTS", "REB", "AST", "3PM", "STL", "BLK"];
  const columnMap = { PTS: "PTS", REB: "TOT", AST: "A", "3PM": "3P", STL: "ST", BLK: "BL" };

  // Fetch data
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/player-stats")
      .then((res) => setRows(res.data || []))
      .catch((err) => {
        console.error("❌ API Error:", err);
        setError("Could not load player data.");
      });
  }, []);

  // Dropdowns
  const teams = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      const t = (r["OWN TEAM"] || "").trim();
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [rows]);

  const roster = useMemo(() => {
    if (!selectedTeam) return [];
    const team = selectedTeam.trim();
    return Array.from(
      new Set(
        rows
          .filter((r) => (r["OWN TEAM"] || "").trim() === team)
          .map((r) => r["PLAYER FULL NAME"])
      )
    ).sort();
  }, [rows, selectedTeam]);

  const opponents = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      const t = (r["OPPONENT TEAM"] || "").trim();
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [rows]);

  // Filter data by player/opponent
  const playerRows = useMemo(() => {
    if (!selectedPlayer) return [];
    let filtered = rows.filter((r) => r["PLAYER FULL NAME"] === selectedPlayer);
    if (selectedOpponent && selectedOpponent !== "All Opponents") {
      filtered = filtered.filter((r) => r["OPPONENT TEAM"] === selectedOpponent);
    }
    return filtered.sort((a, b) => new Date(b["DATE"]) - new Date(a["DATE"]));
  }, [rows, selectedPlayer, selectedOpponent]);

  // Stat averages
  const averageFor = (n) => {
    if (!playerRows.length) return {};
    const games = playerRows.slice(0, n);
    const out = {};
    STAT_KEYS.forEach((key) => {
      const col = columnMap[key];
      const avg =
        games.reduce((sum, g) => sum + Number(g[col] || 0), 0) / games.length;
      out[key] = avg.toFixed(1);
    });
    return out;
  };

  const seasonAvg = averageFor(playerRows.length);
  const last10 = averageFor(10);
  const last3 = averageFor(3);
  const last1 = averageFor(1);

  // Weighted projections
  const nextGameProjection = useMemo(() => {
    if (playerRows.length === 0) return {};
    const games = playerRows.slice(0, 10);
    const weights = [0.25, 0.2, 0.15, 0.12, 0.1, 0.08, 0.05, 0.03, 0.015, 0.015];
    const out = {};
    STAT_KEYS.forEach((key) => {
      const col = columnMap[key];
      let ws = 0,
        wt = 0;
      games.forEach((g, i) => {
        const v = Number(g[col]) || 0;
        const w = weights[i] || 0.015;
        ws += v * w;
        wt += w;
      });
      out[key] = (ws / wt).toFixed(1);
    });
    return out;
  }, [playerRows]);

  const opponentAvg = useMemo(() => {
    if (!selectedOpponent || selectedOpponent === "All Opponents") return null;
    const games = rows.filter(
      (r) =>
        r["PLAYER FULL NAME"] === selectedPlayer &&
        r["OPPONENT TEAM"] === selectedOpponent
    );
    if (!games.length) return null;
    const out = {};
    STAT_KEYS.forEach((key) => {
      const col = columnMap[key];
      const avg =
        games.reduce((sum, g) => sum + Number(g[col] || 0), 0) / games.length;
      out[key] = avg.toFixed(1);
    });
    return out;
  }, [rows, selectedPlayer, selectedOpponent]);

  const teamSummary = useMemo(() => {
    if (!showTeamSummary || !selectedTeam) return [];
    const teamRows = rows.filter(
      (r) => (r["OWN TEAM"] || "").trim() === selectedTeam
    );
    const grouped = {};
    teamRows.forEach((r) => {
      const player = r["PLAYER FULL NAME"];
      grouped[player] = grouped[player] || { PTS: 0, G: 0 };
      grouped[player].PTS += Number(r["PTS"] || 0);
      grouped[player].G += 1;
    });
    return Object.entries(grouped)
      .map(([player, data]) => ({
        player,
        ppg: (data.PTS / data.G).toFixed(1),
      }))
      .sort((a, b) => b.ppg - a.ppg)
      .slice(0, 5);
  }, [rows, selectedTeam, showTeamSummary]);

  // Player image
  useEffect(() => {
    if (!selectedPlayer) {
      setPlayerPhotoUrl(null);
      return;
    }
    const row = rows.find((r) => r["PLAYER FULL NAME"] === selectedPlayer);
    const id = row ? row["PLAYER-ID"] : null;

    let cancelled = false;
    fetchEspnHeadshotUrl(selectedPlayer, id).then((url) => {
      if (!cancelled) setPlayerPhotoUrl(url || null);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedPlayer, rows]);

  if (error) return <div className="error">❌ {error}</div>;

  return (
    <div className="player-dashboard">
      <h2 className="title">🏀 NBA Player Stats Dashboard</h2>

      {/* Filters */}
      <div className="filters">
        <select
          value={selectedTeam}
          onChange={(e) => {
            setSelectedTeam(e.target.value);
            setSelectedPlayer("");
          }}
        >
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={`team-${t}`}>{t}</option>
          ))}
        </select>

        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          disabled={!selectedTeam}
        >
          <option value="">
            {selectedTeam ? "Select Player" : "Select a team first"}
          </option>
          {roster.map((p) => (
            <option key={`player-${p}`}>{p}</option>
          ))}
        </select>

        <select
          value={selectedOpponent}
          onChange={(e) => setSelectedOpponent(e.target.value)}
        >
          <option>All Opponents</option>
          {opponents.map((o) => (
            <option key={`opp-${o}`}>{o}</option>
          ))}
        </select>
      </div>

      {selectedPlayer && (
        <>
          {/* Player Card + Stats */}
          <div className="player-section">
            <div className="player-card">
              {playerPhotoUrl ? (
                <img src={playerPhotoUrl} alt={selectedPlayer} />
              ) : (
                <div className="player-placeholder" />
              )}
              <div className="player-name">{selectedPlayer}</div>
              <div className="player-team">{selectedTeam}</div>
            </div>

            <div className="stats-table">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    {STAT_KEYS.map((k) => (
                      <th key={`hdr-${k}`}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Season Avg", seasonAvg],
                    ["Last 3 Games", last3],
                    ["Last 10 Games", last10],
                    ["Last Game", last1],
                    ["Next Game Projection", nextGameProjection],
                  ].map(([label, data]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      {STAT_KEYS.map((k) => (
                        <td key={`val-${label}-${k}`}>{data[k] || "0.0"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-card">
            <h3>📈 Last 10 Games Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={playerRows.slice(0, 10).reverse()}>
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="DATE" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="PTS" stroke="#2563eb" />
                <Line type="monotone" dataKey="TOT" stroke="#10b981" />
                <Line type="monotone" dataKey="A" stroke="#f59e0b" />
                <Line type="monotone" dataKey="3P" stroke="#8b5cf6" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Vs Opponent */}
          {opponentAvg && (
            <div className="card">
              <h3>🧠 Avg vs {selectedOpponent}</h3>
              <table>
                <thead>
                  <tr>
                    {STAT_KEYS.map((k) => (
                      <th key={`opp-${k}`}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {STAT_KEYS.map((k) => (
                      <td key={`oppv-${k}`}>{opponentAvg[k]}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Last 5 Games */}
          <div className="card">
            <h3>Last 5 Games</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Opponent</th>
                  {STAT_KEYS.map((k) => (
                    <th key={`last5-${k}`}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {playerRows.slice(0, 5).map((g, i) => (
                  <tr key={`g-${i}`}>
                    <td>{g["DATE"]}</td>
                    <td>{g["OPPONENT TEAM"]}</td>
                    {STAT_KEYS.map((k) => (
                      <td key={`cell-${i}-${k}`}>{g[columnMap[k]] ?? 0}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Team Summary */}
          <div className="card">
            <button
              className="toggle-btn"
              onClick={() => setShowTeamSummary(!showTeamSummary)}
            >
              {showTeamSummary ? "Hide Team Summary" : "Show Team Summary"}
            </button>

            {showTeamSummary && (
              <div className="team-summary">
                <h3>⚡ Top 5 Players ({selectedTeam})</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>PPG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamSummary.map((p) => (
                      <tr key={p.player}>
                        <td>{p.player}</td>
                        <td>{p.ppg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
