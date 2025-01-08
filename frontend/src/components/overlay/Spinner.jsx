import { Backdrop, CircularProgress } from "@mui/material";
import { memo } from "react";
import { Loading } from "./Loading";

export const Spinner = memo(() => {
  return (
    <Backdrop open style={{ zIndex: 1400 }}>
      <Loading />
    </Backdrop>
  );
});

Spinner.displayName = "Spinner";
