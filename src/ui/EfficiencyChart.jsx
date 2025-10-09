import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const EfficiencyChart = ({ data }) => {
  // Prevent runtime errors if data is undefined or not an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: "20px" }}>
        No efficiency data available.
      </p>
    );
  }

  // Format the incoming team data for chart use
  const formattedData = data.map((d) => ({
    date: d.DATE,
    points: d.F,
    opponent: d.OPPONENT_SCORE,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={formattedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="points" stroke="#2563eb" name="Points" />
        <Line
          type="monotone"
          dataKey="opponent"
          stroke="#ef4444"
          name="Opponent Points"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EfficiencyChart;
