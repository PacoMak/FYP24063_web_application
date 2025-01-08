import React, { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", close: 4000 },
  { name: "Feb", close: 3000 },
  { name: "Mar", close: 2000 },
  { name: "Apr", close: 2780 },
  { name: "May", close: 1890 },
  { name: "Jun", close: 2390 },
  { name: "Jul", close: 3490 },
  { name: "Aug", close: 2000 },
  { name: "Sep", close: 2780 },
  { name: "Oct", close: 1890 },
  { name: "Nov", close: 2390 },
  { name: "Dec", close: 3490 },
];

export const PortfolioValueChart = memo(() => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="close"
          stroke="#8884d8"
          dot={false}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});
PortfolioValueChart.displayName = "PortfolioValueChart";
