import { SweetAlertIcon } from "sweetalert2";
import { createRoot } from "react-dom/client";
import CustomAlert from "../../components/Alert/CustomAlert";
import React from "react";

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

// Overloaded function signatures
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
      const alertElement = document.createElement("div");
      document.body.appendChild(alertElement);
      const root = createRoot(alertElement);

      const cleanup = () => {
        root.unmount();
        alertElement.remove();
      };

      root.render(
        <CustomAlert
          title={title}
          message={message}
          type={type}
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
            if (onConfirm) onConfirm();
            cleanup();
            resolve(true);
          }}
          onCancel={() => {
            if (onCancel) onCancel();
            cleanup();
            resolve(false);
          }}
          onPrint={() => {
            if (onPrint) onPrint();
          }}
          onClose={() => {
            if (onClose) onClose();
            cleanup();
            resolve(false);
          }}
        />
      );
    } catch (error) {
      console.error("Error showing alert:", error);
      resolve(false);
    }
  });
}
