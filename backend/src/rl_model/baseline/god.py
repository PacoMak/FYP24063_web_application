import numpy as np
from ...utils import print_eval_results


def god_test(env, assets):
    return_history = []
    observation = env.restart()
    done = 0
    total_return = 0
    n = len(assets)

    print("--------------------GOD--------------------")
    while not done:
        action = [0] * (n + 1)
        if env.time < len(env.close_price) - 2:
            action_close_price = np.array([x for x in env.close_price.iloc[env.time]])
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
        return_history.append(total_return)
    print_eval_results(env, total_return)
    yearly_return, _ = env.yearly_return_history()
    monthly_return, _ = env.monthly_return_history()
    return return_history, yearly_return, monthly_return
