import api from "./axios";
import { useQuery } from "@tanstack/react-query";
const getStocksHistory = async (tickers) => {
  const response = await api.get(
    `/stocks/history?${tickers.map((ticker) => `tickers=${ticker}`).join("&")}`
  );
  return response.data;
};
export const useStocksHistory = (tickers) => {
  return useQuery({
    queryKey: ["stock"],
    queryFn: () => getStocksHistory(tickers),
  });
};
