import { memo, useMemo, useState } from "react";
import { Table } from "../../../components";
import styled from "styled-components";
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
import { useTickerList } from "../../../api";
import { exchangeMapper } from "../../../mapper";

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

const TableContainer = styled(Box)`
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
  background-color: ${({ theme }) =>
    theme.colors.selectStocks.button.select.background};
  color: ${({ theme }) => theme.colors.selectStocks.button.select.color};
  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.selectStocks.button.select.hover.background};
    color: ${({ theme }) =>
      theme.colors.selectStocks.button.select.hover.color};
  }
`;
const RemoveButton = styled(Button)`
  background-color: ${({ theme }) =>
    theme.colors.selectStocks.button.remove.background};
  color: ${({ theme }) => theme.colors.selectStocks.button.remove.color};
  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.selectStocks.button.remove.hover.background};
    color: ${({ theme }) =>
      theme.colors.selectStocks.button.remove.hover.color};
  }
`;
const StyledTable = styled(Table)`
  thead {
    position: sticky;
    top: 0px;
    z-index: 2;
  }

  .MuiTableCell-head {
    background-color: ${({ theme }) =>
      theme.colors.selectStocks.table.header.background};
    color: ${({ theme }) => theme.colors.selectStocks.table.header.color};
  }
  .MuiTableRow-root {
    &:hover {
      background-color: ${({ theme }) =>
        theme.colors.selectStocks.table.body.hover.background};
    }
    background-color: ${({ theme }) =>
      theme.colors.selectStocks.table.body.background};
  }
  .MuiTableCell-body {
    color: ${({ theme }) => theme.colors.selectStocks.table.body.color};
  }
  .MuiTablePagination-root {
    background-color: ${({ theme }) =>
      theme.colors.selectStocks.table.pagination.background};
    color: ${({ theme }) => theme.colors.selectStocks.table.pagination.color};
    position: sticky;
    bottom: 0;
    z-index: 2;
  }
`;

const StyledSelect = styled(Select)`
  width: 20%;
  background-color: ${({ theme }) =>
    theme.colors.selectStocks.dropdown.background};
  border-radius: 6px;
  & .MuiSelect-select {
    padding: 8px 12px;
    color: ${({ theme }) => theme.colors.selectStocks.dropdown.color};
  }
`;

const Left = styled(Box)`
  width: 100%;
  height: 100%;
`;

const Right = styled(Box)`
  width: 100%;
  height: 100%;
`;

const rowsPerPageOptions = [20];

const Header = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;

const Body = styled(Box)`
  display: flex;
  gap: 1rem;
`;

const SearchBar = styled(TextField)`
  width: 25%;
  & .MuiInputBase-root {
    background-color: ${({ theme }) =>
      theme.colors.selectStocks.searchBar.background};
    border-radius: 6px;
    padding: 4px 8px;
  }
  & .MuiInputBase-input {
    padding: 8px 12px;
    color: ${({ theme }) => theme.colors.selectStocks.searchBar.color};
    font-size: 0.9rem;
  }
`;
const NextButton = styled(Button)`
  background-color: ${({ $activate, theme }) =>
    $activate
      ? theme.colors.button.next.activate.background
      : theme.colors.button.next.deactivate.background};
  color: ${({ theme }) => theme.colors.button.next.activate.color};
  padding: 0.5rem 2rem;
  border-radius: 6px;
  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.button.next.hover.background};
  }
`;
const ButtonRow = styled(Box)`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;
export const SelectStockTable = memo(
  ({ selectedStocks, setSelectedStocks, setStage }) => {
    const { data: tickerList, isFetching } = useTickerList();
    const [search, setSearch] = useState("");
    const [unselectedStocksTablePage, setUnselectedStocksTablePage] =
      useState(0);
    const [selectedStocksTablePage, setSelectedStocksTablePage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const areaOptions = useMemo(
      () => ["All", ...Object.keys(exchangeMapper)],
      []
    );
    const [area, setArea] = useState(areaOptions[0]);
    const filteredTickerList = useMemo(() => {
      if (isFetching) {
        return [];
      }
      if (area == "All") {
        return Object.values(tickerList)
          .flat()
          .filter(
            ({ name, symbol }) =>
              name.toLowerCase().includes(search.toLowerCase()) ||
              symbol.toLowerCase().includes(search.toLowerCase())
          );
      }
      return tickerList[exchangeMapper[area]].filter(
        ({ name, symbol }) =>
          name.toLowerCase().includes(search.toLowerCase()) ||
          symbol.toLowerCase().includes(search.toLowerCase())
      );
    }, [tickerList, area, isFetching, search]);

    const displayUnselectedStocks = useMemo(() => {
      const start = unselectedStocksTablePage * rowsPerPage;
      const end = start + rowsPerPage;
      if (end > filteredTickerList.length) {
        const emptyStock = Array.from(
          { length: end - filteredTickerList.length },
          (_, index) => ({
            symbol: ` `.repeat(index),
            name: "",
            disableSelect: true,
          })
        );
        return [
          ...filteredTickerList.slice(start, filteredTickerList.length),
          ...emptyStock,
        ];
      }
      return filteredTickerList.slice(start, end);
    }, [unselectedStocksTablePage, rowsPerPage, filteredTickerList]);

    const UnselectedTableCols = useMemo(
      () => [
        {
          key: "Symbol",
          header: "Symbol",
          render: (stock) => stock.symbol,
        },
        {
          key: "Name",
          header: "Name",
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
              }}
              onClick={() => {
                setSelectedStocks([...selectedStocks, stock]);
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
            symbol: ` `.repeat(index),
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
          key: "Symbol",
          header: "Symbol",
          render: (stock) => stock.symbol,
        },
        {
          key: "Name",
          header: "Name",
          render: (stock) => stock.name,
        },
        {
          key: "select",
          header: "",
          render: (stock) => (
            <RemoveButton
              variant="outlined"
              size="small"
              sx={{
                visibility: stock.disableSelect ? "hidden" : "visible",
              }}
              onClick={() => {
                setSelectedStocks(
                  selectedStocks.filter((s) => s.symbol !== stock.symbol)
                );
              }}
            >
              Remove
            </RemoveButton>
          ),
        },
      ],
      [selectedStocks]
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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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
                rowKey={"symbol"}
                page={unselectedStocksTablePage}
                rowsPerPageOptions={rowsPerPageOptions}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(event.target.value);
                }}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => {
                  setUnselectedStocksTablePage(newPage);
                }}
                count={filteredTickerList.length}
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
                rowKey={"symbol"}
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
        <ButtonRow>
          <NextButton
            onClick={() => {
              setStage((prev) => prev + 1);
            }}
            $activate={selectedStocks.length >= 2}
            disabled={selectedStocks.length < 2}
          >
            Next
          </NextButton>
        </ButtonRow>
      </Wrapper>
    );
  }
);

SelectStockTable.displayName = "SelectStockTable";
