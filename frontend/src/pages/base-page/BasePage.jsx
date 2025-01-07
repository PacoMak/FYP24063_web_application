import { Box, CssBaseline, Toolbar } from "@mui/material";
import * as React from "react";
import { memo } from "react";
import { AppBar, SideBar } from "../../components";
import styled from "styled-components";

const StyledBox = styled(Box)`
  flex-grow: 1;
  height: 100vh;
  overflow: auto;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.body.background};
  padding: 2rem 4rem;
`;

export const BasePage = memo(({ children }) => {
  const drawerWidth = 250;
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <CssBaseline />
      <AppBar drawerWidth={drawerWidth} />
      <SideBar drawerWidth={drawerWidth} />
      <StyledBox component="main">
        <Toolbar />
        {children}
      </StyledBox>
    </Box>
  );
});

BasePage.displayName = "BasePage";
