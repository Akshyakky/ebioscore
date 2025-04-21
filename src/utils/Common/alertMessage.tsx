import AlertPopUp from "@/components/Alert/CustomAlertMessage";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import { createRoot } from "react-dom/client";

export const showAlertPopUp = (alertData: AlertDto[] | AlertDto) => {
  const popupElement = document.createElement("div");
  document.body.appendChild(popupElement);

  const root = createRoot(popupElement);

  const handleClose = () => {
    root.unmount();
    document.body.removeChild(popupElement);
  };

  const alertArray = Array.isArray(alertData) ? alertData : [alertData];

  root.render(<AlertPopUp open={true} onClose={handleClose} alertData={alertArray} />);
};
