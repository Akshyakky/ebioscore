import React, { createContext, useContext, useState, ReactNode } from "react";
import CustomAlert, { AlertType } from "../components/Alert/CustomAlert";

// Type definitions
type SweetAlertIcon = "success" | "error" | "warning" | "info" | "question";

interface AlertOptions {
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  showPrintButton?: boolean;
  showCloseButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  printButtonText?: string;
  closeButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onPrint?: () => void;
  onClose?: () => void;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
}

interface AlertState {
  open: boolean;
  title: string;
  message: string;
  type: AlertType;
  options: AlertOptions;
  resolve?: (result: boolean) => void;
}

interface AlertContextType {
  showAlert: (title: string, message: string, type: SweetAlertIcon, needsConfirmationOrOptions?: boolean | AlertOptions, options?: AlertOptions) => Promise<boolean>;
  showSuccessAlert: (title: string, message: string, options?: AlertOptions) => Promise<boolean>;
  showErrorAlert: (title: string, message: string, options?: AlertOptions) => Promise<boolean>;
  showWarningAlert: (title: string, message: string, options?: AlertOptions) => Promise<boolean>;
  showInfoAlert: (title: string, message: string, options?: AlertOptions) => Promise<boolean>;
  showConfirmAlert: (title: string, message: string, options?: AlertOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Map SweetAlert2 icon types to our native alert types
const mapIconType = (icon: SweetAlertIcon): AlertType => {
  const iconMap: Record<SweetAlertIcon, AlertType> = {
    success: "success",
    error: "error",
    warning: "warning",
    info: "info",
    question: "question",
  };
  return iconMap[icon] || "info";
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    title: "",
    message: "",
    type: "info",
    options: {},
  });

  const showAlert = (title: string, message: string, type: SweetAlertIcon, needsConfirmationOrOptions?: boolean | AlertOptions, options?: AlertOptions): Promise<boolean> => {
    // Handle different argument patterns
    let finalNeedsConfirmation = false;
    let finalOptions: AlertOptions = {};

    if (typeof needsConfirmationOrOptions === "boolean") {
      finalNeedsConfirmation = needsConfirmationOrOptions;
      finalOptions = options || {};
    } else if (typeof needsConfirmationOrOptions === "object") {
      finalOptions = needsConfirmationOrOptions;
    }

    const alertOptions: AlertOptions = {
      showConfirmButton: true,
      showCancelButton: finalNeedsConfirmation,
      showPrintButton: false,
      showCloseButton: false,
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      printButtonText: "Print",
      closeButtonText: "Close",
      ...finalOptions,
    };

    return new Promise((resolve) => {
      setAlertState({
        open: true,
        title,
        message,
        type: mapIconType(type),
        options: alertOptions,
        resolve,
      });
    });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const handleConfirm = () => {
    if (alertState.options.onConfirm) {
      try {
        alertState.options.onConfirm();
      } catch (error) {
        console.error("Error in onConfirm callback:", error);
      }
    }
    if (alertState.resolve) {
      alertState.resolve(true);
    }
    closeAlert();
  };

  const handleCancel = () => {
    if (alertState.options.onCancel) {
      try {
        alertState.options.onCancel();
      } catch (error) {
        console.error("Error in onCancel callback:", error);
      }
    }
    if (alertState.resolve) {
      alertState.resolve(false);
    }
    closeAlert();
  };

  const handlePrint = () => {
    if (alertState.options.onPrint) {
      try {
        alertState.options.onPrint();
      } catch (error) {
        console.error("Error in onPrint callback:", error);
      }
    }
    // Don't close the dialog after print
  };

  const handleClose = () => {
    if (alertState.options.onClose) {
      try {
        alertState.options.onClose();
      } catch (error) {
        console.error("Error in onClose callback:", error);
      }
    }
    if (alertState.resolve) {
      alertState.resolve(false);
    }
    closeAlert();
  };

  // Convenience functions
  const showSuccessAlert = (title: string, message: string, options?: AlertOptions): Promise<boolean> => {
    return showAlert(title, message, "success", options);
  };

  const showErrorAlert = (title: string, message: string, options?: AlertOptions): Promise<boolean> => {
    return showAlert(title, message, "error", options);
  };

  const showWarningAlert = (title: string, message: string, options?: AlertOptions): Promise<boolean> => {
    return showAlert(title, message, "warning", options);
  };

  const showInfoAlert = (title: string, message: string, options?: AlertOptions): Promise<boolean> => {
    return showAlert(title, message, "info", options);
  };

  const showConfirmAlert = (title: string, message: string, options?: AlertOptions): Promise<boolean> => {
    return showAlert(title, message, "question", true, options);
  };

  const contextValue: AlertContextType = {
    showAlert,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showInfoAlert,
    showConfirmAlert,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <CustomAlert
        open={alertState.open}
        onClose={handleClose}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        showConfirmButton={alertState.options.showConfirmButton}
        showCancelButton={alertState.options.showCancelButton}
        showPrintButton={alertState.options.showPrintButton}
        showCloseButton={alertState.options.showCloseButton}
        confirmButtonText={alertState.options.confirmButtonText}
        cancelButtonText={alertState.options.cancelButtonText}
        printButtonText={alertState.options.printButtonText}
        closeButtonText={alertState.options.closeButtonText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onPrint={handlePrint}
        maxWidth={alertState.options.maxWidth}
        disableBackdropClick={alertState.options.disableBackdropClick}
        disableEscapeKeyDown={alertState.options.disableEscapeKeyDown}
      />
    </AlertContext.Provider>
  );
};

// Custom hook to use the alert context
export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

// Export types
export type { AlertType, AlertOptions, SweetAlertIcon };
