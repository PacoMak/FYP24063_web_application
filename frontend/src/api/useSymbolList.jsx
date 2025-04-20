import api from "./axios";
import { useQuery } from "@tanstack/react-query";

const getSymbolList = async () => {
  const response = await api.get("/symbols");
  return response.data;
};
export const useSymbolList = () => {
  return useQuery({
    queryKey: ["symbolList"],
    queryFn: () => getSymbolList(),
  });
};
