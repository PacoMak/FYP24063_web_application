import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import matplotlib

matplotlib.use("agg")


def plot_return_over_episodes(episode_axis, return_axis, label, path):
    plt.title("Total return over episodes")
    plt.xlabel("Episode")
    plt.ylabel("Total return")
    plt.plot(episode_axis, return_axis, label=label)
    plt.legend()
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.clf()


def plot_sharpe_ratio_over_episodes(episode_axis, sharpe_ratio_axis, label, path):
    plt.title("Sharpe Ratio over episodes")
    plt.xlabel("Episode")
    plt.ylabel("Sharpe Ratio")
    plt.plot(episode_axis, sharpe_ratio_axis, label=label)
    plt.legend()
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.clf()


def plot_mean_actor_loss_over_episodes(episode_axis, actor_loss_axis, label, path):
    plt.title("Mean Actor Loss over episodes")
    plt.xlabel("Episode")
    plt.ylabel("Mean Actor Loss")
    plt.plot(episode_axis, actor_loss_axis, label=label)
    plt.legend()
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.clf()


def plot_mean_critic_loss_over_episodes(episode_axis, critic_loss_axis, label, path):
    plt.title("Mean Critic Loss over episodes")
    plt.xlabel("Episode")
    plt.ylabel("Mean Critic Loss")
    plt.plot(episode_axis, critic_loss_axis, label=label)
    plt.legend()
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.clf()


def plot_return_over_time(env, return_history, path):
    plt.figure(figsize=(10, 6))
    plt.title("Cumulative return over time")
    plt.xlabel("Date")
    plt.ylabel("Cumulative return")
    date_axis = env.trading_date_range()
    plt.xticks(rotation=45)
    ax = plt.gca()
    ax.xaxis.set_major_locator(ticker.MaxNLocator(nbins=20))
    for mode in return_history:
        plt.plot(date_axis, return_history[mode], label=mode)
    plt.legend()
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.clf()


def plot_yearly_return_rate(env, yearly_return_rate_history, path):
    plt.title("Yearly return rate over time")
    plt.xlabel("Year")
    plt.ylabel("Return rate (in %)")
    _, year_axis = env.yearly_return_history()
    plt.xticks(rotation=45)
    for mode in yearly_return_rate_history:
        plt.plot(year_axis, yearly_return_rate_history[mode], label=mode)
    plt.legend()
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.clf()


def plot_monthly_return_rate(env, monthly_return_rate_history, path):
    plt.title("Monthly return rate over time")
    plt.xlabel("Month")
    plt.ylabel("Return rate (in %)")
    _, month_axis = env.monthly_return_history()
    plt.xticks(rotation=45)
    ax = plt.gca()
    ax.xaxis.set_major_locator(ticker.MaxNLocator(nbins=20))
    for mode in monthly_return_rate_history:
        plt.plot(month_axis, monthly_return_rate_history[mode], label=mode)
    plt.legend()
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.clf()
