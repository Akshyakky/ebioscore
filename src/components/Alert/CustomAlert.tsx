import React, { useEffect } from 'react';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface CustomAlertProps {
  title?: string;
  message: string;
  type: SweetAlertIcon;
  show: boolean;
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
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  title = '',
  message,
  type,
  show,
  showConfirmButton = true,
  showCancelButton = false,
  showPrintButton = false,
  showCloseButton = false,
  confirmButtonText = 'OK',
  cancelButtonText = 'Cancel',
  printButtonText = 'Print',
  closeButtonText = 'Close',
  onConfirm,
  onCancel,
  onPrint,
  onClose,
}) => {
  useEffect(() => {
    if (show) {
      MySwal.fire({
        title,
        text: message,
        icon: type,
        showConfirmButton,
        showCancelButton,
        confirmButtonText,
        cancelButtonText,
        showCloseButton,
        footer: showPrintButton ? `<button id="print-button" class="swal2-print-button">${printButtonText}</button>` : '',
        didOpen: () => {
          if (showPrintButton) {
            const printButton = document.getElementById('print-button');
            if (printButton) {
              printButton.addEventListener('click', () => {
                if (onPrint) onPrint();
              });
            }
          }
        },
        buttonsStyling: true,
      }).then((result: SweetAlertResult) => {
        if (result.isConfirmed && onConfirm) {
          onConfirm();
        } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel && onCancel) {
          onCancel();
        } else if (result.isDismissed && result.dismiss === Swal.DismissReason.close && onClose) {
          onClose();
        }
      });
    }
  }, [
    title,
    message,
    type,
    show,
    showConfirmButton,
    showCancelButton,
    confirmButtonText,
    cancelButtonText,
    showPrintButton,
    showCloseButton,
    printButtonText,
    onConfirm,
    onCancel,
    onPrint,
    onClose,
  ]);

  return null;
};

export default CustomAlert;
