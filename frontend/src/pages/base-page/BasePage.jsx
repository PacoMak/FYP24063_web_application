import { Box, CssBaseline, Toolbar } from "@mui/material";
import { memo } from "react";
import { AppBar, SideBar } from "../../components";
import styled from "styled-components";

const StyledBox = styled(Box)`
  flex-grow: 1;
  height: 100vh;
  overflow: auto;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.body.background};
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
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
