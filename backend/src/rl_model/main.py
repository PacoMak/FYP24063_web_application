import pandas as pd
from flask import json
import numpy as np
import os
from scipy.optimize import minimize
from .env import TradingSimulatorV2, TradingSimulatorAmplifier
from .ddpg import Agent
from ..utils import project_root, print_eval_results
import time

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


def train(agent, env, num_epoch, model_id, log_fn=None):
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


# except Exception as e:
#     log_fn(f"Error during training: {str(e)}")


def test(agent, env, assets, model_id):
    model_paths = get_model_paths(model_id)
    is_training_mode = False
    return_history = {}
    modes = [
        "ddpg",
        "GOD",
        "all_in_last_day_best_return",
        "uniform_with_rebalance",
        "uniform_without_rebalance",
        "MPT",
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
        print_eval_results(env, total_return)
    if "GOD" in modes:
        return_history["GOD"] = []

        print("--------------------GOD--------------------")
        observation = env.restart()
        done = 0
        total_return = 0
        n = len(assets)

        while not done:
            action = [0] * (n + 1)
            if env.time < len(env.close_price) - 2:
                action_close_price = np.array(
                    [x for x in env.close_price.iloc[env.time]]
                )
                forward_close_price = np.array(
                    [x for x in env.close_price.iloc[env.time + 1]]
                )
                logr = np.log(np.divide(forward_close_price, action_close_price))
                if np.max(logr) >= 0:
                    action[np.argmax(logr)] = 1
                else:
                    action[-1] = 1
            else:
                action[-1] = 1
            new_state, reward, done = env.step(action)
            total_return += reward
            return_history["GOD"].append(total_return)
        print_eval_results(env, total_return)
    if "all_in_last_day_best_return" in modes:
        return_history["all_in_last_day_best_return"] = []

        print("--------------------all-in last day best return--------------------")
        observation = env.restart()
        done = 0
        total_return = 0
        n = len(assets)

        while not done:
            action = [0] * (n + 1)
            curr_close_price = np.array([x for x in env.close_price.iloc[env.time]])
            prev_close_price = np.array([x for x in env.close_price.iloc[env.time - 1]])
            logr = np.log(np.divide(prev_close_price, curr_close_price))
            if np.max(logr) >= 0:
                action[np.argmax(logr)] = 1
            else:
                action[-1] = 1
            new_state, reward, done = env.step(action)
            total_return += reward
            return_history["all_in_last_day_best_return"].append(total_return)
        print_eval_results(env, total_return)
    if "uniform_with_rebalance" in modes:
        return_history["uniform_with_rebalance"] = []

        print(
            "--------------------Uniform Weighting with Rebalancing--------------------"
        )
        observation = env.restart()
        done = 0
        total_return = 0

        while not done:
            action = [1 / (len(assets))] * (len(assets)) + [0]
            new_state, reward, done = env.step(action)
            total_return += reward
            return_history["uniform_with_rebalance"].append(total_return)

        # utils.print_eval_results(env, total_return)
    if "uniform_without_rebalance" in modes:
        return_history["uniform_without_rebalance"] = []

        print(
            "--------------------Uniform Weighting without Rebalancing--------------------"
        )
        observation = env.restart()
        done = 0
        total_return = 0
        action = [1 / (len(assets))] * (len(assets)) + [0]
        new_state, reward, done = env.step(action)
        total_return += reward
        return_history["uniform_without_rebalance"].append(total_return)

        while not done:
            action = []
            new_state, reward, done = env.step(action)
            total_return += reward
            return_history["uniform_without_rebalance"].append(total_return)

        print_eval_results(env, total_return)
    if "MPT" in modes:
        return_history["MPT"] = []
        print(
            "--------------------Efficient Frontier Tangent Portfolio--------------------"
        )
        observation = env.restart()
        done = 0
        total_return = 0

        file_path = project_root / "src" / "rl_model" / "env" / "30y-treasury-rate.csv"
        risk_free_rates = pd.read_csv(file_path)
        risk_free_rates["date"] = pd.to_datetime(risk_free_rates["date"]).dt.year
        risk_free_rates.columns = ["year", "risk_free_rate"]

        def calculate_tangent_portfolio(exp_r, cov, risk_free_rate):
            num_assets = len(exp_r)

            def portfolio_performance(weights, exp_r, cov, risk_free_rate):
                returns = np.dot(weights, exp_r)
                std = np.sqrt(np.dot(weights.T, np.dot(cov, weights)))
                sharpe_ratio = (returns - risk_free_rate) / std
                return -sharpe_ratio  # Negative because we minimize

            constraints = {"type": "eq", "fun": lambda x: np.sum(x) - 1}
            bounds = tuple((0, 1) for _ in range(num_assets))
            initial_guess = num_assets * [
                1.0 / num_assets,
            ]

            result = minimize(
                portfolio_performance,
                initial_guess,
                args=(exp_r, cov, risk_free_rate),
                method="SLSQP",
                bounds=bounds,
                constraints=constraints,
            )

            return result.x

        while not done:
            action = []
            window = 30
            if env.time > 3:
                t = max(env.time - window, 0)
                r = env.close_price[t : env.time].pct_change().dropna()
                exp_r = r.mean()
                cov = r.cov()
                d = pd.to_datetime(env.trading_dates[env.time])
                risk_free_rate = (
                    1
                    + risk_free_rates[risk_free_rates["year"] == d.year][
                        "risk_free_rate"
                    ].values[0]
                    / 100
                ) ** (1 / 252 * min(env.time, window)) - 1
                weights = calculate_tangent_portfolio(exp_r, cov, risk_free_rate)
                action = list(weights) + [0]
            new_state, reward, done = env.step(action)
            total_return += reward
            return_history["MPT"].append(total_return)
        print_eval_results(env, total_return)


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
        "model": 3,
    }
    with open(model_paths["params"], "w") as f:
        json.dump(parameters, f, indent=4)

    if parameters["model"] == 1 or parameters["model"] == 2:
        train_env = TradingSimulatorV2(
            principal=parameters["principal"],
            assets=parameters["assets"],
            start_date=parameters["train_start_date"],
            end_date=parameters["train_end_date"],
            rebalance_window=parameters["rebalance_window"],
            tx_fee_per_share=parameters["tx_fee_per_share"],
        )
        test_env = TradingSimulatorV2(
            principal=parameters["principal"],
            assets=parameters["assets"],
            start_date=parameters["test_start_date"],
            end_date=parameters["test_end_date"],
            rebalance_window=parameters["rebalance_window"],
            tx_fee_per_share=parameters["tx_fee_per_share"],
        )
        n_actions = len(parameters["assets"]) + 1
    elif parameters["model"] == 3:
        train_env = TradingSimulatorAmplifier(
            principal=parameters["principal"],
            assets=parameters["assets"],
            start_date=parameters["train_start_date"],
            end_date=parameters["train_end_date"],
            rebalance_window=parameters["rebalance_window"],
            tx_fee_per_share=parameters["tx_fee_per_share"],
        )
        test_env = TradingSimulatorAmplifier(
            principal=parameters["principal"],
            assets=parameters["assets"],
            start_date=parameters["test_start_date"],
            end_date=parameters["test_end_date"],
            rebalance_window=parameters["rebalance_window"],
            tx_fee_per_share=parameters["tx_fee_per_share"],
        )
        n_actions = len(parameters["assets"])

    agent = Agent(
        alpha=parameters["alpha"],
        beta=parameters["beta"],
        gamma=parameters["gamma"],
        tau=parameters["tau"],
        input_dims=[len(parameters["assets"]) * 8 + 1],
        batch_size=parameters["batch_size"],
        n_actions=n_actions,
        model=parameters["model"],
    )

    agent.save_models(
        actor_path=model_paths["actor"],
        target_actor_path=model_paths["target_actor"],
        critic_path=model_paths["critic"],
        target_critic_path=model_paths["target_critic"],
    )

    start_time = time.time()
    # train(
    #     agent=agent,
    #     env=train_env,
    #     num_epoch=parameters["num_epoch"],
    #     model_id=temp_model_id,
    # )
    end_time = time.time()
    print(f"Training time: {end_time - start_time} seconds")
    test(agent=agent, env=test_env, assets=parameters["assets"], model_id=temp_model_id)
