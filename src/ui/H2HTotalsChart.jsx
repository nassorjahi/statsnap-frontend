// src/ui/H2HTotalsChart.jsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  BarChart,
  Bar,
  LabelList,
} from "recharts";

const fmtDate = (d) => {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return d;
  }
};
const mean = (arr) => (arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0);
const stdev = (arr) => {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((n) => (n - m) ** 2)));
};
const toHalf = (n) => Math.round(n * 2) / 2;

export default function H2HTotalsChart({
  data = [],              // [{ date, totalPoints }]
  defaultView = "totals", // 'totals' | 'over' | 'suggest'
  lines = [200, 205, 210, 215, 220],
}) {
  const [view, setView] = useState(defaultView);

  const chartData = useMemo(
    () =>
      (data || []).map((d) => ({
        ...d,
        label: fmtDate(d.date),
        total: Number(d.totalPoints),
      })),
    [data]
  );

  const totals = chartData.map((d) => d.total);
  const avg = useMemo(() => toHalf(mean(totals)), [totals]);
  const sd = useMemo(() => toHalf(stdev(totals)), [totals]);
  const bandLo = Math.max(0, avg - sd);
  const bandHi = avg + sd;
  const domainMin = Math.max(0, Math.min(...totals, bandLo) - 10);
  const domainMax = Math.max(...totals, bandHi) + 10;

  // Over % view
  const [selLine, setSelLine] = useState(lines[2] ?? 210);
  const overCount = useMemo(
    () => chartData.filter((d) => d.total > selLine).length,
    [chartData, selLine]
  );
  const overPct = chartData.length ? Math.round((overCount / chartData.length) * 100) : 0;

  // Suggested total view (no add-to-picks)
  const [suggest, setSuggest] = useState(avg);
  const overAtSuggest = useMemo(
    () => chartData.filter((d) => d.total > suggest).length,
    [chartData, suggest]
  );
  const overPctAtSuggest = chartData.length
    ? Math.round((overAtSuggest / chartData.length) * 100)
    : 0;

  return (
    <div className="h2h-card">
      <div className="h2h-head">
        <div className="h2h-title">Last 5 Head-to-Head Totals</div>

        <div className="h2h-toolbar">
          <button
            className={`h2h-tab ${view === "totals" ? "active" : ""}`}
            onClick={() => setView("totals")}
          >
            Totals Trend
          </button>
          <button
            className={`h2h-tab ${view === "over" ? "active" : ""}`}
            onClick={() => setView("over")}
          >
            Over %
          </button>
          <button
            className={`h2h-tab ${view === "suggest" ? "active" : ""}`}
            onClick={() => setView("suggest")}
          >
            Suggested Total
          </button>
        </div>
      </div>

      {view === "totals" && (
        <div className="h2h-chart">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[domainMin, domainMax]} />
              <Tooltip />
              <ReferenceArea y1={bandLo} y2={bandHi} fill="#e0f2fe" fillOpacity={0.35} />
              <ReferenceLine y={avg} stroke="#0ea5e9" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="h2h-legend">
            <span className="lg-dot lg-blue" /> Totals
            <span className="lg-gap" />
            <span className="lg-line" /> Avg ({avg})
            <span className="lg-gap" />
            <span className="lg-band" /> Typical range (±1σ)
          </div>
        </div>
      )}

      {view === "over" && (
        <div className="h2h-chart">
          <div className="h2h-linepicker">
            {lines.map((v) => (
              <button
                key={v}
                className={`lp-chip ${selLine === v ? "active" : ""}`}
                onClick={() => setSelLine(v)}
              >
                {v}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { key: "Over", val: overCount },
                { key: "Under", val: chartData.length - overCount },
              ]}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="key" />
              <YAxis allowDecimals={false} domain={[0, chartData.length]} />
              <Tooltip />
              <Bar dataKey="val" fill="#2563eb" radius={[6, 6, 0, 0]}>
                <LabelList position="top" formatter={(v) => `${v} of ${chartData.length}`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="h2h-summary">
            <div className="sum-pill">
              Over <b>{selLine}</b> in{" "}
              <b>
                {overCount}/{chartData.length}
              </b>{" "}
              games (<b>{overPct}%</b>)
            </div>
            <div className="sum-sub">
              Avg: <b>{avg}</b> • Typical: <b>{Math.round(bandLo)}</b>–<b>{Math.round(bandHi)}</b>
            </div>
          </div>
        </div>
      )}

      {view === "suggest" && (
        <div className="h2h-suggest">
          <div className="sg-label">Suggested Total</div>
          <div className="sg-value">{suggest.toFixed(1)}</div>

          <div className="sg-controls">
            <button className="sg-btn" onClick={() => setSuggest(toHalf(suggest - 0.5))}>
              -0.5
            </button>
            <button className="sg-btn" onClick={() => setSuggest(avg)}>
              Avg
            </button>
            <button className="sg-btn" onClick={() => setSuggest(toHalf(suggest + 0.5))}>
              +0.5
            </button>
          </div>

          <div className="sg-note">
            Over <b>{suggest.toFixed(1)}</b> in <b>{overAtSuggest}/{chartData.length}</b> games
            (<b>{overPctAtSuggest}%</b>) • Avg <b>{avg}</b> • Typical{" "}
            <b>{Math.round(bandLo)}</b>–<b>{Math.round(bandHi)}</b>
          </div>
        </div>
      )}
    </div>
  );
}
