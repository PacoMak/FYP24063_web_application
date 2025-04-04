import api from "./axios";
import { useQuery } from "@tanstack/react-query";
const getTickerList = async () => {
  const response = await api.get("/tickers");
  return response.data;
};
export const useTickerList = () => {
  return useQuery({
    queryKey: ["tickerList"],
    queryFn: () => getTickerList(),
  });
};
