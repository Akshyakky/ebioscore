import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from "@mui/material";

interface ProviderPopupProps {
  onClose: () => void;
}

const ProviderPopup: React.FC<ProviderPopupProps> = ({ onClose }) => {
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Provider Details</DialogTitle>
      <DialogContent>
        {/* Example content for the popup */}
        <TextField
          autoFocus
          margin="dense"
          id="provider-name"
          label="Provider Name"
          type="text"
          fullWidth
          variant="outlined"
        />
        <TextField
          margin="dense"
          id="provider-description"
          label="Description"
          type="text"
          fullWidth
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProviderPopup;
