def print_eval_results(env, total_return):
    sharpe_ratio = env.sharpe_ratio()
    mdd = env.maximum_drawdown()
    portfolio_value = env.total_portfolio_value()
    yearly_returns, _ = env.yearly_return_history()
    monthly_returns, _ = env.monthly_return_history()
    print(
        f"------Portfolio Value {portfolio_value:.2f}; Total Return {total_return:.2f}; Sharpe Ratio {sharpe_ratio:.5f}; MDD {mdd:.5f}------"
    )
    print(
        f"------Average yearly return {yearly_returns.mean() :.5f}%; Average monthly return {monthly_returns.mean() :.5f}%------\n"
    )
