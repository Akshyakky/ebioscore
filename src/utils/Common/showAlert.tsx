import { SweetAlertIcon } from 'sweetalert2';
import { createRoot } from 'react-dom/client';
import CustomAlert from '../../components/Alert/CustomAlert';

export const showAlert = (
  title: string,
  message: string,
  type: SweetAlertIcon,
  options?: {
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
) => {

  const {
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
  } = options || {};

  try {
    const alertElement = document.createElement('div');
    // alertElement.style.position = 'relative';
    // alertElement.style.zIndex = '1400';
    document.body.appendChild(alertElement);

    const root = createRoot(alertElement);

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
          root.unmount();
          alertElement.remove();
        }}
        onCancel={() => {
          if (onCancel) onCancel();
          root.unmount();
          alertElement.remove();
        }}
        onPrint={() => {
          if (onPrint) onPrint();
        }}
        onClose={() => {
          if (onClose) onClose();
          root.unmount();
          alertElement.remove();
        }}
      />
    );
  } catch (error) {
  }
};



