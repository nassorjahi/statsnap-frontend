import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { mockPlayerStats, mockTeamStats } from "../data/mockMatchupData";
import InjuryReport from "../components/InjuryReport";


/**
 * TODAY'S MATCHUPS — v2 (Home)
 * ---------------------------------------------------------
 * New sections:
 *  - Game Snapshot (logos, records, form, spread/total if present, win-prob)
 *  - Smart Insights (plain-language bullets)
 *  - Team Leader cards (kept, simplified + mobile scroll)
 *  - Trending Player Props (beginner-friendly, model line = rounded avg)
 *  - Totals Trend (Last 5) + % Over lines (simple)
 *  - Suggested Total + Confidence Meter (Low/Med/High)
 *  - Beginner Mode toggle (persists in localStorage)
 *
 * Data:
 *  - /api/player-stats  (expected columns: PLAYER FULL NAME, OWN TEAM, OPPONENT TEAM, DATE, PTS, TOT, A, 3P, ST, BL)
 *  - /api/team-stats    (should contain team-level games; optional fields are checked defensively)
 */

// ---------- helpers
const toDate = (d) => (d ? new Date(d) : null);
const fmt = (n, d = 1) => (n === null || n === undefined || Number.isNaN(n) ? "-" : Number(n).toFixed(d));
const teamKey = (t) => (t || "").trim().toUpperCase();
const shortName = (full) => {
  if (!full) return "";
  const parts = full.split(" ");
  if (parts.length === 1) return parts[0][0] + ".";
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
};
const statMap = { PTS: "PTS", REB: "TOT", AST: "A", "3PM": "3P", BLK: "BL" };
const statOrder = ["PTS", "REB", "AST", "3PM", "BLK"];


// simple headshot (ESPN style) — if you have a util, swap this out.
const fetchEspnHeadshotUrl = (fullName) => {
  const slug = (fullName || "").toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, "-");
  // Placeholder CDN fallback (silently works as an img src; replace with your function if needed)
  return `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${slug}.png&w=96&h=96&scale=crop`;
};

// round “model line” for props (beginner-friendly lines)
const modelLineFor = (stat, avg) => {
  if (avg == null || Number.isNaN(avg)) return null;
  if (stat === "PTS") return Math.floor(avg / 5) * 5 + 0.5; // to nearest 5, add .5
  if (stat === "REB" || stat === "AST" || stat === "BLK") return Math.floor(avg / 2) * 2 + 0.5;
  if (stat === "3PM") return Math.floor(avg) + 0.5;
  return avg;
};

// confidence based on hit rate buckets
const confidenceFromHit = (pct) => {
  if (pct >= 0.65) return { label: "High", color: "var(--ok, #16a34a)" };
  if (pct >= 0.5) return { label: "Medium", color: "var(--warn, #ea580c)" };
  return { label: "Low", color: "var(--bad, #dc2626)" };
};

// compute % over for a given line
const percentOver = (totals, line) => {
  if (!totals?.length) return 0;
  const hits = totals.filter((t) => t != null && line != null && Number(t) > Number(line)).length;
  return hits / totals.length;
};

// get last N by date desc
const lastNByDate = (arr = [], n = 5, dateKey = "DATE") =>
  [...arr].sort((a, b) => toDate(b[dateKey]) - toDate(a[dateKey])).slice(0, n);

// ---------------------------------------------------------

export default function TodayMatchups_v2() {
  const [playerRows, setPlayerRows] = useState([]);
  const [teamRows, setTeamRows] = useState([]);
  const [matchups, setMatchups] = useState([]); // array of { label, away, home, gameId? }
  const [selected, setSelected] = useState(null);
  const [beginner, setBeginner] = useState(
    () => (typeof window !== "undefined" && localStorage.getItem("tm_beginner") === "1") || false
  );

  // fetch data
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // Temporary mock mode
const pr = { data: mockPlayerStats };
const tr = { data: mockTeamStats };

        if (!mounted) return;
        setPlayerRows(Array.isArray(pr.data) ? pr.data : pr.data?.rows || []);
        setTeamRows(Array.isArray(tr.data) ? tr.data : tr.data?.rows || []);
      } catch (e) {
        console.error("Data load error", e);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // infer today's matchups:
  // 1) Prefer teamRows if it includes a "GAME_DATE" or "DATE" and away/home
  // 2) Fallback: use most recent date in playerRows and create pairs by OWN TEAM vs OPPONENT TEAM
  const inferredMatchups = useMemo(() => {
    // try teamRows
    const byGame = new Map();
    for (const g of teamRows || []) {
      const date = g.GAME_DATE || g.DATE;
      if (!date) continue;
      // consider "today" = max date in teamRows (so local demo works any day)
      // we'll take only games on the max date
    }
    let maxTeamDate = null;
    if (teamRows?.length) {
      const dates = teamRows.map((g) => toDate(g.GAME_DATE || g.DATE)).filter(Boolean);
      if (dates.length) maxTeamDate = new Date(Math.max.apply(null, dates));
    }

    const sameDayGames = (teamRows || []).filter((g) => {
      if (!maxTeamDate) return false;
      const d = toDate(g.GAME_DATE || g.DATE);
      return d && d.toDateString() === maxTeamDate.toDateString();
    });

    if (sameDayGames.length) {
      // expect each game to appear twice (home/away); we'll group by a composite key
      const bucket = new Map();
      for (const g of sameDayGames) {
        const home = g.HOME_TEAM || g.HOME || (g.HA === "H" ? g.TEAM : g.OPP);
        const away = g.AWAY_TEAM || g.AWAY || (g.HA === "A" ? g.TEAM : g.OPP);
        if (!home || !away) continue;
        const key = `${teamKey(away)}@${teamKey(home)}`;
        if (!bucket.has(key)) bucket.set(key, { away, home, label: `${away} @ ${home}` });
      }
      return [...bucket.values()];
    }

    // fallback via playerRows
    if (playerRows?.length) {
      const dates = playerRows.map((r) => toDate(r.DATE)).filter(Boolean);
      if (!dates.length) return [];
      const maxDate = new Date(Math.max.apply(null, dates));

      const latest = playerRows.filter((r) => {
        const d = toDate(r.DATE);
        return d && d.toDateString() === maxDate.toDateString();
      });

      const pairs = new Map();
      for (const r of latest) {
        const away = r["OWN TEAM"];
        const home = r["OPPONENT TEAM"];
        if (!away || !home) continue;
        const key = `${teamKey(away)}@${teamKey(home)}`;
        if (!pairs.has(key)) pairs.set(key, { away, home, label: `${away} @ ${home}` });
      }
      return [...pairs.values()];
    }

    return [];
  }, [playerRows, teamRows]);

  // initialize matchups + selection
  useEffect(() => {
    setMatchups(inferredMatchups);
    if (inferredMatchups.length && !selected) {
      setSelected(inferredMatchups[0]);
    }
  }, [inferredMatchups]); // eslint-disable-line

  // persist beginner mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tm_beginner", beginner ? "1" : "0");
    }
  }, [beginner]);

  // ---------- derived for selected matchup
  const selKey = selected ? `${teamKey(selected.away)}@${teamKey(selected.home)}` : null;

  // team games involving these two teams (for charts/insights)
  const headToHeadTeamGames = useMemo(() => {
    if (!selected || !teamRows?.length) return [];
    return teamRows
      .filter((g) => {
        const t = teamKey(g.TEAM || g.OWN_TEAM || g.Team);
        const o = teamKey(g.OPP || g.OPPONENT || g.Opponent);
        return (
          (t === teamKey(selected.away) && o === teamKey(selected.home)) ||
          (t === teamKey(selected.home) && o === teamKey(selected.away))
        );
      })
      .sort((a, b) => toDate(a.GAME_DATE || a.DATE) - toDate(b.GAME_DATE || b.DATE));
  }, [selected, teamRows]);

  // last 5 totals between these two
  const last5Totals = useMemo(() => {
    const totals = headToHeadTeamGames
      .map((g) => {
        const tot = g.TOTAL || g.GAME_TOTAL || (Number(g.PTS_FOR) + Number(g.PTS_AGAINST));
        return typeof tot === "number" && !Number.isNaN(tot) ? tot : null;
      })
      .filter((t) => t != null);
    return totals.slice(-5);
  }, [headToHeadTeamGames]);

  // suggested total = average of last 5 totals (fallback to 219.5)
  const suggestedTotal = useMemo(() => {
    if (!last5Totals.length) return 219.5;
    const avg = last5Totals.reduce((a, b) => a + b, 0) / last5Totals.length;
    return Math.round(avg * 2) / 2; // .5 step
  }, [last5Totals]);

  // % over across a small band of reference lines
  const refLines = useMemo(() => {
    const base = Math.round(suggestedTotal / 5) * 5;
    return [base - 20, base - 15, base - 10, base - 5, base, base + 5, base + 10].filter((x, i, a) => a.indexOf(x) === i);
  }, [suggestedTotal]);

  const overPercents = useMemo(() => {
    return refLines.map((line) => ({
      line,
      pct: percentOver(last5Totals, line),
    }));
  }, [last5Totals, refLines]);

  const conf = confidenceFromHit(percentOver(last5Totals, suggestedTotal));

  // Team form (last 5) and simple win prob from recent point diff
  const teamForm = useMemo(() => {
    if (!selected) return null;
    const withTeam = (tm) =>
      lastNByDate(
        (teamRows || []).filter((g) => teamKey(g.TEAM || g.OWN_TEAM || g.Team) === teamKey(tm)),
        10,
        "GAME_DATE"
      );

    const homeGames = withTeam(selected.home);
    const awayGames = withTeam(selected.away);

    const formStr = (games) => {
      const last5 = games.slice(0, 5);
      const w = last5.filter((g) => (g.RESULT || g.WL || "").toString().toUpperCase().startsWith("W")).length;
      return `W${w}-L${5 - w}`;
    };

    const pdiff = (games) => {
      if (!games.length) return 0;
      const arr = games.map((g) => Number(g.PTS_FOR ?? g.PTS ?? 0) - Number(g.PTS_AGAINST ?? g.OPP_PTS ?? 0));
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    };

    const homePD = pdiff(homeGames);
    const awayPD = pdiff(awayGames);
    const homeWinProb = Math.max(0.1, Math.min(0.9, 0.5 + (homePD - awayPD) / 40)); // gentle, beginner-safe
    return {
      homeForm: formStr(homeGames),
      awayForm: formStr(awayGames),
      homeWinProb,
    };
  }, [selected, teamRows]);

  // Smart insights (plain language)
  const smartInsights = useMemo(() => {
    const out = [];
    if (last5Totals.length >= 3) {
      const avg = Math.round((last5Totals.reduce((a, b) => a + b, 0) / last5Totals.length) * 10) / 10;
      out.push(`📊 The last ${last5Totals.length} matchups averaged ${avg} total points.`);
    }
    if (overPercents.length) {
      const best = overPercents.reduce((m, x) => (x.pct > m.pct ? x : m), { pct: -1 });
      if (best.line) out.push(`💡 Over ${best.line} hit in ${Math.round(best.pct * 100)}% of recent meetings.`);
    }
    if (teamForm) {
      out.push(`🔥 Recent form — ${selected.home}: ${teamForm.homeForm}, ${selected.away}: ${teamForm.awayForm}.`);
    }
    if (!out.length) out.push("ℹ️ Not enough recent data; projections use season averages.");
    return out.slice(0, 3);
  }, [last5Totals, overPercents, teamForm, selected]);

  // Leader cards — last 5 team games, top performer per stat
  const leaders = useMemo(() => {
    if (!selected || !playerRows?.length) return [];
    const recentDateCut = (() => {
      const dates = (playerRows || []).map((r) => toDate(r.DATE)).filter(Boolean);
      if (!dates.length) return null;
      const maxD = new Date(Math.max.apply(null, dates));
      // take last ~14 days so we can compute "last 5" by player/team
      const d = new Date(maxD);
      d.setDate(d.getDate() - 21);
      return d;
    })();

    const rowsForTeam = (tm) =>
      (playerRows || []).filter(
        (r) =>
          teamKey(r["OWN TEAM"]) === teamKey(tm) &&
          (!recentDateCut || (toDate(r.DATE) && toDate(r.DATE) >= recentDateCut))
      );

    const build = (tm, labelPrefix) => {
      const rows = rowsForTeam(tm);
      const byPlayer = new Map();
      for (const r of rows) {
        const key = r["PLAYER FULL NAME"];
        if (!key) continue;
        if (!byPlayer.has(key)) byPlayer.set(key, []);
        byPlayer.get(key).push(r);
      }
      const pickForStat = (stat) => {
        const col = statMap[stat];
        let best = null;
        byPlayer.forEach((games, player) => {
          const last5 = lastNByDate(games, 5, "DATE");
          const avg =
            last5.length > 0
              ? last5.reduce((a, b) => a + Number(b[col] ?? 0), 0) / last5.length
              : null;
          if (avg != null && (best == null || avg > best.avg))
            best = { player, avg, last5, stat, team: tm };
        });
        return best;
      };

      return statOrder.map((s) => {
        const pick = pickForStat(s);
        return pick
          ? {
              team: tm,
              stat: s,
              player: pick.player,
              avg: pick.avg,
              last5: pick.last5,
            }
          : null;
      }).filter(Boolean);
    };

    return [...build(selected.home, selected.home), ...build(selected.away, selected.away)];
  }, [selected, playerRows]);

  // Trending Player Props (3 rows per team)
  const trendingProps = useMemo(() => {
    const rows = [];
    const byTeam = (tm) => leaders.filter((l) => teamKey(l.team) === teamKey(tm));
    const pack = (team) => {
      const top = byTeam(team).slice(0, 5);
      // choose up to 3 varied stats
      const picked = [];
      const seenStats = new Set();
      for (const row of top) {
        if (seenStats.has(row.stat)) continue;
        seenStats.add(row.stat);
        const model = modelLineFor(row.stat, row.avg);
        const leanUp = row.avg >= model; // simple “lean”
        picked.push({
          team,
          player: row.player,
          stat: row.stat,
          avg: row.avg,
          line: model,
          lean: leanUp ? "Over" : "Under",
        });
        if (picked.length === 3) break;
      }
      return picked;
    };
    if (selected) rows.push(...pack(selected.home), ...pack(selected.away));
    return rows;
  }, [leaders, selected]);

  const beginnerNote = (text) =>
    beginner ? <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{text}</div> : null;

  // ---------- UI
  return (
    <div style={{ padding: 16 }}>
      {/* Header Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Today’s Matchups</h1>
        <select
          value={selKey || ""}
          onChange={(e) => {
            const m = matchups.find((x) => `${teamKey(x.away)}@${teamKey(x.home)}` === e.target.value);
            setSelected(m || null);
          }}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#fff",
          }}
        >
          {matchups.map((m) => (
            <option key={`${teamKey(m.away)}@${teamKey(m.home)}`} value={`${teamKey(m.away)}@${teamKey(m.home)}`}>
              {m.label}
            </option>
          ))}
        </select>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setBeginner((v) => !v)}
            style={{
              border: "1px solid #e5e7eb",
              background: beginner ? "#eef2ff" : "#fff",
              color: beginner ? "#1d4ed8" : "#111827",
              padding: "8px 10px",
              borderRadius: 10,
              fontSize: 13,
            }}
            title="Show simple explanations under sections"
          >
            🧩 Beginner Mode {beginner ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Game Snapshot */}
      {selected && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 16,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.label}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#6b7280" }}>Away</div>
                <div style={{ fontWeight: 600 }}>{selected.away}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Form: {teamForm?.awayForm || "—"}
                </div>
              </div>
              <div style={{ width: 2, background: "#f3f4f6", alignSelf: "stretch" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#6b7280" }}>Home</div>
                <div style={{ fontWeight: 600 }}>{selected.home}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Form: {teamForm?.homeForm || "—"}
                </div>
              </div>
            </div>

            {beginnerNote("Snapshot gives quick team context at a glance.")}

            {/* Win prob bar */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Win Probability (home)</div>
              <div
                style={{
                  height: 10,
                  background: "#f3f4f6",
                  borderRadius: 999,
                  position: "relative",
                  overflow: "hidden",
                }}
                aria-label="Home win probability"
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${Math.round((teamForm?.homeWinProb ?? 0.5) * 100)}%`,
                    background:
                      "linear-gradient(90deg, rgba(29,78,216,1) 0%, rgba(147,197,253,1) 100%)",
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>
                {Math.round((teamForm?.homeWinProb ?? 0.5) * 100)}% {selected.home}
              </div>
            </div>
          </div>

          {/* Suggested Total + confidence */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 16,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: 13, color: "#6b7280" }}>Suggested Total</div>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>{fmt(suggestedTotal, 1)}</div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  padding: "6px 8px",
                  borderRadius: 999,
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    background: conf.color,
                    borderRadius: 999,
                    display: "inline-block",
                  }}
                />
                Confidence: {conf.label}
              </span>
            </div>
            {beginnerNote("We average recent matchups to suggest today’s total and rate consistency.")}
          </div>

          {/* Smart insights */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 16,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Smart Insights</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "#111827" }}>
              {smartInsights.map((s, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  {s}
                </li>
              ))}
            </ul>
            {beginnerNote("Plain-language notes highlight what matters for beginners.")}
          </div>
        </section>
      )}
<InjuryReport homeTeam={selected?.home} awayTeam={selected?.away} />

      {/* Leader cards */}
      <section style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Team Leaders (Last 5)</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 12,
          }}
        >
          {leaders.slice(0, 10).map((l, idx) => (
            <div
              key={`${l.team}-${l.stat}-${idx}`}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <img
                src={fetchEspnHeadshotUrl(l.player)}
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                alt={l.player}
                width={44}
                height={44}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {l.team} — {l.stat} Leader
                </div>
                <div style={{ fontWeight: 600 }}>{shortName(l.player)}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Avg: {fmt(l.avg)} • Last 5: {fmt(l.last5?.[0]?.[statMap[l.stat]] ?? "-", 1)}
                </div>
              </div>
            </div>
          ))}
        </div>
        {beginnerNote("Leaders show who’s producing lately for each key stat.")}
      </section>

      {/* Charts + Over% */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.2fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Totals Trend (Last 5) */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Totals Trend (Last 5)</div>
          <div
            style={{
              height: 180,
              position: "relative",
              display: "grid",
              gridTemplateColumns: `repeat(${Math.max(1, last5Totals.length)}, 1fr)`,
              alignItems: "end",
              gap: 8,
            }}
          >
            {last5Totals.map((t, i) => {
              const max = Math.max(...last5Totals, suggestedTotal + 10);
              const h = Math.max(4, (t / max) * 160);
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <div
                    title={`${t}`}
                    style={{
                      height: h,
                      background: "#1d4ed8",
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                  <div style={{ fontSize: 12, color: "#6b7280" }}>G{i + 1}</div>
                </div>
              );
            })}
          </div>
          {beginnerNote("Each bar is a recent game total between these teams. Taller = higher total.")}
        </div>

        {/* % of Games Over lines */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 10 }}>% of Games Over Line</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {overPercents.slice(0, 6).map(({ line, pct }) => (
              <div
                key={line}
                style={{
                  border: "1px solid #f3f4f6",
                  borderRadius: 12,
                  padding: 10,
                  textAlign: "center",
                }}
                title={`% of recent totals above ${line}`}
              >
                <div style={{ fontSize: 12, color: "#6b7280" }}>{line}</div>
                <div style={{ fontWeight: 700 }}>{Math.round(pct * 100)}%</div>
              </div>
            ))}
          </div>
          {beginnerNote("These boxes show how often totals went over each reference line recently.")}
        </div>
      </section>

      {/* Trending Player Props */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontWeight: 600 }}>Trending Player Props</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>(Model lines from recent averages)</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 13, color: "#374151" }}>
                <th style={{ padding: "8px 6px" }}>Team</th>
                <th style={{ padding: "8px 6px" }}>Player</th>
                <th style={{ padding: "8px 6px" }}>Stat</th>
                <th style={{ padding: "8px 6px" }}>Avg</th>
                <th style={{ padding: "8px 6px" }}>Line (model)</th>
                <th style={{ padding: "8px 6px" }}>Lean</th>
              </tr>
            </thead>
            <tbody>
              {trendingProps.map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 6px", fontSize: 14 }}>{r.team}</td>
                  <td style={{ padding: "8px 6px", fontSize: 14 }}>{r.player}</td>
                  <td style={{ padding: "8px 6px", fontSize: 14 }}>{r.stat}</td>
                  <td style={{ padding: "8px 6px", fontSize: 14 }}>{fmt(r.avg, 1)}</td>
                  <td style={{ padding: "8px 6px", fontSize: 14 }}>{fmt(r.line, 1)}</td>
                  <td
                    style={{
                      padding: "8px 6px",
                      fontWeight: 600,
                      color: r.lean === "Over" ? "#16a34a" : "#dc2626",
                      fontSize: 14,
                    }}
                  >
                    {r.lean}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {beginnerNote("A quick list of simple prop ideas based on who’s been producing lately.")}
      </section>

      {/* Footer nav hint (optional) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 8,
          fontSize: 13,
          color: "#6b7280",
          textAlign: "center",
          marginTop: 4,
        }}
      >
        <div>Matchups</div>
        <div>Deep Dive</div>
        <div>Players</div>
        <div>Teams</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
POLISH FILE SUGGESTION (append to src/docs/PolishFile_Feature_Backlog_2025.md)

5. TodayMatchups v2 Enhancements
Status: Implemented
Description:
  Home page now includes Game Snapshot (with simple win probability),
  Smart Insights (plain-language bullets), Trending Player Props (model lines),
  Totals Trend & % Over reference lines, Suggested Total with Confidence Meter,
  and Beginner Mode explanations with localStorage persistence.
Future:
  - Connect real odds when available (spread/ML/total).
  - Add quick “Add to Slip” for props (Pro).
  - Per-user pinning of favorite matchups.
--------------------------------------------------------- */
