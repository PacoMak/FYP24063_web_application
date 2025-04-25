import { memo, useState, useMemo, useCallback } from "react";
import { Box, Slider, Typography } from "@mui/material";
import styled from "styled-components";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

const WeightsContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
`;

const SliderContainer = styled(Box)`
  padding: 0 1rem;
`;

const ChartContainer = styled(Box)`
  flex: 1;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
`;

const generateColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 360) / count;
    const color = `hsl(${hue}, 70%, 50%)`;
    colors.push(color);
  }
  return colors;
};

export const PortfolioWeightsChart = memo(({ weightHistory, timeRange }) => {
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);

  const handleSliderChange = useCallback((event, newValue) => {
    setSelectedTimeIndex(newValue);
  }, []);

  const weights = useMemo(
    () => weightHistory[selectedTimeIndex] ?? {},
    [selectedTimeIndex, weightHistory]
  );

  const pieData = useMemo(() => {
    return Object.entries(weights).map(([symbol, weight]) => ({
      name: symbol,
      value: Number(weight.toFixed(4)),
    }));
  }, [weights]);

  const colors = useMemo(
    () => generateColors(pieData.length),
    [pieData.length]
  );

  const marks = useMemo(() => {
    return timeRange.map((time, index) => ({
      value: index,
      label: index % Math.ceil(timeRange.length / 5) === 0 ? time : "",
    }));
  }, [timeRange]);

  return (
    <WeightsContainer>
      <Box>
        <Typography gutterBottom>Select Time</Typography>
        <SliderContainer>
          <Slider
            value={selectedTimeIndex}
            onChange={handleSliderChange}
            min={0}
            max={timeRange.length - 1}
            step={1}
            marks={marks}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => timeRange[value]}
          />
        </SliderContainer>
      </Box>
      <ChartContainer>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart key={`pie-chart-${selectedTimeIndex}`}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={Math.min(80, window.innerHeight * 0.15)}
                isAnimationActive={false}
                label={({ name, value }) =>
                  `${name}: ${(value * 100).toFixed(2)}%`
                }
                labelLine={{ stroke: "#666", strokeWidth: 1 }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Typography align="center" color="textSecondary">
            No weights available for this time
          </Typography>
        )}
      </ChartContainer>
    </WeightsContainer>
  );
});

PortfolioWeightsChart.displayName = "PortfolioWeightsChart";
