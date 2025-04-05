export const ROUTES = Object.freeze({
  Dashboard: {
    key: "DASHBOARD",
    path: "/model/:model_id",
    render: (model_id) => `/model/${model_id}`,
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
