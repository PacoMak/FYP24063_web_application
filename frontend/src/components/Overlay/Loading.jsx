import { CircularProgress } from "@mui/material";
import { memo } from "react";

export const Loading = memo(() => {
  return <CircularProgress color="inherit" />;
});

Loading.displayName = "Loading";
