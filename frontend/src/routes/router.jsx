import { createBrowserRouter } from "react-router-dom";
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
];
export const router = createBrowserRouter(routes);
