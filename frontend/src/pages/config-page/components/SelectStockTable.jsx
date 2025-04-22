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
import { useSymbolList, useSectorList } from "../../../api";

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
    const { data: symbolList, isFetched: symbolListIsFetched } =
      useSymbolList();
    const { data: sectorList, isFetched: sectorListIsFetched } =
      useSectorList();

    const [unselectedStocksTablePage, setUnselectedStocksTablePage] =
      useState(0);
    const [selectedStocksTablePage, setSelectedStocksTablePage] = useState(0);

    const [search, setSearch] = useState("");

    const rowsPerPage = useMemo(() => 10, []);
    const sectorOptions = useMemo(
      () => ["All", ...(sectorList ?? [])],
      [sectorList]
    );
    const [sector, setSector] = useState("All");

    const filteredSymbolList = useMemo(() => {
      if (!sectorListIsFetched || !symbolListIsFetched) {
        return [];
      }

      if (sector == "All") {
        return Object.values(symbolList)
          .flat()
          .filter(
            ({ name, symbol }) =>
              name.toLowerCase().includes(search.toLowerCase()) ||
              symbol.toLowerCase().includes(search.toLowerCase())
          );
      }
      return symbolList[sector].filter(
        ({ name, symbol }) =>
          name.toLowerCase().includes(search.toLowerCase()) ||
          symbol.toLowerCase().includes(search.toLowerCase())
      );
    }, [symbolList, sector, sectorListIsFetched, symbolListIsFetched, search]);

    const displayUnselectedStocks = useMemo(() => {
      const start = unselectedStocksTablePage * rowsPerPage;
      const end = start + rowsPerPage;
      if (end > filteredSymbolList.length) {
        const emptyStock = Array.from(
          { length: end - filteredSymbolList.length },
          (_, index) => ({
            symbol: ` `.repeat(index),
            name: "",
            disableSelect: true,
          })
        );
        return [
          ...filteredSymbolList.slice(start, filteredSymbolList.length),
          ...emptyStock,
        ];
      }
      return filteredSymbolList.slice(start, end);
    }, [unselectedStocksTablePage, rowsPerPage, filteredSymbolList]);

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
      [selectedStocks, setSelectedStocks]
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
      [selectedStocks, setSelectedStocks]
    );

    return (
      <Wrapper>
        <Header>
          <StyledSelect
            size="small"
            value={sector}
            onChange={(event) => setSector(event.target.value)}
          >
            {sectorOptions.map((sector) => (
              <MenuItem key={sector} value={sector}>
                {sector}
              </MenuItem>
            ))}
          </StyledSelect>
          <SearchBar
            autoComplete="off"
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
                rowsPerPageOptions={[10]}
                rowsPerPage={10}
                onPageChange={(_, newPage) => {
                  setUnselectedStocksTablePage(newPage);
                }}
                count={filteredSymbolList.length}
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
                rowsPerPageOptions={[10]}
                rowsPerPage={10}
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
