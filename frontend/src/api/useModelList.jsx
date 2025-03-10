import api from "./axios";
import { useQuery } from "@tanstack/react-query";

const getModelList = async () => {
  const response = await api.get(`/model`);
  return response.data;
};

export const useModelList = () => {
  return useQuery({
    queryKey: ["models"],
    queryFn: () => getModelList(),
  });
};
