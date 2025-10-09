import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPlayerHeadshot, imgOnErrorFallback } from "../utils/playerImageFetcher";
import "../styles/MatchupDeepDive.css";

export default function MatchupDeepDive() {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [selectedHomePlayers, setSelectedHomePlayers] = useState([]);
  const [selectedAwayPlayers, setSelectedAwayPlayers] = useState([]);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [viewRoster, setViewRoster] = useState("both");

  const teamLogos = {
    Lakers: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
    Nuggets: "https://a.espncdn.com/i/teamlogos/nba/500/den.png",
  };

  const mockStats = {
    Lakers: {
      home: {
        teamStats: { PTS: 118, REB: 45, AST: 27, FG: "49%" },
        players: [
          { id: 3998845, name: "LeBron James", pts: 26.3, reb: 8.5, ast: 7.2, threePM: 2.1 },
          { id: 4257, name: "Anthony Davis", pts: 24.8, reb: 11.9, ast: 3.3, threePM: 0.5 },
          { id: 3159, name: "D’Angelo Russell", pts: 17.1, reb: 2.6, ast: 6.3, threePM: 2.5 },
          { id: 6000, name: "Austin Reaves", pts: 13.8, reb: 3.4, ast: 4.2, threePM: 1.9 },
        ],
      },
    },
    Nuggets: {
      away: {
        teamStats: { PTS: 113, REB: 44, AST: 27, FG: "48%" },
        players: [
          { id: 4277956, name: "Nikola Jokic", pts: 26.1, reb: 11.7, ast: 9.5, threePM: 0.8 },
          { id: 4178, name: "Jamal Murray", pts: 21.3, reb: 4.1, ast: 6.5, threePM: 2.7 },
          { id: 4444, name: "Michael Porter Jr.", pts: 16.4, reb: 5.8, ast: 1.5, threePM: 2.8 },
          { id: 5001, name: "Aaron Gordon", pts: 13.0, reb: 6.2, ast: 2.8, threePM: 0.8 },
        ],
      },
    },
  };

  const teams = Object.keys(mockStats);

  const calcBet = (stat, p, isHome) => {
    const avg = p[stat];
    const adj = avg * (isHome ? 1.05 : 0.95);
    const line = (Math.round(adj * 2) / 2).toFixed(1);
    const conf = Math.max(75, Math.random() * 25 + 75);
    return { line, confidence: conf };
  };

  const color = (c) => (c >= 90 ? "high" : c >= 80 ? "medium" : "low");

  const handleTeamSelect = (team, isHome) => {
    if (!team) return;
    const split = isHome ? "home" : "away";
    const t = mockStats[team]?.[split];
    if (!t) return;
    const picks = t.players.slice(0, 4).map((p) => {
      const stat = "pts";
      const { line, confidence } = calcBet(stat, p, isHome);
      return { ...p, stat, line, confidence };
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
    const split = isHome ? "home" : "away";
    const t = mockStats[team]?.[split];
    if (!team || !t) return null;

    return (
      <>
        <div className="team-stats">
          <h4>{isHome ? "Home" : "Road"} Team Stats</h4>
          <p>
            <strong>PTS:</strong> {t.teamStats.PTS} | <strong>REB:</strong> {t.teamStats.REB}
          </p>
          <p>
            <strong>AST:</strong> {t.teamStats.AST} | <strong>FG%:</strong> {t.teamStats.FG}
          </p>
        </div>

        <div className="player-preview">
          {selectedPlayers.map((p) => (
            <div key={p.id} className={`player-card ${color(p.confidence)}`}>
              <img src={getPlayerHeadshot(p.id)} alt={p.name} onError={imgOnErrorFallback} />
              <h5>{p.name}</h5>
              <p>
                <strong>{p.stat.toUpperCase()}</strong> O {p.line}
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

  const best = useMemo(() => {
    if (!homeTeam && !awayTeam) return [];
    const both = [];
    [
      { name: homeTeam, home: true },
      { name: awayTeam, home: false },
    ].forEach(({ name, home }) => {
      if (!name) return;
      const split = home ? "home" : "away";
      const t = mockStats[name]?.[split];
      if (!t) return;
      t.players.forEach((p) =>
        ["pts", "reb", "ast", "threePM"].forEach((s) => {
          const b = calcBet(s, p, home);
          both.push({
            player: p.name,
            team: name,
            stat: s,
            line: b.line,
            confidence: b.confidence,
          });
        })
      );
    });
    return both.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }, [homeTeam, awayTeam]);

  const mockHeadToHead = [
    {
      date: "2025-03-05",
      home: "Lakers",
      away: "Nuggets",
      homeScore: 121,
      awayScore: 118,
      homeRoster: [
        { player: "LeBron James", logo: teamLogos.Lakers, pts: 28, reb: 9, ast: 8, stl: 2, blk: 1 },
        { player: "Anthony Davis", logo: teamLogos.Lakers, pts: 24, reb: 13, ast: 3, stl: 1, blk: 3 },
      ],
      awayRoster: [
        { player: "Nikola Jokic", logo: teamLogos.Nuggets, pts: 30, reb: 12, ast: 10, stl: 1, blk: 1 },
        { player: "Jamal Murray", logo: teamLogos.Nuggets, pts: 22, reb: 3, ast: 6, stl: 0, blk: 0 },
      ],
    },
  ];

  const selectedGame = mockHeadToHead[selectedGameIndex];
  const rosterToShow =
    viewRoster === "home"
      ? selectedGame.homeRoster
      : viewRoster === "away"
      ? selectedGame.awayRoster
      : [...selectedGame.homeRoster, ...selectedGame.awayRoster];

  return (
    <>
      <div className="matchup-container">
        <div className="panel left-panel">
          <h2>🚗 Away / Road Team</h2>
          <select value={awayTeam} onChange={(e) => handleTeamSelect(e.target.value, false)}>
            <option value="">Select Team</option>
            {teams.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {panel(awayTeam, false)}
        </div>

        <div className="panel right-panel">
          <h2>🏠 Home Team</h2>
          <select value={homeTeam} onChange={(e) => handleTeamSelect(e.target.value, true)}>
            <option value="">Select Team</option>
            {teams.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {panel(homeTeam, true)}
        </div>

        <div className="bets-panel compact">
          <h2>🔥 Top 5 Smart Bets (Overs Only)</h2>
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
                    <td>{b.stat.toUpperCase()}</td>
                    <td>O {b.line}</td>
                    <td>
                      <motion.div
                        className={`confidence-bar ${color(b.confidence)}`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${b.confidence}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        {b.confidence.toFixed(1)}%
                      </motion.div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Only show Head-to-Head if both teams are selected */}
      {homeTeam && awayTeam && (
        <div className="headtohead-panel fullwidth">
          <h2>🏀 Head-to-Head Matchups (Last 5 Games)</h2>
          <div className="matchup-buttons">
            {mockHeadToHead.map((_, i) => (
              <button
                key={i}
                className={`matchup-btn ${selectedGameIndex === i ? "active" : ""}`}
                onClick={() => setSelectedGameIndex(i)}
              >
                {`Game ${i + 1}`}
              </button>
            ))}
          </div>
          <div className="roster-toggle">
            <button
              className={`toggle-btn ${viewRoster === "away" ? "active" : ""}`}
              onClick={() => setViewRoster("away")}
            >
              Away Roster
            </button>
            <button
              className={`toggle-btn ${viewRoster === "home" ? "active" : ""}`}
              onClick={() => setViewRoster("home")}
            >
              Home Roster
            </button>
            <button
              className={`toggle-btn ${viewRoster === "both" ? "active" : ""}`}
              onClick={() => setViewRoster("both")}
            >
              Both
            </button>
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
                {selectedGame.away} ({selectedGame.awayScore}) @ {selectedGame.home} (
                {selectedGame.homeScore}) — {selectedGame.date}
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
                      <td className="player-cell">
                        <img src={s.logo} alt="logo" className="team-logo" /> {s.player}
                      </td>
                      <td>{s.pts}</td>
                      <td>{s.reb}</td>
                      <td>{s.ast}</td>
                      <td>{s.stl}</td>
                      <td>{s.blk}</td>
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
