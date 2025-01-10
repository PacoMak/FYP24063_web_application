from flask import Blueprint, Response, json, request
from ..rl_model import train_dppg
import threading
import os

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
        num_epoch = 5
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


@portfolio.route("/portfolio", methods=["GET"])
def get_portfolio():
    try:
        if os.path.exists("trainning_models"):
            return Response(response="model is training", status=200)
        elif os.path.exists("trained_models"):
            evaluation_file = os.path.join("trained_models", "evaluation.json")
            if os.path.exists(evaluation_file):
                with open(evaluation_file, "r") as f:
                    evaluation_data = json.load(f)
                return Response(
                    response=json.dumps(evaluation_data),
                    status=200,
                    mimetype="application/json",
                )
            else:
                return Response(response="evaluation.json not found", status=404)
        else:
            return Response(response="no model is trained", status=200)
    except Exception as e:
        return Response(response=f"Internal error: {e}", status=501)
