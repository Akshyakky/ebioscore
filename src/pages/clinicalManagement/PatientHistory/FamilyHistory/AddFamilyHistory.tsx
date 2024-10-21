// src/pages/clinicalManagement/PatientHistory/FamilyHistory/AddFamilyHistory.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import FormField from '../../../../components/FormField/FormField';
import CustomButton from '../../../../components/Button/CustomButton';
import { OPIPHistFHDto } from '../../../../interfaces/ClinicalManagement/OPIPHistFHDto';
import { createEntityService } from '../../../../utils/Common/serviceFactory';
import { showAlert } from '../../../../utils/Common/showAlert';
import { useLoading } from '../../../../context/LoadingContext';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';

interface AddFamilyHistoryProps {
    pchartId: number;
    opipNo: number;
    opipCaseNo: number;
}

const AddFamilyHistory: React.FC<AddFamilyHistoryProps> = ({ pchartId, opipNo, opipCaseNo }) => {
    const [fhData, setFHData] = useState<OPIPHistFHDto>({
        opipFHID: 0,
        opipNo,
        opvID: 0,
        pChartID: pchartId,
        opipCaseNo,
        patOpip: 'I',
        opipFHDate: new Date(),
        opipFHDesc: '',
        opipFHNotes: '',
        oldPChartID: 0,
    });

    const { setLoading } = useLoading();
    const fhService = createEntityService<OPIPHistFHDto>('OPIPHistFH', 'clinicalManagementURL');
    const theme = useTheme();

    const loadFamilyHistory = useCallback(async () => {
        if (pchartId) {
            setLoading(true);
            try {
                const response = await fhService.find(`pChartID=${pchartId}`);
                if (response.data && response.data.length > 0) {
                    setFHData(response.data[0]);
                }
            } catch (error) {
                console.error('Error loading family history:', error);
                showAlert('Error', 'Failed to load family history.', 'error');
            } finally {
                setLoading(false);
            }
        }
    }, [pchartId, fhService]);

    useEffect(() => {
        loadFamilyHistory();
    }, [loadFamilyHistory]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFHData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setFHData(prev => ({ ...prev, opipFHDate: date }));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await fhService.save(fhData);
            showAlert('Success', 'Family History saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving family history:', error);
            showAlert('Error', 'Failed to save family history.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ color: theme.palette.text.primary }}>
            <Typography variant="h6" gutterBottom>Family History</Typography>
            <Grid container spacing={2}>
                <FormField
                    type="datepicker"
                    label="Date"
                    value={fhData.opipFHDate}
                    onChange={handleDateChange}
                    name="opipFHDate"
                    ControlID="opipFHDate"
                    size="small"
                />
                <FormField
                    type="textarea"
                    label="Description"
                    value={fhData.opipFHDesc || ''}
                    onChange={handleInputChange}
                    name="opipFHDesc"
                    ControlID="opipFHDesc"
                    size="small"
                    rows={4}
                />
                <FormField
                    type="textarea"
                    label="Notes"
                    value={fhData.opipFHNotes || ''}
                    onChange={handleInputChange}
                    name="opipFHNotes"
                    ControlID="opipFHNotes"
                    size="small"
                    rows={4}
                />
                <Grid item xs={12}>
                    <CustomButton
                        variant="contained"
                        color="success"
                        onClick={handleSave}
                        text="Save Family History"
                        icon={fhData.opipFHID === 0 ? SaveIcon : EditIcon}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AddFamilyHistory;