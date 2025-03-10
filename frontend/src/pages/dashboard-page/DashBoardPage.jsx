import { Box, Card, Typography } from "@mui/material";
import { memo, useState } from "react";
import styled from "styled-components";
import {
  ModelSelector,
  PortfolioValueChart,
  StockPriceTable,
} from "./components";

const Wrapper = styled(Box)`
  display: flex;
  gap: 5rem;
  border: 1px solid blue;
`;
const Left = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;
const Right = styled(Box)`
  flex: 1;
`;

export const DashboardPage = memo(() => {
  const [selectedModel, setSelectedModel] = useState(null);
  if (!selectedModel) {
    return (
      <ModelSelector
        onSelect={(model_id) => {
          setSelectedModel(model_id);
        }}
      />
    );
  }
  return (
    <Wrapper>
      <Left>
        <Box>
          <Typography variant="h5" gutterBottom>
            Portfolio Value
          </Typography>
          <Card sx={{ height: "35vh", borderRadius: 4 }}>
            <PortfolioValueChart />
          </Card>
        </Box>
        <Box>
          <Typography variant="h5" gutterBottom>
            Stocks status
          </Typography>
          <StockPriceTable />
        </Box>
      </Left>
      <Right></Right>
    </Wrapper>
  );
});

DashboardPage.displayName = "DashboardPage";
