import { Box } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import styled from "styled-components";
import { router } from "./routes";

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
