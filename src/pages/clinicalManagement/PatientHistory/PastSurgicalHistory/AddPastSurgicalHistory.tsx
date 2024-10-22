// src/pages/clinicalManagement/PatientHistory/PastSurgicalHistory/AddPastSurgicalHistory.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import FormField from '../../../../components/FormField/FormField';
import CustomButton from '../../../../components/Button/CustomButton';
import { OPIPHistPSHDto } from '../../../../interfaces/ClinicalManagement/OPIPHistPSHDto';
import { createEntityService } from '../../../../utils/Common/serviceFactory';
import { showAlert } from '../../../../utils/Common/showAlert';
import { useLoading } from '../../../../context/LoadingContext';
import { getDefaultFormDate } from '../../../../utils/Common/dateUtils';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';

interface AddPastSurgicalHistoryProps {
    pchartId: number;
    opipNo: number;
    opipCaseNo: number;
    onHistoryChange: (historyData: any) => void;
    showImmediateSave: boolean;
    pastSurgicalData: OPIPHistPSHDto;
}

const AddPastSurgicalHistory: React.FC<AddPastSurgicalHistoryProps> = ({
    pchartId,
    opipNo,
    opipCaseNo,
    onHistoryChange,
    showImmediateSave,
    pastSurgicalData
}) => {
    const getInitialState = useCallback((): OPIPHistPSHDto => ({
        opipPshID: 0,
        opipNo,
        opvID: 0,
        pChartID: pchartId,
        opipCaseNo,
        patOpipYn: 'I',
        opipPshDate: getDefaultFormDate(),
        opipPshDesc: '',
        opipPshNotes: '',
        oldPChartID: 0,
    }), [pchartId, opipNo, opipCaseNo]);

    const [pshData, setPshData] = useState<OPIPHistPSHDto>(pastSurgicalData || getInitialState());
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
                } else {
                    setPshData(getInitialState());
                }
            } catch (error) {
                console.error('Error loading past surgical history:', error);
                showAlert('Error', 'Failed to load past surgical history.', 'error');
                setPshData(getInitialState());
            } finally {
                setLoading(false);
            }
        }
    }, [pchartId, pshService, getInitialState]);

    useEffect(() => {
        loadPastSurgicalHistory();
    }, [loadPastSurgicalHistory]);

    useEffect(() => {
        onHistoryChange({
            type: 'pastSurgicalHistory',
            data: pshData,
            pchartId,
            opipNo,
            opipCaseNo
        });
    }, [pshData, pchartId, opipNo, opipCaseNo, onHistoryChange]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPshData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleDateChange = useCallback((date: Date | null) => {
        if (date) {
            setPshData(prev => ({ ...prev, opipPshDate: date }));
        }
    }, []);

    const handleSave = async () => {
        if (!pshData.opipPshDesc.trim()) {
            showAlert('Warning', 'Please enter a description before saving.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const response = await pshService.save(pshData);
            if (response.success) {
                showAlert('Success', 'Past Surgical History saved successfully!', 'success');
                if (pshData.opipPshID === 0) {
                    setPshData(getInitialState());
                }
            } else {
                showAlert('Error', response.errorMessage || 'Failed to save past surgical history.', 'error');
            }
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
                    maxDate={new Date()}
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
                    isMandatory
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
                {showImmediateSave && (
                    <Grid item xs={12}>
                        <CustomButton
                            variant="contained"
                            color="success"
                            onClick={handleSave}
                            text={`${pshData.opipPshID === 0 ? 'Save' : 'Update'} Past Surgical History`}
                            icon={pshData.opipPshID === 0 ? SaveIcon : EditIcon}
                            disabled={!pshData.opipPshDesc.trim()}
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default AddPastSurgicalHistory;