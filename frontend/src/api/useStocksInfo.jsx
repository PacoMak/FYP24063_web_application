import api from "./axios";
import { useQuery } from "@tanstack/react-query";
const getStocksInfo = async (tickers) => {
  const response = await api.get(
    `/stocks/history?${tickers.map((ticker) => `tickers=${ticker}`).join("&")}`
  );
  return response.data;
};
export const useStocksInfo = (tickers, options) => {
  return useQuery({
    ...options,
    queryKey: ["stock"],
    queryFn: () => getStocksInfo(tickers),
  });
};
