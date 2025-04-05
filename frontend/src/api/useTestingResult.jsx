import api from "./axios";
import { useQuery } from "@tanstack/react-query";
const getTestingResult = async (model_id) => {
  const response = await api.get(`/model/test/${model_id}`);
  return response.data;
};
export const useTestingResult = (model_id) => {
  return useQuery({
    queryKey: ["testing", model_id],
    queryFn: () => getTestingResult(model_id),
  });
};
