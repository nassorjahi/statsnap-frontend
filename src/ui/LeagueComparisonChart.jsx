import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const LeagueComparisonChart = ({ data, selectedTeam, metric = "points" }) => {
  // ✅ Safety check
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: "20px" }}>
        No league comparison data available.
      </p>
    );
  }

  // ✅ Metric Label Mapping
  const metricLabels = {
    points: "Avg Points Scored",
    pointsAllowed: "Avg Points Allowed",
    winRate: "Win Rate (%)",
    efficiency: "Efficiency Margin",
  };

  // ✅ Determine chart color dynamically (highlight selected team)
  const getBarColor = (team) =>
    selectedTeam && team === selectedTeam ? "#2563eb" : "#10b981";

  // ✅ Prepare chart data with proper numeric formatting
  const formattedData = data.map((d) => ({
    TEAM: d.team,
    value:
      metric === "winRate"
        ? parseFloat(d[metric].toFixed(1))
        : parseFloat(d[metric].toFixed(2)),
  }));

  // ✅ Sort descending for readability
  formattedData.sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="TEAM"
          angle={-40}
          textAnchor="end"
          interval={0}
          tick={{ fontSize: 11 }}
          height={60}
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value) =>
            metric === "winRate"
              ? `${value.toFixed(1)}%`
              : value.toFixed(1)
          }
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend verticalAlign="top" height={36} />
        <Bar
          dataKey="value"
          name={metricLabels[metric]}
          radius={[6, 6, 0, 0]}
          isAnimationActive={false}
          label={{
            position: "top",
            fontSize: 10,
            formatter: (v) =>
              metric === "winRate" ? `${v.toFixed(0)}%` : v.toFixed(1),
          }}
          fillOpacity={0.9}
          // ✅ Custom color per bar
          shape={(props) => {
            const { x, y, width, height, payload } = props;
            return (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={getBarColor(payload.TEAM)}
                rx={4}
                ry={4}
              />
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LeagueComparisonChart;
