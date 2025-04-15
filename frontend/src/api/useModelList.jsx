import api from "./axios";
import { useQuery } from "@tanstack/react-query";

const getModelList = async () => {
  const response = await api.get("/models");
  return response.data;
};
export const useModelList = () => {
  return useQuery({
    queryKey: ["modelList"],
    queryFn: () => getModelList(),
  });
};
