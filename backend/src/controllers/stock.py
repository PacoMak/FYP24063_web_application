from flask import Blueprint, Response, json, request
from ..services import stock_services

stock = Blueprint("stock", __name__)


@stock.route("/stocks/history", methods=["GET"])
def get_stocks_history():
    try:
        tickers_list = request.args.getlist("tickers")
        if not tickers_list:
            return Response(status="401")
        stockData = stock_services.get_stocks_data(tickers_list)
        json_data = {ticker: json.loads(data) for ticker, data in stockData.items()}
        return Response(
            response=json.dumps(json_data), status=200, mimetype="application/json"
        )
    except:
        return Response(response="internal error", status=501)


@stock.route("/stock/history", methods=["GET"])
def get_stock_history():
    try:
        ticker = request.args.get("ticker")
        if not ticker:
            return Response(status="401")
        stockData = stock_services.get_stock_data(ticker)
        return Response(
            response=json.dumps(
                json.loads(stockData) if isinstance(stockData, str) else stockData
            ),
            status=200,
            mimetype="application/json",
        )
    except:
        return Response(response="internal error", status=501)


@stock.route("/stock/info", methods=["GET"])
def get_stock_info():
    try:
        print(1)
        ticker = request.args.get("ticker")
        print(2)
        if not ticker:
            return Response(status="401")

        print(3)
        print(ticker)
        stock_info = stock_services.get_stock_info(ticker)
        print(4)

        return Response(
            response=json.dumps(
                json.loads(stock_info) if isinstance(stock_info, str) else stock_info
            ),
            status=200,
            mimetype="application/json",
        )
    except:
        return Response(response="internal error", status=501)
