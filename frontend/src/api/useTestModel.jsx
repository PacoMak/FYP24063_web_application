import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
const testModel = async (model_id, start_date, end_date) => {
  const response = await api.post(`/model/test/${model_id}`, {
    start_date,
    end_date,
  });
  return response.data;
};
export const useTestModel = (model_id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ start_date, end_date }) =>
      testModel(model_id, start_date, end_date),
    onSuccess: () => {
      queryClient.invalidateQueries(["testing"]);
    },
  });
};
