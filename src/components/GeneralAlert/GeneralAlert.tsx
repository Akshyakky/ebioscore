import React from "react";
import { Alert, Snackbar, Button } from "@mui/material";

interface GeneralAlertProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity: "error" | "warning" | "info" | "success";
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}

const GeneralAlert: React.FC<GeneralAlertProps> = ({
  open,
  onClose,
  message,
  severity,
  actions,
}) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{ width: "100%" }}
        action={actions?.map((action, index) => (
          <Button
            key={index}
            color="inherit"
            size="small"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GeneralAlert;
