import yfinance as yf

supportStock = ["MSFT", "TSLA", "CEG", "VST", "GME", "APGE", "MASI"]


def getSingleStock(stockName):
    stock = yf.Ticker(stockName)
    hist = stock.history(period="1mo", interval="5m")
    hist.reset_index(inplace=True)
    return hist.to_json(orient="records", lines=False)
