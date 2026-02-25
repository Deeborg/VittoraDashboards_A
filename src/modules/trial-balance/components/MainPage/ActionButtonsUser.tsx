import React from "react";
import { Box, Button } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

type ActionButtonsProps = {
  onGoToAdjustments: () => void;
  onResetClick: () => void;
};

const ActionButtonsUser: React.FC<ActionButtonsProps> = ({
  onGoToAdjustments,
  onResetClick,
}) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3 }}>
      <Button
        variant="contained"
        color="primary"
        endIcon={<ArrowForwardIosIcon />}
        onClick={onGoToAdjustments}
      >
        Pass Adjustment Entries
      </Button>

      <Button
        variant="outlined"
        color="error"
        startIcon={<RestartAltIcon />}
        onClick={onResetClick}
      >
        Reset
      </Button>
    </Box>
  );
};

export default ActionButtonsUser;
