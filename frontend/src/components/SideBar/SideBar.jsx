import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { memo, useMemo } from "react";
import { ROUTES } from "../../constants";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import HKULogo from ".././../images/hku-logo.jpg";
const StyledDrawer = styled(Drawer)`
  width: ${({ $drawerWidth }) => $drawerWidth}px;
  flex-shrink: 0;
  & .MuiDrawer-paper {
    width: ${({ $drawerWidth }) => $drawerWidth}px;
    box-sizing: border-box;
    background: ${({ theme }) => theme.colors.sidebar.background};
    color: ${({ theme }) => theme.colors.sidebar.color};
  }
`;
const StyledListItemText = styled(ListItemText)`
  text-align: center;
`;
const HKUlogo = styled.img`
  width: 100%;
`;
export const SideBar = memo(({ drawerWidth }) => {
  const items = useMemo(
    () => [
      {
        text: "Dashboard",
        path: ROUTES.Dashboard.path,
      },
      {
        text: "Config",
        path: ROUTES.Config.path,
      },
    ],
    []
  );
  const navigate = useNavigate();
  return (
    <StyledDrawer variant="permanent" anchor="left" $drawerWidth={drawerWidth}>
      <Toolbar>
        {/* <HKUlogo src={HKULogo} alt="HKU Logo" /> */}
      </Toolbar>

      <Divider />
      <List>
        {items.map(({ text, path }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              sx={{ justifyContent: "center", display: "flex" }}
              onClick={() => navigate(path)}
            >
              <StyledListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </StyledDrawer>
  );
});

SideBar.displayName = "SideBar";
