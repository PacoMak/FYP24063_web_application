from enum import Enum
import os
import uuid_utils as uuid
from flask import json
from ..rl_model import (
    train,
    SAVED_MODELS_DIR,
    SAVED_MODEL_DIR,
    SAVED_MODEL_PARAMS_FILEPATH,
    SAVED_MODEL_NETWORKS_DIR,
    SAVED_MODEL_ACTOR_FILEPATH,
    SAVED_MODEL_TARGET_ACTOR_FILEPATH,
    SAVED_MODEL_CRITIC_FILEPATH,
    SAVED_MODEL_TARGET_CRITIC_FILEPATH,
    SAVED_MODEL_EVALUATION_DIR,
    SAVED_MODEL_RETURN_OVER_EPOCH_JSON_FILEPATH,
    SAVED_MODEL_SHARPE_RATIO_OVER_EPOCH_JSON_FILEPATH,
    SAVED_MODEL_RETURN_OVER_TIME_JSON_FILEPATH,
    SAVED_MODEL_GRAPH_DIR,
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
        if not os.path.isdir(SAVED_MODEL_DIR.format(id=model_id)):
            os.makedirs(SAVED_MODEL_DIR.format(id=model_id))
        if not os.path.isdir(SAVED_MODEL_NETWORKS_DIR.format(id=model_id)):
            os.makedirs(SAVED_MODEL_NETWORKS_DIR.format(id=model_id))
        if not os.path.isdir(SAVED_MODEL_EVALUATION_DIR.format(id=model_id)):
            os.makedirs(SAVED_MODEL_EVALUATION_DIR.format(id=model_id))
        if not os.path.isdir(SAVED_MODEL_GRAPH_DIR.format(id=model_id)):
            os.makedirs(SAVED_MODEL_GRAPH_DIR.format(id=model_id))

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
            actor_path=SAVED_MODEL_ACTOR_FILEPATH.format(id=model_id),
            target_actor_path=SAVED_MODEL_TARGET_ACTOR_FILEPATH.format(id=model_id),
            critic_path=SAVED_MODEL_CRITIC_FILEPATH.format(id=model_id),
            target_critic_path=SAVED_MODEL_TARGET_CRITIC_FILEPATH.format(id=model_id),
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
        with open(f"{SAVED_MODEL_PARAMS_FILEPATH.format(id=model_id)}", "w") as f:
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
            actor_path=SAVED_MODEL_ACTOR_FILEPATH.format(id=model_id),
            target_actor_path=SAVED_MODEL_TARGET_ACTOR_FILEPATH.format(id=model_id),
            critic_path=SAVED_MODEL_CRITIC_FILEPATH.format(id=model_id),
            target_critic_path=SAVED_MODEL_TARGET_CRITIC_FILEPATH.format(id=model_id),
        )
        testing_env = TradingSimulator(
            principal=principal,
            assets=assets,
            start_date=start_date,
            end_date=end_date,
            rebalance_window=rebalance_window,
            tx_fee_per_share=tx_fee_per_share,
        )

        testing_thread = threading.Thread(
            target=test,
            kwargs={
                "agent": agent,
                "env": testing_env,
                "assets": assets,
                "model_id": model_id,
            },
        )
        testing_thread.start()

    def is_model_trained(self, model_id):
        if not os.path.isdir(SAVED_MODEL_DIR.format(id=model_id)):
            return False
        if not (
            os.path.isfile(SAVED_MODEL_ACTOR_FILEPATH.format(id=model_id))
            and os.path.isfile(SAVED_MODEL_TARGET_ACTOR_FILEPATH.format(id=model_id))
            and os.path.isfile(SAVED_MODEL_CRITIC_FILEPATH.format(id=model_id))
            and os.path.isfile(SAVED_MODEL_TARGET_CRITIC_FILEPATH.format(id=model_id))
        ):
            return False
        return True

    def get_trainning_params(self, model_id):
        if not os.path.isfile(SAVED_MODEL_PARAMS_FILEPATH.format(id=model_id)):
            raise FileNotFoundException(f"model {model_id} not found")
        with open(f"{SAVED_MODEL_PARAMS_FILEPATH.format(id=model_id)}", "r") as f:
            params = json.load(f)
        return params

    def get_return_over_epoch_json(self, model_id):
        if not os.path.isfile(
            SAVED_MODEL_RETURN_OVER_EPOCH_JSON_FILEPATH.format(id=model_id)
        ):
            raise FileNotFoundException(f"return over epoch file not found")
        with open(
            SAVED_MODEL_RETURN_OVER_EPOCH_JSON_FILEPATH.format(id=model_id), "r"
        ) as f:
            return_over_epoch = json.load(f)
        return return_over_epoch

    def get_return_over_time_json(self, model_id):
        if not os.path.isfile(
            SAVED_MODEL_RETURN_OVER_TIME_JSON_FILEPATH.format(id=model_id)
        ):
            raise FileNotFoundException(f"return over time file not found")
        with open(
            SAVED_MODEL_RETURN_OVER_TIME_JSON_FILEPATH.format(id=model_id), "r"
        ) as f:
            return_over_time = json.load(f)
        return return_over_time

    def get_sharpe_ratio_over_epoch_json(self, model_id):
        if not os.path.isfile(
            SAVED_MODEL_SHARPE_RATIO_OVER_EPOCH_JSON_FILEPATH.format(id=model_id)
        ):
            raise FileNotFoundException(f"sharpe_ratio over time file not found")
        with open(
            SAVED_MODEL_SHARPE_RATIO_OVER_EPOCH_JSON_FILEPATH.format(id=model_id), "r"
        ) as f:
            sharpe_ratio_over_epoch = json.load(f)
        return sharpe_ratio_over_epoch

    def get_models(self):
        model_ids = os.listdir(SAVED_MODELS_DIR)
        return model_ids
