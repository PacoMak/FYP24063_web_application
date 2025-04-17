import { memo } from "react";
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

const getYDomain = (data) => {
  if (!data || data.length === 0) return [0, 0];

  const values = data.flatMap((entry) =>
    [
      entry.ddpg,
      entry.uniform_with_rebalance,
      entry.uniform_without_rebalance,
      entry.MPT,
      entry.all_in_last_day_best_return,
    ]
      .filter((val) => val !== undefined && val !== null)
      .map((val) => parseFloat(val))
  );

  const min = Math.min(...values);
  const max = Math.max(...values);

  return [min, max];
};

export const ReturnOverTimeChart = memo(({ data }) => {
  const yDomain = getYDomain(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={yDomain} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dot={false}
          dataKey="ddpg"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dot={false}
          dataKey="uniform_with_rebalance"
          stroke="#82ca9d"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dot={false}
          dataKey="uniform_without_rebalance"
          stroke="#ff7300"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dot={false}
          dataKey="MPT"
          stroke="#ff0000"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dot={false}
          dataKey="all_in_last_day_best_return"
          stroke="#00c4b4"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

ReturnOverTimeChart.displayName = "ReturnOverTimeChart";
