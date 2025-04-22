import {
  Box,
  Card,
  Paper,
  styled,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { memo, useEffect, useRef, useState } from "react";
import { useTrainModel } from "../../../api";
import { useOverlay } from "../../../context";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants";

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

const ButtonRow = styled(Box)`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const BackButton = styled(Button)`
  color: ${({ theme }) => theme.colors.button.back.color};
  background-color: ${({ theme }) => theme.colors.button.back.background};
  padding: 0.5rem 2rem;
  border-radius: 6px;
  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.button.back.hover.background};
  }
`;

const FinishButton = styled(Button)`
  background-color: ${({ $activate, theme }) =>
    $activate
      ? theme.colors.button.next.activate.background
      : theme.colors.button.next.deactivate.background};
  color: ${({ theme }) => theme.colors.button.next.activate.color};
  padding: 0.5rem 2rem;
  border-radius: 6px;
  &:hover {
    ${({ theme }) => theme.colors.button.next.hover.background};
  }
`;

export const TrainingLog = memo(
  ({ selectedStocks, trainingParams, setStage }) => {
    const { showSpinner, hideSpinner, showErrorDialog } = useOverlay();
    const [trainingStart, setTrainingStart] = useState(false);
    const [trainingEnd, setTrainingEnd] = useState(false);
    const [modelId, setModelId] = useState(null);
    const [logs, setLogs] = useState([]);
    const { mutateAsync: trainModelAsync } = useTrainModel();
    const navigate = useNavigate();
    const logRef = useRef(null);

    // Auto-scroll to bottom when logs update
    useEffect(() => {
      if (logRef.current) {
        logRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [logs]);

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
          showErrorDialog("Error", "Lost Connection to server.");
          eventSource.close();
        };
      }
      return () => {
        if (eventSource) {
          eventSource.close();
        }
      };
    }, [modelId, showErrorDialog]);

    const handleStartTraining = async () => {
      try {
        showSpinner();
        const payload = {
          assets: selectedStocks.map((stock) => stock.symbol),
          rebalance_window: trainingParams.rebalanceWindow,
          principal: trainingParams.principal,
          num_epoch: trainingParams.epochs,
          start_date: trainingParams.trainingStartDate.format("YYYY-MM-DD"),
          end_date: trainingParams.trainingEndDate.format("YYYY-MM-DD"),
          alpha: trainingParams.alpha,
          beta: trainingParams.beta,
          gamma: trainingParams.gamma,
          tau: trainingParams.tau,
          batch_size: trainingParams.batchSize,
          model_name: trainingParams.modelName,
        };
        const modelId = await trainModelAsync(payload);
        setModelId(modelId);
        setTrainingStart(true);
      } catch (error) {
        showErrorDialog("Error", error);
      } finally {
        hideSpinner();
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
              <Typography variant="subtitle2" color="textSecondary">
                <strong>Selected Stocks:</strong>{" "}
                {selectedStocks?.length
                  ? selectedStocks.map((stock) => stock.symbol).join(", ")
                  : "None"}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" mt={1}>
                <strong>Training Parameters:</strong>
              </Typography>
              {trainingParams ? (
                <Box ml={2}>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Rebalance Window:</strong>{" "}
                    {trainingParams.rebalanceWindow},{" "}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Principal:</strong> {trainingParams.principal},{" "}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Epochs:</strong> {trainingParams.epochs},{" "}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Start Date:</strong>{" "}
                    {trainingParams.trainingStartDate.format("YYYY-MM-DD")},{" "}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>End Date:</strong>{" "}
                    {trainingParams.trainingEndDate.format("YYYY-MM-DD")},{" "}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Alpha:</strong> {trainingParams.alpha},{" "}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Beta:</strong> {trainingParams.beta},{" "}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Gamma:</strong> {trainingParams.gamma},{" "}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Tau:</strong> {trainingParams.tau},{" "}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Batch Size:</strong> {trainingParams.batchSize},{" "}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Model Name:</strong> {trainingParams.modelName},{" "}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  None
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary" mt={1}>
                <strong>Model Type:</strong>{" "}
                {trainingParams.modelType === 1 && "Fully Connected Layers"}
                {trainingParams.modelType === 2 && "Long Short-Term Memory"}
                {trainingParams.modelType === 3 && "Amplifier"}
              </Typography>
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              Logs
            </Typography>
            <LogContainer>
              {trainingStart ? (
                <LogDisplay role="log" aria-label="Training logs">
                  {logs.length > 0 &&
                    logs.map((log, index) => <div key={index}>{log}</div>)}
                  <div ref={logRef}></div>
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
        <ButtonRow>
          <BackButton
            variant="outlined"
            onClick={() => {
              setStage((prev) => prev - 1);
            }}
            disabled={trainingStart}
          >
            Back
          </BackButton>
          <FinishButton
            variant="contained"
            $activate={trainingEnd}
            disabled={!trainingEnd}
            onClick={() => {
              navigate(ROUTES.Models.path);
            }}
          >
            Finish
          </FinishButton>
        </ButtonRow>
      </Wrapper>
    );
  }
);

TrainingLog.displayName = "TrainingLog";
