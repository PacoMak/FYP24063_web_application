import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { memo, useState } from "react";
import styled from "styled-components";
import { SelectStockTable, TrainParamsForm } from "./components";

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  gap: 1rem;
`;

const StyledStepper = styled(Stepper)`
  & .MuiStepLabel-label {
    font-size: 1.1rem;
    color: #666666;
  }

  & .MuiStepLabel-label.Mui-active {
    color: #1976d2;
    font-weight: 600;
  }

  & .MuiStepLabel-label.Mui-completed {
    color: #2e7d32;
  }

  & .MuiStepIcon-root {
    width: 2rem;
    height: 2rem;
    color: #e0e0e0;
  }

  & .MuiStepIcon-root.Mui-active {
    color: #1976d2;
  }

  & .MuiStepIcon-root.Mui-completed {
    color: #2e7d32;
  }

  & .MuiStepConnector-line {
    border-color: #e0e0e0;
    border-width: 2px;
  }
`;

const StepContent = styled(Box)`
  flex-grow: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  overflow: visible;
`;

const StepperContainer = styled(Box)``;

export const ConfigPage = memo(() => {
  const [stage, setStage] = useState(0);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const steps = [
    "Select Stocks",
    "Set Training Params",
    "Wait for Model Training",
  ];

  return (
    <Wrapper>
      <StyledStepper activeStep={stage} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>
              <Typography variant="body1">
                Step {index + 1}: {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </StyledStepper>
      <StepContent>
        {stage === 0 && (
          <SelectStockTable
            selectedStocks={selectedStocks}
            setSelectedStocks={setSelectedStocks}
            setStage={setStage}
          />
        )}
        {stage === 1 && <TrainParamsForm setStage={setStage} />}
      </StepContent>
    </Wrapper>
  );
});

ConfigPage.displayName = "ConfigPage";
