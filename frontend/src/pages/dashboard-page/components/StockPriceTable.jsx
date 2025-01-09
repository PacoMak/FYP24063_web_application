import React, { memo, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
} from "@mui/material";
import styled from "styled-components";
import { useStocksHistory } from "../../../api";

const stockData = [
  { name: "AAPL", open: 150, close: 155, high: 160, low: 148 },
  { name: "GOOGL", open: 2800, close: 2825, high: 2850, low: 2780 },
  { name: "MSFT", open: 300, close: 305, high: 310, low: 295 },
  { name: "AMZN", open: 3400, close: 3420, high: 3450, low: 3380 },
  { name: "TSLA", open: 700, close: 710, high: 720, low: 690 },
];

const StyledTableContainer = styled(TableContainer)`
  max-height: 35vh;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 12px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) =>
      theme.colors.stockPriceTable.scrollBar.background};
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) =>
      theme.colors.stockPriceTable.scrollBar.thumb};
    border-radius: 10px;
    border: 3px solid
      ${({ theme }) => theme.colors.stockPriceTable.scrollBar.border};
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) =>
      theme.colors.stockPriceTable.scrollBar.thumbHover};
  }
`;

const StyledTableCellHead = styled(TableCell)`
  background-color: ${({ theme }) =>
    theme.colors.stockPriceTable.heading.background};
  color: ${({ theme }) => theme.colors.stockPriceTable.heading.color};
  border-bottom: 2px solid
    ${({ theme }) => theme.colors.stockPriceTable.heading.border};
`;

const StyledTableCellBody = styled(TableCell)`
  background-color: ${({ theme }) =>
    theme.colors.stockPriceTable.body.background};
  color: ${({ theme }) => theme.colors.stockPriceTable.body.color};
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.stockPriceTable.body.border};
`;

export const StockPriceTable = memo(() => {
  const { data, isLoading, isError } = useStocksHistory([
    "AAPL",
    "GOOGL",
    "MSFT",
    "AMZN",
    "TSLA",
  ]);
  const stocks = useMemo(() =>
    Object.entries(data ?? {}).map(([name, values]) => {
      return {
        name,
        open: values[values.length - 1].Open.toFixed(2),
        close: values[values.length - 1].Close.toFixed(2),
        high: values[values.length - 1].High.toFixed(2),
        low: values[values.length - 1].Low.toFixed(2),
      };
    })
  );
  const columns = useMemo(
    () => [
      {
        header: "Stock",
        key: "STOCK",
        render: (stock) => stock.name,
      },
      {
        header: "Open Price",
        key: "OPEN PRICE",
        render: (stock) => stock.open,
      },
      {
        header: "Close Price",
        key: "CLOSE PRICE",
        render: (stock) => stock.close,
      },
      {
        header: "High Price",
        key: "HIGH PRICE",
        render: (stock) => stock.high,
      },
      {
        header: "Low Price",
        key: "LOW PRICE",
        render: (stock) => stock.low,
      },
    ],
    []
  );

  if (isLoading) {
    return <></>;
  }
  return (
    <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
      <StyledTableContainer component={Card}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(({ header, key }) => (
                <StyledTableCellHead key={key}>{header}</StyledTableCellHead>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((stock) => {
              return (
                <TableRow key={stock.name}>
                  {columns.map(({ key, render }) => (
                    <StyledTableCellBody component="th" scope="row" key={key}>
                      {render(stock)}
                    </StyledTableCellBody>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Paper>
  );
});

StockPriceTable.displayName = "StockPriceTable";
