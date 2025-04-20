import { Box, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { memo, useMemo, useState } from "react";
import styled from "styled-components";
import { SelectStockTable, TrainingLog, TrainParamsForm } from "./components";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { trainning_params_schema } from "../../yup";
const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  gap: 1rem;
  height: 100%;
`;

const StyledStepper = styled(Stepper)`
  & .MuiStepLabel-label {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.stepper.incompleted.color};
  }

  & .MuiStepLabel-label.Mui-active {
    color: ${({ theme }) => theme.colors.stepper.active.color};
    font-weight: 600;
  }

  & .MuiStepLabel-label.Mui-completed {
    color: ${({ theme }) => theme.colors.stepper.completed.color};
  }

  & .MuiStepIcon-root {
    width: 2rem;
    height: 2rem;
    color: ${({ theme }) => theme.colors.stepper.incompleted.background};
  }

  & .MuiStepIcon-root.Mui-active {
    color: ${({ theme }) => theme.colors.stepper.active.background};
  }

  & .MuiStepIcon-root.Mui-completed {
    color: ${({ theme }) => theme.colors.stepper.completed.background};
  }

  & .MuiStepConnector-line {
    border-color: ${({ theme }) => theme.colors.stepper.line.color};
    border-width: 2px;
  }
`;

const StepContent = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const ConfigPage = memo(() => {
  const [stage, setStage] = useState(0);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const initialTrainingParams = useMemo(
    () => ({
      modelName: "",
      tau: 0.03,
      alpha: 0.0001,
      beta: 0.0005,
      gamma: 0.99,
      batchSize: 128,
      epochs: 40,
      rebalanceWindow: 1,
      principal: 1000000,
      trainingStartDate: dayjs().subtract(2, "year"),
      trainingEndDate: dayjs().endOf("year").subtract(1, "year"),
      modelType: 1,
    }),
    []
  );
  const formik = useFormik({
    initialValues: initialTrainingParams,
    validationSchema: trainning_params_schema,
    validateOnMount: true,
    onSubmit: (values) => {
      values.trainingStartDate = values.trainingStartDate.format("YYYY-MM-DD");
      values.trainingEndDate = values.trainingEndDate.format("YYYY-MM-DD");
    },
  });
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
        {stage === 1 && <TrainParamsForm setStage={setStage} formik={formik} />}
        {stage === 2 && (
          <TrainingLog
            selectedStocks={selectedStocks}
            trainingParams={formik.values}
            setStage={setStage}
          />
        )}
      </StepContent>
    </Wrapper>
  );
});

ConfigPage.displayName = "ConfigPage";
