import { TextField } from "@mui/material";
import { memo } from "react";

export const FormikTextField = memo(({ formik, label, name, ...props }) => {
  return (
    <TextField
      label={label}
      name={name}
      variant="outlined"
      fullWidth
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      value={formik.values[name]}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
      {...props}
    />
  );
});
FormikTextField.displayName = "FormikTextField";
