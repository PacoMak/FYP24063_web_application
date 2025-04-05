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
from ..utils import project_root

# File paths
SAVED_MODELS_DIR = project_root / "src" / "trained_models"


def get_model_paths(model_id):
    model_dir = SAVED_MODELS_DIR / str(model_id)
    networks_dir = model_dir / "networks"
    evaluation_dir = model_dir / "evaluation"
    graph_dir = model_dir / "graph"

    return {
        "model_dir": model_dir,
        "networks_dir": networks_dir,
        "evaluation_dir": evaluation_dir,
        "graph_dir": graph_dir,
        "params": model_dir / "parameters.json",
        "actor": networks_dir / "actor_ddpg",
        "target_actor": networks_dir / "target_actor_ddpg",
        "critic": networks_dir / "critic_ddpg",
        "target_critic": networks_dir / "target_critic_ddpg",
        "return_over_epoch": evaluation_dir / "return_over_epoch.json",
        "sharpe_ratio_over_epoch": evaluation_dir / "sharpe_ratio_over_epoch.json",
        "return_over_time": evaluation_dir / "return_over_time.json",
        "return_over_epoch_graph": graph_dir / "return_over_epoch.png",
        "sharpe_ratio_over_epoch_graph": graph_dir / "sharpe_ratio_over_epoch.png",
        "actor_loss_graph": graph_dir / "actor_loss.png",
        "critic_loss_graph": graph_dir / "critic_loss.png",
        "return_over_time_graph": graph_dir / "return_over_time.png",
    }


def train(agent, env, num_epoch, model_id):
    model_paths = get_model_paths(model_id)
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
                actor_path=model_paths["actor"],
                target_actor_path=model_paths["target_actor"],
                critic_path=model_paths["critic"],
                target_critic_path=model_paths["target_critic"],
            )
            xAxis = range(1, i + 1)
            plot_graph(
                title="Total return over epoch",
                x_label="Epoch",
                y_label="Total return",
                xAxis=xAxis,
                yAxis=return_history,
                filename=model_paths["return_over_epoch_graph"],
            )

            plot_graph(
                title="Sharpe Ratio over epoch",
                x_label="Epoch",
                y_label="Sharpe Ratio",
                xAxis=xAxis,
                yAxis=sharpe_ratio_history,
                filename=model_paths["sharpe_ratio_over_epoch_graph"],
            )

            plot_graph(
                title="Actor Loss",
                x_label="Progress",
                y_label="Actor Loss",
                xAxis=xAxis,
                yAxis=actor_loss_history,
                filename=model_paths["actor_loss_graph"],
            )

            plot_graph(
                title="Critic Loss",
                x_label="Progress",
                y_label="Critic Loss",
                xAxis=xAxis,
                yAxis=critic_loss_history,
                filename=model_paths["critic_loss_graph"],
            )
        print(
            f"------Episode {i} Summary: Total Return {total_return:.2f}; Sharpe Ratio {sharpe_ratio:.5f};------\n"
        )

    print(
        f"DDPG average performance: Total Return {np.mean(return_history['ddpg'])}; Sharpe Ratio {np.mean(sharpe_ratio_history['ddpg'])}"
    )

    agent.save_models(
        actor_path=model_paths["actor"],
        target_actor_path=model_paths["target_actor"],
        critic_path=model_paths["critic"],
        target_critic_path=model_paths["target_critic"],
    )
    xAxis = range(1, num_epoch + 1)
    plot_graph(
        title="Total return over epoch",
        x_label="Epoch",
        y_label="Total return",
        xAxis=xAxis,
        yAxis=return_history,
        filename=model_paths["return_over_epoch_graph"],
    )

    plot_graph(
        title="Sharpe Ratio over epoch",
        x_label="Epoch",
        y_label="Sharpe Ratio",
        xAxis=xAxis,
        yAxis=sharpe_ratio_history,
        filename=model_paths["sharpe_ratio_over_epoch_graph"],
    )
    with open(model_paths["return_over_epoch"], "w") as f:
        json.dump(return_history["ddpg"], f)
    with open(model_paths["sharpe_ratio_over_epoch"], "w") as f:
        json.dump(sharpe_ratio_history["ddpg"], f)
    return


def test(agent, env, assets, model_id):
    model_paths = get_model_paths(model_id)
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
            actor_path=model_paths["actor"],
            target_actor_path=model_paths["target_actor"],
            critic_path=model_paths["critic"],
            target_critic_path=model_paths["target_critic"],
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
        filename=model_paths["return_over_time_graph"],
    )
    with open(model_paths["return_over_time"], "w") as f:
        json.dump(return_history, f)
    return


if __name__ == "__main__":
    temp_model_id = "20250217"

    parameters = {
        "name": temp_model_id,
        "assets": [
            "AAPL",
            "MSFT",
            "GOOGL",
            "AMZN",
            "TSLA",
            "JNJ",
            "PG",
            "KO",
            "XOM",
            "GE",
        ],
        "rebalance_window": 1,
        "tx_fee_per_share": 0.005,
        "principal": 1000000,
        "num_epoch": 5,
        "train_start_date": "2020-01-01",
        "train_end_date": "2021-12-31",
        "test_start_date": "2022-01-01",
        "test_end_date": "2024-12-31",
        "alpha": 0.0005,
        "beta": 0.0025,
        "gamma": 0.99,
        "tau": 0.09,
        "batch_size": 128,
    }
    model_paths = get_model_paths(temp_model_id)

    if not os.path.isdir(model_paths["model_dir"]):
        os.makedirs(model_paths["model_dir"])
    if not os.path.isdir(model_paths["networks_dir"]):
        os.makedirs(model_paths["networks_dir"])
    if not os.path.isdir(model_paths["evaluation_dir"]):
        os.makedirs(model_paths["evaluation_dir"])
    if not os.path.isdir(model_paths["graph_dir"]):
        os.makedirs(model_paths["graph_dir"])
    with open(model_paths["params"], "w") as f:
        json.dump(parameters, f, indent=4)
    device = "cuda:0" if T.cuda.is_available() else "cpu"
    agent = Agent(
        alpha=0.0005,
        beta=0.0025,
        gamma=0.99,
        tau=0.09,
        input_dims=[len(parameters["assets"]) * 5 + 2],
        batch_size=128,
        n_actions=len(parameters["assets"]) + 1,
        device=device,
    )
    agent.save_models(
        actor_path=model_paths["actor"],
        target_actor_path=model_paths["target_actor"],
        critic_path=model_paths["critic"],
        target_critic_path=model_paths["target_critic"],
    )
    training_env = TradingSimulator(
        principal=parameters["principal"],
        assets=parameters["assets"],
        start_date=parameters["train_start_date"],
        end_date=parameters["train_end_date"],
        rebalance_window=parameters["rebalance_window"],
        tx_fee_per_share=parameters["tx_fee_per_share"],
    )

    test_env = TradingSimulator(
        principal=parameters["principal"],
        assets=parameters["assets"],
        start_date=parameters["test_start_date"],
        end_date=parameters["test_end_date"],
        rebalance_window=parameters["rebalance_window"],
        tx_fee_per_share=parameters["tx_fee_per_share"],
    )
    start_time = time.time()
    train(
        agent=agent,
        env=training_env,
        num_epoch=parameters["num_epoch"],
        model_id=temp_model_id,
    )
    end_time = time.time()
    print(f"{device} Training time: {end_time - start_time} seconds")
    test(agent=agent, env=test_env, assets=parameters["assets"], model_id=temp_model_id)
