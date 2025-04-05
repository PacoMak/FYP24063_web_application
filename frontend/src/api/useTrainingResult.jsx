import api from "./axios";
import { useQuery } from "@tanstack/react-query";
const getTrainingResult = async (model_id) => {
  const response = await api.get(`/model/train/${model_id}`);
  return response.data;
};
export const useTrainingResult = (model_id) => {
  return useQuery({
    queryKey: ["training", model_id],
    queryFn: () => getTrainingResult(model_id),
  });
};
