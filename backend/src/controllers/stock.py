from flask import Blueprint, Response, json, request
from ..services import StockService

stock = Blueprint("stock", __name__)
stock_service = StockService()


@stock.route("/stocks/history", methods=["GET"])
def get_stocks_history():
    try:
        tickers_list = request.args.getlist("tickers")
        if not tickers_list:
            return Response(status="401")
        stockData = stock_service.get_stocks_data(tickers_list)
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
        stockData = stock_service.get_stock_data(ticker)
        return Response(
            response=json.dumps(
                json.loads(stockData) if isinstance(stockData, str) else stockData
            ),
            status=200,
            mimetype="application/json",
        )
    except:
        return Response(response="internal error", status=501)


@stock.route("/stocks/info", methods=["GET"])
def get_stocks_info():
    try:
        tickers_list = request.args.getlist("tickers")
        if not tickers_list:
            return Response(status="401")
        stocks_info = stock_service.get_stocks_info(tickers_list)
        return Response(
            response=json.dumps(stocks_info), status=200, mimetype="application/json"
        )
    except:
        return Response(response="internal error", status=501)


@stock.route("/stock/info", methods=["GET"])
def get_stock_info():
    try:
        ticker = request.args.get("ticker")
        if not ticker:
            return Response(status="401")
        stock_info = stock_service.get_stock_info(ticker)

        return Response(
            response=json.dumps(
                json.loads(stock_info) if isinstance(stock_info, str) else stock_info
            ),
            status=200,
            mimetype="application/json",
        )
    except:
        return Response(response="internal error", status=501)
