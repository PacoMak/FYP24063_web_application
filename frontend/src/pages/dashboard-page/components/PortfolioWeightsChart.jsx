import { memo, useState, useMemo } from "react";
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
  min-height: 350px;
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

  const handleSliderChange = (event, newValue) => {
    setSelectedTimeIndex(newValue);
  };

  const weights = weightHistory[selectedTimeIndex] || {};

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
            aria-labelledby="time-slider"
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
                outerRadius={150}
                isAnimationActive={false}
                label={({ name, value }) =>
                  `${name}: ${(value * 100).toFixed(2)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Legend />
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
