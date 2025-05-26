import { createRoot } from "react-dom/client";
import CustomAlert, { AlertType } from "../../components/Alert/CustomAlert";

// Type mapping from SweetAlert2 icons to our native alert types
type SweetAlertIcon = "success" | "error" | "warning" | "info" | "question";

type AlertOptions = {
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
};

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

// Overloaded function signatures to maintain backwards compatibility
export function showAlert(title: string, message: string, type: SweetAlertIcon): Promise<boolean>;
export function showAlert(title: string, message: string, type: SweetAlertIcon, needsConfirmation: boolean): Promise<boolean>;
export function showAlert(title: string, message: string, type: SweetAlertIcon, options: AlertOptions): Promise<boolean>;
export function showAlert(title: string, message: string, type: SweetAlertIcon, needsConfirmation: boolean, options: AlertOptions): Promise<boolean>;

// Implementation
export function showAlert(title: string, message: string, type: SweetAlertIcon, needsConfirmationOrOptions?: boolean | AlertOptions, options?: AlertOptions): Promise<boolean> {
  // Handle different argument patterns
  let finalNeedsConfirmation = false;
  let finalOptions: AlertOptions = {};

  if (typeof needsConfirmationOrOptions === "boolean") {
    finalNeedsConfirmation = needsConfirmationOrOptions;
    finalOptions = options || {};
  } else if (typeof needsConfirmationOrOptions === "object") {
    finalOptions = needsConfirmationOrOptions;
  }

  const {
    showConfirmButton = true,
    showCancelButton = finalNeedsConfirmation,
    showPrintButton = false,
    showCloseButton = false,
    confirmButtonText = "OK",
    cancelButtonText = "Cancel",
    printButtonText = "Print",
    closeButtonText = "Close",
    onConfirm,
    onCancel,
    onPrint,
    onClose,
  } = finalOptions;

  return new Promise((resolve) => {
    try {
      // Create a container for the alert
      const alertContainer = document.createElement("div");
      alertContainer.id = `alert-container-${Date.now()}`;
      document.body.appendChild(alertContainer);

      const root = createRoot(alertContainer);

      const cleanup = () => {
        try {
          root.unmount();
          if (alertContainer.parentNode) {
            alertContainer.parentNode.removeChild(alertContainer);
          }
        } catch (error) {
          console.warn("Error during alert cleanup:", error);
        }
      };

      const handleResult = (result: boolean) => {
        // Small delay to allow any animations to complete
        setTimeout(() => {
          cleanup();
          resolve(result);
        }, 150);
      };

      root.render(
        <CustomAlert
          title={title}
          message={message}
          type={mapIconType(type)}
          show={true}
          showConfirmButton={showConfirmButton}
          showCancelButton={showCancelButton}
          showPrintButton={showPrintButton}
          showCloseButton={showCloseButton}
          confirmButtonText={confirmButtonText}
          cancelButtonText={cancelButtonText}
          printButtonText={printButtonText}
          closeButtonText={closeButtonText}
          onConfirm={() => {
            if (onConfirm) {
              try {
                onConfirm();
              } catch (error) {
                console.error("Error in onConfirm callback:", error);
              }
            }
            handleResult(true);
          }}
          onCancel={() => {
            if (onCancel) {
              try {
                onCancel();
              } catch (error) {
                console.error("Error in onCancel callback:", error);
              }
            }
            handleResult(false);
          }}
          onPrint={() => {
            if (onPrint) {
              try {
                onPrint();
              } catch (error) {
                console.error("Error in onPrint callback:", error);
              }
            }
            // Don't close the dialog after print
          }}
          onClose={() => {
            if (onClose) {
              try {
                onClose();
              } catch (error) {
                console.error("Error in onClose callback:", error);
              }
            }
            handleResult(false);
          }}
        />
      );
    } catch (error) {
      console.error("Error showing alert:", error);
      resolve(false);
    }
  });
}

// Export the AlertType for external use
export type { AlertType };

// Convenience functions for common alert types
export const showSuccessAlert = (title: string, message: string, options?: AlertOptions): Promise<boolean> => {
  return showAlert(title, message, "success", options);
};

export const showErrorAlert = (title: string, message: string, options?: AlertOptions): Promise<boolean> => {
  return showAlert(title, message, "error", options);
};

export const showWarningAlert = (title: string, message: string, options?: AlertOptions): Promise<boolean> => {
  return showAlert(title, message, "warning", options);
};

export const showInfoAlert = (title: string, message: string, options?: AlertOptions): Promise<boolean> => {
  return showAlert(title, message, "info", options);
};

export const showConfirmAlert = (title: string, message: string, options?: AlertOptions): Promise<boolean> => {
  return showAlert(title, message, "question", true, options);
};
