import matplotlib.pyplot as plt


def plot_graph(title, x_label, y_label, xAxis, yAxis, filename):
    plt.title(title)
    plt.xlabel(x_label)
    plt.ylabel(y_label)
    for label, data in yAxis.items():
        plt.plot(xAxis, data, label=label)
    plt.legend()
    plt.savefig(
        filename,
        dpi=300,
        bbox_inches="tight",
    )
    plt.clf()
    pass


# def plot_multiline_graph(title, x_label, y_label, xAxis, yAxis, label, filename):
#     plt.title(title)
#     plt.xlabel(x_label)
#     plt.ylabel(y_label)
#     for mode in training_mode:
#         if training_mode[mode] == 1:
#             plt.plot(xAxis, yAxis[mode], label=mode)
#     plt.legend()
#     plt.savefig(
#         filename,
#         dpi=300,
#         bbox_inches="tight",
#     )
#     plt.clf()
#     pass
