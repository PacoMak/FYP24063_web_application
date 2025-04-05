import { memo, useMemo } from "react";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { trainning_params_schema } from "../../../yup";
import { FormikTextField } from "./FormikTextField";
import { FormikDateField } from "./FormikDateField";
import { Card, Box, Typography, Button } from "@mui/material";
import { useOverlay } from "../../../context/useOverlay";
import styled from "styled-components";

const Wrapper = styled(Card)`
  height: 100%;
  width: 50%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;
const StyledForm = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem;
  flex-grow: 1;
`;
const StyledRow = styled(Box)`
  flex: 1 1 45%;
`;
const Title = styled(Box)`
  font-size: 1.5rem;
  margin: 1rem 0 0 2rem;
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
  color: #333333;
  padding: 0.5rem 2rem;
  border-radius: 6px;
  &:hover {
    background-color: #e0e0e0;
  }
`;
const ButtonRow = styled(Box)`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  width: 95%;
  margin: 0 auto;
  padding: 1rem;
`;
export const TrainParamsForm = memo(({ setStage }) => {
  const { showErrorDialog } = useOverlay();

  const fields = useMemo(
    () => [
      {
        label: "tau",
        name: "tau",
        initValue: 0.001,
        type: "number",
      },
      {
        label: "alpha",
        name: "alpha",
        initValue: 0.00025,
        type: "number",
      },
      {
        label: "beta",
        name: "beta",
        initValue: 0.00025,
        type: "number",
      },
      {
        label: "gamma",
        name: "gamma",
        initValue: 0.9,
        type: "number",
      },
      {
        label: "batch size",
        name: "batchSize",
        initValue: 8,
        type: "number",
      },
      {
        label: "epochs",
        name: "epochs",
        initValue: 40,
        type: "number",
      },
      {
        label: "rebalance window",
        name: "rebalanceWindow",
        initValue: 10,
        type: "number",
      },
      {
        label: "principle",
        name: "principle",
        initValue: 10000,
        type: "number",
      },
      {
        label: "training start date",
        name: "trainingStartDate",
        initValue: dayjs(),
        type: "date",
      },
      {
        label: "training end date",
        name: "trainingEndDate",
        initValue: dayjs(),
        type: "date",
      },
    ],
    []
  );
  const initialValues = useMemo(
    () =>
      fields.reduce(
        (acc, field) => {
          acc[field.name] = field.initValue;
          return acc;
        },
        {
          stocks: [],
        }
      ),
    [fields]
  );
  const formik = useFormik({
    initialValues,
    validationSchema: trainning_params_schema,

    validate: async (values) => {
      try {
        await trainning_params_schema.validate(values);
      } catch (err) {
        showErrorDialog(err.message);
      }
    },
    onSubmit: (values) => {
      values = { ...values };
      values.startDate = values.startDate.format("YYYY-MM-DD");
      values.endDate = values.endDate.format("YYYY-MM-DD");
    },
  });

  return (
    <Wrapper>
      <Title>Parameters</Title>
      <StyledForm>
        {fields.map(({ label, name, type }) => (
          <StyledRow key={name}>
            {["string", "number"].includes(type) && (
              <FormikTextField
                formik={formik}
                label={label}
                name={name}
                type={type}
              />
            )}

            {["date"].includes(type) && (
              <FormikDateField formik={formik} label={label} name={name} />
            )}
          </StyledRow>
        ))}
      </StyledForm>
      <ButtonRow>
        <BackButton
          variant="outlined"
          onClick={() => setStage((prev) => prev - 1)}
        >
          Back
        </BackButton>
        <NextButton onClick={() => setStage((prev) => prev + 1)}>
          Next
        </NextButton>
      </ButtonRow>
    </Wrapper>
  );
});

TrainParamsForm.displayName = "TrainParamsForm";
