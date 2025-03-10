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
import time
import torch as T

# File paths
SAVED_MODELS_DIR = "saved_models"
SAVED_MODEL_DIR = f"{SAVED_MODELS_DIR}/{{id}}"

# For network
SAVED_MODEL_NETWORKS_DIR = f"{SAVED_MODEL_DIR}/networks"
SAVED_MODEL_ACTOR_FILEPATH = f"{SAVED_MODEL_NETWORKS_DIR}/actor_ddpg"
SAVED_MODEL_TARGET_ACTOR_FILEPATH = f"{SAVED_MODEL_NETWORKS_DIR}/target_actor_ddpg"
SAVED_MODEL_CRITIC_FILEPATH = f"{SAVED_MODEL_NETWORKS_DIR}/critic_ddpg"
SAVED_MODEL_TARGET_CRITIC_FILEPATH = f"{SAVED_MODEL_NETWORKS_DIR}/target_critic_ddpg"

# for evaluation
SAVED_MODEL_EVALUATION_DIR = f"{SAVED_MODEL_DIR}/evaluation"
SAVED_MODEL_RETURN_OVER_EPOCH_JSON_FILEPATH = (
    f"{SAVED_MODEL_EVALUATION_DIR}/return_over_epoch.json"
)
SAVED_MODEL_SHARPE_RATIO_OVER_EPOCH_JSON_FILEPATH = (
    f"{SAVED_MODEL_EVALUATION_DIR}/sharpe_ratio_over_epoch.json"
)
SAVED_MODEL_RETURN_OVER_TIME_JSON_FILEPATH = (
    f"{SAVED_MODEL_EVALUATION_DIR}/return_over_time.json"
)
# evaluation graph file paths (should be removed in the end)
SAVED_MODEL_GRAPH_DIR = f"{SAVED_MODEL_DIR}/graph"
SAVED_MODEL_RETURN_OVER_EPOCH_FILEPATH = (
    f"{SAVED_MODEL_GRAPH_DIR}/return_over_epoch.png"
)
SAVED_MODEL_SHARPE_RATIO_OVER_EPOCH_FILEPATH = (
    f"{SAVED_MODEL_GRAPH_DIR}/sharpe_ratio_over_epoch.png"
)
SAVED_MODEL_ACTOR_LOSS_OVER_EPOCH_FILEPATH = f"{SAVED_MODEL_GRAPH_DIR}/actor_loss.png"
SAVED_MODEL_CRITIC_LOSS_OVER_EPOCH_FILEPATH = f"{SAVED_MODEL_GRAPH_DIR}/critic_loss.png"
SAVED_MODEL_RETURN_OVER_TIME_FILEPATH = f"{SAVED_MODEL_GRAPH_DIR}/return_over_time.png"


def train(agent, env, num_epoch, model_id):
    is_training_mode = True
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
                actor_path=SAVED_MODEL_ACTOR_FILEPATH.format(id=model_id),
                target_actor_path=SAVED_MODEL_TARGET_ACTOR_FILEPATH.format(id=model_id),
                critic_path=SAVED_MODEL_CRITIC_FILEPATH.format(id=model_id),
                target_critic_path=SAVED_MODEL_TARGET_CRITIC_FILEPATH.format(
                    id=model_id
                ),
            )
            xAxis = range(1, i + 1)
            plot_graph(
                title="Total return over epoch",
                x_label="Epoch",
                y_label="Total return",
                xAxis=xAxis,
                yAxis=return_history,
                filename=SAVED_MODEL_RETURN_OVER_EPOCH_FILEPATH.format(id=model_id),
            )

            plot_graph(
                title="Sharpe Ratio over epoch",
                x_label="Epoch",
                y_label="Sharpe Ratio",
                xAxis=xAxis,
                yAxis=sharpe_ratio_history,
                filename=SAVED_MODEL_SHARPE_RATIO_OVER_EPOCH_FILEPATH.format(
                    id=model_id
                ),
            )

            plot_graph(
                title="Actor Loss",
                x_label="Progress",
                y_label="Actor Loss",
                xAxis=xAxis,
                yAxis=actor_loss_history,
                filename=SAVED_MODEL_ACTOR_LOSS_OVER_EPOCH_FILEPATH.format(id=model_id),
            )

            plot_graph(
                title="Critic Loss",
                x_label="Progress",
                y_label="Critic Loss",
                xAxis=xAxis,
                yAxis=critic_loss_history,
                filename=SAVED_MODEL_CRITIC_LOSS_OVER_EPOCH_FILEPATH.format(
                    id=model_id
                ),
            )
        print(
            f"------Episode {i} Summary: Total Return {total_return:.2f}; Sharpe Ratio {sharpe_ratio:.5f};------\n"
        )

    print(
        f"DDPG average performance: Total Return {np.mean(return_history['ddpg'])}; Sharpe Ratio {np.mean(sharpe_ratio_history['ddpg'])}"
    )

    agent.save_models(
        actor_path=SAVED_MODEL_ACTOR_FILEPATH.format(id=model_id),
        target_actor_path=SAVED_MODEL_TARGET_ACTOR_FILEPATH.format(id=model_id),
        critic_path=SAVED_MODEL_CRITIC_FILEPATH.format(id=model_id),
        target_critic_path=SAVED_MODEL_TARGET_CRITIC_FILEPATH.format(id=model_id),
    )
    xAxis = range(1, num_epoch + 1)
    plot_graph(
        title="Total return over epoch",
        x_label="Epoch",
        y_label="Total return",
        xAxis=xAxis,
        yAxis=return_history,
        filename=SAVED_MODEL_RETURN_OVER_EPOCH_FILEPATH.format(id=model_id),
    )

    plot_graph(
        title="Sharpe Ratio over epoch",
        x_label="Epoch",
        y_label="Sharpe Ratio",
        xAxis=xAxis,
        yAxis=sharpe_ratio_history,
        filename=SAVED_MODEL_SHARPE_RATIO_OVER_EPOCH_FILEPATH.format(id=model_id),
    )
    with open(
        SAVED_MODEL_RETURN_OVER_EPOCH_JSON_FILEPATH.format(id=model_id), "w"
    ) as f:
        json.dump(return_history["ddpg"], f)
    with open(
        SAVED_MODEL_SHARPE_RATIO_OVER_EPOCH_JSON_FILEPATH.format(id=model_id), "w"
    ) as f:
        json.dump(sharpe_ratio_history["ddpg"], f)
    return


def test(agent, env, assets, model_id):
    is_training_mode = False
    return_history = {}
    modes = [
        "ddpg",
        "uniform_with_rebalance",
        "uniform_without_rebalance",
        # "basic_MPT",
    ]
    print(modes)
    if "ddpg" in modes:
        agent.load_models(
            actor_path=SAVED_MODEL_ACTOR_FILEPATH.format(id=temp_model_id),
            target_actor_path=SAVED_MODEL_TARGET_ACTOR_FILEPATH.format(
                id=temp_model_id
            ),
            critic_path=SAVED_MODEL_CRITIC_FILEPATH.format(id=temp_model_id),
            target_critic_path=SAVED_MODEL_TARGET_CRITIC_FILEPATH.format(
                id=temp_model_id
            ),
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

    if "uniform_with_rebalance" in modes:
        return_history["uniform_with_rebalance"] = uniform_with_rebalance_test(
            env, assets
        )

    if "uniform_without_rebalance" in modes:
        return_history["uniform_without_rebalance"] = uniform_without_rebalance_test(
            env, assets
        )

    # if modes["basic_MPT"] == 1:
    #     return_history["basic_MPT"] = basic_mpt_test(env, assets, rebalance_window)
    plot_graph(
        title="Cumulative return over time",
        x_label="Time",
        y_label="Cumulative return",
        xAxis=range(1, len(return_history[list(return_history.keys())[0]]) + 1),
        yAxis=return_history,
        filename=SAVED_MODEL_RETURN_OVER_TIME_FILEPATH.format(id=model_id),
    )
    with open(SAVED_MODEL_RETURN_OVER_TIME_JSON_FILEPATH.format(id=model_id), "w") as f:
        json.dump(return_history["ddpg"], f)
    return


if __name__ == "__main__":
    assets = ["APA", "TSLA"]
    rebalance_window = 1
    tx_fee_per_share = 0.005
    principal = 1000000
    num_epoch = 10
    temp_model_id = "20250217"
    train_start_date = "2015-01-01"
    train_end_date = "2017-12-31"
    test_start_date = "2018-01-01"
    test_end_date = "2024-12-31"
    alpha = 0.0005
    beta = 0.0025
    gamma = 0.99
    tau = 0.09
    batch_size = 128
    if not os.path.isdir(SAVED_MODEL_DIR.format(id=temp_model_id)):
        os.makedirs(SAVED_MODEL_DIR.format(id=temp_model_id))
    if not os.path.isdir(SAVED_MODEL_NETWORKS_DIR.format(id=temp_model_id)):
        os.makedirs(SAVED_MODEL_NETWORKS_DIR.format(id=temp_model_id))

    if not os.path.isdir(SAVED_MODEL_EVALUATION_DIR.format(id=temp_model_id)):
        os.makedirs(SAVED_MODEL_EVALUATION_DIR.format(id=temp_model_id))
    if not os.path.isdir(SAVED_MODEL_GRAPH_DIR.format(id=temp_model_id)):
        os.makedirs(SAVED_MODEL_GRAPH_DIR.format(id=temp_model_id))

    device = "cpu"
    agent = Agent(
        alpha=alpha,
        beta=beta,
        gamma=gamma,
        tau=tau,
        input_dims=[len(assets) * 5 + 2],
        batch_size=batch_size,
        n_actions=len(assets) + 1,
        device=device,
    )
    agent.save_models(
        actor_path=SAVED_MODEL_ACTOR_FILEPATH.format(id=temp_model_id),
        target_actor_path=SAVED_MODEL_TARGET_ACTOR_FILEPATH.format(id=temp_model_id),
        critic_path=SAVED_MODEL_CRITIC_FILEPATH.format(id=temp_model_id),
        target_critic_path=SAVED_MODEL_TARGET_CRITIC_FILEPATH.format(id=temp_model_id),
    )
    training_env = TradingSimulator(
        principal=principal,
        assets=assets,
        start_date=train_start_date,
        end_date=train_end_date,
        rebalance_window=rebalance_window,
        tx_fee_per_share=tx_fee_per_share,
    )

    test_env = TradingSimulator(
        principal=principal,
        assets=assets,
        start_date=test_start_date,
        end_date=test_end_date,
        rebalance_window=rebalance_window,
        tx_fee_per_share=tx_fee_per_share,
    )
    start_time = time.time()
    train(agent=agent, env=training_env, num_epoch=num_epoch, model_id=temp_model_id)
    end_time = time.time()
    print(f"{device} Training time: {end_time - start_time} seconds")
    test(agent=agent, env=test_env, assets=assets, model_id=temp_model_id)
