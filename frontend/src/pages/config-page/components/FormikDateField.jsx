import { DatePicker } from "@mui/x-date-pickers";
import { memo } from "react";

export const FormikDateField = memo(({ formik, name, label, ...props }) => {
  return (
    <DatePicker
      label={label}
      name={name}
      onChange={(value) => {
        formik.setFieldValue(name, value, false);
        formik.validateField(name);
      }}
      value={formik.values[name]}
      slotProps={{
        textField: {
          error: Boolean(formik.errors[name]),
          helperText: formik.errors[name],
        },
        FormHelperTextProps: {
          style: {
            color: formik.errors[name] ? "red" : "inherit",
          },
        },
      }}
      {...props}
    />
  );
});
FormikDateField.displayName = "FormikDateField";
