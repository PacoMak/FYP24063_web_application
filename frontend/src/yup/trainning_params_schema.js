import dayjs from "dayjs";
import * as Yup from "yup";

export const trainning_params_schema = Yup.object().shape({
  modelName: Yup.string().test(
    "not-empty",
    "Model name cannot be an empty string",
    (value) => value && value.trim().length > 0
  ),
  tau: Yup.number()
    .required("Required")
    .positive("Must be positive")
    .max(1, "Must be less than 1"),
  alpha: Yup.number()
    .required("Required")
    .positive("Must be positive")
    .max(1, "Must be less than 1"),
  beta: Yup.number()
    .required("Required")
    .positive("Must be positive")
    .max(1, "Must be less than 1"),
  gamma: Yup.number()
    .required("Required")
    .positive("Must be positive")
    .max(1, "Must be less than 1"),
  batchSize: Yup.number()
    .required("Required")
    .integer("Must be an integer")
    .min(1, "Must be greater than 0"),
  epochs: Yup.number()
    .required("Required")
    .integer("Must be an integer")
    .min(1, "Must be greater than 0"),
  trainingStartDate: Yup.date()
    .required("Required")
    .max(Yup.ref("trainingEndDate"), "Start date must be before end date")
    .test(
      "min-one-years",
      "training period must be at least 1 years",
      function (value) {
        const endDate = this.parent.trainingEndDate;
        if (value && endDate) {
          return dayjs(endDate).diff(dayjs(value), "year", true) >= 1;
        }
        return true;
      }
    ),
  trainingEndDate: Yup.date()
    .required("Required")
    .min(Yup.ref("trainingStartDate"), "End date must be after start date")
    .test(
      "min-one-years",
      "training period must be at least 1 years",
      function (value) {
        const startDate = this.parent.trainingStartDate;
        if (value && startDate) {
          return dayjs(value).diff(dayjs(startDate), "year", true) >= 1;
        }
        return true;
      }
    ),
  rebalanceWindow: Yup.number()
    .required("Required")
    .integer("Must be an integer")
    .min(1, "Must be greater than 0"),
  principal: Yup.number().required("Required").positive("Must be positive"),
});
