from flask import Blueprint, Response, json, request
from ..services import ModelService
from ..errors import FileNotFoundException, ModelNotFoundException
import uuid_utils as uuid

model = Blueprint("model", __name__)
model_service = ModelService()


@model.route("/model/train", methods=["POST"])
def train_model():
    try:
        model_id = str(uuid.uuid4())
        body = request.get_json(force=True)
        assets = body.get("assets")

        rebalance_window = body.get("rebalance_window")
        tx_fee_per_share = body.get("tx_fee_per_share", 0.005)
        principal = body.get("principal")
        num_epoch = body.get("num_epoch")
        start_date = body.get("start_date")
        end_date = body.get("end_date")
        alpha = body.get("alpha")
        beta = body.get("beta")
        gamma = body.get("gamma")
        tau = body.get("tau")
        batch_size = body.get("batch_size")
        model_name = body.get("model_name")
        model_type = body.get("model_type")
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
            model_id=model_id,
            model_name=model_name,
            model_type=model_type,
        )
        return Response(response=model_id, status=200)
    except Exception as e:
        return Response(response=f"Internal error: {e}", status=501)


@model.route("/model/<model_id>", methods=["DELETE"])
def delete_model(model_id):
    try:
        model_service.delete_model(model_id)
        return Response(status=200)
    except ModelNotFoundException as e:
        return Response(response=f"Error: {e}", status=e.status_code)
    except Exception as e:
        return Response(response=f"Internal error: {e}", status=501)


@model.route("/model/train/<model_id>/logs", methods=["GET"])
def get_model_train_logs(model_id):
    return Response(
        model_service.get_training_logs_stream(model_id),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


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
        result, time_range = model_service.test_model(start_date, end_date, model_id)
        return Response(
            response=json.dumps({"result": result, "time_range": time_range}),
            status=200,
        )
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
