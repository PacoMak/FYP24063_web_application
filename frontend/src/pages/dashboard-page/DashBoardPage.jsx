import { Box, Button, Card, Typography } from "@mui/material";
import { memo, useMemo } from "react";
import styled from "styled-components";
import {
  PortfolioValueChart,
  ReturnOverEpochChart,
  ReturnOverTimeChart,
  StockPriceTable,
} from "./components";
import {
  STOCKS_HISTORY,
  RETURN_OVER_TIME,
  RETURN_OVER_EPOCH,
} from "../../data";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`;

const Head = styled(Box)`
  flex: 0 0 auto;
  display: flex;
  gap: 1rem;
  padding: 1rem;
`;

const Body = styled(Box)`
  display: flex;
  flex-grow: 1;
  padding: 1rem;
  gap: 1rem;
  overflow: hidden;
`;

const LeftColumn = styled(Box)`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RightColumn = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Cell = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
`;

const CardWrapper = styled(Card)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

export const DashboardPage = memo(() => {
  const formattedReturnOverTime = useMemo(() => {
    const models = Object.keys(RETURN_OVER_TIME);
    const dates = RETURN_OVER_TIME[models[0]].map((entry) => entry.date);
    return dates.map((date, index) => {
      let obj = { date };
      models.forEach((model) => {
        obj = { ...obj, [model]: RETURN_OVER_TIME[model][index].value };
      });
      return obj;
    });
  }, []);

  const formattedReturnOverEpoch = useMemo(() => {
    const models = Object.keys(RETURN_OVER_EPOCH);
    const epochs = RETURN_OVER_EPOCH[models[0]].length;
    return Array.from({ length: epochs }, (_, index) => {
      let obj = { epoch: index };
      models.forEach((model) => {
        obj = { ...obj, [model]: RETURN_OVER_EPOCH[model][index] };
      });
      return obj;
    });
  }, []);
  const navigate = useNavigate();
  return (
    <Wrapper>
      <Head>
        <Button
          variant="contained"
          onClick={() => {
            navigate(ROUTES.Models.path);
          }}
        >
          Back
        </Button>
      </Head>
      <Body>
        <LeftColumn>
          <Cell>
            <Typography variant="h5" gutterBottom>
              Stocks Status
            </Typography>
            <StockPriceTable data={STOCKS_HISTORY} />
          </Cell>
        </LeftColumn>
        <RightColumn>
          <Cell>
            <Typography variant="h5" gutterBottom>
              Portfolio Value
            </Typography>
            <CardWrapper>
              <PortfolioValueChart />
            </CardWrapper>
          </Cell>
          <Cell>
            <Typography variant="h5" gutterBottom>
              Return Over Time
            </Typography>
            <CardWrapper>
              <ReturnOverTimeChart data={formattedReturnOverTime} />
            </CardWrapper>
          </Cell>
          <Cell>
            <Typography variant="h5" gutterBottom>
              Return Over Epoch
            </Typography>
            <CardWrapper>
              <ReturnOverEpochChart data={formattedReturnOverEpoch} />
            </CardWrapper>
          </Cell>
        </RightColumn>
      </Body>
    </Wrapper>
  );
});

DashboardPage.displayName = "DashboardPage";
