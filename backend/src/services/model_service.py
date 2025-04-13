from enum import Enum
import os
import uuid_utils as uuid
from flask import json
from ..rl_model import (
    train,
    get_model_paths,
    SAVED_MODELS_DIR,
    Agent,
    TradingSimulator,
    test,
)
from ..errors import FileNotFoundException
import threading


class ModelService:
    def __init__(self):
        pass

    def train_model(
        self,
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
    ):
        model_id = str(uuid.uuid4())
        model_paths = get_model_paths(model_id)
        if not os.path.isdir(model_paths["model_dir"]):
            os.makedirs(model_paths["model_dir"])
        if not os.path.isdir(model_paths["networks_dir"]):
            os.makedirs(model_paths["networks_dir"])
        if not os.path.isdir(model_paths["evaluation_dir"]):
            os.makedirs(model_paths["evaluation_dir"])
        if not os.path.isdir(model_paths["graph_dir"]):
            os.makedirs(model_paths["graph_dir"])

        agent = Agent(
            alpha=alpha,
            beta=beta,
            gamma=gamma,
            tau=tau,
            input_dims=[len(assets) * 5 + 2],
            batch_size=batch_size,
            n_actions=len(assets) + 1,
        )
        agent.save_models(
            actor_path=model_paths["actor"],
            target_actor_path=model_paths["target_actor"],
            critic_path=model_paths["critic"],
            target_critic_path=model_paths["target_critic"],
        )
        training_env = TradingSimulator(
            principal=principal,
            assets=assets,
            start_date=start_date,
            end_date=end_date,
            rebalance_window=rebalance_window,
            tx_fee_per_share=tx_fee_per_share,
        )
        parameters = {
            "assets": assets,
            "rebalance_window": rebalance_window,
            "tx_fee_per_share": tx_fee_per_share,
            "principal": principal,
            "num_epoch": num_epoch,
            "start_date": start_date,
            "end_date": end_date,
            "alpha": alpha,
            "beta": beta,
            "gamma": gamma,
            "tau": tau,
            "batch_size": batch_size,
        }
        with open(model_paths["params"], "w") as f:
            json.dump(parameters, f, indent=4)
        training_thread = threading.Thread(
            target=train,
            kwargs={
                "agent": agent,
                "env": training_env,
                "num_epoch": num_epoch,
                "model_id": model_id,
            },
        )
        training_thread.start()

    def test_model(self, start_date, end_date, model_id):
        model_paths = get_model_paths(model_id)
        params = self.get_trainning_params(model_id)
        assets = params["assets"]
        rebalance_window = params["rebalance_window"]
        tx_fee_per_share = params["tx_fee_per_share"]
        principal = params["principal"]
        alpha = params["alpha"]
        beta = params["beta"]
        gamma = params["gamma"]
        tau = params["tau"]
        batch_size = params["batch_size"]

        agent = Agent(
            alpha=alpha,
            beta=beta,
            gamma=gamma,
            tau=tau,
            input_dims=[len(assets) * 5 + 2],
            batch_size=batch_size,
            n_actions=len(assets) + 1,
        )
        agent.load_models(
            actor_path=model_paths["actor"],
            target_actor_path=model_paths["target_actor"],
            critic_path=model_paths["critic"],
            target_critic_path=model_paths["target_critic"],
        )
        testing_env = TradingSimulator(
            principal=principal,
            assets=assets,
            start_date=start_date,
            end_date=end_date,
            rebalance_window=rebalance_window,
            tx_fee_per_share=tx_fee_per_share,
        )
        result = test(agent=agent, env=testing_env, model_id=model_id, assets=assets)
        return result

    def is_model_trained(self, model_id):
        model_paths = get_model_paths(model_id)
        if not os.path.isdir(model_paths["model_dir"]):
            return False
        if not (
            os.path.isfile(model_paths["actor"])
            and os.path.isfile(model_paths["target_actor"])
            and os.path.isfile(model_paths["critic"])
            and os.path.isfile(model_paths["target_critic"])
        ):
            return False
        return True

    def get_trainning_params(self, model_id):
        model_paths = get_model_paths(model_id)
        if not os.path.isfile(model_paths["params"]):
            raise FileNotFoundException(f"model {model_id} not found")
        with open(model_paths["params"], "r") as f:
            params = json.load(f)
        return params

    def get_return_over_epoch_json(self, model_id):
        model_paths = get_model_paths(model_id)
        if not os.path.isfile(model_paths["return_over_epoch"]):
            raise FileNotFoundException(f"return over epoch file not found")
        with open(model_paths["return_over_epoch"], "r") as f:
            return_over_epoch = json.load(f)
        return return_over_epoch

    def get_return_over_time_json(self, model_id):
        model_paths = get_model_paths(model_id)
        if not os.path.isfile(model_paths["return_over_time"]):
            raise FileNotFoundException(f"return over time file not found")
        with open(model_paths["return_over_time"], "r") as f:
            return_over_time = json.load(f)
        return return_over_time

    def get_sharpe_ratio_over_epoch_json(self, model_id):
        model_paths = get_model_paths(model_id)
        if not os.path.isfile(model_paths["sharpe_ratio_over_epoch"]):
            raise FileNotFoundException(f"sharpe_ratio over time file not found")
        with open(model_paths["sharpe_ratio_over_epoch"], "r") as f:
            sharpe_ratio_over_epoch = json.load(f)
        return sharpe_ratio_over_epoch

    def get_models(self):
        model_ids = os.listdir(SAVED_MODELS_DIR)
        return model_ids
