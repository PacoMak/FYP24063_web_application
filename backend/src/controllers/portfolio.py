from flask import Blueprint, Response, json, request
from ..rl_model import train_dppg
import threading

portfolio = Blueprint("portfolio", __name__)


@portfolio.route("/portfolio", methods=["POST"])
def train_portfolio():
    try:
        # Start the training in a separate thread
        assets = [
            "FUTU",
            "NVDA",
        ]
        rebalance_window = 10
        tx_fee_per_share = 0.005
        principal = 1000000
        num_epoch = 1
        training_thread = threading.Thread(
            target=train_dppg,
            kwargs={
                "assets": assets,
                "rebalance_window": rebalance_window,
                "tx_fee_per_share": tx_fee_per_share,
                "principal": principal,
                "num_epoch": num_epoch,
            },
        )
        training_thread.start()
        return Response(response="Training started", status=200)
    except Exception as e:
        return Response(response=f"Internal error: {e}", status=501)
