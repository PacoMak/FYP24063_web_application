export const ROUTES = Object.freeze({
  Dashboard: {
    key: "DASHBOARD",
    path: "/model/:id",
    render: (id) => `/model/${id}`,
  },
  Config: {
    key: "CONFIG",
    path: "/config",
  },
  Models: {
    key: "MODELS",
    path: "/models",
  },
});
