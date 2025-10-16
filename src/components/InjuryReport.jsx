// ==========================================================
// 🚑 INJURY REPORT — Live API Edition
// ----------------------------------------------------------
// ✅ Fetches from /api/ab/injuries + /api/ab/health
// ✅ Auto-refresh every 6 hrs + manual refresh button
// ✅ Filters by selected matchup (home + away)
// ✅ Toast notifications + clean responsive layout
// ==========================================================

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/InjuryReport.css";
import { API_URL } from "../data/teamData";

export default function InjuryReport({ homeTeam, awayTeam }) {
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 🧩 Toast helper
  const customToast = (message, type) => {
    toast[type](message, {
      position: "bottom-right",
      autoClose: 2500,
      hideProgressBar: false,
      theme: "colored",
      transition: Slide,
      style: {
        background: type === "success" ? "#1d4ed8" : "#dc2626",
        color: "#fff",
        fontSize: "14px",
        borderRadius: "8px",
      },
    });
  };

  // 🧠 Fetch cached injuries
  const fetchInjuries = async (showToast = false) => {
    try {
      const res = await axios.get(`${API_URL}/ab/injuries`, {
        withCredentials: false,
      });
      const data = res.data?.data || res.data?.response || res.data || [];
      setInjuries(data);
      setLastUpdated(new Date().toLocaleTimeString());
      if (showToast) customToast("Injury data refreshed ✅", "success");
    } catch (err) {
      console.error("❌ Injury fetch failed:", err.message);
      await pingHealth();
      customToast("Failed to load injury data ⚠️", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Manual refresh (forces re-scrape)
  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${API_URL}/ab/injuries/refresh`, {
        withCredentials: false,
      });
      const data = res.data?.data || res.data?.response || [];
      setInjuries(data);
      setLastUpdated(new Date().toLocaleTimeString());
      customToast("Injury report updated successfully ✅", "success");
    } catch (err) {
      console.error("Manual refresh failed:", err.message);
      await pingHealth();
      customToast("Error refreshing injury data ⚠️", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // 🩺 Backend health check fallback
  const pingHealth = async () => {
    try {
      const res = await axios.get(`${API_URL}/ab/health`);
      console.log("Health:", res.data?.status || res.status);
    } catch {
      console.warn("Backend health check failed");
    }
  };

  // 🔄 Auto-refresh every 6 hours
  useEffect(() => {
    fetchInjuries();
    const interval = setInterval(() => fetchInjuries(true), 1000 * 60 * 60 * 6);
    return () => clearInterval(interval);
  }, []);

  // 🎯 Filter by matchup
  const relevant = injuries.filter(
    (i) =>
      i.team?.toLowerCase().includes(homeTeam?.toLowerCase()) ||
      i.team?.toLowerCase().includes(awayTeam?.toLowerCase())
  );

  // 🩹 Badge color by status
  const badgeColor = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("out") || s.includes("inactive")) return "#dc2626";
    if (s.includes("question") || s.includes("doubt")) return "#f59e0b";
    if (s.includes("prob") || s.includes("day")) return "#16a34a";
    return "#6b7280";
  };

  // ⏳ Loading
  if (loading)
    return (
      <div className="injury-report">
        <h3>Injury Report</h3>
        <p>Loading injuries...</p>
      </div>
    );

  // 🧘 No injuries found
  if (!relevant.length)
    return (
      <div className="injury-report">
        <div className="injury-header">
          <h3>
            🚑 Injury Report — {awayTeam} @ {homeTeam}
          </h3>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="refresh-btn"
          >
            {refreshing ? (
              <>
                <div className="spinner" />
                Refreshing...
              </>
            ) : (
              "🔄 Refresh"
            )}
          </button>
        </div>
        <div className="injury-sub">Last updated: {lastUpdated || "—"}</div>
        <p>No reported injuries for this matchup.</p>
        <ToastContainer />
      </div>
    );

  // ✅ Render injuries
  return (
    <div className="injury-report">
      <div className="injury-header">
        <h3>
          🚑 Injury Report — {awayTeam} @ {homeTeam}
        </h3>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="refresh-btn"
        >
          {refreshing ? (
            <>
              <div className="spinner" />
              Refreshing...
            </>
          ) : (
            "🔄 Refresh"
          )}
        </button>
      </div>

      <div className="injury-sub">Last updated: {lastUpdated || "—"}</div>

      <div className="injury-grid">
        {relevant.map((r, i) => (
          <div key={i} className="injury-card">
            <div className="player-name">{r.player}</div>
            <div className="player-team">{r.team}</div>
            <div className="player-injury">{r.injury || "Undisclosed"}</div>
            <div
              className="player-status"
              style={{ background: badgeColor(r.status) }}
            >
              {r.status || "Unknown"}
            </div>
            {r.note && <div className="player-note">{r.note}</div>}
          </div>
        ))}
      </div>

      <ToastContainer />
    </div>
  );
}
