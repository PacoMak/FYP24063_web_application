from flask import Blueprint, Response, json, request
from ..services import getStocksData, supportStock, getStockData

stock = Blueprint("stock", __name__)


@stock.route("/stockList", methods=["GET"])
def getStockList():
    try:
        tickers_list = request.args.getlist("tickers")
        if not tickers_list:
            return Response(status="401")
        for ticker in tickers_list:
            if ticker not in supportStock:
                return Response(
                    response=f"{ticker} is not supported",
                    status=401,
                    mimetype="application/json",
                )
        stockData = getStocksData(tickers_list)
        json_data = {ticker: json.loads(data) for ticker, data in stockData.items()}
        return Response(
            response=json.dumps(json_data), status=200, mimetype="application/json"
        )
    except:
        return Response(response="internal error", status=501)


@stock.route("/stock", methods=["GET"])
def getStock():
    try:
        ticker = request.args.get("ticker")
        if not ticker:
            return Response(status="401")
        if ticker not in supportStock:
            return Response(
                response=f"{ticker} is not supported",
                status=401,
                mimetype="application/json",
            )
        stockData = getStockData(ticker)
        return Response(
            response=json.dumps(
                json.loads(stockData) if isinstance(stockData, str) else stockData
            ),
            status=200,
            mimetype="application/json",
        )
    except:
        return Response(response="internal error", status=501)
