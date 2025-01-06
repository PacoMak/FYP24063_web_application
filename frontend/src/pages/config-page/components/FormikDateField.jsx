import { DatePicker } from "@mui/x-date-pickers";
import { memo } from "react";

export const FormikDateField = memo(({ formik, name, label, ...props }) => {
  return (
    <DatePicker
      label={label}
      name={name}
      onChange={(value) => formik.setFieldValue(name, value)}
      value={formik.values[name]}
      {...props}
    />
  );
});
FormikDateField.displayName = "FormikDateField";
