import yfinance as yf
import time


class StockService:
    def __init__(self, period="5y"):
        self.interval_mapper = {
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
        self.period = period

    def get_stocks_data(self, tickers_list, interval=86400):
        tickers = yf.Tickers(" ".join(tickers_list))
        data = {}
        for ticker in tickers_list:
            hist = tickers.tickers[ticker].history(
                period=self.period, interval=self.interval_mapper[interval]
            )
            hist.reset_index(inplace=True)
            data[ticker] = hist.to_json(orient="records", lines=False)
        return data

    def get_stock_data(self, ticker, interval=86400):
        ticker = yf.Ticker(ticker)
        hist = ticker.history(
            period=self.period, interval=self.interval_mapper[interval]
        )
        return hist.to_json(orient="records", lines=False)

    def get_stocks_info(self, tickers_list):
        tickers = yf.Tickers(" ".join(tickers_list))
        data = {}
        for ticker in tickers_list:
            data[ticker] = tickers.tickers[ticker].info
        return data

    # for latest data
    def get_stock_stream(self, tickers_list, interval=86400):
        while True:
            tickers = yf.Tickers(" ".join(tickers_list))
            data = {}
            for ticker in tickers_list:
                hist = tickers.tickers[ticker].history(
                    period=self.period, interval=self.interval_mapper[interval]
                )
                hist.reset_index(inplace=True)
                latest_data = hist.iloc[[-1]].reset_index(drop=True)
                data[ticker] = latest_data.to_numpy()
            yield data
            time.sleep(interval)

    def get_stock_info(self, ticker):
        ticker = yf.Ticker(ticker)
        return ticker.info


if __name__ == "__main__":
    # tickers = ["MSFT", "AAPL", "GOOG", "MMM", "GS", "NKE", "AXP", "HON", "CRM", "JPM"]
    # for data in get_stock_stream(tickers):
    #     print(data)
    spy = yf.Ticker("AAPL")
    print(spy.info)
