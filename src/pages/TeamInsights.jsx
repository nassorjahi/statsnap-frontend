// ==========================================================
// 🏀 TEAM INSIGHTS DASHBOARD — Live API Edition
// ----------------------------------------------------------
// ✅ Pulls data from /api/ab/player-feed + /api/ab/teams
// ✅ Displays team-level and player-level insights
// ✅ Preserves all original table/chart logic and visuals
// ==========================================================

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_URL } from "../data/teamData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ----------------------------------------------------------
// Component
// ----------------------------------------------------------
export default function TeamInsights() {
  const [rows, setRows] = useState([]); // Player stats
  const [teamRows, setTeamRows] = useState([]); // Team stats
  const [selectedTeam, setSelectedTeam] = useState("");
  const [error, setError] = useState("");

  // 🏀 ESPN logo map
  const teamLogoMap = {
    Hawks: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png",
    Celtics: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
    Nets: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png",
    Hornets: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png",
    Bulls: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
    Cavaliers: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png",
    Mavericks: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png",
    Nuggets: "https://a.espncdn.com/i/teamlogos/nba/500/den.png",
    Pistons: "https://a.espncdn.com/i/teamlogos/nba/500/det.png",
    Warriors: "https://a.espncdn.com/i/teamlogos/nba/500/gs.png",
    Rockets: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png",
    Pacers: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png",
    Clippers: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png",
    Lakers: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
    Grizzlies: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png",
    Heat: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png",
    Bucks: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png",
    Timberwolves: "https://a.espncdn.com/i/teamlogos/nba/500/min.png",
    Pelicans: "https://a.espncdn.com/i/teamlogos/nba/500/no.png",
    Knicks: "https://a.espncdn.com/i/teamlogos/nba/500/ny.png",
    Thunder: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png",
    Magic: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png",
    "76ers": "https://a.espncdn.com/i/teamlogos/nba/500/phi.png",
    Suns: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png",
    "Trail Blazers": "https://a.espncdn.com/i/teamlogos/nba/500/por.png",
    Kings: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png",
    Spurs: "https://a.espncdn.com/i/teamlogos/nba/500/sa.png",
    Raptors: "https://a.espncdn.com/i/teamlogos/nba/500/tor.png",
    Jazz: "https://a.espncdn.com/i/teamlogos/nba/500/utah.png",
    Wizards: "https://a.espncdn.com/i/teamlogos/nba/500/wsh.png",
  };

  const statKeys = {
    Points: "PTS",
    Rebounds: "TOT",
    Assists: "A",
    "3 Pointers": "3P",
    Blocks: "BL",
    Steals: "ST",
  };

  // ----------------------------------------------------------
  // Fetch data from API
  // ----------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const [playerFeed, teamFeed] = await Promise.all([
          axios.get(`${API_URL}/ab/player-feed`),
          axios.get(`${API_URL}/ab/teams`),
        ]);

        setRows(playerFeed.data?.data || playerFeed.data?.response || []);
        setTeamRows(teamFeed.data?.data || teamFeed.data?.response || []);
      } catch (err) {
        console.error("❌ Error loading team insights data:", err.message);
        setError("Failed to load data.");
      }
    };
    loadData();
  }, []);

  // ----------------------------------------------------------
  // Team dropdown options
  // ----------------------------------------------------------
  const teams = useMemo(() => {
    const allTeams = [
      ...new Set(
        rows.map((r) => r["OWN TEAM"]).filter(Boolean)
      ),
    ];
    return allTeams.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [rows]);

  // ----------------------------------------------------------
  // Filter rows for selected team
  // ----------------------------------------------------------
  const teamPlayerRows = useMemo(() => {
    if (!selectedTeam) return [];
    return rows.filter((r) => r["OWN TEAM"] === selectedTeam);
  }, [rows, selectedTeam]);

  // ----------------------------------------------------------
  // Build top 6 tables (points, rebounds, etc.)
  // ----------------------------------------------------------
  const buildTable = (label, key) => {
    const players = teamPlayerRows.reduce((acc, r) => {
      const name = r["PLAYER FULL NAME"];
      if (!acc[name]) acc[name] = { home: [], away: [] };
      if (r["VENUE (R/H/N)"] === "H") acc[name].home.push(Number(r[key] || 0));
      if (r["VENUE (R/H/N)"] === "R") acc[name].away.push(Number(r[key] || 0));
      return acc;
    }, {});

    const averages = Object.entries(players).map(([name, data]) => {
      const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
      return {
        name,
        homeAvg: avg(data.home).toFixed(1),
        awayAvg: avg(data.away).toFixed(1),
      };
    });

    const top6 = averages
      .sort(
        (a, b) =>
          Number(b.homeAvg) + Number(b.awayAvg) -
          (Number(a.homeAvg) + Number(a.awayAvg))
      )
      .slice(0, 6);

    return (
      <div
        key={label}
        style={{
          flex: "1",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 12,
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          minWidth: 280,
        }}
      >
        <h3
          style={{
            background: "#b91c1c",
            color: "white",
            textAlign: "center",
            borderRadius: 6,
            padding: "6px 0",
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {label}
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>Player</th>
              <th style={{ padding: "6px 8px", textAlign: "center" }}>Home</th>
              <th style={{ padding: "6px 8px", textAlign: "center" }}>Away</th>
            </tr>
          </thead>
          <tbody>
            {top6.map((p, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  background: i % 2 ? "#fafafa" : "#fff",
                }}
              >
                <td style={{ padding: "6px 8px" }}>{p.name}</td>
                <td style={{ textAlign: "center" }}>{p.homeAvg}</td>
                <td style={{ textAlign: "center" }}>{p.awayAvg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ----------------------------------------------------------
  // Build last 10 games overview
  // ----------------------------------------------------------
  const last10 = useMemo(() => {
    if (!selectedTeam || !teamRows?.length) return [];

    const games = teamRows.filter(
      (g) =>
        g.TEAM === selectedTeam ||
        g.HOME_TEAM === selectedTeam ||
        g.AWAY_TEAM === selectedTeam
    );

    const grouped = {};
    for (const g of games) {
      const key = g.GAME_ID || `${g.HOME_TEAM}-${g.AWAY_TEAM}-${g.DATE}`;
      const isHome = g.HOME_TEAM === selectedTeam;
      grouped[key] = {
        date: g.GAME_DATE || g.DATE,
        opponent: isHome ? g.AWAY_TEAM : g.HOME_TEAM,
        venue: isHome ? "H" : "R",
        teamPts: Number(isHome ? g.PTS_FOR ?? g.PTS : g.PTS_AGAINST ?? g.OPP_PTS),
        oppPts: Number(isHome ? g.PTS_AGAINST ?? g.OPP_PTS : g.PTS_FOR ?? g.PTS),
      };
    }

    const result = Object.values(grouped)
      .map((g) => ({
        ...g,
        result: g.teamPts > g.oppPts ? "W" : g.teamPts < g.oppPts ? "L" : "T",
        logo: teamLogoMap[g.opponent] || "",
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10);

    return result;
  }, [selectedTeam, teamRows]);

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div style={{ padding: 20, maxWidth: 1250, margin: "auto" }}>
      <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 20 }}>
        🏀 Team Insights Dashboard
      </h2>

      {/* Team Selector */}
      <div style={{ marginBottom: 20 }}>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            fontSize: 15,
          }}
        >
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {selectedTeam ? (
        <>
          {/* Player Stat Tables */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            {["Points", "Rebounds", "Assists"].map((label) =>
              buildTable(label, statKeys[label])
            )}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 40 }}>
            {["3 Pointers", "Blocks", "Steals"].map((label) =>
              buildTable(label, statKeys[label])
            )}
          </div>

          {/* Last 10 Games */}
          <div
            style={{
              marginTop: 40,
              background: "#fff",
              borderRadius: 10,
              padding: 20,
              border: "1px solid #e5e7eb",
            }}
          >
            <h3>📈 Last 10 Games — Team vs Opponent</h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 10,
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Opponent</th>
                  <th style={{ textAlign: "center", padding: "6px 8px" }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {last10.map((g, i) => {
                  const prefix = g.venue === "H" ? "vs" : "@";
                  const resultColor =
                    g.result === "W"
                      ? "#16a34a"
                      : g.result === "L"
                      ? "#dc2626"
                      : "#6b7280";
                  const score = `${g.teamPts}-${g.oppPts}`;
                  return (
                    <tr key={i}>
                      <td style={{ padding: "6px 8px" }}>{g.date}</td>
                      <td
                        style={{
                          padding: "6px 8px",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {prefix}{" "}
                        {g.logo && (
                          <img
                            src={g.logo}
                            alt={g.opponent}
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                            }}
                          />
                        )}
                        <span>{g.opponent}</span>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: 600,
                          color: resultColor,
                        }}
                      >
                        {g.result}{" "}
                        <span style={{ color: "#2563eb" }}>{score}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p style={{ color: "#6b7280" }}>
          👆 Select a team above to view player and team insights.
        </p>
      )}
    </div>
  );
}
