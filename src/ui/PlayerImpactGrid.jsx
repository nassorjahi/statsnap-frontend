import React, { useEffect, useState } from "react";
import axios from "axios";

const PlayerImpactGrid = ({ team }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // ✅ ESPN Headshot by PLAYER-ID
  const getHeadshotURL = (id) => {
    if (!id) return "https://a.espncdn.com/i/headshots/nophoto.png";
    return `https://a.espncdn.com/i/headshots/nba/players/full/${id}.png`;
  };

  // ✅ Team name normalization and mapping
  const teamMap = {
    atl: "Hawks",
    atlanta: "Hawks",
    "atlanta hawks": "Hawks",
    bos: "Celtics",
    boston: "Celtics",
    "boston celtics": "Celtics",
    bkn: "Nets",
    brooklyn: "Nets",
    "brooklyn nets": "Nets",
    cha: "Hornets",
    charlotte: "Hornets",
    "charlotte hornets": "Hornets",
    chi: "Bulls",
    chicago: "Bulls",
    "chicago bulls": "Bulls",
    cle: "Cavaliers",
    cleveland: "Cavaliers",
    "cleveland cavaliers": "Cavaliers",
    dal: "Mavericks",
    dallas: "Mavericks",
    "dallas mavericks": "Mavericks",
    den: "Nuggets",
    denver: "Nuggets",
    "denver nuggets": "Nuggets",
    det: "Pistons",
    detroit: "Pistons",
    "detroit pistons": "Pistons",
    gsw: "Warriors",
    "golden state": "Warriors",
    "golden state warriors": "Warriors",
    hou: "Rockets",
    houston: "Rockets",
    "houston rockets": "Rockets",
    ind: "Pacers",
    indiana: "Pacers",
    "indiana pacers": "Pacers",
    lac: "Clippers",
    "la clippers": "Clippers",
    lal: "Lakers",
    "los angeles lakers": "Lakers",
    mem: "Grizzlies",
    memphis: "Grizzlies",
    "memphis grizzlies": "Grizzlies",
    mia: "Heat",
    miami: "Heat",
    "miami heat": "Heat",
    mil: "Bucks",
    milwaukee: "Bucks",
    "milwaukee bucks": "Bucks",
    min: "Timberwolves",
    minnesota: "Timberwolves",
    "minnesota timberwolves": "Timberwolves",
    nop: "Pelicans",
    "new orleans": "Pelicans",
    "new orleans pelicans": "Pelicans",
    nyk: "Knicks",
    "new york": "Knicks",
    "new york knicks": "Knicks",
    okc: "Thunder",
    "oklahoma city": "Thunder",
    "oklahoma city thunder": "Thunder",
    orl: "Magic",
    orlando: "Magic",
    "orlando magic": "Magic",
    phi: "76ers",
    philadelphia: "76ers",
    "philadelphia 76ers": "76ers",
    phx: "Suns",
    phoenix: "Suns",
    "phoenix suns": "Suns",
    por: "Trail Blazers",
    portland: "Trail Blazers",
    "portland trail blazers": "Trail Blazers",
    sac: "Kings",
    sacramento: "Kings",
    "sacramento kings": "Kings",
    sas: "Spurs",
    "san antonio": "Spurs",
    "san antonio spurs": "Spurs",
    tor: "Raptors",
    toronto: "Raptors",
    "toronto raptors": "Raptors",
    uta: "Jazz",
    utah: "Jazz",
    "utah jazz": "Jazz",
    was: "Wizards",
    washington: "Wizards",
    "washington wizards": "Wizards",
  };

  useEffect(() => {
    if (!team) return;

    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/player-stats");
        const allPlayers = res.data || [];

        const normalize = (str) =>
          (str || "").toLowerCase().trim().replace(/[^a-z]/g, "");

        const teamKey = normalize(team);
        const mappedTeam = teamMap[teamKey] || team;

        const teamPlayers = allPlayers.filter(
          (p) =>
            p["OWN TEAM"] &&
            p["OWN TEAM"].toLowerCase() === mappedTeam.toLowerCase()
        );

        // ✅ Aggregate multiple games per player
        const playerMap = {};
        teamPlayers.forEach((p) => {
          const name = p["PLAYER FULL NAME"];
          if (!playerMap[name]) {
            playerMap[name] = {
              name,
              id: p["PLAYER-ID"],
              team: p["OWN TEAM"],
              games: 0,
              totalPoints: 0,
              totalRebounds: 0,
              totalAssists: 0,
              totalSteals: 0,
              totalBlocks: 0,
            };
          }

          playerMap[name].games += 1;
          playerMap[name].totalPoints += Number(p["PTS"]) || 0;
          playerMap[name].totalRebounds += Number(p["REB"]) || 0;
          playerMap[name].totalAssists += Number(p["AST"]) || 0;
          playerMap[name].totalSteals += Number(p["STL"]) || 0;
          playerMap[name].totalBlocks += Number(p["BL"]) || 0;
        });

        const aggregated = Object.values(playerMap).map((p) => {
          const avgPoints = p.totalPoints / p.games;
          const avgRebounds = p.totalRebounds / p.games;
          const avgAssists = p.totalAssists / p.games;
          const avgSteals = p.totalSteals / p.games;
          const avgBlocks = p.totalBlocks / p.games;
          const impact =
            avgPoints + avgRebounds * 0.7 + avgAssists * 0.7 + avgSteals + avgBlocks;

          return {
            id: p.id,
            name: p.name,
            team: p.team,
            points: avgPoints.toFixed(1),
            rebounds: avgRebounds.toFixed(1),
            assists: avgAssists.toFixed(1),
            impact: impact.toFixed(1),
          };
        });

        const ranked = aggregated.sort((a, b) => b.impact - a.impact);
        setPlayers(ranked);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching player impact data:", err);
        setPlayers([]);
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [team]);

  if (!team)
    return <p style={{ textAlign: "center", padding: "20px" }}>No team selected.</p>;

  if (loading)
    return (
      <p style={{ textAlign: "center", padding: "20px" }}>
        Loading player impact data...
      </p>
    );

  if (!players || players.length === 0)
    return (
      <p style={{ textAlign: "center", padding: "20px" }}>
        No player data found for {team}.
      </p>
    );

  // ✅ Limit default view to 4 players
  const displayPlayers = showAll ? players : players.slice(0, 4);

  // ✅ Find highest impact for color scaling
  const maxImpact = Math.max(...players.map((p) => parseFloat(p.impact)));

  // ✅ Determine color based on performance
  const getImpactColor = (percent) => {
    if (percent >= 80) return "#16a34a"; // Green (Elite)
    if (percent >= 60) return "#2563eb"; // Blue (Solid)
    if (percent >= 40) return "#facc15"; // Yellow (Average)
    return "#dc2626"; // Red (Cold)
  };

  return (
    <div style={{ padding: "10px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {displayPlayers.map((p, idx) => {
          const impactPercent = (parseFloat(p.impact) / maxImpact) * 100;
          const color = getImpactColor(impactPercent);

          return (
            <div
              key={idx}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "14px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                textAlign: "center",
              }}
            >
              {/* ✅ Headshot */}
              <img
                src={getHeadshotURL(p.id)}
                alt={p.name}
                onError={(e) =>
                  (e.target.src =
                    "https://a.espncdn.com/i/headshots/nophoto.png")
                }
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  margin: "0 auto 8px",
                }}
              />

              <p
                style={{
                  fontWeight: "700",
                  fontSize: "14px",
                  marginBottom: "6px",
                }}
              >
                {p.name}
              </p>
              <p style={{ color: "#374151", fontSize: "12px" }}>
                {p.points} pts | {p.rebounds} reb | {p.assists} ast
              </p>

              {/* ✅ Impact Score Bar */}
              <div
                style={{
                  marginTop: "10px",
                  height: "8px",
                  background: "#e5e7eb",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${impactPercent}%`,
                    height: "100%",
                    background: color,
                    transition: "width 0.5s ease",
                  }}
                ></div>
              </div>

              <p
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: color,
                }}
              >
                Impact Score: {p.impact}
              </p>
            </div>
          );
        })}
      </div>

      {/* ✅ Toggle Button */}
      <div style={{ textAlign: "center", marginTop: "12px" }}>
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {showAll ? "Show Top 4 Only" : "Show Full Roster"}
        </button>
      </div>
    </div>
  );
};

export default PlayerImpactGrid;
