import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

type ConfirmResetDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmResetDialog: React.FC<ConfirmResetDialogProps> = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Reset</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to reset and upload a new file? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button color="error" onClick={onConfirm}>Yes, Reset</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmResetDialog;
