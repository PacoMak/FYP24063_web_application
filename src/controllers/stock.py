from flask import Blueprint, Response
from ..services.stockServices import getSingleStock, supportStock

stock = Blueprint("stock", __name__)


@stock.route("/<stockName>")
def getStock(stockName):
    try:
        if stockName in supportStock:
            stockData = getSingleStock(stockName)
            return Response(response=stockData, status=200, mimetype="application/json")
        else:
            return Response(
                response="stockName is not supported",
                status=404,
                mimetype="application/json",
            )
    except:
        return Response(response="internal error", status=501)
