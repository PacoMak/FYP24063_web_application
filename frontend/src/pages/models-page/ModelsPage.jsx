import { memo, useCallback, useMemo, useState } from "react";
import { Box, Button, Checkbox } from "@mui/material";
import styled from "styled-components";
import { Models } from "../../data";
import { Table } from "../../components";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";
import { DeleteIcon } from "../../icons";

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;

  flex-grow: 1;
  gap: 1rem;
  overflow: hidden;
`;

const DeleteButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.button.delete.background};
  color: ${({ theme }) => theme.colors.button.delete.color};
`;

const ButtonRow = styled(Box)`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const TableContainer = styled.div`
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
  height: 100%;
  overflow: auto;
`;
const StyledTable = styled(Table)`
  border: none;
  thead {
    position: sticky;
    top: 0px;
    z-index: 2;
  }
  .MuiTableCell-head {
    thead {
      position: sticky;
      top: 0px;
      z-index: 2;
    }
    background-color: ${({ theme }) => theme.colors.table.header.background};
    color: ${({ theme }) => theme.colors.table.header.color};
  }
  .MuiTableRow-root {
    &:hover {
      cursor: pointer;
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
const StyledDeleteIcon = styled(DeleteIcon)`
  path {
    fill: ${({ theme }) => theme.colors.button.delete.color};
  }
`;
const rowsPerPageOptions = [10];
export const ModelsPage = memo(() => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedModels, setSelectedModels] = useState([]);
  const navigate = useNavigate();

  const displayModels = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;

    if (end > Models.length) {
      const emptyModel = Array.from(
        { length: end - Models.length },
        (_, i) => ({
          id: `empty_${i}`,
          name: "",
          learning_rate: "",
          tau: "",
          gamma: "",
          epsilon: "",
          batch_size: "",
          epochs: "",
          max_memory: "",
          disableSelect: true,
        })
      );
      return [...Models.slice(start, end), ...emptyModel];
    }

    return Models.slice(start, end);
  }, [page, rowsPerPage]);

  const cols = useMemo(
    () => [
      {
        key: "select",
        header: "",
        render: (model) => (
          <Checkbox
            size="small"
            disabled={model.disableSelect}
            sx={{
              visibility: model.disableSelect ? "hidden" : "visible",
            }}
            checked={selectedModels.includes(model.id)}
            onChange={(event) => {
              if (event.target.checked) {
                setSelectedModels((prev) => [...prev, model.id]);
                return;
              }
              setSelectedModels((prev) => prev.filter((id) => id !== model.id));
            }}
            onClick={(event) => {
              event.stopPropagation(); // Prevents the checkbox click from triggering row click
            }}
          />
        ),
      },
      {
        key: "name",
        header: "Name",
        render: (model) => model.name,
      },
      {
        key: "learning_rate",
        header: "Learning_rate",
        render: (model) => model.learning_rate,
      },
      {
        key: "tau",
        header: "tau",
        render: (model) => model.tau,
      },
      {
        key: "gamma",
        header: "gamma",
        render: (model) => model.gamma,
      },
      {
        key: "epsilon",
        header: "epsilon",
        render: (model) => model.epsilon,
      },
      {
        key: "batch_size",
        header: "batch_size",
        render: (model) => model.batch_size,
      },
      {
        key: "epochs",
        header: "epochs",
        render: (model) => model.epochs,
      },
      {
        key: "max_memory",
        header: "max_memory",
        render: (model) => model.max_memory,
      },
    ],
    [selectedModels]
  );
  return (
    <Wrapper>
      <ButtonRow>
        <DeleteButton variant="contained">
          <StyledDeleteIcon />
          Delete
        </DeleteButton>
      </ButtonRow>
      <TableContainer>
        <StyledTable
          cols={cols}
          data={displayModels}
          rowKey={"id"}
          page={page}
          rowsPerPageOptions={rowsPerPageOptions}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(event.target.value);
          }}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => {
            setPage(newPage);
          }}
          onRowClick={(datum) => {
            navigate(`${ROUTES.Dashboard.render(datum.id)}`);
          }}
          count={Models.length}
        />
      </TableContainer>
    </Wrapper>
  );
});

ModelsPage.displayName = "ModelsPage";
