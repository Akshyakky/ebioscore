//utils/Common/showAlert.tsx
import { SweetAlertIcon } from 'sweetalert2';
import ReactDOM from 'react-dom';
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

  const alertElement = document.createElement('div');
  document.body.appendChild(alertElement);

  ReactDOM.render(
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
      onConfirm={onConfirm}
      onCancel={onCancel}
      onPrint={onPrint}
      onClose={onClose}
    />,
    alertElement
  );
};
