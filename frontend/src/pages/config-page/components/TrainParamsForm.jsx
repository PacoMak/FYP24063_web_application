import { memo } from "react";
import { Card, Box, Button, TextField } from "@mui/material";
import styled from "styled-components";
import { DatePicker } from "@mui/x-date-pickers";

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
  width: 95%;
  margin: 0 auto;
  padding: 1rem;
`;
export const TrainParamsForm = memo(({ setStage, formik }) => {
  return (
    <Wrapper>
      <Title>Parameters</Title>
      <StyledForm>
        <StyledRow>
          <TextField
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
        </StyledRow>
        <StyledRow>
          <TextField
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
        </StyledRow>
        <StyledRow>
          <TextField
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
        </StyledRow>
        <StyledRow>
          <TextField
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
        </StyledRow>
        <StyledRow>
          <TextField
            fullWidth
            label="batch size"
            value={formik.values["batchSize"]}
            name="batchSize"
            type="number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched["batchSize"] && Boolean(formik.errors["batchSize"])
            }
            helperText={
              formik.touched["batchSize"] && formik.errors["batchSize"]
            }
          />
        </StyledRow>
        <StyledRow>
          <TextField
            fullWidth
            label="epochs"
            value={formik.values["epochs"]}
            name="epochs"
            type="number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched["epochs"] && Boolean(formik.errors["epochs"])}
            helperText={formik.touched["epochs"] && formik.errors["epochs"]}
          />
        </StyledRow>
        <StyledRow>
          <TextField
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
        </StyledRow>
        <StyledRow>
          <TextField
            fullWidth
            label="principle"
            value={formik.values["principle"]}
            name="principle"
            type="number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched["principle"] && Boolean(formik.errors["principle"])
            }
            helperText={
              formik.touched["principle"] && formik.errors["principle"]
            }
          />
        </StyledRow>
        <StyledRow>
          <DatePicker
            label="Training Start Date"
            name="trainingStartDate"
            value={formik.values["trainingStartDate"]}
            onChange={(value) => {
              formik.setFieldValue("trainingStartDate", value, true);
              formik.validateField("trainingStartDate");
            }}
            slotProps={{
              textField: {
                error: Boolean(formik.errors["trainingStartDate"]),
                helperText: formik.errors["trainingStartDate"],
                fullWidth: true,
              },
              FormHelperTextProps: {
                style: {
                  color: formik.errors["trainingStartDate"] ? "red" : "inherit",
                },
              },
            }}
          />
        </StyledRow>
        <StyledRow>
          <DatePicker
            label="Training End Date"
            name="trainingEndDate"
            value={formik.values["trainingEndDate"]}
            onChange={(value) => {
              formik.setFieldValue("trainingEndDate", value, true);
              formik.validateField("trainingEndDate");
            }}
            slotProps={{
              textField: {
                error: Boolean(formik.errors["trainingEndDate"]),
                helperText: formik.errors["trainingEndDate"],
                fullWidth: true,
              },
              FormHelperTextProps: {
                style: {
                  color: formik.errors["trainingEndDate"] ? "red" : "inherit",
                },
              },
            }}
          />
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
