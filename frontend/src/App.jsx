import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme as createMuiTheme,
} from "@mui/material";
import { router } from "./routes";
import { theme } from "./theme";

const MuiTheme = createMuiTheme({
  typography: {
    button: {
      textTransform: "none",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <MuiThemeProvider theme={MuiTheme}>
        <RouterProvider router={router} />
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;
