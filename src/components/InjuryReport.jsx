import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./InjuryReport.css";

export default function InjuryReport({ homeTeam, awayTeam }) {
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ✅ Fetch cached injuries
  const fetchInjuries = async (showToast = false) => {
    try {
      const res = await axios.get("http://localhost:5050/api/injuries");
      setInjuries(res.data || []);
      setLastUpdated(new Date().toLocaleTimeString());
      if (showToast) customToast("Injury data refreshed successfully ✅", "success");
    } catch (err) {
      console.error("❌ Injury fetch failed:", err.message);
      customToast("Failed to load injury data ⚠️", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Manual refresh (live scrape)
  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get("http://localhost:5050/api/injuries/refresh");
      setInjuries(res.data.data || []);
      setLastUpdated(new Date().toLocaleTimeString());
      customToast("Injury report updated successfully ✅", "success");
    } catch (err) {
      console.error("Manual refresh failed:", err.message);
      customToast("Error refreshing injury data ⚠️", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ Toast wrapper (custom theme)
  const customToast = (message, type) => {
    toast[type](message, {
      position: "bottom-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
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

  // ✅ Load on mount + refresh every 6 hrs
  useEffect(() => {
    fetchInjuries();
    const interval = setInterval(() => fetchInjuries(true), 1000 * 60 * 60 * 6);
    return () => clearInterval(interval);
  }, []);

  // ✅ Filter matchup
  const relevant = injuries.filter(
    (i) =>
      i.team?.toLowerCase().includes(homeTeam?.toLowerCase()) ||
      i.team?.toLowerCase().includes(awayTeam?.toLowerCase())
  );

  // ✅ Badge color
  const badgeColor = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("out") || s.includes("inactive")) return "#dc2626";
    if (s.includes("question") || s.includes("doubt")) return "#f59e0b";
    if (s.includes("prob") || s.includes("day")) return "#16a34a";
    return "#6b7280";
  };

  if (loading)
    return (
      <div className="injury-report">
        <h3>Injury Report</h3>
        <p>Loading injuries...</p>
      </div>
    );

  // ✅ Empty Matchup State
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
        <div className="injury-sub">
          Last updated: {lastUpdated || "—"}
        </div>
        <p>No reported injuries for this matchup.</p>
        <ToastContainer />
      </div>
    );

  // ✅ Render injuries grid
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
