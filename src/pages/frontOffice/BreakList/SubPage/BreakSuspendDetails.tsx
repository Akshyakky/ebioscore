import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Grid, Box } from "@mui/material";
import Close from "@mui/icons-material/Close";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import CustomButton from "../../../../components/Button/CustomButton";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import TextArea from "../../../../components/TextArea/TextArea";
import { BreakConSuspendData } from "../../../../interfaces/frontOffice/BreakConSuspendData";
import { BreakConSuspendService } from "../../../../services/FrontOfficeServices/BreakConSuspendService";
import { useLoading } from "../../../../context/LoadingContext";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { formatDate } from './../../../../utils/Common/dateUtils';

interface BreakSuspendDetailsProps {
    open: boolean;
    onClose: () => void;
    breakData: any;
}

const BreakSuspendDetails: React.FC<BreakSuspendDetailsProps> = ({ open, onClose, breakData }) => {
    const { setLoading } = useLoading();
    const serverDate = useServerDate();
    const [suspendStartDate, setSuspendStartDate] = useState(serverDate);
    const [suspendEndDate, setSuspendEndDate] = useState(serverDate);
    const [notes, setNotes] = useState<string>("");
    const { compID, compCode, compName, userID, userName } = useSelector((state: any) => state.userDetails);

    useEffect(() => {
        if (open && breakData) {
            setSuspendStartDate(serverDate);
            setSuspendEndDate(serverDate);
            setNotes(breakData.rNotes || "");
        }
    }, [open, breakData, serverDate]);

    const handleSave = useCallback(async () => {
        if (!breakData) return;

        const suspendData: BreakConSuspendData = {
            ...breakData,
            bCSStartDate: new Date(suspendStartDate),
            bCSEndDate: new Date(suspendEndDate),
            rNotes: notes,
            rCreatedOn: serverDate,
            rCreatedID: userID,
            rCreatedBy: userName,
            rModifiedOn: serverDate,
            rModifiedID: userID,
            rModifiedBy: userName,
            compID,
            compCode,
            compName
        };

        setLoading(true);
        try {
            const result = await BreakConSuspendService.saveBreakConSuspend(suspendData);
            if (result.success) {
                onClose();
            } else {
                console.error("Failed to save suspend data:", result.errorMessage);
            }
        } catch (error) {
            console.error("Error saving suspend data:", error);
        } finally {
            setLoading(false);
        }
    }, [breakData, suspendStartDate, suspendEndDate, notes, serverDate, userID, userName, compID, compCode, compName, setLoading]);

    const renderDateField = (id: string, title: string, value: string | Date, onChange?: (value: Date) => void) => (
        <Grid item xs={12} md={6}>
            <FloatingLabelTextBox
                ControlID={id}
                title={title}
                value={typeof value === 'string' ? value : formatDate(value.toString())}
                onChange={onChange ? (e: React.ChangeEvent<HTMLInputElement>) => {
                    const date = new Date(e.target.value);
                    onChange(date);
                } : undefined}
                type={onChange ? "date" : undefined}
                readOnly={!onChange}
                size="small"
            />
        </Grid>
    );

    return (
        <GenericDialog
            open={open}
            onClose={onClose}
            title="Suspend Break"
            maxWidth="sm"
            disableEscapeKeyDown={true}
            disableBackdropClick={true}
            dialogContentSx={{ maxHeight: '400px' }}
            fullWidth
            actions={
                <>
                    <CustomButton
                        variant="contained"
                        text="Save"
                        onClick={handleSave}
                        size="small"
                        color="secondary"
                    />
                    <CustomButton
                        variant="outlined"
                        text="Close"
                        onClick={onClose}
                        icon={Close}
                        size="small"
                        color="secondary"
                    />
                </>
            }>
            <Box>
                <Grid container spacing={2}>
                    {renderDateField("BreakStartDate", "Break Start Date", formatDate(breakData?.blStartDate || new Date()))}
                    {renderDateField("BreakEndDate", "Break End Date", formatDate(breakData?.blEndDate || new Date()))}
                    {renderDateField("SuspendStartDate", "Suspend Start Date", suspendStartDate, setSuspendStartDate)}
                    {renderDateField("SuspendEndDate", "Suspend End Date", suspendEndDate, setSuspendEndDate)}
                    <Grid item xs={12}>
                        <TextArea
                            label="Notes"
                            name="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            placeholder="Enter any notes here"
                            maxLength={4000}
                            isMandatory={false}
                            error={false}
                            helperText=""
                        />
                    </Grid>
                </Grid>
            </Box>
        </GenericDialog>
    );
};

export default React.memo(BreakSuspendDetails);