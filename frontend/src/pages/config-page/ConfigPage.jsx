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
  overflow: hidden;
  width: 100%;
  margin: 0 auto;
  gap: 1rem;
  height: 100%;
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
  height: 100%;
`;

const ButtonRow = styled(Box)`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const NextButton = styled(Button)`
  background-color: #1976d2;
  color: #ffffff;
  padding: 0.5rem 2rem;
  border-radius: 6px;
  &:hover {
    background-color: #1565c0;
  }
`;

const BackButton = styled(Button)`
  background-color: #f5f5f5;
  color: #333333;
  padding: 0.5rem 2rem;
  border-radius: 6px;
  &:hover {
    background-color: #e0e0e0;
  }
`;

export const ConfigPage = memo(() => {
  const [stage, setStage] = useState(0);

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
        {stage === 0 && <SelectStockTable />}
        {stage === 1 && <TrainParamsForm />}
      </StepContent>

      <ButtonRow>
        {stage > 0 && (
          <BackButton
            onClick={() => setStage((prev) => prev - 1)}
            variant="outlined"
          >
            Back
          </BackButton>
        )}
        {stage < steps.length - 1 && (
          <NextButton
            onClick={() => setStage((prev) => prev + 1)}
            variant="contained"
          >
            Next
          </NextButton>
        )}
      </ButtonRow>
    </Wrapper>
  );
});

ConfigPage.displayName = "ConfigPage";
