import numpy as np
from ...utils import print_eval_results


def follow_last_day_best_return_test(env, assets):
    return_history = []

    print("--------------------follow last day best return--------------------")
    observation = env.restart()
    done = 0
    total_return = 0
    n = len(assets)

    prev_action = [1 / (len(assets) + 1)] * (len(assets) + 1)

    while not done:
        action = prev_action.copy()

        curr_close_price = np.append(np.array(env.close_price.iloc[env.time]), 1)
        prev_close_price = np.append(np.array(env.close_price.iloc[env.time - 1]), 1)

        logr = np.log(
            np.divide(prev_close_price, curr_close_price)
        )  # logarithmic returns

        # Increase the asset with the maximum logarithmic return
        max_index = np.argmax(logr)
        action[max_index] += 0.1

        total_decrease_needed = 0.1
        sorted_indices = np.argsort(logr)

        for idx in sorted_indices:
            amount_available = action[idx]
            subtraction = min(amount_available, total_decrease_needed)
            action[idx] -= subtraction
            total_decrease_needed -= subtraction

            if total_decrease_needed == 0:
                break

        prev_action = action

        new_state, reward, done = env.step(action)
        total_return += reward
        return_history.append(total_return)
    print_eval_results(env, total_return)
    yearly_return, _ = env.yearly_return_history()
    monthly_return, _ = env.monthly_return_history()
    return return_history, yearly_return, monthly_return
