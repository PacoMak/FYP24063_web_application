import yfinance as yf
import time

supportStock = ["MSFT", "AAPL", "GOOG", "MMM", "GS", "NKE", "AXP", "HON", "CRM", "JPM"]
interval_mapper = {
    60: "1m",
    120: "2m",
    300: "5m",
    900: "15m",
    1800: "30m",
    3600: "60m",
    5400: "90m",
    86400: "1d",
    432000: "5d",
    604800: "1wk",
}
PERIOD = "5y"


def getStocksData(tickers_list, interval=86400):
    tickers = yf.Tickers(" ".join(tickers_list))
    data = {}
    for ticker in tickers_list:
        hist = tickers.tickers[ticker].history(
            period=PERIOD, interval=interval_mapper[interval]
        )
        hist.reset_index(inplace=True)
        data[ticker] = hist.to_json(orient="records", lines=False)
    return data


def getStockData(ticker, interval=86400):
    ticker = yf.Ticker(ticker)
    hist = ticker.history(period=PERIOD, interval=interval_mapper[interval])
    return hist.to_json(orient="records", lines=False)


# for latest data
def get_stock_stream(tickers_list, interval=86400):
    while True:
        tickers = yf.Tickers(" ".join(tickers_list))
        data = {}
        for ticker in tickers_list:
            hist = tickers.tickers[ticker].history(
                period=PERIOD, interval=interval_mapper[interval]
            )
            hist.reset_index(inplace=True)
            latest_data = hist.iloc[[-1]].reset_index(drop=True)
            data[ticker] = latest_data.to_numpy()
        yield data
        time.sleep(interval)


if __name__ == "__main__":
    tickers = supportStock
    for data in get_stock_stream(tickers):
        print(data)
