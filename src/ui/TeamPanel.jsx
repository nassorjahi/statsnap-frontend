import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const fmtDate = (d) => {
  try { return new Date(d).toISOString().slice(5, 10); } catch { return d; }
};

export default function TeamPanel({ title, logo, pace, ptsFor, ptsAgainst, last10, trend = [] }) {
  const data = (trend || []).map((t) => ({
    ...t,
    label: fmtDate(t.date),
    totalFor: Number(t.totalFor || 0),
    totalAgainst: Number(t.totalAgainst || 0),
  }));

  return (
    <div className="tp-card">
      <div className="tp-head">
        <div className="tp-title">
          <img className="tp-logo" src={logo} alt="" />
          <span>{title}</span>
        </div>
        <div className="tp-meta">
          <div><span className="k">Pace</span><span className="v">{pace ?? "—"}</span></div>
          <div><span className="k">Pts For</span><span className="v">{ptsFor ?? "—"}</span></div>
          <div><span className="k">Pts Agst</span><span className="v">{ptsAgainst ?? "—"}</span></div>
          <div><span className="k">Last 10</span><span className="v">{last10 || "—"}</span></div>
        </div>
      </div>

      <div className="tp-chart">
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis hide />
            <Tooltip />
            <Line type="monotone" dataKey="totalFor" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="totalAgainst" stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="tp-legend">
          <span className="dot blue" /> For <span className="gap" />
          <span className="dot orange" /> Against
        </div>
      </div>
    </div>
  );
}
