import React from "react";
import { Paper, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const MappingSuccess: React.FC = () => (
  <Paper
    elevation={3}
    sx={{
      mb: 4,
      p: 2,
      backgroundColor: "#e8f5e9",
      borderRadius: 1,
      display: "flex",
      alignItems: "center",
      gap: 1,
    }}
  >
    <CheckCircleIcon color="success" />
    <Typography variant="h6" color="success.main">
      Columns Mapped! Ready for Statements
    </Typography>
  </Paper>
);

export default MappingSuccess;
