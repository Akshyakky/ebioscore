import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, TextField, DialogActions } from '@mui/material';
import CustomButton from '../../../../components/Button/CustomButton';
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { BreakListService } from '../../../../services/FrontOfficeServices/BreakListServices/BreakListService';
import { BreakConSuspendService } from '../../../../services/FrontOfficeServices/BreakConSuspendService';
import { BreakConSuspendData } from '../../../../interfaces/frontOffice/BreakConSuspendData';
import { BreakConDetailData } from '../../../../interfaces/frontOffice/BreakConDetailsData';
import { BreakListConDetailsService } from '../../../../services/FrontOfficeServices/BreakListServices/BreakListConDetailService';
import { notifySuccess } from '../../../../utils/Common/toastManager';

interface SuspendFormProps {
    onClose: () => void;
    open?: boolean;
    selectedBreakId: BreakConDetailData | null;
    token: string;
    onSuspendSuccess: () => void;
}

interface Company {
    compID: number;
    compCode: string;
    compName: string;
}

const SuspendForm: React.FC<SuspendFormProps> = ({ onClose, selectedBreakId, token, onSuspendSuccess }) => {
    const [breakFromDate, setBreakFromDate] = useState<string>('');
    const [breakToDate, setBreakToDate] = useState<string>('');
    const [suspendFromDate, setSuspendFromDate] = useState<string>('');
    const [suspendEndDate, setSuspendEndDate] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [hPLID, setHPLID] = useState<number | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [createdID, setCreatedID] = useState<number>(0);
    const [createdBy, setCreatedBy] = useState<string>('');
    const [modifiedID, setModifiedID] = useState<number>(0);
    const [modifiedBy, setModifiedBy] = useState<string>('');
    const [modifiedOn, setModifiedOn] = useState<Date>(new Date());

    useEffect(() => {
        debugger
        if (selectedBreakId && selectedBreakId.blID) {
            const fetchDetails = async () => {
                try {
                    // Fetch break list details
                    const breakListResponse = await BreakListService.getBreakListById(token, selectedBreakId.blID);
                    if (breakListResponse.success && breakListResponse.data) {
                        setBreakFromDate(formatDateToInputString(new Date(breakListResponse.data.bLStartDate)));
                        setBreakToDate(formatDateToInputString(new Date(breakListResponse.data.bLEndDate)));
                        setCompany({
                            compID: breakListResponse.data.compID,
                            compCode: breakListResponse.data.compCode,
                            compName: breakListResponse.data.compName
                        });
                        setCreatedID(breakListResponse.data.rCreatedID || 0);
                        setCreatedBy(breakListResponse.data.rCreatedBy || '');
                        setModifiedID(breakListResponse.data.rModifiedID || 0);
                        setModifiedBy(breakListResponse.data.rModifiedBy || '');
                        setModifiedOn(new Date(breakListResponse.data.rModifiedOn || new Date()));
                    } else {
                        console.error("Error fetching break list details:", breakListResponse.errorMessage);
                    }

                    // Fetch break condition details
                    const breakConDetailResponse = await BreakListConDetailsService.getBreakConDetailById(token, selectedBreakId.blID);
                    if (breakConDetailResponse.success && breakConDetailResponse.data && breakConDetailResponse.data.length > 0) {
                        setHPLID(breakConDetailResponse.data[0].hPLID);
                    } else {
                        console.error("Error fetching break condition details:", breakConDetailResponse.errorMessage);
                    }
                } catch (error) {
                    console.error("Error fetching details:", error);
                    setErrorMessage("Failed to load details.");
                }
            };
            fetchDetails();
        }
    }, [selectedBreakId, token]);

    const formatDateToInputString = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async () => {
        debugger
        if (!suspendFromDate || !suspendEndDate) {
            setErrorMessage("Suspend dates are required.");
            return;
        }

        const suspendData: BreakConSuspendData = {
            bLID: selectedBreakId?.blID || 0,
            bCSStartDate: new Date(suspendFromDate),
            bCSEndDate: new Date(suspendEndDate),
            rNotes: notes,
            rActiveYN: 'Y',
            rCreatedOn: new Date(),
            bCSID: 0,
            hPLID: hPLID || 0,
            rCreatedID: createdID,
            rCreatedBy: createdBy,
            rModifiedID: modifiedID,
            rModifiedBy: modifiedBy,
            rModifiedOn: new Date(),
            compCode: company?.compCode || "",
            compName: company?.compName || "",
            compID: company?.compID || 0,
        };

        console.log('Submitting data:', suspendData);

        try {
            const response = await BreakConSuspendService.saveBreakConSuspend(token, suspendData);

            if (response.success) {
                notifySuccess("Break Condition Suspended Successfully!");
                onSuspendSuccess();
                onClose();
            } else {
                console.error("Error saving suspend details:", response.errorMessage);
                setErrorMessage(response.errorMessage || "Failed to save suspend details.");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("An error occurred while saving suspend details.");
        }
    };



    const handleResume = async () => {
        if (!selectedBreakId || hPLID === null) {
            setErrorMessage("Missing required data.");
            return;
        }

        const suspendData: BreakConSuspendData = {
            bLID: selectedBreakId.blID,
            bCSStartDate: new Date(suspendFromDate),
            bCSEndDate: new Date(suspendEndDate),
            rNotes: notes,
            rActiveYN: 'N',
            rCreatedOn: new Date(),
            bCSID: 0,
            hPLID: hPLID,
            rCreatedID: 0,
            rCreatedBy: '',
            rModifiedID: 0,
            rModifiedBy: '',
            rModifiedOn: new Date(),
            compCode: company ? company.compCode : "",
            compName: company ? company.compName : "",
            compID: company ? company.compID : 0,
        };

        try {
            const response = await BreakConSuspendService.saveBreakConSuspend(token, suspendData);

            if (response.success) {
                notifySuccess("Break Condition Resumed Successfully!");
                setSuspendFromDate('');
                setSuspendEndDate('');
                setNotes('');
                onClose();
            } else {
                console.error("Error resuming suspend details:", response.errorMessage);
                setErrorMessage(response.errorMessage || "Failed to resume suspend details.");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("An error occurred while resuming suspend details.");
        }
    };

    return (
        <Paper elevation={3} style={{ padding: 16, margin: '20px 0' }}>
            <Typography variant="h6" gutterBottom>Break Date:</Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        type="date"
                        label="From Date"
                        value={breakFromDate}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        InputProps={{ readOnly: true }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        type="date"
                        label="To Date"
                        value={breakToDate}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        InputProps={{ readOnly: true }}
                    />
                </Grid>
            </Grid>
            <Typography variant="h6" gutterBottom style={{ marginTop: 20 }}>Suspend Date:</Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        type="date"
                        label="From Date"
                        value={suspendFromDate}
                        onChange={(e) => setSuspendFromDate(e.target.value)}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        type="date"
                        label="To Date"
                        value={suspendEndDate}
                        onChange={(e) => setSuspendEndDate(e.target.value)}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
            </Grid>
            <TextField
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                size="small"
                fullWidth
                multiline
                rows={4}
                style={{ marginTop: 20 }}
            />

            <DialogActions>
                <CustomButton
                    variant="contained"
                    text="Close"
                    icon={CloseIcon}
                    size="medium"
                    onClick={onClose}
                    color="error"
                />
                <CustomButton
                    variant="contained"
                    text="Save"
                    icon={SaveIcon}
                    size="medium"
                    onClick={handleSubmit}
                    color="success"
                />

            </DialogActions>
        </Paper>
    );
};

export default SuspendForm;
