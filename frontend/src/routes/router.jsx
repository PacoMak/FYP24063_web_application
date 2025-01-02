import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "../constants";

export const routes = [
  {
    path: ROUTES.Portfolio.path,
    element: <>Portfolio</>,
  },
  {
    path: ROUTES.Stock.path,
    element: <>stock</>,
  },
];
export const router = createBrowserRouter(routes);
