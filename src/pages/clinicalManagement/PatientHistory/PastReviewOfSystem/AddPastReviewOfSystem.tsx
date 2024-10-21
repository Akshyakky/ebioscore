// src/pages/clinicalManagement/PatientHistory/ReviewOfSystem/AddPastReviewOfSystem.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import FormField from '../../../../components/FormField/FormField';
import CustomButton from '../../../../components/Button/CustomButton';
import { OPIPHistROSDto } from '../../../../interfaces/ClinicalManagement/OPIPHistROSDto';
import { createEntityService } from '../../../../utils/Common/serviceFactory';
import { showAlert } from '../../../../utils/Common/showAlert';
import { useLoading } from '../../../../context/LoadingContext';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';

interface AddPastReviewOfSystemProps {
    pchartId: number;
    opipNo: number;
    opipCaseNo: number;
}

const AddPastReviewOfSystem: React.FC<AddPastReviewOfSystemProps> = ({ pchartId, opipNo, opipCaseNo }) => {
    const [rosData, setRosData] = useState<OPIPHistROSDto>({
        opipRosID: 0,
        opipNo,
        opvID: 0,
        PChartID: pchartId,
        opipCaseNo,
        patOpip: 'I',
        opipRosDate: new Date(),
        opipRosDesc: '',
        opipRosNotes: '',
        oldPChartID: 0,
    });

    const { setLoading } = useLoading();
    const rosService = createEntityService<OPIPHistROSDto>('OPIPHistROS', 'clinicalManagementURL');
    const theme = useTheme();

    const loadReviewOfSystem = useCallback(async () => {
        if (pchartId) {
            setLoading(true);
            try {
                const response = await rosService.find(`PChartID=${pchartId}`);
                if (response.data && response.data.length > 0) {
                    setRosData(response.data[0]);
                }
            } catch (error) {
                console.error('Error loading review of system:', error);
                showAlert('Error', 'Failed to load review of system.', 'error');
            } finally {
                setLoading(false);
            }
        }
    }, [pchartId, rosService]);

    useEffect(() => {
        loadReviewOfSystem();
    }, [loadReviewOfSystem]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRosData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setRosData(prev => ({ ...prev, opipRosDate: date }));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await rosService.save(rosData);
            showAlert('Success', 'Review of System saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving review of system:', error);
            showAlert('Error', 'Failed to save review of system.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ color: theme.palette.text.primary }}>
            <Typography variant="h6" gutterBottom>Review of System</Typography>
            <Grid container spacing={2}>
                <FormField
                    type="datepicker"
                    label="Date"
                    value={rosData.opipRosDate}
                    onChange={handleDateChange}
                    name="opipRosDate"
                    ControlID="opipRosDate"
                    size="small"
                />
                <FormField
                    type="textarea"
                    label="Description"
                    value={rosData.opipRosDesc}
                    onChange={handleInputChange}
                    name="opipRosDesc"
                    ControlID="opipRosDesc"
                    size="small"
                    rows={4}
                />
                <FormField
                    type="textarea"
                    label="Notes"
                    value={rosData.opipRosNotes || ''}
                    onChange={handleInputChange}
                    name="opipRosNotes"
                    ControlID="opipRosNotes"
                    size="small"
                    rows={4}
                />
                <Grid item xs={12}>
                    <CustomButton
                        variant="contained"
                        color="success"
                        onClick={handleSave}
                        text="Save Review of System"
                        icon={rosData.opipRosID === 0 ? SaveIcon : EditIcon}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AddPastReviewOfSystem;