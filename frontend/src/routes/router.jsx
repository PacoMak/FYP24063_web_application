import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { BasePage, ConfigPage, DashboardPage, ModelsPage } from "../pages";

export const routes = [
  {
    path: ROUTES.Dashboard.path,
    element: (
      <BasePage title={"Model Performance"}>
        <DashboardPage />
      </BasePage>
    ),
  },
  {
    path: ROUTES.Config.path,
    element: (
      <BasePage title={"Train New Model"}>
        <ConfigPage />
      </BasePage>
    ),
  },
  {
    path: ROUTES.Models.path,
    element: (
      <BasePage title={"Trained Models"}>
        <ModelsPage />
      </BasePage>
    ),
  },
  {
    path: "*",
    element: <Navigate to={ROUTES.Models.path} replace />,
  },
];
export const router = createBrowserRouter(routes);
