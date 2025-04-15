import AlertPopUp from "@/components/Alert/CustomAlertMessage";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import ReactDOM from "react-dom";

export const showAlertPopUp = (alertData: AlertDto[] | AlertDto) => {
  const popupElement = document.createElement("div");
  document.body.appendChild(popupElement);

  const handleClose = () => {
    ReactDOM.unmountComponentAtNode(popupElement);
    document.body.removeChild(popupElement);
  };

  const alertArray = Array.isArray(alertData) ? alertData : [alertData];

  ReactDOM.render(<AlertPopUp open={true} onClose={handleClose} alertData={alertArray} />, popupElement);
};
