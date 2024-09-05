import React from "react";
import ReactDOM from "react-dom";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CustomGrid from "../CustomGrid/CustomGrid";
import { AlertDto } from "../../interfaces/Common/AlertManager";

interface AlertPopUpProps {
    open: boolean;
    onClose: () => void;
    alertData?: AlertDto;
}

const AlertPopUp: React.FC<AlertPopUpProps> = ({ open, onClose, alertData }) => {
    const defaultColumns = [
        { key: "oPIPAlertID", header: "Sl No.", visible: true },
        {
            key: "oPIPDate",
            header: "Date",
            visible: true,
            formatter: (value: any) => {
                if (value instanceof Date && !isNaN(value.getTime())) {
                    return value.toLocaleDateString();
                } else {
                    return 'No valid date';
                }
            },
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
                    data={alertData ? [alertData] : []}
                    maxHeight="400px"
                    minHeight="300px"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AlertPopUp;
