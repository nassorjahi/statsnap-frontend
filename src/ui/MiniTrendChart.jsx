// src/ui/MiniTrendChart.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MiniTrendChart({ data }) {
  if (!data) return null;

  const chartData = data.map((pts, i) => ({ game: i + 1, pts }));

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={chartData}>
        <XAxis dataKey="game" hide />
        <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
        <Tooltip />
        <Line type="monotone" dataKey="pts" stroke="#2563eb" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
