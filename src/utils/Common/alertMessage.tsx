import ReactDOM from "react-dom";
import { AlertDto } from "../../interfaces/Common/AlertManager";
import AlertPopUp from "../../components/Alert/CustomAlertMessage";

export const showAlertPopUp = (alertData: AlertDto) => {
    const popupElement = document.createElement('div');
    document.body.appendChild(popupElement);

    const handleClose = () => {
        ReactDOM.unmountComponentAtNode(popupElement);
        document.body.removeChild(popupElement);
    };

    ReactDOM.render(
        <AlertPopUp
            open={true}
            onClose={handleClose}
            alertData={alertData}
        />,
        popupElement
    );
};
