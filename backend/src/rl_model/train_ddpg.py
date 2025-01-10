from .ddpg import Agent
import numpy as np
from .env import TradingSimulator
import matplotlib.pyplot as plt
import os
import json
import shutil


def train_dppg(assets, rebalance_window, tx_fee_per_share, principal, num_epoch):
    if os.path.exists("trained_models"):
        shutil.rmtree("trained_models")
    env = TradingSimulator(
        principal=principal,
        assets=assets,
        start_date="2024-01-01",
        end_date="2024-11-11",
        rebalance_window=rebalance_window,
        tx_fee_per_share=tx_fee_per_share,
    )

    # Default alpha=0.000025, beta=0.00025, tau=0.001, batch_size=64
    agent = Agent(
        alpha=0.000025,
        beta=0.00025,
        input_dims=[4, len(assets), rebalance_window, len(assets)],
        tau=0.001,
        batch_size=8,
        n_actions=len(assets) + 1,
    )

    # agent.load_models()
    np.random.seed(0)

    score_history = []
    sharpe_ratio_history = []
    for i in range(num_epoch):
        print(f"-----------------Episode {i+1}-----------------")
        observation = env.restart()
        done = 0
        score = 0
        while not done:
            action = agent.choose_action(observation)
            print("action:", action)
            new_state, reward, done = env.step(action)
            print("reward:", reward)
            agent.remember(observation, action, reward, new_state, done)
            agent.learn()
            score += reward
            observation = new_state
        score_history.append(score)
        sharpe_ratio = env.sharpe_ratio()
        sharpe_ratio_history.append(sharpe_ratio)

        # Save models every 25 epochs
        if i % 25 == 0:
            agent.save_models("trainning_models/")
            parameters = {
                "assets": assets,
                "rebalance_window": rebalance_window,
                "tx_fee_per_share": tx_fee_per_share,
                "principal": principal,
                "num_epoch": num_epoch,
                "alpha": agent.alpha,
                "beta": agent.beta,
                "tau": agent.tau,
                "batch_size": agent.batch_size,
                "current_epoch": i,
            }
            with open("trainning_models/parameters.json", "w") as f:
                json.dump(parameters, f, indent=4)
        print(
            f"------Episode {i+1} Summary: Score {score:.2f}; Sharpe Ratio {sharpe_ratio:.5f}; Trailing 100 games avg {np.mean(score_history[-100:]):.3f} ------"
        )

    # Save the final models
    agent.save_models("trained_models/")

    # Save the parameters to a JSON file
    parameters = {
        "assets": assets,
        "rebalance_window": rebalance_window,
        "tx_fee_per_share": tx_fee_per_share,
        "principal": principal,
        "num_epoch": num_epoch,
        "alpha": agent.alpha,
        "beta": agent.beta,
        "tau": agent.tau,
        "batch_size": agent.batch_size,
    }

    with open("trained_models/parameters.json", "w") as f:
        json.dump(parameters, f, indent=4)

    shutil.rmtree("trainning_models")
    # Generating evaluation graphs
    if not os.path.isdir("evaluation"):
        os.makedirs("evaluation")

    evaluate_model(score_history, sharpe_ratio_history, num_epoch)


def evaluate_model(score_history, sharpe_ratio_history, num_epoch):
    xAxis = range(1, num_epoch + 1)
    plt.title("Total return over epoch")
    plt.xlabel("Epoch")
    plt.ylabel("Total return")
    plt.plot(xAxis, score_history)
    plt.savefig("evaluation/total_return.png", dpi=300, bbox_inches="tight")
    plt.clf()

    plt.title("Sharpe Ratio over epoch")
    plt.xlabel("Epoch")
    plt.ylabel("Sharpe Ratio")
    plt.plot(xAxis, sharpe_ratio_history)
    plt.savefig("evaluation/sharpe_ratio.png", dpi=300, bbox_inches="tight")

    evaluation = {
        "total_return": score_history,
        "sharpe_ratio": sharpe_ratio_history,
    }
    with open("trained_models/evaluation.json", "w") as f:
        json.dump(evaluation, f, indent=4)


if __name__ == "__main__":
    assets = [
        "FUTU",
        "NVDA",
    ]
    rebalance_window = 10
    tx_fee_per_share = 0.005
    principal = 1000000
    num_epoch = 5
    train_dppg(
        assets=assets,
        rebalance_window=rebalance_window,
        tx_fee_per_share=tx_fee_per_share,
        principal=principal,
        num_epoch=num_epoch,
    )
