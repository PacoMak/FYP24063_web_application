import { Box, Button, Card, Typography } from "@mui/material";
import { memo, useMemo } from "react";
import styled from "styled-components";
import {
  PortfolioValueChart,
  ReturnOverEpochChart,
  ReturnOverTimeChart,
  StockPriceTable,
} from "./components";
import { RETURN_OVER_TIME } from "../../data";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../constants";
import {
  useModel,
  useStocksHistory,
  useTestingResult,
  useTrainingResult,
} from "../../api";

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
  padding: 1rem 0 0 1rem;
`;

const Body = styled(Box)`
  display: flex;
  flex-grow: 1;
  padding: 1rem 0 0 1rem;
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
  padding: 1rem;
`;

export const DashboardPage = memo(() => {
  const navigate = useNavigate();
  const { model_id } = useParams();

  const { data: trainingResult, isFetching: isTrainingResultFetching } =
    useTrainingResult(model_id);
  const { data: testingResult, isFetching: isTestingResultFetching } =
    useTestingResult(model_id);
  const { data: model, isFetching: isModelFetching } = useModel(model_id);

  const modelStocks = useMemo(() => {
    if (isModelFetching) {
      return [];
    }
    return model.assets ?? [];
  }, [isModelFetching, model]);

  const { data: stocksHistory, isFetching: isStocksHistoryFetching } =
    useStocksHistory(modelStocks, { enable: !isModelFetching });

  const stocksLatestInfo = useMemo(() => {
    if (isStocksHistoryFetching) {
      return [];
    }
    const tickers = Object.keys(stocksHistory);
    return tickers.map((ticker) => ({
      name: ticker,
      open: stocksHistory[ticker][
        stocksHistory[ticker].length - 1
      ]?.Open.toFixed(2),
      close:
        stocksHistory[ticker][stocksHistory[ticker].length - 1]?.Close.toFixed(
          2
        ),
      high: stocksHistory[ticker][
        stocksHistory[ticker].length - 1
      ]?.High.toFixed(2),
      low: stocksHistory[ticker][stocksHistory[ticker].length - 1]?.Low.toFixed(
        2
      ),
    }));
  }, [isStocksHistoryFetching, stocksHistory]);

  const formattedReturnOverTime = useMemo(() => {
    if (isTestingResultFetching) {
      return [];
    }
    const models = Object.keys(testingResult);
    const len = testingResult[models[0]].length;
    return Array.from({ length: len }, (_, index) => {
      return models.reduce(
        (acc, model) => {
          return {
            ...acc,
            [model]: testingResult[model][index]?.toFixed(2),
          };
        },
        {
          date: index,
        }
      );
    }).slice(-100);
  }, [isTestingResultFetching, testingResult]);

  const formattedReturnOverEpoch = useMemo(() => {
    if (isTrainingResultFetching) {
      return [];
    }
    const epochs = trainingResult.return_over_epoch.length;
    return Array.from({ length: epochs }, (_, index) => {
      return { epoch: index, ddpg: trainingResult.return_over_epoch[index] };
    });
  }, [isTrainingResultFetching, trainingResult]);

  const formattedSharpeRatioOverEpoch = useMemo(() => {
    if (isTrainingResultFetching) {
      return [];
    }
    const epochs = trainingResult.sharpe_ratio_over_epoch.length;
    return Array.from({ length: epochs }, (_, index) => {
      return {
        epoch: index,
        ddpg: trainingResult.sharpe_ratio_over_epoch[index],
      };
    });
  }, [isTrainingResultFetching, trainingResult]);
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
            <StockPriceTable data={stocksLatestInfo} />
          </Cell>
        </LeftColumn>
        <RightColumn>
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
              Sharpe Ratio Over Epoch
            </Typography>
            <CardWrapper>
              <ReturnOverTimeChart data={formattedSharpeRatioOverEpoch} />
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
