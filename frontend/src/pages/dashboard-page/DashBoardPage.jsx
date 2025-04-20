import { Box, Button, Card, Tabs, Tab, Typography } from "@mui/material";
import { memo, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import {
  ChartNotAvailable,
  ReturnOverEpochChart,
  ReturnOverTimeChart,
  StockPriceTable,
  SharpeRatioOverEpochChart,
  PortfolioWeightsChart,
} from "./components";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../constants";
import {
  useModel,
  useStocksHistory,
  useTestModel,
  useTrainingResult,
} from "../../api";
import { DatePicker } from "@mui/x-date-pickers";
import { useOverlay } from "../../context";

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`;

const Head = styled(Box)`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RightColumn = styled(Box)`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  padding: 2rem;
`;

const StyledDatePicker = styled(DatePicker)`
  background-color: white;
`;

const StyledTabs = styled(Tabs)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  & .MuiTabs-indicator {
    background-color: ${({ theme }) => theme.palette.primary.main};
    height: 3px;
    border-radius: 2px;
  }
  padding: 0 1rem;
`;

const StyledTab = styled(Tab)`
  text-transform: none;
  font-weight: 500;
  font-size: 1rem;
  padding: 12px 24px;
  color: ${({ theme }) => theme.palette.text.secondary};
  &.Mui-selected {
    color: ${({ theme }) => theme.palette.primary.main};
    font-weight: 600;
  }
  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
    color: ${({ theme }) => theme.palette.primary.main};
  }
  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 8px 16px;
    font-size: 0.875rem;
  }
`;

export const DashboardPage = memo(() => {
  const { showErrorDialog, showSpinner, hideSpinner } = useOverlay();
  const navigate = useNavigate();
  const { model_id } = useParams();
  const [testingResult, setTestingResult] = useState(null);
  const { mutateAsync: testModelMutate } = useTestModel(model_id);
  const [testingStartDate, setTestingStartDate] = useState(null);
  const [testingEndDate, setTestingEndDate] = useState(null);
  const { data: trainingResult, isFetching: isTrainingResultFetching } =
    useTrainingResult(model_id);
  const { data: model, isFetching: isModelFetching } = useModel(model_id);
  const [activeTab, setActiveTab] = useState(0);

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
    if (!testingResult) {
      return [];
    }
    const models = Object.keys(testingResult.result);
    const len = testingResult.result[models[0]].length;
    return Array.from({ length: len }, (_, index) => {
      return models.reduce(
        (acc, model) => {
          return {
            ...acc,
            [model]: testingResult.result[model][index]?.toFixed(2),
          };
        },
        {
          date: testingResult.time_range[index],
        }
      );
    }).slice(-100);
  }, [testingResult]);

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

  const handleTestButtonOnClick = useCallback(async () => {
    try {
      showSpinner();
      if (!testingStartDate || !testingEndDate) {
        showErrorDialog("Invalid Input", "Please select start and end date");
        return;
      }
      if (testingStartDate.isAfter(testingEndDate)) {
        showErrorDialog("Invalid Input", "Start date must be before end date");
        return;
      }
      const res = await testModelMutate({
        start_date: testingStartDate.format("YYYY-MM-DD"),
        end_date: testingEndDate.format("YYYY-MM-DD"),
      });
      setTestingResult(res);
    } catch (e) {
      showErrorDialog("Error", e.message);
    } finally {
      hideSpinner();
    }
  }, [
    testModelMutate,
    testingStartDate,
    testingEndDate,
    showErrorDialog,
    hideSpinner,
    showSpinner,
  ]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderChart = () => {
    switch (activeTab) {
      case 0:
        return formattedReturnOverTime.length > 0 ? (
          <ReturnOverTimeChart data={formattedReturnOverTime} />
        ) : (
          <ChartNotAvailable />
        );
      case 1:
        return (
          <SharpeRatioOverEpochChart data={formattedSharpeRatioOverEpoch} />
        );
      case 2:
        return <ReturnOverEpochChart data={formattedReturnOverEpoch} />;
      case 3:
        return testingResult && testingResult.weight_history?.length > 0 ? (
          <PortfolioWeightsChart
            weightHistory={testingResult.weight_history}
            timeRange={testingResult.time_range}
          />
        ) : (
          <ChartNotAvailable />
        );
      default:
        return <ChartNotAvailable />;
    }
  };

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
        Test from
        <StyledDatePicker
          name="testing start date"
          label="testing start date"
          maxDate={dayjs().subtract(1, "day")}
          value={testingStartDate}
          onChange={(e) => {
            setTestingStartDate(e);
          }}
        />
        to
        <StyledDatePicker
          name="testing end date"
          label="testing end date"
          maxDate={dayjs().subtract(1, "day")}
          value={testingEndDate}
          onChange={(e) => {
            setTestingEndDate(e);
          }}
        />
        <Button variant="contained" onClick={handleTestButtonOnClick}>
          Test
        </Button>
      </Head>
      <Body>
        <LeftColumn>
          <Cell>
            <Typography gutterBottom>Stocks Status</Typography>
            <StockPriceTable data={stocksLatestInfo} />
          </Cell>
        </LeftColumn>
        <RightColumn>
          <StyledTabs value={activeTab} onChange={handleTabChange} centered>
            <StyledTab label="Return Over Time" />
            <StyledTab label="Sharpe Ratio Over Epoch" />
            <StyledTab label="Return Over Epoch" />
            <StyledTab label="Portfolio Weights" />
          </StyledTabs>
          <Cell>
            <CardWrapper>{renderChart()}</CardWrapper>
          </Cell>
        </RightColumn>
      </Body>
    </Wrapper>
  );
});

DashboardPage.displayName = "DashboardPage";
