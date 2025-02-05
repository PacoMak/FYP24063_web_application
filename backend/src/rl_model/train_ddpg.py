import pandas as pd
from .ddpg.v2.agent_v2 import Agent
import numpy as np
from .env.trading_simulator_v2 import TradingSimulator
import os
from scipy.optimize import minimize
from .baseline import (
    uniform_with_rebalance_test,
    uniform_without_rebalance_test,
    basic_mpt_test,
)
from ..utils import plot_graph
import shutil

# Configurations
# Portfolio settings
assets = ["APA", "LNC", "RCL", "FCX", "GOLD", "FDP", "NEM", "BMY"]
rebalance_window = 1
tx_fee_per_share = 0.005
principal = 1000000
num_epoch = 5

# File paths
TRAINNING_MODELS_DIR = "trainning_models"
TRAINNING_MODELS_EVALUATION_DIR = f"{TRAINNING_MODELS_DIR}/evaluation"
TRAINNING_MODELS_RETURN_FILEPATH = (
    f"{TRAINNING_MODELS_EVALUATION_DIR}/return_over_epoch.png"
)
TRAINNING_MODELS_SHARPE_RATIO_FILEPATH = (
    f"{TRAINNING_MODELS_EVALUATION_DIR}/sharpe_ratio_over_epoch.png"
)
TRAINNING_MODELS_ACTOR_LOSS_FILEPATH = (
    f"{TRAINNING_MODELS_EVALUATION_DIR}/actor_loss_over_epoch.png"
)
TRAINNING_MODELS_CRITIC_LOSS_FILEPATH = (
    f"{TRAINNING_MODELS_EVALUATION_DIR}/critic_loss_over_epoch.png"
)

TRAINNING_ACTOR_FILEPATH = f"{TRAINNING_MODELS_DIR}/actor_ddpg"
TRAINNING_TARGET_ACTOR_FILEPATH = f"{TRAINNING_MODELS_DIR}/target_actor_ddpg"
TRAINNING_CRITIC_FILEPATH = f"{TRAINNING_MODELS_DIR}/critic_ddpg"
TRAINNING_TARGET_CRITIC_FILEPATH = f"{TRAINNING_MODELS_DIR}/target_critic_ddpg"


TRAINED_MODELS_DIR = "trained_models"
TRAINED_MODELS_EVALUATION_DIR = f"{TRAINED_MODELS_DIR}/evaluation"
TRAINED_MODELS_RETURN_OVER_EPOCH_FILEPATH = (
    f"{TRAINED_MODELS_EVALUATION_DIR}/return_over_epoch.png"
)
TRAINED_MODELS_SHARPE_RATIO_OVER_EPOCH_FILEPATH = (
    f"{TRAINED_MODELS_EVALUATION_DIR}/sharpe_ratio_over_epoch.png"
)
TRAINED_MODELS_RETURN_OVER_TIME_FILEPATH = (
    f"{TRAINED_MODELS_EVALUATION_DIR}/return_over_time.png"
)


TRAINED_ACTOR_FILEPATH = f"{TRAINED_MODELS_DIR}/actor_ddpg"
TRAINED_TARGET_ACTOR_FILEPATH = f"{TRAINED_MODELS_DIR}/target_actor_ddpg"
TRAINED_CRITIC_FILEPATH = f"{TRAINED_MODELS_DIR}/critic_ddpg"
TRAINED_TARGET_CRITIC_FILEPATH = f"{TRAINED_MODELS_DIR}/target_critic_ddpg"


def train(
    assets=assets,
    rebalance_window=rebalance_window,
    tx_fee_per_share=tx_fee_per_share,
    principal=principal,
    num_epoch=num_epoch,
    start_date="2004-07-01",
    end_date="2005-07-31",
):

    is_training_mode = True
    # Evaluation metrics
    return_history = {"ddpg": []}
    sharpe_ratio_history = {"ddpg": []}
    training_mode = {"ddpg": 1}
    actor_loss_history = {"ddpg": []}
    critic_loss_history = {"ddpg": []}

    # Trading environment initialization
    env = TradingSimulator(
        principal=principal,
        assets=assets,
        start_date=start_date,
        end_date=end_date,
        rebalance_window=rebalance_window,
        tx_fee_per_share=tx_fee_per_share,
    )

    # Default alpha=0.000025, beta=0.00025, gamma=0.99, tau=0.001, batch_size=64
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
        actor_path=TRAINNING_ACTOR_FILEPATH,
        target_actor_path=TRAINNING_TARGET_ACTOR_FILEPATH,
        critic_path=TRAINNING_CRITIC_FILEPATH,
        target_critic_path=TRAINNING_TARGET_CRITIC_FILEPATH,
    )
    np.random.seed(0)
    if not os.path.isdir(TRAINNING_MODELS_EVALUATION_DIR):
        os.makedirs(TRAINNING_MODELS_EVALUATION_DIR)
    if not os.path.isdir(TRAINED_MODELS_EVALUATION_DIR):
        os.makedirs(TRAINED_MODELS_EVALUATION_DIR)
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
            if i % 10 == 0 or i == 1:
                print("observation:", observation)
                print("action:", action, "\n")
            agent.remember(observation, action, reward, new_state, done)
            actor_loss, critic_loss = agent.learn()
            total_actor_loss += actor_loss
            total_critic_loss += critic_loss
            total_return += reward
            # print("reward:", reward)
            observation = new_state
        return_history["ddpg"].append(total_return)
        sharpe_ratio = env.sharpe_ratio()
        sharpe_ratio_history["ddpg"].append(sharpe_ratio)
        actor_loss_history["ddpg"].append(total_actor_loss)
        critic_loss_history["ddpg"].append(total_critic_loss)

        if i % 5 == 0:
            agent.save_models(
                actor_path=TRAINNING_ACTOR_FILEPATH,
                target_actor_path=TRAINNING_TARGET_ACTOR_FILEPATH,
                critic_path=TRAINNING_CRITIC_FILEPATH,
                target_critic_path=TRAINNING_TARGET_CRITIC_FILEPATH,
            )
            xAxis = range(1, i + 1)
            plot_graph(
                title="Total return over epoch",
                x_label="Epoch",
                y_label="Total return",
                xAxis=xAxis,
                yAxis=return_history,
                filename=TRAINNING_MODELS_RETURN_FILEPATH,
            )

            plot_graph(
                title="Sharpe Ratio over epoch",
                x_label="Epoch",
                y_label="Sharpe Ratio",
                xAxis=xAxis,
                yAxis=sharpe_ratio_history,
                filename=TRAINNING_MODELS_SHARPE_RATIO_FILEPATH,
            )

            plot_graph(
                title="Actor Loss",
                x_label="Progress",
                y_label="Actor Loss",
                xAxis=xAxis,
                yAxis=actor_loss_history,
                filename=TRAINNING_MODELS_ACTOR_LOSS_FILEPATH,
            )

            plot_graph(
                title="Critic Loss",
                x_label="Progress",
                y_label="Critic Loss",
                xAxis=xAxis,
                yAxis=critic_loss_history,
                filename=TRAINNING_MODELS_CRITIC_LOSS_FILEPATH,
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
    shutil.rmtree(TRAINNING_MODELS_DIR)


def test(
    assets=assets,
    rebalance_window=rebalance_window,
    tx_fee_per_share=tx_fee_per_share,
    principal=principal,
    start_date="2004-07-01",
    end_date="2005-07-31",
):
    testing_mode = {
        "ddpg": 1,
        "uniform_with_rebalance": 1,
        "uniform_without_rebalance": 1,
        "basic_MPT": 0,
    }
    if not os.path.isdir(TRAINED_MODELS_EVALUATION_DIR):
        os.makedirs(TRAINED_MODELS_EVALUATION_DIR)
    return_history = {}
    sharpe_ratio_history = {}

    is_training_mode = False

    env = TradingSimulator(
        principal=principal,
        assets=assets,
        start_date=start_date,
        end_date=end_date,
        rebalance_window=rebalance_window,
        tx_fee_per_share=tx_fee_per_share,
    )

    # Default alpha=0.000025, beta=0.00025, gamma=0.99, tau=0.001, batch_size=64
    agent = Agent(
        alpha=0.0005,
        beta=0.0025,
        gamma=0.99,
        tau=0.09,
        input_dims=[len(assets) * 5 + 2],
        batch_size=128,
        n_actions=len(assets) + 1,
    )
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
    plot_graph(
        title="Cumulative return over time",
        x_label="Time",
        y_label="Cumulative return",
        xAxis=range(1, len(return_history[list(return_history.keys())[0]]) + 1),
        yAxis=return_history,
        filename=TRAINED_MODELS_RETURN_OVER_TIME_FILEPATH,
    )
    # if testing_mode["basic_MPT"] == 1:
    #     return_history["basic_MPT"] = basic_mpt_test(env, assets, rebalance_window)


# xAxis = range(
# 			1, len(return_history[list(return_history.keys())[0]]) + 1
# 		)  # Get the number of times of portfolio rebalance

# 		plt.title("Cumulative return over time")
# 		plt.xlabel("Time")
# 		plt.ylabel("Cumulative return")

# 		for mode in testing_mode:
# 			if testing_mode[mode] == 1:
# 				plt.plot(xAxis, return_history[mode], label=mode)

# 		plt.legend()
# 		plt.savefig("evaluation/test_cumulative_return.png", dpi=300, bbox_inches="tight")
# 		plt.clf()
# 		pass

if __name__ == "__main__":
    train()
    test()
