from enum import Enum
import os

from flask import json
from ..rl_model import (
    train,
    TRAINING_MODELS_EVALUATION_DIR,
    TRAINED_MODELS_EVALUATION_DIR,
    TRAINED_MODELS_DIR,
    TRAINED_ACTOR_FILEPATH,
    TRAINED_CRITIC_FILEPATH,
    TRAINED_TARGET_CRITIC_FILEPATH,
    TRAINED_TARGET_ACTOR_FILEPATH,
    TRAINING_MODELS_DIR,
    TRAINING_ACTOR_FILEPATH,
    TRAINING_CRITIC_FILEPATH,
    TRAINING_TARGET_ACTOR_FILEPATH,
    TRAINING_TARGET_CRITIC_FILEPATH,
    TRAINED_MODELS_RETURN_OVER_EPOCH__JSON_FILEPATH,
    TRAINED_MODELS_RETURN_OVER_TIME_JSON_FILEPATH,
    TRAINED_MODELS_SHARPE_RATIO_OVER_EPOCH_JSON_FILEPATH,
    Agent,
    TradingSimulator,
    test,
)
import shutil
import threading


class ModelStatus(Enum):
    TRAINING = "training"
    TRAINED = "trained"
    NOT_TRAINED = "not trained"

    def __str__(self):
        return self.value


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
        if not os.path.isdir(TRAINING_MODELS_EVALUATION_DIR):
            os.makedirs(TRAINING_MODELS_EVALUATION_DIR)
        if not os.path.isdir(TRAINED_MODELS_EVALUATION_DIR):
            os.makedirs(TRAINED_MODELS_EVALUATION_DIR)
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
            actor_path=TRAINING_ACTOR_FILEPATH,
            target_actor_path=TRAINING_TARGET_ACTOR_FILEPATH,
            critic_path=TRAINING_CRITIC_FILEPATH,
            target_critic_path=TRAINING_TARGET_CRITIC_FILEPATH,
        )
        agent.save_models(
            actor_path=TRAINING_ACTOR_FILEPATH,
            target_actor_path=TRAINING_TARGET_ACTOR_FILEPATH,
            critic_path=TRAINING_CRITIC_FILEPATH,
            target_critic_path=TRAINING_TARGET_CRITIC_FILEPATH,
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
        with open(f"{TRAINED_MODELS_DIR}/parameters.json", "w") as f:
            json.dump(parameters, f, indent=4)
        training_thread = threading.Thread(
            target=train,
            kwargs={
                "agent": agent,
                "env": training_env,
                "num_epoch": num_epoch,
            },
        )
        training_thread.start()

    def test_model(self, start_date, end_date):
        params = self.get_trainning_params()
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
            actor_path=TRAINED_ACTOR_FILEPATH,
            target_actor_path=TRAINED_TARGET_ACTOR_FILEPATH,
            critic_path=TRAINED_CRITIC_FILEPATH,
            target_critic_path=TRAINED_TARGET_CRITIC_FILEPATH,
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
            },
        )
        testing_thread.start()

    def is_model_trained(self):
        if not os.path.isdir(TRAINED_MODELS_DIR):
            return False
        if not (
            os.path.isfile(TRAINED_ACTOR_FILEPATH)
            and os.path.isfile(TRAINED_CRITIC_FILEPATH)
            and os.path.isfile(TRAINED_TARGET_CRITIC_FILEPATH)
            and os.path.isfile(TRAINED_TARGET_ACTOR_FILEPATH)
        ):
            return False
        return True

    def get_trainning_params(self):
        with open(f"{TRAINED_MODELS_DIR}/parameters.json", "r") as f:
            params = json.load(f)
        return params

    def get_return_over_epoch_json(self):
        with open(TRAINED_MODELS_RETURN_OVER_EPOCH__JSON_FILEPATH, "r") as f:
            return_over_epoch = json.load(f)
        return return_over_epoch

    def get_return_over_time_json(self):
        with open(TRAINED_MODELS_RETURN_OVER_TIME_JSON_FILEPATH, "r") as f:
            return_over_time = json.load(f)
        return return_over_time

    def get_sharpe_ratio_over_epoch_json(self):
        with open(TRAINED_MODELS_SHARPE_RATIO_OVER_EPOCH_JSON_FILEPATH, "r") as f:
            sharpe_ratio_over_epoch = json.load(f)
        return sharpe_ratio_over_epoch

    def is_model_training(self):
        if not os.path.isdir(TRAINING_MODELS_DIR):
            return False
        if not (
            os.path.isfile(TRAINING_ACTOR_FILEPATH)
            and os.path.isfile(TRAINING_CRITIC_FILEPATH)
            and os.path.isfile(TRAINING_TARGET_ACTOR_FILEPATH)
            and os.path.isfile(TRAINING_TARGET_CRITIC_FILEPATH)
        ):
            return False
        return True

    def model_status(self):
        if self.is_model_training():
            return ModelStatus.TRAINING
        if self.is_model_trained():
            return ModelStatus.TRAINED
        return ModelStatus.NOT_TRAINED
