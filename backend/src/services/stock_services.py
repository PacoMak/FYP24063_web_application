import yfinance as yf
from ..utils import project_root
import csv
import json
from io import StringIO


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
        self.areas = [
            "AMEX",
            "ASX",
            "CFE",
            "EUREX",
            "FOREX",
            "INDEX",
            "LSE",
            "MGEX",
            "NASDAQ",
            "NYBOT",
            "NYSE",
            "OTCBB",
            "SGX",
            "TSX",
            "TSXV",
            "USMF",
            "WCE",
        ]

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

    def get_stock_info(self, ticker):
        ticker = yf.Ticker(ticker)
        return ticker.info

    def get_exchange_tickers(self):
        stocks = {}
        for area in self.areas:
            ticker_file = project_root / "src" / "tickers" / f"{area}.txt"
            with open(ticker_file) as file:
                content = file.read()
                csv_file = StringIO(content)
                reader = csv.reader(csv_file, delimiter="\t")
                next(reader)
                area_stocks = []
                for row in reader:
                    area_stocks.append({"symbol": row[0], "name": row[1]})
                stocks[area] = area_stocks
        return stocks


if __name__ == "__main__":
    spy = yf.Ticker("AAPL")
    print(spy.info)
