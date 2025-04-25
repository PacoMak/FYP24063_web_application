import os
from flask import json
from queue import Queue
from ..rl_model import (
    train,
    get_model_paths,
    SAVED_MODELS_DIR,
    Agent,
    TradingSimulator,
    test,
)
from ..errors import FileNotFoundException, ModelNotFoundException
import threading
import shutil


class ModelService:
    def __init__(self):
        self.log_queues = {}
        self.threads = {}

    def log_message(self, model_id, message):
        if model_id not in self.log_queues:
            self.log_queues[model_id] = Queue()
        self.log_queues[model_id].put(message)

    def get_training_logs_stream(self, model_id):
        if model_id not in self.log_queues:
            return None
        queue = self.log_queues.get(model_id, Queue())
        while True:
            try:
                message = queue.get()
                yield f"data: {message}\n\n"
            except Exception as e:
                break

    def delete_model(self, model_id):
        model_paths = get_model_paths(model_id)
        if not os.path.isdir(model_paths["model_dir"]):
            raise ModelNotFoundException(f"Model not found")
        shutil.rmtree(model_paths["model_dir"])

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
        model_id,
        model_name,
        model_type,
    ):
        model_paths = get_model_paths(model_id)
        if not os.path.isdir(model_paths["model_dir"]):
            os.makedirs(model_paths["model_dir"])
        if not os.path.isdir(model_paths["networks_dir"]):
            os.makedirs(model_paths["networks_dir"])
        if not os.path.isdir(model_paths["evaluation_dir"]):
            os.makedirs(model_paths["evaluation_dir"])
        if not os.path.isdir(model_paths["graph_dir"]):
            os.makedirs(model_paths["graph_dir"])

        train_env = TradingSimulator(
            principal=principal,
            assets=assets,
            start_date=start_date,
            end_date=end_date,
            rebalance_window=rebalance_window,
            tx_fee_per_share=tx_fee_per_share,
        )
        if model_type == 1 or model_type == 2:
            n_actions = len(assets) + 1
        elif model_type == 3:
            n_actions = len(assets)

        agent = Agent(
            alpha=alpha,
            beta=beta,
            gamma=gamma,
            tau=tau,
            input_dims=[len(assets) * 8 + 1],
            batch_size=batch_size,
            n_actions=n_actions,
            model=model_type,
        )
        agent.save_models(
            actor_path=model_paths["actor"],
            target_actor_path=model_paths["target_actor"],
            critic_path=model_paths["critic"],
            target_critic_path=model_paths["target_critic"],
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
            "model_name": model_name,
            "model_type": model_type,
        }
        with open(model_paths["params"], "w") as f:
            json.dump(parameters, f, indent=4)
        training_thread = threading.Thread(
            target=train,
            kwargs={
                "agent": agent,
                "env": train_env,
                "num_epoch": num_epoch,
                "model_id": model_id,
                "log_fn": lambda msg: self.log_message(model_id, msg),
            },
        )
        self.threads[model_id] = training_thread
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
        model_type = params["model_type"]

        test_env = TradingSimulator(
            principal=principal,
            assets=assets,
            start_date=start_date,
            end_date=end_date,
            rebalance_window=rebalance_window,
            tx_fee_per_share=tx_fee_per_share,
        )
        if model_type == 1 or model_type == 2:
            n_actions = len(assets) + 1
        elif model_type == 3:
            n_actions = len(assets)

        agent = Agent(
            alpha=alpha,
            beta=beta,
            gamma=gamma,
            tau=tau,
            input_dims=[len(assets) * 8 + 1],
            batch_size=batch_size,
            n_actions=n_actions,
            model=model_type,
        )
        agent.load_models(
            actor_path=model_paths["actor"],
            target_actor_path=model_paths["target_actor"],
            critic_path=model_paths["critic"],
            target_critic_path=model_paths["target_critic"],
        )

        result, time_range, weight_history = test(
            agent=agent, env=test_env, model_id=model_id, assets=assets
        )
        return result, time_range, weight_history

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
        for model_id in model_ids:
            model_paths = get_model_paths(model_id)
            if not os.path.isfile(model_paths["params"]):
                self.delete_model(model_id)
        model_ids = os.listdir(SAVED_MODELS_DIR)
        return model_ids
