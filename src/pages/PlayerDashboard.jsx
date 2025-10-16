// ==========================================================
// 🏀 PLAYER DASHBOARD — LIVE DATA + OPTIMIZED VERSION
// ----------------------------------------------------------
// ✅ Pulls data from /api/ab/player-feed (StatSnap backend)
// ✅ Preprocesses rosters, opponents, and players on idle time
// ✅ Caches lookups for O(1) dropdown selection
// ✅ Fully compatible with Render + all visual features
// ==========================================================

import React, { useEffect, useMemo, useState, useTransition } from "react";
import axios from "axios";
import { API_URL } from "../data/teamData";
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

// -----------------------------
// Helpers
// -----------------------------
const normalize = (v) => (v == null ? "" : String(v).trim().toLowerCase());

const parseGameDate = (raw) => {
  if (!raw) return NaN;
  const num = Number(raw);
  if (!isNaN(num) && num > 10000 && num < 80000) {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + num * 86400000);
  }
  const d = new Date(raw);
  if (!isNaN(d)) return d;
  const m = String(raw).match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const [_, mm, dd, yyyy] = m;
    return new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T00:00:00Z`);
  }
  return NaN;
};

const formatExcelDate = (value, pretty = false) => {
  if (!value) return "";
  const parsedDate = parseGameDate(value);
  if (!isNaN(parsedDate))
    return parsedDate.toLocaleDateString("en-US", {
      month: pretty ? "short" : "2-digit",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  return "";
};

// -----------------------------
// Component
// -----------------------------
export default function PlayerDashboard() {
  const [rows, setRows] = useState([]);
  const [gamesByPlayer, setGamesByPlayer] = useState(new Map());
  const [rostersByTeam, setRostersByTeam] = useState({});
  const [opponents, setOpponents] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState("");
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const TEAM_NAME_MAP = {
    "76ers": "Philadelphia 76ers", Bucks: "Milwaukee Bucks", Bulls: "Chicago Bulls",
    Cavaliers: "Cleveland Cavaliers", Celtics: "Boston Celtics", Clippers: "LA Clippers",
    Grizzlies: "Memphis Grizzlies", Hawks: "Atlanta Hawks", Heat: "Miami Heat",
    Hornets: "Charlotte Hornets", Jazz: "Utah Jazz", Kings: "Sacramento Kings",
    Knicks: "New York Knicks", Lakers: "Los Angeles Lakers", Magic: "Orlando Magic",
    Mavericks: "Dallas Mavericks", Nets: "Brooklyn Nets", Nuggets: "Denver Nuggets",
    Pacers: "Indiana Pacers", Pelicans: "New Orleans Pelicans", Pistons: "Detroit Pistons",
    Raptors: "Toronto Raptors", Rockets: "Houston Rockets", Spurs: "San Antonio Spurs",
    Suns: "Phoenix Suns", Thunder: "Oklahoma City Thunder", Timberwolves: "Minnesota Timberwolves",
    "Trail Blazers": "Portland Trail Blazers", Warriors: "Golden State Warriors", Wizards: "Washington Wizards",
  };
  const NBA_TEAMS = new Set(Object.values(TEAM_NAME_MAP));
  const TEAM_SHORT_TO_FULL = TEAM_NAME_MAP;
  const TEAM_FULL_TO_SHORT = Object.fromEntries(
    Object.entries(TEAM_NAME_MAP).map(([s, f]) => [f, s])
  );

  const STAT_KEYS = ["PTS", "REB", "AST", "3PM", "STL", "BLK"];
  const columnMap = { PTS: "PTS", REB: "TOT", AST: "A", "3PM": "3P", STL: "ST", BLK: "BL" };

  // --------------------------------------------------
  // Fetch player data (LIVE)
  // --------------------------------------------------
  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API_URL}/ab/player-feed`)
      .then((res) => {
        if (!mounted) return;
        const data =
          Array.isArray(res.data?.data) || Array.isArray(res.data?.response)
            ? res.data.data || res.data.response
            : [];
        setRows(data);
        console.log("✅ Player data loaded:", data.length);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load player data.");
      });
    return () => (mounted = false);
  }, []);

  // --------------------------------------------------
  // Preprocess (on idle thread)
  // --------------------------------------------------
  useEffect(() => {
    if (!rows.length) return;
    const processData = () => {
      const map = new Map();
      const rosterMap = {};
      const opponentSet = new Set();
      const cutoff = new Date("2024-01-01T00:00:00Z").getTime();

      for (const r of rows) {
        const playerName = r["PLAYER FULL NAME"];
        const date = parseGameDate(r["DATE"]);
        if (!playerName || isNaN(date) || date.getTime() < cutoff) continue;

        const key = normalize(playerName);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(r);

        const fullTeam = TEAM_SHORT_TO_FULL[r["OWN TEAM"]] || r["OWN TEAM"];
        if (NBA_TEAMS.has(fullTeam)) {
          if (!rosterMap[fullTeam]) rosterMap[fullTeam] = new Set();
          rosterMap[fullTeam].add(playerName);
        }

        const oppFull = TEAM_SHORT_TO_FULL[r["OPPONENT TEAM"]] || r["OPPONENT TEAM"];
        if (NBA_TEAMS.has(oppFull)) opponentSet.add(oppFull);
      }

      for (const games of map.values()) {
        games.sort((a, b) => parseGameDate(b["DATE"]) - parseGameDate(a["DATE"]));
      }

      const finalRoster = {};
      for (const [team, set] of Object.entries(rosterMap)) {
        finalRoster[team] = Array.from(set).sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
      }

      setGamesByPlayer(map);
      setRostersByTeam(finalRoster);
      setOpponents(Array.from(opponentSet).sort((a, b) => a.localeCompare(b)));
      console.log(`✅ Processed ${map.size} players.`);
    };

    if ("requestIdleCallback" in window)
      requestIdleCallback(processData);
    else setTimeout(processData, 0);
  }, [rows]);

  // --------------------------------------------------
  // Derived Data
  // --------------------------------------------------
  const roster = useMemo(() => rostersByTeam[selectedTeam] || [], [selectedTeam, rostersByTeam]);
  const teams = useMemo(
    () => Array.from(NBA_TEAMS).sort((a, b) => a.localeCompare(b)),
    []
  );

  const playerRows = useMemo(() => {
    if (!selectedPlayer) return [];
    const base = gamesByPlayer.get(normalize(selectedPlayer)) || [];
    if (!selectedOpponent || selectedOpponent === "All Opponents") return base;
    const short = TEAM_FULL_TO_SHORT[selectedOpponent] || selectedOpponent;
    return base.filter((g) => normalize(g["OPPONENT TEAM"]) === normalize(short));
  }, [selectedPlayer, selectedOpponent, gamesByPlayer, TEAM_FULL_TO_SHORT]);

  // --------------------------------------------------
  // Aggregates
  // --------------------------------------------------
  const averageFor = (n) => {
    if (!playerRows.length) return {};
    const games = playerRows.slice(0, n);
    const out = {};
    for (const k of STAT_KEYS) {
      const col = columnMap[k];
      out[k] = (
        games.reduce((s, g) => s + (Number(g[col]) || 0), 0) / games.length
      ).toFixed(1);
    }
    return out;
  };

  const seasonAvg = averageFor(playerRows.length);
  const last10 = averageFor(10);
  const last3 = averageFor(3);
  const last1 = averageFor(1);

  const nextGameProjection = useMemo(() => {
    if (!playerRows.length) return {};
    const games = playerRows.slice(0, 10);
    const weights = [0.25, 0.2, 0.15, 0.12, 0.1, 0.08, 0.05, 0.03, 0.015, 0.015];
    const out = {};
    for (const k of STAT_KEYS) {
      const col = columnMap[k];
      let sum = 0,
        wsum = 0;
      games.forEach((g, i) => {
        const v = Number(g[col]) || 0;
        const w = weights[i] || 0.015;
        sum += v * w;
        wsum += w;
      });
      out[k] = (sum / wsum).toFixed(1);
    }
    return out;
  }, [playerRows]);

  const opponentAvg = useMemo(() => {
    if (!selectedOpponent || selectedOpponent === "All Opponents") return null;
    if (!playerRows.length) return null;
    const out = {};
    for (const k of STAT_KEYS) {
      const col = columnMap[k];
      out[k] = (
        playerRows.reduce((s, g) => s + (Number(g[col]) || 0), 0) /
        playerRows.length
      ).toFixed(1);
    }
    return out;
  }, [playerRows, selectedOpponent]);

  const latestDate = playerRows.length
    ? formatExcelDate(playerRows[0]["DATE"], true)
    : "";

  // --------------------------------------------------
  // Headshot Fetcher
  // --------------------------------------------------
  useEffect(() => {
    if (!selectedPlayer) return setPlayerPhotoUrl(null);
    let cancelled = false;
    setTimeout(() => {
      const games = gamesByPlayer.get(normalize(selectedPlayer));
      const row = games?.[0];
      const id = row ? row["PLAYER-ID"] : null;
      fetchEspnHeadshotUrl(selectedPlayer, id).then((url) => {
        if (!cancelled) setPlayerPhotoUrl(url || null);
      });
    }, 50);
    return () => (cancelled = true);
  }, [selectedPlayer, gamesByPlayer]);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  if (error) return <div style={{ color: "red", padding: 20 }}>{error}</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1150, margin: "auto" }}>
      <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 20 }}>
        🏀 NBA Player Stats Dashboard
      </h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
        <select
          value={selectedTeam}
          onChange={(e) => {
            startTransition(() => {
              setSelectedTeam(e.target.value);
              setSelectedPlayer("");
              setSelectedOpponent("");
            });
          }}
        >
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select
          value={selectedPlayer}
          onChange={(e) => {
            startTransition(() => setSelectedPlayer(e.target.value));
          }}
          disabled={!selectedTeam}
        >
          <option value="">
            {selectedTeam ? "Select Player" : "Select a team first"}
          </option>
          {roster.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          value={selectedOpponent}
          onChange={(e) => startTransition(() => setSelectedOpponent(e.target.value))}
        >
          <option value="">All Opponents</option>
          {opponents.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {isPending && <div style={{ opacity: 0.6 }}>Loading…</div>}

      {/* Player Section */}
      {selectedPlayer && (
        <>
          {/* Player Overview */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "250px 1fr",
              gap: 20,
              marginBottom: 30,
            }}
          >
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
                    objectFit: "cover",
                    marginBottom: 10,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "#e5e7eb",
                    margin: "auto",
                    marginBottom: 10,
                  }}
                />
              )}
              <div style={{ fontWeight: 800, fontSize: 18 }}>{selectedPlayer}</div>
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
                    {STAT_KEYS.map((k) => (
                      <th key={k} style={{ padding: "6px 10px" }}>
                        {k}
                      </th>
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
                      <td style={{ fontWeight: 600, padding: "6px 10px" }}>{label}</td>
                      {STAT_KEYS.map((k) => (
                        <td key={k} style={{ padding: "6px 10px" }}>
                          {data[k] || "0.0"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              background: "#fff",
              padding: 16,
              marginBottom: 24,
            }}
          >
            <h3>📈 Last 10 Games Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={playerRows.slice(0, 10).reverse()}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis
                  dataKey="DATE"
                  tickFormatter={(d) => formatExcelDate(d, true)}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(l) => formatExcelDate(l, true)}
                  formatter={(v, n) => [v, n]}
                />
                <Legend />
                <Line type="monotone" dataKey="PTS" stroke="#2563eb" />
                <Line type="monotone" dataKey="TOT" stroke="#10b981" />
                <Line type="monotone" dataKey="A" stroke="#f59e0b" />
                <Line type="monotone" dataKey="3P" stroke="#8b5cf6" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Opponent Average */}
          {opponentAvg && (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#fff",
                padding: 16,
                marginBottom: 24,
              }}
            >
              <h3>🧠 Avg vs {selectedOpponent}</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1d4ed8", color: "white" }}>
                    {STAT_KEYS.map((k) => (
                      <th key={k}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {STAT_KEYS.map((k) => (
                      <td key={k} style={{ padding: "6px 10px" }}>
                        {opponentAvg[k]}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Last 5 Games */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              background: "#fff",
              padding: 16,
            }}
          >
            <h3>
              LAST 5 GAMES{" "}
              {latestDate && (
                <span style={{ fontWeight: "normal" }}>
                  (through {latestDate})
                </span>
              )}
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#1d4ed8", color: "white" }}>
                  <th>Date</th>
                  <th>Opponent</th>
                  {STAT_KEYS.map((k) => (
                    <th key={k}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {playerRows.slice(0, 5).map((g, i) => (
                  <tr key={i} style={{ background: i % 2 ? "#f9fafb" : "#fff" }}>
                    <td>{formatExcelDate(g["DATE"], true)}</td>
                    <td>{g["OPPONENT TEAM"]}</td>
                    {STAT_KEYS.map((k) => (
                      <td key={k}>{g[columnMap[k]] ?? 0}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
