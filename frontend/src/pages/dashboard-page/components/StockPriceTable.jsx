import { memo, useMemo, useState } from "react";
import styled from "styled-components";
import { Table } from "../../../components";

const TableContainer = styled.div`
  height: 100%;
  overflow: auto;
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

const StyledTable = styled(Table)`
  .MuiTableCell-head {
    background-color: ${({ theme }) => theme.colors.table.header.background};
    color: ${({ theme }) => theme.colors.table.header.color};
  }
  thead {
    position: sticky;
    top: 0;
    z-index: 2;
  }
  .MuiTableRow-root {
    &:hover {
      background-color: ${({ theme }) =>
        theme.colors.table.body.hover.background};
    }
    background-color: ${({ theme }) => theme.colors.table.body.background};
  }
  .MuiTableCell-body {
    color: ${({ theme }) => theme.colors.table.body.color};
  }
  .MuiTablePagination-root {
    background-color: ${({ theme }) =>
      theme.colors.table.pagination.background};
    color: ${({ theme }) => theme.colors.table.pagination.color};
    position: sticky;
    bottom: 0;
    z-index: 2;
  }
`;
const rowsPerPageOptions = [10];
export const StockPriceTable = memo(({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const displayStocks = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    if (end > data.length) {
      const emptyStock = Array.from(
        { length: end - data.length },
        (_, index) => ({
          name: " ".repeat(index),
          open: "\u00A0",
          close: "",
          high: "",
          low: "",
          disableSelect: true,
        })
      );
      return [...data.slice(start, end), ...emptyStock];
    }
    return data.slice(start, end);
  }, [page, rowsPerPage, data]);
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

  return (
    <TableContainer>
      <StyledTable
        data={displayStocks}
        cols={columns}
        rowKey={"name"}
        page={page}
        rowsPerPageOptions={rowsPerPageOptions}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(event.target.value);
        }}
        rowsPerPage={rowsPerPage}
        onPageChange={(event, newPage) => {
          setPage(newPage);
        }}
        count={data.length}
      />
    </TableContainer>
  );
});

StockPriceTable.displayName = "StockPriceTable";
