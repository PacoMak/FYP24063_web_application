import { Box, Card, Typography } from "@mui/material";
import { memo } from "react";
import styled from "styled-components";
import { PortfolioValueChart, StockPriceTable } from "./components";
import { Loading } from "../../components";
import { useStocksHistory } from "../../api";

const Wrapper = styled(Box)`
  display: flex;
  gap: 5rem;
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
