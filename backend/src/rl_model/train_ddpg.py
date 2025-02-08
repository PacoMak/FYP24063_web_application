from flask import json
from .ddpg.v2.agent_v2 import Agent
import numpy as np
from .env.trading_simulator_v2 import TradingSimulator
import os
from .baseline import (
    uniform_with_rebalance_test,
    uniform_without_rebalance_test,
    basic_mpt_test,
)
from ..utils import plot_graph
import shutil

# Configurations
# Portfolio settings


# File paths
TRAINING_MODELS_DIR = "training_models"
TRAINING_MODELS_EVALUATION_DIR = f"{TRAINING_MODELS_DIR}/evaluation"
TRAINING_MODELS_RETURN_FILEPATH = (
    f"{TRAINING_MODELS_EVALUATION_DIR}/return_over_epoch.png"
)
TRAINING_MODELS_SHARPE_RATIO_FILEPATH = (
    f"{TRAINING_MODELS_EVALUATION_DIR}/sharpe_ratio_over_epoch.png"
)
TRAINING_MODELS_ACTOR_LOSS_FILEPATH = (
    f"{TRAINING_MODELS_EVALUATION_DIR}/actor_loss_over_epoch.png"
)
TRAINING_MODELS_CRITIC_LOSS_FILEPATH = (
    f"{TRAINING_MODELS_EVALUATION_DIR}/critic_loss_over_epoch.png"
)


TRAINING_ACTOR_FILEPATH = f"{TRAINING_MODELS_DIR}/actor_ddpg"
TRAINING_TARGET_ACTOR_FILEPATH = f"{TRAINING_MODELS_DIR}/target_actor_ddpg"
TRAINING_CRITIC_FILEPATH = f"{TRAINING_MODELS_DIR}/critic_ddpg"
TRAINING_TARGET_CRITIC_FILEPATH = f"{TRAINING_MODELS_DIR}/target_critic_ddpg"


TRAINED_MODELS_DIR = "trained_models"
TRAINED_MODELS_EVALUATION_DIR = f"{TRAINED_MODELS_DIR}/evaluation"
TRAINED_MODELS_RETURN_OVER_EPOCH_FILEPATH = (
    f"{TRAINED_MODELS_EVALUATION_DIR}/return_over_epoch.png"
)
TRAINED_MODELS_RETURN_OVER_EPOCH__JSON_FILEPATH = (
    f"{TRAINED_MODELS_EVALUATION_DIR}/return_over_epoch.json"
)
TRAINED_MODELS_SHARPE_RATIO_OVER_EPOCH_FILEPATH = (
    f"{TRAINED_MODELS_EVALUATION_DIR}/sharpe_ratio_over_epoch.png"
)
TRAINED_MODELS_SHARPE_RATIO_OVER_EPOCH_JSON_FILEPATH = (
    f"{TRAINED_MODELS_EVALUATION_DIR}/sharpe_ratio_over_epoch.json"
)
TRAINED_MODELS_RETURN_OVER_TIME_FILEPATH = (
    f"{TRAINED_MODELS_EVALUATION_DIR}/return_over_time.png"
)
TRAINED_MODELS_RETURN_OVER_TIME_JSON_FILEPATH = (
    f"{TRAINED_MODELS_EVALUATION_DIR}/return_over_time.json"
)


TRAINED_ACTOR_FILEPATH = f"{TRAINED_MODELS_DIR}/actor_ddpg"
TRAINED_TARGET_ACTOR_FILEPATH = f"{TRAINED_MODELS_DIR}/target_actor_ddpg"
TRAINED_CRITIC_FILEPATH = f"{TRAINED_MODELS_DIR}/critic_ddpg"
TRAINED_TARGET_CRITIC_FILEPATH = f"{TRAINED_MODELS_DIR}/target_critic_ddpg"


def train(agent, env, num_epoch):

    is_training_mode = True
    # Evaluation metrics
    return_history = {"ddpg": []}
    sharpe_ratio_history = {"ddpg": []}
    actor_loss_history = {"ddpg": []}
    critic_loss_history = {"ddpg": []}

    np.random.seed(0)

    print("--------------------DDPG Training--------------------")
    for i in range(1, num_epoch + 1):
        print(f"-----------------Episode {i}-----------------")
        observation = env.restart()
        done = 0
        total_return = 0
        total_actor_loss = 0
        total_critic_loss = 0
        while not done:
            action = agent.choose_action(observation, is_training_mode)
            new_state, reward, done = env.step(action)
            agent.remember(observation, action, reward, new_state, done)
            actor_loss, critic_loss = agent.learn()
            total_actor_loss += actor_loss
            total_critic_loss += critic_loss
            total_return += reward
            observation = new_state
        return_history["ddpg"].append(total_return)
        sharpe_ratio = env.sharpe_ratio()
        sharpe_ratio_history["ddpg"].append(sharpe_ratio)
        actor_loss_history["ddpg"].append(total_actor_loss)
        critic_loss_history["ddpg"].append(total_critic_loss)

        if i % 5 == 0:
            agent.save_models(
                actor_path=TRAINING_ACTOR_FILEPATH,
                target_actor_path=TRAINING_TARGET_ACTOR_FILEPATH,
                critic_path=TRAINING_CRITIC_FILEPATH,
                target_critic_path=TRAINING_TARGET_CRITIC_FILEPATH,
            )
            xAxis = range(1, i + 1)
            plot_graph(
                title="Total return over epoch",
                x_label="Epoch",
                y_label="Total return",
                xAxis=xAxis,
                yAxis=return_history,
                filename=TRAINING_MODELS_RETURN_FILEPATH,
            )

            plot_graph(
                title="Sharpe Ratio over epoch",
                x_label="Epoch",
                y_label="Sharpe Ratio",
                xAxis=xAxis,
                yAxis=sharpe_ratio_history,
                filename=TRAINING_MODELS_SHARPE_RATIO_FILEPATH,
            )

            plot_graph(
                title="Actor Loss",
                x_label="Progress",
                y_label="Actor Loss",
                xAxis=xAxis,
                yAxis=actor_loss_history,
                filename=TRAINING_MODELS_ACTOR_LOSS_FILEPATH,
            )

            plot_graph(
                title="Critic Loss",
                x_label="Progress",
                y_label="Critic Loss",
                xAxis=xAxis,
                yAxis=critic_loss_history,
                filename=TRAINING_MODELS_CRITIC_LOSS_FILEPATH,
            )
        print(
            f"------Episode {i} Summary: Total Return {total_return:.2f}; Sharpe Ratio {sharpe_ratio:.5f};------\n"
        )

    print(
        f"DDPG average performance: Total Return {np.mean(return_history['ddpg'])}; Sharpe Ratio {np.mean(sharpe_ratio_history['ddpg'])}"
    )

    agent.save_models(
        actor_path=TRAINED_ACTOR_FILEPATH,
        target_actor_path=TRAINED_TARGET_ACTOR_FILEPATH,
        critic_path=TRAINED_CRITIC_FILEPATH,
        target_critic_path=TRAINED_TARGET_CRITIC_FILEPATH,
    )
    xAxis = range(1, num_epoch + 1)
    plot_graph(
        title="Total return over epoch",
        x_label="Epoch",
        y_label="Total return",
        xAxis=xAxis,
        yAxis=return_history,
        filename=TRAINED_MODELS_RETURN_OVER_EPOCH_FILEPATH,
    )

    plot_graph(
        title="Sharpe Ratio over epoch",
        x_label="Epoch",
        y_label="Sharpe Ratio",
        xAxis=xAxis,
        yAxis=sharpe_ratio_history,
        filename=TRAINED_MODELS_SHARPE_RATIO_OVER_EPOCH_FILEPATH,
    )
    with open(TRAINED_MODELS_RETURN_OVER_EPOCH__JSON_FILEPATH, "w") as f:
        json.dump(return_history, f)
    with open(TRAINED_MODELS_SHARPE_RATIO_OVER_EPOCH_JSON_FILEPATH, "w") as f:
        json.dump(sharpe_ratio_history, f)
    shutil.rmtree(TRAINING_MODELS_DIR)

    return


def test(agent, env):
    is_training_mode = False
    testing_mode = {
        "ddpg": 1,
        "uniform_with_rebalance": 1,
        "uniform_without_rebalance": 1,
        "basic_MPT": 0,
    }
    return_history = {}
    sharpe_ratio_history = {}

    if testing_mode["ddpg"]:
        agent.load_models(
            actor_path=TRAINED_ACTOR_FILEPATH,
            target_actor_path=TRAINED_TARGET_ACTOR_FILEPATH,
            critic_path=TRAINED_CRITIC_FILEPATH,
            target_critic_path=TRAINED_TARGET_CRITIC_FILEPATH,
        )
        np.random.seed(0)
        return_history["ddpg"] = []
        print("--------------------DDPG--------------------")
        observation = env.restart()
        done = 0
        total_return = 0
        while not done:
            action = agent.choose_action(observation, is_training_mode)
            new_state, reward, done = env.step(action)
            total_return += reward
            observation = new_state
            return_history["ddpg"].append(total_return)
        sharpe_ratio = env.sharpe_ratio()
        portfolio_value = env.total_portfolio_value()
        print(
            f"------Portfolio Value {portfolio_value:.2f}; Total Return {total_return:.2f}; Sharpe Ratio {sharpe_ratio:.5f};------\n"
        )

    if testing_mode["uniform_with_rebalance"]:
        return_history["uniform_with_rebalance"] = uniform_with_rebalance_test(
            env, assets
        )

    if testing_mode["uniform_without_rebalance"]:
        return_history["uniform_without_rebalance"] = uniform_without_rebalance_test(
            env, assets
        )

    # if testing_mode["basic_MPT"] == 1:
    #     return_history["basic_MPT"] = basic_mpt_test(env, assets, rebalance_window)
    plot_graph(
        title="Cumulative return over time",
        x_label="Time",
        y_label="Cumulative return",
        xAxis=range(1, len(return_history[list(return_history.keys())[0]]) + 1),
        yAxis=return_history,
        filename=TRAINED_MODELS_RETURN_OVER_TIME_FILEPATH,
    )
    with open(TRAINED_MODELS_RETURN_OVER_TIME_JSON_FILEPATH, "w") as f:
        json.dump(return_history, f)


if __name__ == "__main__":
    assets = ["APA", "LNC", "RCL", "FCX"]
    rebalance_window = 1
    tx_fee_per_share = 0.005
    principal = 1000000
    num_epoch = 5

    if not os.path.isdir(TRAINING_MODELS_EVALUATION_DIR):
        os.makedirs(TRAINING_MODELS_EVALUATION_DIR)
    if not os.path.isdir(TRAINED_MODELS_EVALUATION_DIR):
        os.makedirs(TRAINED_MODELS_EVALUATION_DIR)
    agent = Agent(
        alpha=0.0005,
        beta=0.0025,
        gamma=0.99,
        tau=0.09,
        input_dims=[len(assets) * 5 + 2],
        batch_size=128,
        n_actions=len(assets) + 1,
    )
    agent.load_models(
        actor_path=TRAINING_ACTOR_FILEPATH,
        target_actor_path=TRAINING_TARGET_ACTOR_FILEPATH,
        critic_path=TRAINING_CRITIC_FILEPATH,
        target_critic_path=TRAINING_TARGET_CRITIC_FILEPATH,
    )
    agent.save_models(
        actor_path=TRAINED_ACTOR_FILEPATH,
        target_actor_path=TRAINED_TARGET_ACTOR_FILEPATH,
        critic_path=TRAINED_CRITIC_FILEPATH,
        target_critic_path=TRAINED_TARGET_CRITIC_FILEPATH,
    )
    TRAINING_env = TradingSimulator(
        principal=principal,
        assets=assets,
        start_date="2009-01-01",
        end_date="2017-12-31",
        rebalance_window=rebalance_window,
        tx_fee_per_share=tx_fee_per_share,
    )

    test_env = TradingSimulator(
        principal=principal,
        assets=assets,
        start_date="2018-01-01",
        end_date="2024-12-31",
        rebalance_window=rebalance_window,
        tx_fee_per_share=tx_fee_per_share,
    )
    train(agent=agent, env=TRAINING_env, num_epoch=num_epoch)
    test(agent=agent, env=TRAINING_env)
