import { memo } from "react";
import styled from "styled-components";
import { AppBar as MuiAppBar, Toolbar, Typography } from "@mui/material";
const StyledAppBar = styled(MuiAppBar)`
  background-color: ${({ theme }) => theme.colors.appbar.background};
  color: ${({ theme }) => theme.colors.appbar.color};
  width: calc(100% - ${({ $drawerWidth }) => $drawerWidth}px);
  margin-left: ${({ $drawerWidth }) => $drawerWidth}px;
`;

export const AppBar = memo(({ drawerWidth }) => {
  return (
    <StyledAppBar position="fixed" $drawerWidth={drawerWidth} elevation={0}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Portfolio Management With Technical Analysis Using Reinforcement
          Learning
        </Typography>
      </Toolbar>
    </StyledAppBar>
  );
});

AppBar.displayName = "AppBar";
