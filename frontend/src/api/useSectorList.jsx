import api from "./axios";
import { useQuery } from "@tanstack/react-query";

const getSectorList = async () => {
  const response = await api.get("/symbols/sectors");
  return response.data;
};
export const useSectorList = () => {
  return useQuery({
    queryKey: ["sectorList"],
    queryFn: () => getSectorList(),
  });
};
