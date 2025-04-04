from flask import Blueprint, Response, json, request
from ..services import ModelService
from ..errors import FileNotFoundException

model = Blueprint("model", __name__)
model_service = ModelService()


@model.route("/model/train", methods=["POST"])
def train_model():
    try:
        body = request.get_json(force=True)
        assets = body.get(
            "assets",
            ["APA", "TSLA"],
        )
        rebalance_window = body.get("rebalance_window", 1)
        tx_fee_per_share = body.get("tx_fee_per_share", 0.005)
        principal = body.get("principal", 1000000)
        num_epoch = body.get("num_epoch", 5)
        start_date = body.get("start_date", "2020-07-01")
        end_date = body.get("end_date", "2024-07-31")
        alpha = body.get("alpha", 0.0005)
        beta = body.get("beta", 0.0025)
        gamma = body.get("gamma", 0.99)
        tau = body.get("tau", 0.09)
        batch_size = body.get("batch_size", 128)
        model_service.train_model(
            assets=assets,
            rebalance_window=rebalance_window,
            tx_fee_per_share=tx_fee_per_share,
            principal=principal,
            num_epoch=num_epoch,
            start_date=start_date,
            end_date=end_date,
            alpha=alpha,
            beta=beta,
            gamma=gamma,
            tau=tau,
            batch_size=batch_size,
        )
        return Response(response="Training started", status=200)
    except Exception as e:
        return Response(response=f"Internal error: {e}", status=501)


@model.route("/model/train/<model_id>", methods=["GET"])
def get_model_train_metrics(model_id):
    try:
        return_over_epoch = model_service.get_return_over_epoch_json(model_id)
        sharpe_ratio_over_epoch = model_service.get_sharpe_ratio_over_epoch_json(
            model_id
        )
        response = {
            "return_over_epoch": return_over_epoch,
            "sharpe_ratio_over_epoch": sharpe_ratio_over_epoch,
        }
        return Response(response=json.dumps(response), status=200)
    except FileNotFoundException as e:
        return Response(response=f"File not found: {e}", status=e.status_code)
    except Exception as e:
        return Response(response=f"Internal error: {e}", status=501)


@model.route("/model/train/<model_id>/params", methods=["GET"])
def get_model_train_params(model_id):
    try:
        params = model_service.get_trainning_params(model_id)
        return Response(response=json.dumps(params), status=200)
    except FileNotFoundException as e:
        return Response(response=f"File not found: {e}", status=e.status_code)
    except Exception as e:
        return Response(response=f"Internal error: {e}", status=501)


@model.route("/model/test/<model_id>", methods=["POST"])
def test_model(model_id):
    try:
        body = request.get_json(force=True)
        start_date = body.get("start_date", "2020-07-01")
        end_date = body.get("end_date", "2024-07-31")
        model_service.test_model(start_date, end_date, model_id)
        return Response(response=json.dumps("testing started"), status=200)
    except Exception as e:
        return Response(response=f"Internal error: {e}", status=501)


@model.route("/model/test/<model_id>", methods=["GET"])
def get_model_test_metrics(model_id):
    try:
        response = model_service.get_return_over_time_json(model_id)
        return Response(response=json.dumps(response), status=200)
    except FileNotFoundException as e:
        return Response(response=f"File not found: {e}", status=e.status_code)
    except Exception as e:
        return Response(response=f"Internal error: {e}", status=501)


@model.route("/models", methods=["GET"])
def get_models():
    try:
        res = []
        models = model_service.get_models()
        for model_id in models:
            params = model_service.get_trainning_params(model_id)
            res.append(
                {
                    "model_id": model_id,
                    **params,
                }
            )
        return Response(response=json.dumps(res), status=200)
    except Exception as e:
        return Response(response=f"Internal error: {e}", status=501)
