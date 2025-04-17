import { memo } from "react";
import { Card, Box, Button, TextField, MenuItem } from "@mui/material";
import styled from "styled-components";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

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
  padding: 1.5rem 3rem;
  flex-grow: 1;
`;
const StyledRow = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
`;
const StyledField = styled(Box)`
  flex: 1 1 45%;
  min-width: 0;
  &:only-child {
    flex: 0 1 45%;
  }
`;
const Title = styled(Box)`
  font-size: 1.5rem;
  margin: 1rem 0 0 2rem;
`;
const NextButton = styled(Button)`
  background-color: ${({ $activate, theme }) =>
    $activate
      ? theme.colors.button.next.activate.background
      : theme.colors.button.next.deactivate.background};
  color: ${({ theme }) => theme.colors.button.next.activate.color};
  padding: 0.5rem 2rem;
  border-radius: 6px;
  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.button.next.hover.background};
  }
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
const ButtonRow = styled(Box)`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  width: 100%;
  margin: 0 auto;
  padding: 1rem;
`;

export const TrainParamsForm = memo(({ setStage, formik }) => {
  return (
    <Wrapper>
      <Title>Parameters</Title>
      <StyledForm>
        <StyledRow>
          <StyledField>
            <TextField
              size="small"
              fullWidth
              label="model name"
              value={formik.values["modelName"]}
              name="modelName"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched["modelName"] &&
                Boolean(formik.errors["modelName"])
              }
              helperText={
                formik.touched["modelName"] && formik.errors["modelName"]
              }
            />
          </StyledField>
          <StyledField>
            <TextField
              size="small"
              fullWidth
              label="tau"
              value={formik.values["tau"]}
              name="tau"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched["tau"] && Boolean(formik.errors["tau"])}
              helperText={formik.touched["tau"] && formik.errors["tau"]}
            />
          </StyledField>
        </StyledRow>
        <StyledRow>
          <StyledField>
            <TextField
              size="small"
              fullWidth
              label="alpha"
              value={formik.values["alpha"]}
              name="alpha"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched["alpha"] && Boolean(formik.errors["alpha"])}
              helperText={formik.touched["alpha"] && formik.errors["alpha"]}
            />
          </StyledField>
          <StyledField>
            <TextField
              size="small"
              fullWidth
              label="beta"
              value={formik.values["beta"]}
              name="beta"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched["beta"] && Boolean(formik.errors["beta"])}
              helperText={formik.touched["beta"] && formik.errors["beta"]}
            />
          </StyledField>
        </StyledRow>
        <StyledRow>
          <StyledField>
            <TextField
              size="small"
              fullWidth
              label="gamma"
              value={formik.values["gamma"]}
              name="gamma"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched["gamma"] && Boolean(formik.errors["gamma"])}
              helperText={formik.touched["gamma"] && formik.errors["gamma"]}
            />
          </StyledField>
          <StyledField>
            <TextField
              size="small"
              fullWidth
              label="batch size"
              value={formik.values["batchSize"]}
              name="batchSize"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched["batchSize"] &&
                Boolean(formik.errors["batchSize"])
              }
              helperText={
                formik.touched["batchSize"] && formik.errors["batchSize"]
              }
            />
          </StyledField>
        </StyledRow>
        <StyledRow>
          <StyledField>
            <TextField
              size="small"
              fullWidth
              label="epochs"
              value={formik.values["epochs"]}
              name="epochs"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched["epochs"] && Boolean(formik.errors["epochs"])
              }
              helperText={formik.touched["epochs"] && formik.errors["epochs"]}
            />
          </StyledField>
          <StyledField>
            <TextField
              size="small"
              fullWidth
              label="rebalance window"
              value={formik.values["rebalanceWindow"]}
              name="rebalanceWindow"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched["rebalanceWindow"] &&
                Boolean(formik.errors["rebalanceWindow"])
              }
              helperText={
                formik.touched["rebalanceWindow"] &&
                formik.errors["rebalanceWindow"]
              }
            />
          </StyledField>
        </StyledRow>
        <StyledRow>
          <StyledField>
            <DatePicker
              label="training start date"
              name="trainingStartDate"
              value={formik.values["trainingStartDate"]}
              maxDate={dayjs().subtract(1, "day")}
              onChange={(value) => {
                formik.setFieldValue("trainingStartDate", value, true);
                formik.validateField("trainingStartDate");
              }}
              slotProps={{
                textField: {
                  error: Boolean(formik.errors["trainingStartDate"]),
                  helperText: formik.errors["trainingStartDate"],
                  fullWidth: true,
                  size: "small",
                },
                FormHelperTextProps: {
                  style: {
                    color: formik.errors["trainingStartDate"]
                      ? "red"
                      : "inherit",
                  },
                },
              }}
            />
          </StyledField>
          <StyledField>
            <DatePicker
              label="training end date"
              name="trainingEndDate"
              value={formik.values["trainingEndDate"]}
              maxDate={dayjs().subtract(1, "day")}
              onChange={(value) => {
                formik.setFieldValue("trainingEndDate", value, true);
                formik.validateField("trainingEndDate");
              }}
              slotProps={{
                textField: {
                  error: Boolean(formik.errors["trainingEndDate"]),
                  helperText: formik.errors["trainingEndDate"],
                  fullWidth: true,
                  size: "small",
                },
                FormHelperTextProps: {
                  style: {
                    color: formik.errors["trainingEndDate"] ? "red" : "inherit",
                  },
                },
              }}
            />
          </StyledField>
        </StyledRow>
        <StyledRow>
          <StyledField>
            <TextField
              size="small"
              fullWidth
              label="principal"
              value={formik.values["principal"]}
              name="principal"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched["principal"] &&
                Boolean(formik.errors["principal"])
              }
              helperText={
                formik.touched["principal"] && formik.errors["principal"]
              }
            />
          </StyledField>

          <StyledField>
            <TextField
              fullWidth
              select
              label="model type"
              size="small"
              value={formik.values["modelType"]}
              onChange={(e) => {
                formik.setFieldValue("modelType", e.target.value, true);
              }}
            >
              <MenuItem value={1}>Fully Connected Layers</MenuItem>
              <MenuItem value={2}>Long Short-Term Memory</MenuItem>
              <MenuItem value={3}>Amplifier</MenuItem>
            </TextField>
          </StyledField>
        </StyledRow>
      </StyledForm>
      <ButtonRow>
        <BackButton
          variant="outlined"
          onClick={() => setStage((prev) => prev - 1)}
        >
          Back
        </BackButton>
        <NextButton
          onClick={() => setStage((prev) => prev + 1)}
          $activate={Object.keys(formik.errors).length === 0}
          disabled={Object.keys(formik.errors).length > 0}
        >
          Next
        </NextButton>
      </ButtonRow>
    </Wrapper>
  );
});

TrainParamsForm.displayName = "TrainParamsForm";
