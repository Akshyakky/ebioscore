import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Grid, Box } from "@mui/material";
import Close from "@mui/icons-material/Close";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import CustomButton from "../../../../components/Button/CustomButton";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import TextArea from "../../../../components/TextArea/TextArea";
import { BreakConSuspendService } from "../../../../services/FrontOfficeServices/BreakConSuspendService";
import { useLoading } from "../../../../context/LoadingContext";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { BreakConSuspendData } from "../../../../interfaces/FrontOffice/BreakConSuspendData";

interface BreakSuspendDetailsProps {
    open: boolean;
    onClose: () => void;
    breakData: any;
}

const BreakSuspendDetails: React.FC<BreakSuspendDetailsProps> = ({ open, onClose, breakData }) => {
    const { setLoading } = useLoading();
    const serverDate = useServerDate();
    const { compID, compCode, compName, userID, userName } = useSelector((state: any) => state.userDetails);

    const [suspendData, setSuspendData] = useState<Partial<BreakConSuspendData>>({
        bCSStartDate: serverDate,
        bCSEndDate: serverDate,
        rNotes: "",
    });

    useEffect(() => {
        if (open && breakData) {
            setSuspendData(prevData => ({
                ...prevData,
                bCSStartDate: serverDate,
                bCSEndDate: serverDate,
                rNotes: breakData.rNotes || "",
            }));
        }
    }, [open, breakData, serverDate]);

    const handleInputChange = (field: keyof BreakConSuspendData, value: any) => {
        setSuspendData(prevData => ({ ...prevData, [field]: value }));
    };

    const handleSave = useCallback(async () => {
        if (!breakData) return;

        const updatedSuspendData: BreakConSuspendData = {
            ...breakData,
            ...suspendData,
            bCSStartDate: new Date(suspendData.bCSStartDate as Date),
            bCSEndDate: new Date(suspendData.bCSEndDate as Date),
            compID,
            compCode,
            compName
        };

        setLoading(true);
        try {
            const result = await BreakConSuspendService.saveBreakConSuspend(updatedSuspendData);
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
    }, [breakData, suspendData, serverDate, userID, userName, compID, compCode, compName, setLoading, onClose]);

    const renderDateField = (id: string, title: string, value: Date | string | undefined, onChange?: (value: Date) => void) => (
        <Grid item xs={12} md={6}>
            <FloatingLabelTextBox
                ControlID={id}
                title={title}
                value={value ? (typeof value === 'string' ? value : value.toISOString().split('T')[0]) : ''}
                onChange={onChange ? (e: React.ChangeEvent<HTMLInputElement>) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime())) {
                        onChange(date);
                    }
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
                    {renderDateField("BreakStartDate", "Break Start Date", breakData?.blStartDate)}
                    {renderDateField("BreakEndDate", "Break End Date", breakData?.blEndDate)}
                    {renderDateField("SuspendStartDate", "Suspend Start Date", suspendData.bCSStartDate, (date) => handleInputChange('bCSStartDate', date))}
                    {renderDateField("SuspendEndDate", "Suspend End Date", suspendData.bCSEndDate, (date) => handleInputChange('bCSEndDate', date))}
                    <Grid item xs={12}>
                        <TextArea
                            label="Notes"
                            name="notes"
                            value={suspendData.rNotes || ""}
                            onChange={(e) => handleInputChange('rNotes', e.target.value)}
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