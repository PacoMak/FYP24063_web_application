import {
  Box,
  Card,
  Paper,
  styled,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { memo, useEffect, useState } from "react";
import { useTrainModel } from "../../../api";

const StyledPaper = styled(Card)`
  height: 100%;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  box-shadow: ${({ theme }) => theme.shadows[2]};
  border-radius: ${({ theme }) => theme.shape.borderRadius};
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.palette.background.paper};
`;

const Wrapper = styled(Paper)`
  width: 80%;
  max-height: 70vh;
  margin: auto;
  border-radius: ${({ theme }) => theme.shape.borderRadius};
  padding: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 95%;
    padding: ${({ theme }) => theme.spacing(2)};
  }
`;

const LogContainer = styled(Box)`
  flex-grow: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(1)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius};
  background-color: ${({ theme }) => theme.palette.grey[50]};
  display: flex;
  flex-direction: column;
`;

const LogDisplay = styled(Box)`
  flex-grow: 1;
  padding: ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme }) => theme.palette.background.paper};
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-all;
`;

const StyledTrainButton = styled(Button)`
  margin: 0 auto;
`;

const ButtonWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const TrainingLog = memo(({ selectedStocks, trainingParams }) => {
  const [trainingStart, setTrainingStart] = useState(false);
  const [trainingEnd, setTrainingEnd] = useState(false);
  const [modelId, setModelId] = useState(null);
  const [logs, setLogs] = useState([]);
  const { mutateAsync: trainModelAsync } = useTrainModel();

  // Handle SSE for logs
  useEffect(() => {
    let eventSource;
    if (modelId) {
      eventSource = new EventSource(
        `http://127.0.0.1:5000/model/train/${modelId}/logs`
      );
      eventSource.onmessage = (event) => {
        if (
          event.data ===
          "--------------------DDPG Training End--------------------"
        ) {
          setTrainingEnd(true);
        }
        setLogs((prevLogs) => [...prevLogs, event.data]);
      };
      eventSource.onerror = () => {
        setTrainingEnd(true);
        setLogs((prevLogs) => [...prevLogs, "Error: Lost connection to logs"]);
        eventSource.close();
      };
    }
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [modelId]);

  const handleStartTraining = async () => {
    try {
      const payload = {
        assets: selectedStocks.map((stock) => stock.symbol),
        batch_size: trainingParams.batchSize,
        rebalance_window: trainingParams.rebalanceWindow,
        start_date: trainingParams.startDate,
        end_date: trainingParams.endDate,
        num_epoch: trainingParams.epochs,
        ...trainingParams,
      };
      const modelId = await trainModelAsync(payload);
      setModelId(modelId);
      setTrainingStart(true);
    } catch (error) {
      setLogs((prevLogs) => [
        ...prevLogs,
        `Error: Training failed - ${error.message}`,
      ]);
    }
  };

  return (
    <Wrapper elevation={3}>
      <Typography variant="h6" fontWeight="bold" color="primary">
        Training Log
      </Typography>
      <Divider />
      <StyledPaper>
        <Box display="flex" flexDirection="column" height="100%">
          <Typography variant="subtitle1" gutterBottom>
            Training Details
          </Typography>
          <Box mb={2}>
            <Typography variant="body2" color="textSecondary">
              <strong>Selected Stocks:</strong>{" "}
              {selectedStocks?.length
                ? selectedStocks.map((stock) => stock.symbol).join(", ")
                : "None"}
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={1}>
              <strong>Training Parameters:</strong>{" "}
              {trainingParams ? JSON.stringify(trainingParams) : "None"}
            </Typography>
          </Box>
          <Typography variant="subtitle1" gutterBottom>
            Logs
          </Typography>
          <LogContainer>
            {trainingStart ? (
              <LogDisplay role="log" aria-label="Training logs">
                {logs.length > 0
                  ? logs.map((log, index) => <div key={index}>{log}</div>)
                  : "Logs will appear here..."}
              </LogDisplay>
            ) : (
              <ButtonWrapper>
                <StyledTrainButton
                  variant="contained"
                  color="primary"
                  onClick={handleStartTraining}
                >
                  Start Training
                </StyledTrainButton>
              </ButtonWrapper>
            )}
          </LogContainer>
        </Box>
      </StyledPaper>
    </Wrapper>
  );
});

TrainingLog.displayName = "TrainingLog";
