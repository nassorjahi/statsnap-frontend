import React, { useState, useMemo } from "react";
import { getPlayerHeadshot, imgOnErrorFallback } from "../utils/playerImageFetcher";
import "../styles/MatchupDeepDive.css";

/* Player Card */
const PlayerCard = ({ player, stat, line, confidence }) => {
  const tier = confidence >= 90 ? "high" : confidence >= 75 ? "medium" : "low";
  const label =
    stat === "threePM"
      ? "3PM"
      : stat === "pts"
      ? "PTS"
      : stat === "reb"
      ? "REB"
      : "AST";

  return (
    <div className={`player-card ${tier}`}>
      <img
        src={getPlayerHeadshot(player.id)}
        alt={player.name}
        onError={imgOnErrorFallback}
        className="player-image"
      />
      <h4>{player.name}</h4>
      <p className="team">{player.team}</p>
      <p className="stat">
        <strong>Over {label}</strong> {line}
      </p>
      <div className={`confidence-bar ${tier}`}>
        {confidence.toFixed(1)}%
      </div>
    </div>
  );
};

/* Main Page */
export default function MatchupDeepDive() {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");

  const mockStats = {
    Lakers: {
      home: {
        players: [
          { id: 3998845, name: "LeBron James", pts: 26.3, reb: 8.5, ast: 7.2, threePM: 2.1 },
          { id: 4257, name: "Anthony Davis", pts: 24.8, reb: 11.9, ast: 3.3, threePM: 0.5 },
          { id: 4263, name: "Austin Reaves", pts: 13.4, reb: 3.2, ast: 4.4, threePM: 1.8 },
        ],
      },
    },
    Nuggets: {
      home: {
        players: [
          { id: 4277956, name: "Nikola Jokic", pts: 27.4, reb: 12.5, ast: 9.8, threePM: 1.0 },
          { id: 4178, name: "Jamal Murray", pts: 21.3, reb: 4.1, ast: 6.5, threePM: 2.7 },
          { id: 4056688, name: "Russell Westbrook", pts: 15.7, reb: 5.6, ast: 6.8, threePM: 1.2 },
        ],
      },
    },
  };
  const teams = Object.keys(mockStats);

  const calcSmartBet = (stat, p) => {
    const avg = p[stat];
    const adj = avg * (1 + Math.random() * 0.2 - 0.1);
    const line = Math.round(adj * 0.9 * 2) / 2;
    const confidence = 70 + Math.random() * 30;
    return { line, confidence };
  };

  const allBets = useMemo(() => {
    const arr = [];
    [homeTeam, awayTeam].forEach((teamName) => {
      if (!teamName) return;
      const team = mockStats[teamName]?.home;
      if (!team) return;
      team.players.forEach((p) => {
        ["pts", "reb", "ast", "threePM"].forEach((stat) => {
          const bet = calcSmartBet(stat, p);
          arr.push({
            player: p.name,
            team: teamName,
            stat,
            dir: "Over",
            ...bet,
          });
        });
      });
    });
    return arr;
  }, [homeTeam, awayTeam]);

  const topBets = useMemo(
    () => [...allBets].sort((a, b) => b.confidence - a.confidence).slice(0, 5),
    [allBets]
  );

  const tier = (c) => (c >= 90 ? "high" : c >= 75 ? "medium" : "low");

  const top3ByTeam = (teamName) => {
    const team = mockStats[teamName]?.home;
    if (!team) return [];
    const overs = team.players.map((p) => {
      const stat =
        ["pts", "reb", "ast", "threePM"][Math.floor(Math.random() * 4)];
      const bet = calcSmartBet(stat, p);
      return { player: { ...p, team: teamName }, stat, ...bet };
    });
    return overs.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  };

  const homeCards = homeTeam ? top3ByTeam(homeTeam) : [];
  const awayCards = awayTeam ? top3ByTeam(awayTeam) : [];

  return (
    <div className="matchup-deep-container">
      {/* LEFT - Away Team */}
      <div className="team-panel">
        <h2>🚗 Away / Road Team</h2>
        <select value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)}>
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <div className="player-card-grid">
          {awayCards.map((p, i) => (
            <PlayerCard key={i} {...p} />
          ))}
        </div>
      </div>

      {/* CENTER - Home Team */}
      <div className="team-panel">
        <h2>🏠 Home Team</h2>
        <select value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)}>
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <div className="player-card-grid">
          {homeCards.map((p, i) => (
            <PlayerCard key={i} {...p} />
          ))}
        </div>
      </div>

      {/* RIGHT - Smart Bets */}
      <div className="bets-panel compact">
        <h2>🔥 Top 5 Smart Bets (Over/Under)</h2>
        {topBets.length === 0 ? (
          <p>Select both teams to view smart bets.</p>
        ) : (
          <table className="smart-bet-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Team</th>
                <th>Stat</th>
                <th>Dir</th>
                <th>Line</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {topBets.map((b, i) => (
                <tr key={i}>
                  <td>{b.player}</td>
                  <td>{b.team}</td>
                  <td>{b.stat === "threePM" ? "3PM" : b.stat.toUpperCase()}</td>
                  <td>{b.dir}</td>
                  <td>{b.line}</td>
                  <td>
                    <div className={`confidence-bar ${tier(b.confidence)}`}>
                      {b.confidence.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
