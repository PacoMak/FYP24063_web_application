import os
import pandas as pd
import numpy as np
from scipy.optimize import minimize


def basic_mpt_test(env, assets, rebalance_window):
    return_history = []
    print(
        "--------------------Efficient Frontier Tangent Portfolio--------------------"
    )
    observation = env.restart()
    done = 0
    total_return = 0

    risk_free_rates = pd.read_csv(
        f"{os.path.dirname(os.path.abspath(__file__))}/../env/30y-treasury-rate.csv"
    )
    risk_free_rates.columns = ["date", "risk_free_rate"]
    rebalance_dates_df = pd.DataFrame(env.rebalance_dates, columns=["date"])
    risk_free_rates = pd.merge(
        rebalance_dates_df, risk_free_rates, on="date", how="left"
    )
    risk_free_rates["risk_free_rate"] = (
        risk_free_rates["risk_free_rate"] * env.rebalance_window / 365
    )
    risk_free_rates["risk_free_rate"] = (
        risk_free_rates["risk_free_rate"].interpolate().bfill().ffill()
    )

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
        # t = max(env.time - 4, 0) # MPT should use more days to calulate the covariance matrix (but fair test with DDPG the range should depends on the window of the matrix for DDPG)
        t = env.time
        r = (
            env.close_price[t * rebalance_window : (t + 1) * rebalance_window]
            .pct_change()
            .dropna()
        )
        exp_r = r.mean()
        cov = r.cov()
        d = env.rebalance_dates[t]
        risk_free_rate = risk_free_rates[risk_free_rates["date"] == d][
            "risk_free_rate"
        ].values[0]

        # Calculate tangent portfolio weights
        weights = calculate_tangent_portfolio(exp_r, cov, risk_free_rate)

        action = list(weights) + [0]
        new_state, reward, done = env.step(action)
        total_return += reward
        return_history.append(total_return)
    sharpe_ratio = env.sharpe_ratio()
    print(
        f"------Total Return {total_return:.2f}; Sharpe Ratio {sharpe_ratio:.5f};------\n"
    )
