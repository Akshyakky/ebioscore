// src/pages/clinicalManagement/PatientHistory/SocialHistory/AddSocialHistory.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import FormField from '../../../../components/FormField/FormField';
import CustomButton from '../../../../components/Button/CustomButton';
import { OPIPHistSHDto } from '../../../../interfaces/ClinicalManagement/OPIPHistSHDto';
import { createEntityService } from '../../../../utils/Common/serviceFactory';
import { showAlert } from '../../../../utils/Common/showAlert';
import { useLoading } from '../../../../context/LoadingContext';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';

interface AddSocialHistoryProps {
    pchartId: number;
    opipNo: number;
    opipCaseNo: number;
}

const AddSocialHistory: React.FC<AddSocialHistoryProps> = ({ pchartId, opipNo, opipCaseNo }) => {
    const [shData, setSHData] = useState<OPIPHistSHDto>({
        opipSHID: 0,
        opipNo,
        opvID: 0,
        pChartID: pchartId,
        opipCaseNo,
        patOpip: 'I',
        opipSHDate: new Date(),
        opipSHDesc: '',
        opipSHNotes: '',
        oldPChartID: 0,
    });

    const { setLoading } = useLoading();
    const shService = createEntityService<OPIPHistSHDto>('OPIPHistSH', 'clinicalManagementURL');
    const theme = useTheme();

    const loadSocialHistory = useCallback(async () => {
        if (pchartId) {
            setLoading(true);
            try {
                const response = await shService.find(`pChartID=${pchartId}`);
                if (response.data && response.data.length > 0) {
                    setSHData(response.data[0]);
                }
            } catch (error) {
                console.error('Error loading social history:', error);
                showAlert('Error', 'Failed to load social history.', 'error');
            } finally {
                setLoading(false);
            }
        }
    }, [pchartId, shService]);

    useEffect(() => {
        loadSocialHistory();
    }, [loadSocialHistory]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSHData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setSHData(prev => ({ ...prev, opipSHDate: date }));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await shService.save(shData);
            showAlert('Success', 'Social History saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving social history:', error);
            showAlert('Error', 'Failed to save social history.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ color: theme.palette.text.primary }}>
            <Typography variant="h6" gutterBottom>Social History</Typography>
            <Grid container spacing={2}>
                <FormField
                    type="datepicker"
                    label="Date"
                    value={shData.opipSHDate}
                    onChange={handleDateChange}
                    name="opipSHDate"
                    ControlID="opipSHDate"
                    size="small"
                />
                <FormField
                    type="textarea"
                    label="Description"
                    value={shData.opipSHDesc}
                    onChange={handleInputChange}
                    name="opipSHDesc"
                    ControlID="opipSHDesc"
                    size="small"
                    rows={4}
                />
                <FormField
                    type="textarea"
                    label="Notes"
                    value={shData.opipSHNotes || ''}
                    onChange={handleInputChange}
                    name="opipSHNotes"
                    ControlID="opipSHNotes"
                    size="small"
                    rows={4}
                />
                <Grid item xs={12}>
                    <CustomButton
                        variant="contained"
                        color="success"
                        onClick={handleSave}
                        text="Save Social History"
                        icon={shData.opipSHID === 0 ? SaveIcon : EditIcon}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AddSocialHistory;