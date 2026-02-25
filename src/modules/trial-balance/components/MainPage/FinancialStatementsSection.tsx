import React from "react";
import { Paper } from "@mui/material";
import FinancialStatements from "../Financials/Financialstatement";

type Props = {
  data: any[];
  amountKeys: { amountCurrentKey: string; amountPreviousKey: string };
  useDatabase: boolean;
};

const FinancialStatementsSection: React.FC<Props> = ({ data, amountKeys, useDatabase }) => (
  <Paper
    elevation={4}
    sx={{
      p: 4,
      mb: 4,
      borderTop: "4px solid #3f51b5",
    }}
  >
    <FinancialStatements data={data} amountKeys={amountKeys} useDatabase={useDatabase} />
  </Paper>
);

export default FinancialStatementsSection;
