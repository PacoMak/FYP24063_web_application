import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { memo } from "react";
import styled from "styled-components";
const StyledTableRow = styled(TableRow)`
  cursor: ${({ $canSelect }) => ($canSelect ? "pointer" : "auto")};
`;
export const Table = memo(
  ({
    className,
    rowKey,
    data,
    cols,
    onRowClick,
    size = "medium",
    ...props
  }) => {
    return (
      <MuiTable className={className} size={size}>
        <TableHead>
          <TableRow>
            {cols.map((col) => (
              <TableCell key={col.key}>{col.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((datum) => (
            <StyledTableRow
              $canSelect={datum.disableSelect !== true && onRowClick}
              key={datum[rowKey]}
              onClick={() => {
                if (onRowClick) {
                  onRowClick(datum);
                }
              }}
            >
              {cols.map((col) => (
                <TableCell key={col.key}>{col.render(datum)}</TableCell>
              ))}
            </StyledTableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination {...props} />
          </TableRow>
        </TableFooter>
      </MuiTable>
    );
  }
);
Table.displayName = "Table";
