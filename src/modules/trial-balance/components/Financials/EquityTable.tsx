import React from "react";
import { Paper, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { EquityColumn, EquityRow } from "./types";

interface Props {
  title: string;
  columns: EquityColumn[];
  rows: EquityRow[];
  actionButton?: React.ReactNode; // <-- ADD THIS NEW PROP
}

export const EquityMultiTable: React.FC<Props> = ({ title, columns, rows, actionButton }) => { // <-- ADD actionButton HERE
  return (
    <Paper sx={{ my: 4, overflow: "hidden" }}>
      <Box sx={{ p: 2 }}>
        {/* VVV MODIFY THIS SECTION VVV */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {title}
          </Typography>
          {actionButton} 
        </Box>
        {/* ^^^ MODIFY THIS SECTION ^^^ */}

        <Table size="small" sx={{ "& td, & th": { border: "1px solid rgba(224,224,224,1)" } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "action.hover" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Particulars</TableCell>
              {columns.map((col) => (
                <TableCell key={col.key} align="right" sx={{ fontWeight: "bold" }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell>{row.label}</TableCell>
                {columns.map((col) => (
                  <TableCell key={col.key} align="right">
                    {row.values?.[col.key] ?? "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
);
};