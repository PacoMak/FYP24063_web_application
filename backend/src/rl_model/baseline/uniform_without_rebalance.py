import numpy as np
from ...utils import print_eval_results


def uniform_without_rebalance_test(env, assets):
    return_history = []
    print(
        "--------------------Uniform Weighting without Rebalancing--------------------"
    )

    observation = env.restart()
    done = 0
    total_return = 0
    action = [1 / (len(assets))] * (len(assets)) + [0]
    new_state, reward, done = env.step(action)
    total_return += reward
    return_history.append(total_return)

    while not done:
        action = []
        new_state, reward, done = env.step(action)
        total_return += reward
        return_history.append(total_return)

    print_eval_results(env, total_return)
    yearly_return, _ = env.yearly_return_history()
    monthly_return, _ = env.monthly_return_history()
    return return_history, yearly_return, monthly_return
