import { memo } from "react";
import { Box, Typography } from "@mui/material";
import styled from "styled-components";

const Wrapper = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

export const ChartNotAvailable = memo(() => {
  return (
    <Wrapper>
      <Typography variant="h6" color="textSecondary">
        Test the model to generate and display the chart
      </Typography>
    </Wrapper>
  );
});

ChartNotAvailable.displayName = "ChartNotAvailable";
