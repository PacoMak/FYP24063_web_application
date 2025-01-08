import { Button, Card, Typography, Box } from "@mui/material";
import { memo, useMemo } from "react";
import styled from "styled-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FormikDateField,
  FormikTextField,
  SelectStocksField,
} from "./components";
import dayjs from "dayjs";

const StyledBox = styled(Card)`
  width: min(75%, 30vw);
  margin: auto;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
`;

const StyledFormContainer = styled(Box)`
  flex-grow: 1; // Take up remaining space
  display: flex;
  flex-direction: column;
`;

const StyledForm = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 2rem;
`;

const StyledRow = styled(Box)`
  flex: 1 1 45%;
`;

const ButtonWrapper = styled(Box)`
  display: flex;
  justify-content: flex-end;
  gap: 2rem;
  margin-top: 2rem;
`;

const validationSchema = Yup.object().shape({
  tau: Yup.number()
    .required("Required")
    .min(0, "Must be greater than 0")
    .max(1, "Must be less than 1"),
  alpha: Yup.number()
    .required("Required")
    .min(0, "Must be greater than 0")
    .max(1, "Must be less than 1"),
  beta: Yup.number()
    .required("Required")
    .min(0, "Must be greater than 0")
    .max(1, "Must be less than 1"),
  batchSize: Yup.number()
    .required("Required")
    .integer("Must be an integer")
    .positive("Must be positive"),
  epochs: Yup.number()
    .required("Required")
    .integer("Must be an integer")
    .positive("Must be positive"),
  startDate: Yup.date()
    .required("Required")
    .max(Yup.ref("endDate"), "Start date must be before end date"),
  endDate: Yup.date()
    .required("Required")
    .min(Yup.ref("startDate"), "End date must be after start date"),
  rebalanceWindow: Yup.number()
    .required("Required")
    .integer("Must be an integer"),
  principle: Yup.number().required("Required"),
  stocks: Yup.array().min(2, "Select at least two stocks").required("Required"),
});

export const ConfigPage = memo(() => {
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
        label: "start date",
        name: "startDate",
        initValue: dayjs(),
        type: "date",
      },
      {
        label: "end date",
        name: "endDate",
        initValue: dayjs(),
        type: "date",
      },
      {
        label: "rebalancew window",
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
        label: "dummy",
        name: "dummy",
        initValue: "dummy",
        type: "dummy",
      },
      {
        label: "stocks",
        name: "stocks",
        initValue: [],
        type: "stocks",
      },
    ],
    [dayjs]
  );

  const initialValues = useMemo(
    () =>
      fields.reduce((acc, field) => {
        if (field.name === "dummy") return acc;
        acc[field.name] = field.initValue;
        return acc;
      }, {}),
    [fields]
  );
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      values = { ...values };
      values.startDate = values.startDate.format("YYYY-MM-DD");
      values.endDate = values.endDate.format("YYYY-MM-DD");
      console.log(values);
    },
  });
  console.log(formik.errors);

  return (
    <StyledBox>
      <Typography variant="h5" gutterBottom>
        Model Parameters
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <StyledFormContainer>
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
                {["stocks"].includes(type) && (
                  <SelectStocksField
                    formik={formik}
                    label={label}
                    name={name}
                  />
                )}
              </StyledRow>
            ))}
          </StyledForm>
        </StyledFormContainer>

        <ButtonWrapper>
          <Button variant="outlined" type="reset" onClick={formik.handleReset}>
            Reset
          </Button>
          <Button variant="contained" type="submit">
            Train
          </Button>
        </ButtonWrapper>
      </form>
    </StyledBox>
  );
});

ConfigPage.displayName = "ConfigPage";
