import * as Yup from "yup";

export const trainning_params_schema = Yup.object().shape({
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
