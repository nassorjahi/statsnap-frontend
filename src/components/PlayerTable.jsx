// ============================================================
// 🏀 PlayerTable.jsx — StatSnap (self-fetching + debug)
// ------------------------------------------------------------
// • Always fetches from backend using playerName (ignores parent data)
// • Dedupe by (DATE + TEAM + OPPONENT)
// • Sorts by DATE desc, shows last 5
// • Works across mixed CSV schemas
// • Debug strip shows source & counts
// ============================================================

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "../data/teamData"; // make sure this points to your backend base URL

// --- helpers ---
const get = (obj, keys, fallback = "") => {
  for (const k of keys) if (obj && obj[k] != null && String(obj[k]).length) return obj[k];
  return fallback;
};

const parseDateSafe = (v) => {
  const s = String(v ?? "").trim();
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t);
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const mm = Number(m[1]), dd = Number(m[2]);
    const yyyy = Number(m[3].length === 2 ? "20" + m[3] : m[3]);
    return new Date(yyyy, mm - 1, dd);
  }
  return null;
};

export default function PlayerTable({ playerName, season }) {
  const [rows, setRows] = useState([]);
  const [debug, setDebug] = useState({ total: 0, afterDedupe: 0, source: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!playerName) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // Build URL — pull *plenty* of rows so dedupe/sort works
        const params = new URLSearchParams();
        params.set("player", playerName);
        params.set("limit", "800");
        if (season) params.set("season", season);

        const url = `${API_URL}/api/player-feed?${params.toString()}`;
        const { data } = await axios.get(url);

        const raw = Array.isArray(data?.data) ? data.data : [];
        if (!mounted) return;

        // Normalize fields across schemas
        const norm = raw.map((r) => ({
          DATE: get(r, ["DATE", "Date", "Game Date", "GAME_DATE", "GAME DATE"], ""),
          TEAM: get(r, ["OWN TEAM", "TEAM", "TEAM ABBR", "Team", "TEAM_NAME", "TEAM_NAME_ABBR"], ""),
          OPP:  get(r, ["OPPONENT", "OPPONENT TEAM", "OPP TEAM", "OPP ABBR", "Opponent", "OPPONENT_NAME"], ""),
          PTS:  get(r, ["PTS", "Points"], 0),
          REB:  get(r, ["REB", "Rebounds"], 0),
          AST:  get(r, ["AST", "Assists"], 0),
          TPM:  get(r, ["3PM", "3-PT (FGM)", "3PTM"], 0), // displayed as 3PM
          STL:  get(r, ["STL", "Steals"], 0),
          BLK:  get(r, ["BLK", "Blocks"], 0),
        }));

        // Dedupe by (date + team + opponent)
        const seen = new Set();
        const deduped = [];
        for (const g of norm) {
          const d = parseDateSafe(g.DATE);
          if (!d || !g.OPP) continue;
          const key = `${d.toISOString().slice(0,10)}|${g.TEAM}|${g.OPP}`;
          if (seen.has(key)) continue;
          seen.add(key);
          deduped.push({ ...g, _t: d.getTime() });
        }

        // Sort desc and take 5
        deduped.sort((a, b) => b._t - a._t);
        const last5 = deduped.slice(0, 5);

        setRows(last5);
        setDebug({
          total: raw.length,
          afterDedupe: deduped.length,
          source: data?.file_used || "unknown",
        });

        // Also log to console for deeper debugging
        // (dates/opponents of the 1st 10 after sort)
        console.log("[PlayerTable] fetched:", {
          url,
          totalRaw: raw.length,
          afterDedupe: deduped.length,
          first10: deduped.slice(0, 10).map(x => ({ DATE: x.DATE, OPP: x.OPP, TEAM: x.TEAM })),
        });

      } catch (e) {
        console.error("[PlayerTable] fetch error:", e);
        setErr("Could not load player games.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [playerName, season]);

  // --- UI ---
  return (
    <div className="overflow-x-auto">
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="font-semibold text-gray-800">LAST 5 GAMES</h4>
        {playerName && (
          <div className="text-xs text-gray-500">
            {loading ? "loading…" : `src:${debug.source} • raw:${debug.total} • uniq:${debug.afterDedupe}`}
          </div>
        )}
      </div>

      {!playerName && (
        <div className="p-3 border rounded-md text-sm text-gray-500">
          Select a player to view recent games.
        </div>
      )}

      {playerName && (
        <table className="min-w-full border border-gray-300 rounded-md overflow-hidden text-sm">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Opponent</th>
              <th className="px-3 py-2 text-right">PTS</th>
              <th className="px-3 py-2 text-right">REB</th>
              <th className="px-3 py-2 text-right">AST</th>
              <th className="px-3 py-2 text-right">3PM</th>
              <th className="px-3 py-2 text-right">STL</th>
              <th className="px-3 py-2 text-right">BLK</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="8" className="px-3 py-3 text-center text-gray-500">Loading…</td></tr>
            )}
            {!loading && err && (
              <tr><td colSpan="8" className="px-3 py-3 text-center text-red-600">{err}</td></tr>
            )}
            {!loading && !err && rows.length === 0 && (
              <tr><td colSpan="8" className="px-3 py-3 text-center text-gray-500">No recent games found.</td></tr>
            )}
            {!loading && !err && rows.map((r, i) => (
              <tr key={i} className={`border-t border-gray-200 ${i % 2 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}>
                <td className="px-3 py-2">{r.DATE || "-"}</td>
                <td className="px-3 py-2">{r.OPP || "-"}</td>
                <td className="px-3 py-2 text-right">{Number(r.PTS) || 0}</td>
                <td className="px-3 py-2 text-right">{Number(r.REB) || 0}</td>
                <td className="px-3 py-2 text-right">{Number(r.AST) || 0}</td>
                <td className="px-3 py-2 text-right">{Number(r.TPM) || 0}</td>
                <td className="px-3 py-2 text-right">{Number(r.STL) || 0}</td>
                <td className="px-3 py-2 text-right">{Number(r.BLK) || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
