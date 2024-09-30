from flask import Blueprint, Response, json, request
from ..services.stockServices import getStocksData, supportStock

stock = Blueprint("stock", __name__)


@stock.route("/")
def getStock():
    try:
        stocks_list = request.args.getlist("stockNames")
        if not stocks_list:
            return Response(status="401")
        for stock in stocks_list:
            if stock not in supportStock:
                return Response(
                    response="stockName is not supported",
                    status=401,
                    mimetype="application/json",
                )

        stockData = getStocksData(stocks_list)
        json_data = {ticker: json.loads(data) for ticker, data in stockData.items()}

        return Response(
            response=json.dumps(json_data), status=200, mimetype="application/json"
        )
    except:
        return Response(response="internal error", status=501)
