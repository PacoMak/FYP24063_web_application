import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
const deleteModel = async (model_id) => {
  const response = await api.delete(`/model/${model_id}`);
  return response.data;
};
export const useDeleteModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (model_id) => deleteModel(model_id),
    onSuccess: () => {
      queryClient.invalidateQueries(["modelList"]);
    },
  });
};
