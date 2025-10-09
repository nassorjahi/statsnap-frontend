import React, { useMemo, useState } from "react";
import data from "../mock/today_matchups.json";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar
} from "recharts";

const categories = ["PTS", "REB", "AST", "3PM", "BLK"];

function Chip({ label }) {
  return (
    <span style={{
      padding: "6px 10px",
      border: "1px solid #e2e8f0",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: "#fff"
    }}>{label}</span>
  );
}

function Card({ title, children }) {
  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 16,
      background: "#fff"
    }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

export default function TodayMatchups() {
  const games = data.games || [];
  const [gameId, setGameId] = useState(games[0]?.id || null);

  const game = useMemo(() => games.find(g => g.id === gameId), [games, gameId]);

  const totalsTrend = useMemo(() => {
    if (!game) return [];
    return game.h2h.last5.map((g, i) => ({ idx: `G${i+1}`, total: g.total }));
  }, [game]);

  const overBuckets = useMemo(() => {
    if (!game) return [];
    const ranges = [200, 205, 210, 215, 220];
    return ranges.map(r => ({
      label: `${r}`,
      over: game.h2h.last5.filter(x => x.total > r).length,
      under: game.h2h.last5.filter(x => x.total <= r).length
    }));
  }, [game]);

  const suggestedChips = useMemo(() => {
    if (!game) return [];
    // auto-create 10 chips (two rows of five)
    const vals = [200, 205, 210, 212.5, 215, 217.5, 220, 222.5, 225, 227.5];
    return vals.map(v => `Total ${v}+`);
  }, [game]);

  const leaders = game?.leaders;

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      {/* Games dropdown */}
      <section style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label htmlFor="game" style={{ fontWeight: 800 }}>Today’s Games:</label>
        <select
          id="game"
          value={gameId || ""}
          onChange={e => setGameId(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #d1d5db" }}
        >
          {games.map(g => (
            <option key={g.id} value={g.id}>
              {g.away.nickname} @ {g.home.nickname}
            </option>
          ))}
        </select>
      </section>

      {game && (
        <>
          {/* Leader cards: 10 total (5 per team × 5 stats) */}
          <section style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12
          }}>
            {["home", "away"].flatMap(side => (
              categories.map(cat => {
                const leader = leaders?.[side]?.[cat];
                return (
                  <Card key={`${side}-${cat}`} title={`${game[side].nickname} — ${cat} Leader`}>
                    {leader ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                          src={leader.photo}
                          alt={leader.name}
                          style={{ width: 48, height: 48, borderRadius: 999, objectFit: "cover", border: "1px solid #e5e7eb" }}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <div>
                          <div style={{ fontWeight: 800 }}>{leader.name}</div>
                          <div style={{ fontSize: 12, color: "#475569" }}>
                            Avg: {leader.avg} • Last 5: {leader.last5}
                          </div>
                        </div>
                      </div>
                    ) : <div style={{ color: "#64748b" }}>No data</div>}
                  </Card>
                );
              })
            ))}
          </section>

          {/* Head-to-Head Totals */}
          <section style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12
          }}>
            <Card title="Totals Trend (Last 5)">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={totalsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="idx" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#2563eb" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Over % (Ref chips 200–220)">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overBuckets}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="over" fill="#16a34a" />
                    <Bar dataKey="under" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Suggested Total">
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 36, fontWeight: 900 }}>{game.h2h.suggested_total.toFixed(1)}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Chip label="+0.5" />
                  <Chip label="-0.5" />
                  <Chip label="Avg" />
                </div>
              </div>
            </Card>
          </section>

          {/* Suggested lines — 10 chips in 2 rows of 5 */}
          <section>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Suggested Lines</div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 8
            }}>
              {suggestedChips.slice(0, 5).map((c, i) => <Chip key={`r1-${i}`} label={c} />)}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 8,
              marginTop: 8
            }}>
              {suggestedChips.slice(5).map((c, i) => <Chip key={`r2-${i}`} label={c} />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
