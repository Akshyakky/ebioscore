// src/pages/clinicalManagement/PatientHistory/PastSurgicalHistory/AddPastSurgicalHistory.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import FormField from '../../../../components/FormField/FormField';
import CustomButton from '../../../../components/Button/CustomButton';
import { OPIPHistPSHDto } from '../../../../interfaces/ClinicalManagement/OPIPHistPSHDto';
import { createEntityService } from '../../../../utils/Common/serviceFactory';
import { showAlert } from '../../../../utils/Common/showAlert';
import { useLoading } from '../../../../context/LoadingContext';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';

interface AddPastSurgicalHistoryProps {
    pchartId: number;
    opipNo: number;
    opipCaseNo: number;
}

const AddPastSurgicalHistory: React.FC<AddPastSurgicalHistoryProps> = ({ pchartId, opipNo, opipCaseNo }) => {
    const [pshData, setPshData] = useState<OPIPHistPSHDto>({
        opipPshID: 0,
        opipNo,
        opvID: 0,
        pChartID: pchartId,
        opipCaseNo,
        patOpipYn: 'I',
        opipPshDate: new Date(),
        opipPshDesc: '',
        opipPshNotes: '',
        oldPChartID: 0,
    });

    const { setLoading } = useLoading();
    const pshService = createEntityService<OPIPHistPSHDto>('OPIPHistPSH', 'clinicalManagementURL');
    const theme = useTheme();

    const loadPastSurgicalHistory = useCallback(async () => {
        if (pchartId) {
            setLoading(true);
            try {
                const response = await pshService.find(`pChartID=${pchartId}`);
                if (response.data && response.data.length > 0) {
                    setPshData(response.data[0]);
                }
            } catch (error) {
                console.error('Error loading past surgical history:', error);
                showAlert('Error', 'Failed to load past surgical history.', 'error');
            } finally {
                setLoading(false);
            }
        }
    }, [pchartId, pshService]);

    useEffect(() => {
        loadPastSurgicalHistory();
    }, [loadPastSurgicalHistory]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPshData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setPshData(prev => ({ ...prev, opipPshDate: date }));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await pshService.save(pshData);
            showAlert('Success', 'Past Surgical History saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving past surgical history:', error);
            showAlert('Error', 'Failed to save past surgical history.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ color: theme.palette.text.primary }}>
            <Typography variant="h6" gutterBottom>Past Surgical History</Typography>
            <Grid container spacing={2}>
                <FormField
                    type="datepicker"
                    label="Date"
                    value={pshData.opipPshDate}
                    onChange={handleDateChange}
                    name="opipPshDate"
                    ControlID="opipPshDate"
                    size="small"
                />
                <FormField
                    type="textarea"
                    label="Description"
                    value={pshData.opipPshDesc}
                    onChange={handleInputChange}
                    name="opipPshDesc"
                    ControlID="opipPshDesc"
                    size="small"
                    rows={4}
                />
                <FormField
                    type="textarea"
                    label="Notes"
                    value={pshData.opipPshNotes || ''}
                    onChange={handleInputChange}
                    name="opipPshNotes"
                    ControlID="opipPshNotes"
                    size="small"
                    rows={4}
                />
                <Grid item xs={12}>
                    <CustomButton
                        variant="contained"
                        color="success"
                        onClick={handleSave}
                        text="Save Past Surgical History"
                        icon={pshData.opipPshID === 0 ? SaveIcon : EditIcon}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AddPastSurgicalHistory;