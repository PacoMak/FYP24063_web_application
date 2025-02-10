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
    sharpe_ratio = env.sharpe_ratio()
    portfolio_value = env.total_portfolio_value()
    print(
        f"------Portfolio Value {portfolio_value:.2f}; Total Return {total_return:.2f}; Sharpe Ratio {sharpe_ratio:.5f};------\n"
    )
    return return_history
