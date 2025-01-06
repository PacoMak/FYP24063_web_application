import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { memo, useMemo } from "react";

export const SelectStocksField = memo(({ formik, name, label }) => {
  const stockOptions = useMemo(
    () => ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"],
    []
  );
  return (
    <FormControl fullWidth>
      <InputLabel id="stock-select-label">{label}</InputLabel>
      <Select
        labelId="stock-select-label"
        multiple
        value={formik.values.stocks}
        onChange={(event) => formik.setFieldValue(name, event.target.value)}
        renderValue={(selected) => selected.join(", ")}
        label={label}
      >
        {stockOptions.map((stock) => (
          <MenuItem key={stock} value={stock}>
            {stock}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});

SelectStocksField.displayName = "SelectStocksField";
