export const ROUTES = Object.freeze({
  Portfolio: {
    key: "PORTFOLIO",
    path: "/portfolio",
  },
  Stock: {
    key: "STOCK",
    path: "/stock/:ticker",
    render: (ticker) => `/stock/${ticker}`,
  },
});
