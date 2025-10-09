import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PlayerChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="PLAYER FULL NAME" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="PTS" fill="#8884d8" />
          <Bar dataKey="3P" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlayerChart;
