import yfinance as yf
from ..utils import project_root
import csv
import json
from io import StringIO
import pandas as pd


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

    def get_stock_info(self, ticker):
        ticker = yf.Ticker(ticker)
        return ticker.info

    def get_symbols(self):
        file_path = project_root / "src" / "tickers" / "tickers.csv"
        df = pd.read_csv(file_path, keep_default_na=False, na_values=[""])
        df["Sector"] = df["Sector"].fillna("Other")
        grouped = df.groupby("Sector")
        result = {}
        for sector, group in grouped:
            result[sector] = [
                {"name": row["Name"], "symbol": row["Symbol"]}
                for index, row in group.iterrows()
            ]
        return result

    def get_unique_sectors(self):
        file_path = project_root / "src" / "tickers" / "tickers.csv"
        df = pd.read_csv(file_path, keep_default_na=False, na_values=[""])
        df["Sector"] = df["Sector"].fillna("Other")
        sectors = sorted(df["Sector"].unique().tolist())
        if "Other" in sectors:
            sectors.remove("Other")
            sectors.append("Other")
        return sectors


if __name__ == "__main__":
    spy = yf.Ticker("AAPL")
    print(spy.info)
