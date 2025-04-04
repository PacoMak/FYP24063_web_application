import { memo, useCallback, useMemo, useState } from "react";
import { Box, Button, Checkbox } from "@mui/material";
import styled from "styled-components";
import { Table } from "../../components";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";
import { DeleteIcon } from "../../icons";
import { useModelList } from "../../api";

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
  const { data: modelList, isFetching } = useModelList();
  const navigate = useNavigate();
  const models = useMemo(() => {
    if (isFetching) {
      return [];
    }
    return modelList ?? [];
  }, [isFetching, modelList]);
  const displayModels = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;

    if (end > models.length) {
      const emptyModel = Array.from(
        { length: end - models.length },
        (_, i) => ({
          model_id: ` `.repeat(i + 1),
          disableSelect: true,
        })
      );
      return [...models.slice(start, end), ...emptyModel];
    }

    return models.slice(start, end);
  }, [page, rowsPerPage, models]);

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
              event.stopPropagation();
            }}
          />
        ),
      },
      {
        key: "name",
        header: "Name",
        render: (model) => model.model_id,
      },
      {
        key: "Actor_Learning_Rate",
        header: "Actor Learning Rate",
        render: (model) => model.alpha,
      },
      {
        key: "Critic_Learning_Rate",
        header: "Critic Learning Rate",
        render: (model) => model.beta,
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
        key: "batch_size",
        header: "batch_size",
        render: (model) => model.batch_size,
      },
      {
        key: "epochs",
        header: "epochs",
        render: (model) => model.num_epoch,
      },
      {
        key: "Training_Start_date",
        header: "Training Start Date",
        render: (model) => model.train_start_date,
      },
      {
        key: "Training_End_date",
        header: "Training End Date",
        render: (model) => model.train_end_date,
      },
      {
        key: "Testing_Start_date",
        header: "Testing Start Date",
        render: (model) => model.test_start_date,
      },
      {
        key: "Testing_End_date",
        header: "Testing End Date",
        render: (model) => model.test_end_date,
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
          rowKey={"model_id"}
          page={page}
          rowsPerPageOptions={rowsPerPageOptions}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(event.target.value);
          }}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => {
            setPage(newPage);
          }}
          onRowClick={(datum) => {
            navigate(`${ROUTES.Dashboard.render(datum.id)}`);
          }}
          count={models.length}
        />
      </TableContainer>
    </Wrapper>
  );
});

ModelsPage.displayName = "ModelsPage";
