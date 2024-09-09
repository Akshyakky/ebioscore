import React from "react";
import CustomGrid from "../CustomGrid/CustomGrid";
import { AlertDto } from "../../interfaces/Common/AlertManager";
import CustomButton from "../Button/CustomButton";
import Close from "@mui/icons-material/Close";
import GenericDialog from "../GenericDialog/GenericDialog";

interface AlertPopUpProps {
    open: boolean;
    onClose: () => void;
    alertData: AlertDto[];
}

const AlertPopUp: React.FC<AlertPopUpProps> = ({
    open,
    onClose,
    alertData,
}) => {
    const defaultColumns = [
        { key: "oPIPAlertID", header: "Sl No.", visible: true },
        {
            key: "oPIPDate",
            header: "Date",
            visible: true,
            formatter: (value: Date) => new Date(value).toLocaleDateString(),
        },
        { key: "alertDescription", header: "Description", visible: true },
        { key: "rCreatedBy", header: "Created By", visible: true },
    ];

    const activeAlerts = alertData.filter(alert => alert.rActiveYN === "Y");

    return (
        <GenericDialog
            open={open}
            onClose={onClose}
            title="Alert Details"
            maxWidth="md"
            fullWidth
            actions={
                <CustomButton
                    onClick={onClose}
                    color="secondary"
                    text="Close"
                    variant="contained"
                    icon={Close}
                />
            }
        >
            <CustomGrid
                columns={defaultColumns}
                data={activeAlerts}
                maxHeight="400px"
                minHeight="300px"
            />


        </GenericDialog>
    )

};

export default AlertPopUp;
