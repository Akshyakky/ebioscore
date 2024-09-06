import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CustomGrid from "../CustomGrid/CustomGrid";
import { AlertDto } from "../../interfaces/Common/AlertManager";
import CustomButton from "../Button/CustomButton";

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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Alert Details</DialogTitle>
            <DialogContent dividers>
                <CustomGrid
                    columns={defaultColumns}
                    data={alertData}
                    maxHeight="400px"
                    minHeight="300px"
                />
            </DialogContent>
            <DialogActions>
                <CustomButton
                    onClick={onClose}
                    color="secondary"
                    text="Close"
                    variant="contained"
                />
            </DialogActions>
        </Dialog>
    );
};

export default AlertPopUp;
