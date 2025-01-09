import api from "./axios";
import { useQuery } from "@tanstack/react-query";
const getStocksInfo = async (tickers) => {
  const response = await api.get(
    `/stocks/info?${tickers.map((ticker) => `tickers=${ticker}`).join("&")}`
  );
  return response.data;
};
export const useStocksInfo = (tickers) => {
  return useQuery({
    queryKey: ["stock"],
    queryFn: () => getStocksInfo(tickers),
  });
};
