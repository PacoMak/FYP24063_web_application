import numpy as np
from ...utils import print_eval_results, project_root
import pandas as pd
from scipy.optimize import minimize


def mpt_test(env, assets):
    return_history = []
    print(
        "--------------------Efficient Frontier Tangent Portfolio--------------------"
    )
    observation = env.restart()
    done = 0
    total_return = 0

    file_path = project_root / "src" / "rl_model" / "env" / "10y-treasury-rate.csv"
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
        return_history.append(total_return)
    print_eval_results(env, total_return)
    yearly_return, _ = env.yearly_return_history()
    monthly_return, _ = env.monthly_return_history()
    return return_history, yearly_return, monthly_return
