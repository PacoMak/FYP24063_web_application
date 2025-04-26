import pandas as pd
from flask import json
import numpy as np
import os
from .env import TradingSimulator
from .ddpg import Agent
from ..utils import (
    project_root,
    print_eval_results,
    plot_sharpe_ratio_over_episodes,
    plot_return_over_episodes,
    plot_mean_actor_loss_over_episodes,
    plot_mean_critic_loss_over_episodes,
    plot_return_over_time,
    plot_monthly_return_rate,
    plot_yearly_return_rate,
)
from .baseline import (
    all_in_last_day_best_return_test,
    god_test,
    uniform_with_rebalance_test,
    uniform_without_rebalance_test,
    mpt_test,
    follow_last_day_best_return_test,
)

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
        "return_over_epoch_graph": graph_dir / "training_total_return.png",
        "sharpe_ratio_over_epoch_graph": graph_dir / "training_sharpe_ratio.png",
        "actor_loss_graph": graph_dir / "training_actor_loss.png",
        "critic_loss_graph": graph_dir / "training_critic_loss.png",
        "return_over_time_graph": graph_dir / "testing_cumulative_return.png",
        "yearly_return_graph": graph_dir / "testing_yearly_return_rate.png",
        "monthly_return_graph": graph_dir / "testing_monthly_return_rate.png",
    }


def train(agent, env, num_epoch, model_id, log_fn=None):
    try:
        if not log_fn:
            log_fn = print
        model_paths = get_model_paths(model_id)
        is_training_mode = True
        return_history = {"ddpg": []}
        sharpe_ratio_history = {"ddpg": []}
        actor_loss_history = {"ddpg": []}
        critic_loss_history = {"ddpg": []}
        np.random.seed(0)
        log_fn("--------------------DDPG Training--------------------")
        for i in range(1, num_epoch + 1):
            log_fn(f"-----------------Episode {i}-----------------")
            observation = env.restart()
            done = 0
            total_return = 0
            total_actor_loss = 0
            total_critic_loss = 0
            learning_count = 0

            while not done:
                action = agent.choose_action(observation, is_training_mode)
                new_state, reward, done = env.step(action)
                agent.remember(observation, action, reward, new_state, done)
                actor_loss, critic_loss = agent.learn()
                if actor_loss != None:
                    total_actor_loss += actor_loss
                    total_critic_loss += critic_loss
                    learning_count += 1
                total_return += reward
                observation = new_state
            return_history["ddpg"].append(total_return)
            sharpe_ratio = env.sharpe_ratio()
            sharpe_ratio_history["ddpg"].append(sharpe_ratio)
            actor_loss_history["ddpg"].append(total_actor_loss / learning_count)
            critic_loss_history["ddpg"].append(total_critic_loss / learning_count)
            if i % 5 == 0:
                agent.save_models(
                    actor_path=model_paths["actor"],
                    target_actor_path=model_paths["target_actor"],
                    critic_path=model_paths["critic"],
                    target_critic_path=model_paths["target_critic"],
                )
                episode_axis = range(1, i + 1)
                plot_return_over_episodes(
                    episode_axis,
                    return_history["ddpg"],
                    "ddpg",
                    model_paths["return_over_epoch_graph"],
                )
                plot_sharpe_ratio_over_episodes(
                    episode_axis,
                    sharpe_ratio_history["ddpg"],
                    "ddpg",
                    model_paths["sharpe_ratio_over_epoch_graph"],
                )
                plot_mean_actor_loss_over_episodes(
                    episode_axis,
                    actor_loss_history["ddpg"],
                    "ddpg",
                    model_paths["actor_loss_graph"],
                )
                plot_mean_critic_loss_over_episodes(
                    episode_axis,
                    critic_loss_history["ddpg"],
                    "ddpg",
                    model_paths["critic_loss_graph"],
                )

            log_fn(
                f"------Episode {i} Summary: Total Return {total_return:.2f}; Sharpe Ratio {sharpe_ratio:.5f};------\n"
            )
        log_fn(
            f"DDPG average performance: Total Return {np.mean(return_history['ddpg'])}; Sharpe Ratio {np.mean(sharpe_ratio_history['ddpg'])}"
        )
        agent.save_models(
            actor_path=model_paths["actor"],
            target_actor_path=model_paths["target_actor"],
            critic_path=model_paths["critic"],
            target_critic_path=model_paths["target_critic"],
        )
        with open(model_paths["return_over_epoch"], "w") as f:
            json.dump(return_history["ddpg"], f)
        with open(model_paths["sharpe_ratio_over_epoch"], "w") as f:
            json.dump(sharpe_ratio_history["ddpg"], f)
        log_fn(f"--------------------DDPG Training End--------------------")
        return
    except Exception as e:
        log_fn(f"Error during training: {str(e)}")


def test(agent, env, assets, model_id):
    model_paths = get_model_paths(model_id)
    is_training_mode = False
    return_history = {}
    yearly_return_rate_history = {}
    monthly_return_rate_history = {}
    weight_history = []
    modes = [
        "ddpg",
        # "GOD",
        "all_in_last_day_best_return",
        "follow_last_day_best_return",
        "uniform_with_rebalance",
        "uniform_without_rebalance",
        "MPT",
    ]
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
            weight_history.append(env.get_portfolio_weights())

        yearly_return_rate_history["ddpg"], _ = env.yearly_return_history()
        monthly_return_rate_history["ddpg"], _ = env.monthly_return_history()
        print_eval_results(env, total_return)

    if "GOD" in modes:
        god_return_history, yearly_return, monthly_return = god_test(env, assets)
        return_history["GOD"] = god_return_history
        yearly_return_rate_history["GOD"] = yearly_return
        monthly_return_rate_history["GOD"] = monthly_return

    if "follow_last_day_best_return" in modes:
        fldbr_return_history, yearly_return, monthly_return = (
            follow_last_day_best_return_test(env, assets)
        )
        return_history["follow_last_day_best_return"] = fldbr_return_history
        yearly_return_rate_history["follow_last_day_best_return"] = yearly_return
        monthly_return_rate_history["follow_last_day_best_return"] = monthly_return

    if "all_in_last_day_best_return" in modes:
        returns, yearly_return, monthly_return = all_in_last_day_best_return_test(
            env, assets
        )
        return_history["all_in_last_day_best_return"] = returns
        yearly_return_rate_history["all_in_last_day_best_return"] = yearly_return
        monthly_return_rate_history["all_in_last_day_best_return"] = monthly_return

    if "uniform_with_rebalance" in modes:
        returns, yearly_return, monthly_return = uniform_with_rebalance_test(
            env, assets
        )
        return_history["uniform_with_rebalance"] = returns
        yearly_return_rate_history["uniform_with_rebalance"] = yearly_return
        monthly_return_rate_history["uniform_with_rebalance"] = monthly_return

    if "uniform_without_rebalance" in modes:
        returns, yearly_return, monthly_return = uniform_without_rebalance_test(
            env, assets
        )
        return_history["uniform_without_rebalance"] = returns
        yearly_return_rate_history["uniform_without_rebalance"] = yearly_return
        monthly_return_rate_history["uniform_without_rebalance"] = monthly_return

    if "MPT" in modes:
        returns, yearly_return, monthly_return = mpt_test(env, assets)
        return_history["MPT"] = returns
        yearly_return_rate_history["MPT"] = yearly_return
        monthly_return_rate_history["MPT"] = monthly_return
    time_range = env.trading_date_range()
    plot_return_over_time(env, return_history, model_paths["return_over_time_graph"])
    plot_monthly_return_rate(
        env, monthly_return_rate_history, model_paths["monthly_return_graph"]
    )
    plot_yearly_return_rate(
        env, yearly_return_rate_history, model_paths["yearly_return_graph"]
    )
    return return_history, time_range, weight_history


if __name__ == "__main__":

    temp_model_id = "20250217"
    model_paths = get_model_paths(temp_model_id)

    if not os.path.isdir(model_paths["model_dir"]):
        os.makedirs(model_paths["model_dir"])
    if not os.path.isdir(model_paths["networks_dir"]):
        os.makedirs(model_paths["networks_dir"])
    if not os.path.isdir(model_paths["evaluation_dir"]):
        os.makedirs(model_paths["evaluation_dir"])
    if not os.path.isdir(model_paths["graph_dir"]):
        os.makedirs(model_paths["graph_dir"])

    parameters = {
        "model_name": temp_model_id,
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
        "model_type": 3,
    }
    with open(model_paths["params"], "w") as f:
        json.dump(parameters, f, indent=4)

    train_env = TradingSimulator(
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
    if parameters["model_type"] == 1 or parameters["model_type"] == 2:
        n_actions = len(parameters["assets"]) + 1
    elif parameters["model_type"] == 3:
        n_actions = len(parameters["assets"])

    agent = Agent(
        alpha=parameters["alpha"],
        beta=parameters["beta"],
        gamma=parameters["gamma"],
        tau=parameters["tau"],
        input_dims=[len(parameters["assets"]) * 8 + 1],
        batch_size=parameters["batch_size"],
        n_actions=n_actions,
        model=parameters["model_type"],
    )

    agent.save_models(
        actor_path=model_paths["actor"],
        target_actor_path=model_paths["target_actor"],
        critic_path=model_paths["critic"],
        target_critic_path=model_paths["target_critic"],
    )

    train(
        agent=agent,
        env=train_env,
        num_epoch=parameters["num_epoch"],
        model_id=temp_model_id,
    )
    test(agent=agent, env=test_env, assets=parameters["assets"], model_id=temp_model_id)
