import { Box, CssBaseline, Toolbar } from "@mui/material";
import { memo } from "react";
import { AppBar, SideBar } from "../../components";
import styled from "styled-components";

const StyledBox = styled(Box)`
  flex-grow: 1;
  height: 100vh;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.body.background};
  padding: 1rem 1rem;
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled(Box)`
  display: flex;
  height: 100%;
  overflow: auto;
  background: ${({ theme }) => theme.colors.body.background};
`;
const Title = styled.span`
  font-size: 1.5rem;
  border-bottom: 3px solid #505050;
  padding-bottom: 2px;
  padding-right: 5px;
  margin-left: 1rem;
  color: #505050;
`;
export const BasePage = memo(({ children, title }) => {
  const drawerWidth = 250;
  return (
    <Wrapper sx={{ display: "flex", height: "100%" }}>
      <CssBaseline />
      <AppBar drawerWidth={drawerWidth} />
      <SideBar drawerWidth={drawerWidth} />
      <StyledBox component="main">
        <Toolbar />
        <Box>{title && <Title>{title}</Title>}</Box>

        {children}
      </StyledBox>
    </Wrapper>
  );
});

BasePage.displayName = "BasePage";
