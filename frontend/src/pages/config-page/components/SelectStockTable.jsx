import { memo, useMemo, useState } from "react";
import { Table } from "../../../components";
import styled from "styled-components";
import { stocks } from "../../../data";
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@mui/material";
import { SearchIcon } from "../../../icons";

const Wrapper = styled(Paper)`
  width: 80%;
  height: 100%;
  margin: auto;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TableContainer = styled.div`
  height: 100%
  overflow: auto;
  &::-webkit-scrollbar {
    width: 12px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 10px;
    border: 3px solid #f1f1f1;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;
const SelectButton = styled(Button)`
  background-color: #1976d2;
  color: #ffffff;
`;
const UnselectButton = styled(Button)`
  background-color: #e53935;
  color: #ffffff;
`;
const StyledTable = styled(Table)`
  thead {
    position: sticky;
    top: 0px;
    z-index: 2;
  }

  .MuiTableCell-head {
    background-color: #1976d2;
    color: #ffffff;
  }
  .MuiTableRow-root {
    &:hover {
      background-color: #f5f5f5;
    }
    background-color: #ffffff;
  }
  .MuiTableCell-body {
    color: #333333;
  }
  .MuiTablePagination-root {
    background-color: #ffffff;
    color: #333333;
    position: sticky;
    bottom: 0;
    z-index: 2;
  }
`;

const StyledSelect = styled(Select)`
  width: 20%;
  background-color: #ffffff;
  border-radius: 6px;
  // & .MuiOutlinedInput-notchedOutline {
  //   border-color: #1976d2;
  // }
  // &:hover .MuiOutlinedInput-notchedOutline {
  //   border-color: #1565c0;
  // }
  // &.Mui-focused .MuiOutlinedInput-notchedOutline {
  //   border-color: #1976d2;
  //   border-width: 2px;
  // }
  & .MuiSelect-select {
    padding: 8px 12px;
    color: #333333;
  }
`;

const Left = styled(Box)`
  flex-grow: 1;
`;

const Right = styled(Box)`
  flex-grow: 1;
`;

const rowsPerPageOptions = [20];

const Header = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;

const Body = styled(Box)`
  display: flex;
  flex: auto auto;
  flex-grow: 1;
  gap: 1rem;
`;

const SearchBar = styled(TextField)`
  width: 25%;
  & .MuiInputBase-root {
    background-color: #ffffff;
    border-radius: 6px;
    padding: 4px 8px;
  }
  & .MuiInputBase-input {
    padding: 8px 12px;
    color: #333333;
    font-size: 0.9rem;
  }
  // & .MuiOutlinedInput-notchedOutline {
  //   border-color: #1976d2;
  // }
  // &:hover .MuiOutlinedInput-notchedOutline {
  //   border-color: #1565c0;
  // }
  // &.Mui-focused .MuiOutlinedInput-notchedOutline {
  //   border-color: #1976d2;
  //   border-width: 2px;
  // }
`;

export const SelectStockTable = memo(() => {
  const areaOptions = useMemo(
    () => [
      "All",
      "American Stock Exchange",
      "Australian Securities Exchange",
      "Chicago Futures Exchange",
      "EUREX Futures Exchange",
      "Foreign Exchange",
      "Global Indices",
      "LIFFE Futures and Options",
      "London Stock Exchange",
      "Minneapolis Grain Exchange",
      "NASDAQ Stock Exchange",
      "New York Board of Trade",
      "New York Stock Exchange",
      "OTC Bulletin Board",
      "Singapore Stock Exchange",
      "Tokyo Stock Exchange",
      "Toronto Venture Exchange",
      "Mutual Funds",
      "Winnipeg Commodity Exchange",
    ],
    []
  );

  const [area, setArea] = useState(areaOptions[0]);
  const [unselectedStocksTablePage, setUnselectedStocksTablePage] = useState(0);
  const [selectedStocksTablePage, setSelectedStocksTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStocks, setSelectedStocks] = useState([]);

  const displayUnselectedStocks = useMemo(() => {
    const start = unselectedStocksTablePage * rowsPerPage;
    const end = start + rowsPerPage;
    if (end > stocks.length) {
      const emptyStock = Array.from(
        { length: end - stocks.length },
        (_, index) => ({
          ticker: ` `.repeat(index),
          name: "",
          disableSelect: true,
        })
      );
      return [...stocks.slice(start, stocks.length), ...emptyStock];
    }
    return stocks.slice(start, end);
  }, [unselectedStocksTablePage, rowsPerPage]);

  const UnselectedTableCols = useMemo(
    () => [
      {
        key: "ticker",
        header: "ticker",
        render: (stock) => stock.ticker,
      },
      {
        key: "name",
        header: "name",
        render: (stock) => stock.name,
      },
      {
        key: "select",
        header: "",
        render: (stock) => (
          <SelectButton
            variant="outlined"
            size="small"
            sx={{
              visibility:
                stock.disableSelect || selectedStocks.includes(stock)
                  ? "hidden"
                  : "visible",
              minWidth: "80px",
            }}
            onClick={() => {
              setSelectedStocks((prev) => [...prev, stock]);
            }}
          >
            Select
          </SelectButton>
        ),
      },
    ],
    [selectedStocks]
  );

  const displaySelectedStocks = useMemo(() => {
    const start = selectedStocksTablePage * rowsPerPage;
    const end = start + rowsPerPage;
    if (end > selectedStocks.length) {
      const emptyStock = Array.from(
        { length: end - selectedStocks.length },
        (_, index) => ({
          ticker: ` `.repeat(index),
          name: "",
          disableSelect: true,
        })
      );
      return [...selectedStocks, ...emptyStock];
    }
    return selectedStocks.slice(start, end);
  }, [selectedStocksTablePage, rowsPerPage, selectedStocks]);

  const SelectedTableCols = useMemo(
    () => [
      {
        key: "ticker",
        header: "ticker",
        render: (stock) => stock.ticker,
      },
      {
        key: "name",
        header: "name",
        render: (stock) => stock.name,
      },
      {
        key: "select",
        header: "",
        render: (stock) => (
          <UnselectButton
            variant="outlined"
            size="small"
            sx={{
              visibility: stock.disableSelect ? "hidden" : "visible",
              minWidth: "80px",
            }}
            onClick={() => {
              setSelectedStocks((prev) =>
                prev.filter((s) => s.ticker !== stock.ticker)
              );
            }}
          >
            Unselect
          </UnselectButton>
        ),
      },
    ],
    []
  );

  return (
    <Wrapper>
      <Header>
        <StyledSelect
          size="small"
          value={area}
          onChange={(event) => setArea(event.target.value)}
        >
          {areaOptions.map((area) => (
            <MenuItem key={area} value={area}>
              {area}
            </MenuItem>
          ))}
        </StyledSelect>
        <SearchBar
          variant="outlined"
          placeholder="Search"
          S
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Header>
      <Body>
        <Left>
          Unselected Stocks:
          <TableContainer>
            <StyledTable
              size="small"
              cols={UnselectedTableCols}
              data={displayUnselectedStocks}
              rowKey={"ticker"}
              page={unselectedStocksTablePage}
              rowsPerPageOptions={rowsPerPageOptions}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(event.target.value);
              }}
              rowsPerPage={rowsPerPage}
              onPageChange={(event, newPage) => {
                setUnselectedStocksTablePage(newPage);
              }}
              count={stocks.length}
            />
          </TableContainer>
        </Left>
        <Right>
          Selected Stocks:
          <TableContainer>
            <StyledTable
              size="small"
              cols={SelectedTableCols}
              data={displaySelectedStocks}
              rowKey={"ticker"}
              page={selectedStocksTablePage}
              rowsPerPageOptions={rowsPerPageOptions}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(event.target.value);
              }}
              rowsPerPage={rowsPerPage}
              onPageChange={(event, newPage) => {
                setSelectedStocksTablePage(newPage);
              }}
              count={selectedStocks.length}
            />
          </TableContainer>
        </Right>
      </Body>
    </Wrapper>
  );
});

SelectStockTable.displayName = "SelectStockTable";
