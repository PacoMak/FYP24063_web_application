import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme as createMuiTheme,
} from "@mui/material";
import { router } from "./routes";
import { theme } from "./theme";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OverlayProvider } from "./context";
import { Spinner } from "./components";

const MuiTheme = createMuiTheme({
  typography: {
    button: {
      textTransform: "none",
    },
  },
});

const quertyClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={quertyClient}>
      <ThemeProvider theme={theme}>
        <MuiThemeProvider theme={MuiTheme}>
          <OverlayProvider spinnerComponent={Spinner}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <RouterProvider router={router} />
            </LocalizationProvider>
          </OverlayProvider>
        </MuiThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
