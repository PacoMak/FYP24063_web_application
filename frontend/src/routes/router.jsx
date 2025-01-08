import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { BasePage, ConfigPage, DashboardPage } from "../pages";

export const routes = [
  {
    path: ROUTES.Dashboard.path,
    element: (
      <BasePage>
        <DashboardPage />
      </BasePage>
    ),
  },
  {
    path: ROUTES.Config.path,
    element: (
      <BasePage>
        <ConfigPage />
      </BasePage>
    ),
  },
  {
    path: "*",
    element: <Navigate to={ROUTES.Dashboard.path} replace />,
  },
];
export const router = createBrowserRouter(routes);
