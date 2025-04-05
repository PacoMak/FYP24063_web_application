import api from "./axios";
import { useQuery } from "@tanstack/react-query";

const getModel = async (model_id) => {
  const response = await api.get(`/model/train/${model_id}/params`);
  return response.data;
};
export const useModel = (model_id) => {
  return useQuery({
    queryKey: ["model", model_id],
    queryFn: () => getModel(model_id),
  });
};
