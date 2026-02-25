import React from "react";
import { Box, Button } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SettingsIcon from "@mui/icons-material/Settings";

type ActionButtonsProps = {
  useDatabase: boolean;
  setUseDatabase: (value: boolean) => void;
  onGoToAdjustments: () => void;
  onResetClick: () => void;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  useDatabase,
  setUseDatabase,
  onGoToAdjustments,
  onResetClick,
}) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3 }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setUseDatabase(!useDatabase)}
        startIcon={<SettingsIcon />}
      >
        {useDatabase ? "Switch to Excel Mode" : "Switch to Database Mode"}
      </Button>

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
        Reset / Upload New File
      </Button>
    </Box>
  );
};

export default ActionButtons;
