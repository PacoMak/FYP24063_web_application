import {
  Button,
  Card,
  Typography,
  TextField,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
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
  tau: Yup.number().required("Required"),
  alpha: Yup.number().required("Required"),
  beta: Yup.number().required("Required"),
  batchSize: Yup.number().required("Required"),
  epochs: Yup.number().required("Required"),
  startDate: Yup.date().required("Required"),
  endDate: Yup.date().required("Required"),
  selectedStocks: Yup.array()
    .min(1, "Select at least one stock")
    .required("Required"),
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
        label: "batchSize",
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
        label: "startDate",
        name: "startDate",
        initValue: dayjs(),
        type: "date",
      },
      {
        label: "endDate",
        name: "endDate",
        initValue: dayjs(),
        type: "date",
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
    // validationSchema,
    onSubmit: (values) => {
      values.startDate = values.startDate.format("YYYY-MM-DD");
      values.endDate = values.endDate.format("YYYY-MM-DD");
      console.log(values);
    },
  });

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
