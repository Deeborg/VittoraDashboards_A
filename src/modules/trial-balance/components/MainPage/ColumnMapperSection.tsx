import React from "react";
import { Paper, Typography } from "@mui/material";
import ColumnMapper from "../ColumnMapper";
import { MappedRow } from "./Types/types";

type Props = {
  columns: string[];
  rawData: any[];
  onConfirm: (
    mappedData: MappedRow[],
    amountCurrentKey: string,
    amountPreviousKey: string
  ) => void;
};

const ColumnMapperSection: React.FC<Props> = ({
  columns,
  rawData,
  onConfirm,
}) => (
  <Paper elevation={3} sx={{ p: 4 }}>
    <Typography variant="h6" gutterBottom>
      Map Columns
    </Typography>
    <ColumnMapper columns={columns} rawData={rawData} onConfirm={onConfirm} />
  </Paper>
);

export default ColumnMapperSection;
