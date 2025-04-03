import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { memo } from "react";

export const Table = memo(
  ({ className, rowKey, data, cols, onRowClick, ...props }) => {
    return (
      <MuiTable className={className} {...props}>
        <TableHead>
          <TableRow>
            {cols.map((col) => (
              <TableCell key={col.key}>{col.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((datum) => (
            <TableRow
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
            </TableRow>
          ))}
        </TableBody>
        <TablePagination {...props} />
      </MuiTable>
    );
  }
);
Table.displayName = "Table";
