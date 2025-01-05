import { Button, Card, Typography } from "@mui/material";
import { memo } from "react";
import styled from "styled-components";
const StyledBox = styled(Card)`
  border: 1px solid black;
  height: 80%;
  width: min(80%, 50vw);
  margin: auto;
  padding: 2rem 3rem;
`;

export const ConfigPage = memo(() => {
  return (
    <StyledBox>
      <Typography variant="h5">Model Parameters</Typography>
      <Button variant="outlined">Reset</Button>

      <Button variant="contained">Train</Button>
    </StyledBox>
  );
});
ConfigPage.displayName = "ConfigPage";
