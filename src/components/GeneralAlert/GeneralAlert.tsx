import React, { useMemo } from "react";
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
  autoHideDuration?: number;
}

const GeneralAlert: React.FC<GeneralAlertProps> = ({
  open,
  onClose,
  message,
  severity,
  actions,
  autoHideDuration = 6000,
}) => {
  const renderedActions = useMemo(() => {
    return actions?.map((action, index) => (
      <Button
        key={index}
        color="inherit"
        size="small"
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    ));
  }, [actions]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      role="alert"
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{ width: "100%" }}
        action={renderedActions}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GeneralAlert;
