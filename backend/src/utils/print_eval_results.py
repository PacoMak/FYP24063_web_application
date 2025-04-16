def print_eval_results(env, total_return):
    sharpe_ratio = env.sharpe_ratio()
    omega_ratio = env.omega_ratio(15)
    mdd = env.maximum_drawdown()
    portfolio_value = env.total_portfolio_value()
    avg_yearly_return = env.avg_yearly_return()
    avg_monthly_return = env.avg_monthly_return()
    print(
        f"------Portfolio Value {portfolio_value:.2f}; Total Return {total_return:.2f};------"
    )
    print(
        f"------Sharpe Ratio {sharpe_ratio:.5f}; Omega Ratio {omega_ratio:.5f} MDD {mdd:.5f}------"
    )
    print(
        f"------Average yearly return {avg_yearly_return:.5f}%; Average monthly return {avg_monthly_return:.5f}%------\n"
    )
