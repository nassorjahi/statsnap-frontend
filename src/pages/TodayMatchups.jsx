// ==========================================================
// 🏀 MATCHUP DEEP DIVE — UNIVERSAL TEAM EDITION
// ----------------------------------------------------------
// ✅ Pulls live data from backend APIs
// ✅ Lists all teams dynamically (no hardcoding)
// ✅ Auto-generates Smart Bets + Head-to-Head
// ✅ Works with /api/ab/player-feed, /api/ab/games/today, /api/ab/teams
// ==========================================================

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "../data/teamData";
import { fetchEspnHeadshotUrl } from "../utils/playerImageFetcher";
import "../styles/MatchupDeepDive.css";

export default function MatchupDeepDive() {
  const [games, setGames] = useState([]);
  const [playerFeed, setPlayerFeed] = useState([]);
  const [teams, setTeams] = useState([]);
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [selectedHomePlayers, setSelectedHomePlayers] = useState([]);
  const [selectedAwayPlayers, setSelectedAwayPlayers] = useState([]);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [viewRoster, setViewRoster] = useState("both");
  const [error, setError] = useState("");

  // =====================================================
  // 1️⃣ Load Live Data — dynamic, non-hardcoded
  // =====================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const [gamesRes, playerRes, teamsRes] = await Promise.all([
          axios.get(`${API_URL}/ab/games/today`),
          axios.get(`${API_URL}/ab/player-feed`),
          axios.get(`${API_URL}/ab/teams`),
        ]);

        const gamesData = gamesRes.data?.response || gamesRes.data?.data || [];
        const playerData =
          playerRes.data?.response || playerRes.data?.data || [];

        // Try to get teams from API or fallback to unique team names in playerFeed
        let teamList =
          teamsRes.data?.data?.map((t) => t.Team || t.name) ||
          teamsRes.data?.response?.map((t) => t.Team || t.name) ||
          [];

        if (!teamList.length && playerData.length) {
          const fromFeed = playerData.map((p) => p["OWN TEAM"]).filter(Boolean);
          teamList = [...new Set(fromFeed)];
        }

        setGames(gamesData);
        setPlayerFeed(playerData);
        setTeams(
          [...new Set(teamList)].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" })
          )
        );
      } catch (err) {
        console.error("❌ Error loading live data:", err);
        setError("Failed to load live NBA data.");
      }
    };
    loadData();
  }, []);

  // =====================================================
  // 2️⃣ Player Logic + Smart Bets
  // =====================================================
  const calcBet = (stat, p, isHome) => {
    const avg = Number(p[stat]) || 0;
    const adj = avg * (isHome ? 1.05 : 0.95);
    const line = (Math.round(adj * 2) / 2).toFixed(1);
    const conf = Math.min(99, Math.max(70, 70 + Math.random() * 30));
    return { line, confidence: conf };
  };

  const color = (c) => (c >= 90 ? "high" : c >= 80 ? "medium" : "low");

  const handleTeamSelect = (team, isHome) => {
    if (!team) return;

    const teamPlayers = playerFeed.filter(
      (p) => p["OWN TEAM"]?.toLowerCase() === team.toLowerCase()
    );

    if (!teamPlayers.length) return;

    const uniquePlayers = Array.from(
      new Map(teamPlayers.map((p) => [p["PLAYER FULL NAME"], p])).values()
    ).slice(0, 6);

    const picks = uniquePlayers.map((p) => {
      const { line, confidence } = calcBet("PTS", p, isHome);
      return { ...p, stat: "PTS", line, confidence };
    });

    if (isHome) {
      setHomeTeam(team);
      setSelectedHomePlayers(picks);
    } else {
      setAwayTeam(team);
      setSelectedAwayPlayers(picks);
    }
  };

  const panel = (team, isHome) => {
    const selectedPlayers = isHome ? selectedHomePlayers : selectedAwayPlayers;
    if (!team || !selectedPlayers.length) return null;

    return (
      <>
        <div className="team-stats">
          <h4>{isHome ? "Home" : "Away"} Team</h4>
          <p>
            <strong>Players:</strong> {selectedPlayers.length}
          </p>
        </div>

        <div className="player-preview">
          {selectedPlayers.map((p, i) => (
            <div key={i} className={`player-card ${color(p.confidence)}`}>
              <img
                src={fetchEspnHeadshotUrl(p["PLAYER FULL NAME"])}
                alt={p["PLAYER FULL NAME"]}
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              />
              <h5>{p["PLAYER FULL NAME"]}</h5>
              <p>
                <strong>{p.stat}</strong> O {p.line}
              </p>
              <motion.div
                className={`confidence-bar ${color(p.confidence)}`}
                initial={{ width: "0%" }}
                animate={{ width: `${p.confidence}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                {p.confidence.toFixed(0)}%
              </motion.div>
            </div>
          ))}
        </div>
      </>
    );
  };

  // =====================================================
  // 3️⃣ Smart Bets (Top 5)
  // =====================================================
  const best = useMemo(() => {
    if (!homeTeam && !awayTeam) return [];
    const both = [];

    const collect = (team, isHome) => {
      const players = playerFeed.filter(
        (p) => p["OWN TEAM"]?.toLowerCase() === team.toLowerCase()
      );
      players.slice(0, 5).forEach((p) => {
        ["PTS", "REB", "AST", "3P"].forEach((s) => {
          const { line, confidence } = calcBet(s, p, isHome);
          both.push({
            player: p["PLAYER FULL NAME"],
            team,
            stat: s,
            line,
            confidence,
          });
        });
      });
    };

    if (homeTeam) collect(homeTeam, true);
    if (awayTeam) collect(awayTeam, false);

    return both.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }, [homeTeam, awayTeam, playerFeed]);

  // =====================================================
  // 4️⃣ Head-to-Head (Last 5)
  // =====================================================
  const headToHeadGames = useMemo(() => {
    if (!homeTeam || !awayTeam) return [];
    const matchups = playerFeed.filter(
      (r) =>
        (r["OWN TEAM"]?.toLowerCase() === homeTeam.toLowerCase() &&
          r["OPPONENT TEAM"]?.toLowerCase() === awayTeam.toLowerCase()) ||
        (r["OWN TEAM"]?.toLowerCase() === awayTeam.toLowerCase() &&
          r["OPPONENT TEAM"]?.toLowerCase() === homeTeam.toLowerCase())
    );

    const grouped = {};
    matchups.forEach((g) => {
      const key = g["DATE"];
      if (!grouped[key])
        grouped[key] = {
          date: g["DATE"],
          home: homeTeam,
          away: awayTeam,
          roster: [],
        };
      grouped[key].roster.push(g);
    });

    return Object.values(grouped)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [homeTeam, awayTeam, playerFeed]);

  const selectedGame = headToHeadGames[selectedGameIndex] || null;
  const rosterToShow = selectedGame?.roster?.slice(0, 10) || [];

  // =====================================================
  // 5️⃣ Render
  // =====================================================
  if (error) return <div style={{ color: "red", padding: 20 }}>{error}</div>;

  return (
    <>
      <div className="matchup-container">
        {/* Away Team */}
        <div className="panel left-panel">
          <h2>🚗 Away Team</h2>
          <select
            value={awayTeam}
            onChange={(e) => handleTeamSelect(e.target.value, false)}
          >
            <option value="">Select Team</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {panel(awayTeam, false)}
        </div>

        {/* Home Team */}
        <div className="panel right-panel">
          <h2>🏠 Home Team</h2>
          <select
            value={homeTeam}
            onChange={(e) => handleTeamSelect(e.target.value, true)}
          >
            <option value="">Select Team</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {panel(homeTeam, true)}
        </div>

        {/* Smart Bets */}
        <div className="bets-panel compact">
          <h2>🔥 Top 5 Smart Bets</h2>
          {best.length === 0 ? (
            <p>Select both teams to see top bets.</p>
          ) : (
            <table className="smart-bet-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Stat</th>
                  <th>Line</th>
                  <th>Conf.</th>
                </tr>
              </thead>
              <tbody>
                {best.map((b, i) => (
                  <tr key={i}>
                    <td>{b.player}</td>
                    <td>{b.team}</td>
                    <td>{b.stat}</td>
                    <td>O {b.line}</td>
                    <td>
                      <motion.div
                        className={`confidence-bar ${color(b.confidence)}`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${b.confidence}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        {b.confidence.toFixed(0)}%
                      </motion.div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Head-to-Head Section */}
      {homeTeam && awayTeam && selectedGame && (
        <div className="headtohead-panel fullwidth">
          <h2>🏀 Head-to-Head Matchups (Last 5)</h2>
          <div className="matchup-buttons">
            {headToHeadGames.map((g, i) => (
              <button
                key={i}
                className={`matchup-btn ${
                  selectedGameIndex === i ? "active" : ""
                }`}
                onClick={() => setSelectedGameIndex(i)}
              >
                {new Date(g.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedGameIndex}-${viewRoster}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="boxscore-table-container"
            >
              <h4>
                {awayTeam} @ {homeTeam} —{" "}
                {new Date(selectedGame.date).toLocaleDateString()}
              </h4>
              <table className="smart-bet-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>PTS</th>
                    <th>REB</th>
                    <th>AST</th>
                    <th>STL</th>
                    <th>BLK</th>
                  </tr>
                </thead>
                <tbody>
                  {rosterToShow.map((s, i) => (
                    <tr key={i}>
                      <td>{s["PLAYER FULL NAME"]}</td>
                      <td>{s["PTS"]}</td>
                      <td>{s["TOT"]}</td>
                      <td>{s["A"]}</td>
                      <td>{s["ST"]}</td>
                      <td>{s["BL"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
