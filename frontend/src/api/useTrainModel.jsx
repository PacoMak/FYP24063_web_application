import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";

const trainModel = async ({
  assets,
  rebalance_window,
  tx_fee_per_share,
  principal,
  num_epoch,
  start_date,
  end_date,
  alpha,
  beta,
  gamma,
  tau,
  batch_size,
}) => {
  const response = await api.post(`/model/train`, {
    assets,
    rebalance_window,
    tx_fee_per_share,
    principal,
    num_epoch,
    start_date,
    end_date,
    alpha,
    beta,
    gamma,
    tau,
    batch_size,
  });
  return response.data;
};

export const useTrainModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => trainModel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["training"]);
    },
  });
};
