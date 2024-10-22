// src/pages/clinicalManagement/PatientHistory/ReviewOfSystem/AddPastReviewOfSystem.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import FormField from '../../../../components/FormField/FormField';
import CustomButton from '../../../../components/Button/CustomButton';
import { OPIPHistROSDto } from '../../../../interfaces/ClinicalManagement/OPIPHistROSDto';
import { createEntityService } from '../../../../utils/Common/serviceFactory';
import { showAlert } from '../../../../utils/Common/showAlert';
import { useLoading } from '../../../../context/LoadingContext';
import { getDefaultFormDate } from '../../../../utils/Common/dateUtils';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';

interface AddPastReviewOfSystemProps {
    pchartId: number;
    opipNo: number;
    opipCaseNo: number;
    onHistoryChange: (historyData: any) => void;
    showImmediateSave: boolean;
    reviewOfSystemData: OPIPHistROSDto;
}

const AddPastReviewOfSystem: React.FC<AddPastReviewOfSystemProps> = ({
    pchartId,
    opipNo,
    opipCaseNo,
    onHistoryChange,
    showImmediateSave,
    reviewOfSystemData
}) => {
    const getInitialState = useCallback((): OPIPHistROSDto => ({
        opipRosID: 0,
        opipNo,
        opvID: 0,
        PChartID: pchartId,
        opipCaseNo,
        patOpip: 'I',
        opipRosDate: getDefaultFormDate(),
        opipRosDesc: '',
        opipRosNotes: '',
        oldPChartID: 0,
    }), [pchartId, opipNo, opipCaseNo]);

    const [rosData, setRosData] = useState<OPIPHistROSDto>(reviewOfSystemData || getInitialState());
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
                } else {
                    setRosData(getInitialState());
                }
            } catch (error) {
                console.error('Error loading review of system:', error);
                showAlert('Error', 'Failed to load review of system.', 'error');
                setRosData(getInitialState());
            } finally {
                setLoading(false);
            }
        }
    }, [pchartId, rosService, getInitialState]);

    useEffect(() => {
        loadReviewOfSystem();
    }, [loadReviewOfSystem]);

    useEffect(() => {
        onHistoryChange(rosData);
    }, [rosData, onHistoryChange]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRosData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleDateChange = useCallback((date: Date | null) => {
        if (date) {
            setRosData(prev => ({ ...prev, opipRosDate: date }));
        }
    }, []);

    const handleSave = async () => {
        if (!rosData.opipRosDesc.trim()) {
            showAlert('Warning', 'Please enter a description before saving.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const response = await rosService.save(rosData);
            if (response.success) {
                showAlert('Success', 'Review of System saved successfully!', 'success');
                if (rosData.opipRosID === 0) {
                    setRosData(getInitialState());
                }
            } else {
                showAlert('Error', response.errorMessage || 'Failed to save review of system.', 'error');
            }
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
                    maxDate={new Date()}
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
                    isMandatory
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
                {showImmediateSave && (
                    <Grid item xs={12}>
                        <CustomButton
                            variant="contained"
                            color="success"
                            onClick={handleSave}
                            text={`${rosData.opipRosID === 0 ? 'Save' : 'Update'} Review of System`}
                            icon={rosData.opipRosID === 0 ? SaveIcon : EditIcon}
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default AddPastReviewOfSystem;