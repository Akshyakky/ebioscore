import React, { useState, useCallback, useMemo } from 'react';
import { Grid, Typography, Paper } from '@mui/material';
import FormField from '../../../components/FormField/FormField';
import CustomGrid from '../../../components/CustomGrid/CustomGrid';
import { Column } from '../../../components/CustomGrid/CustomGrid';
import { IcdDetailDto } from '../../../interfaces/ClinicalManagement/IcdDetailDto';
import { createEntityService } from '../../../utils/Common/serviceFactory';
import CustomButton from '../../../components/Button/CustomButton';
import { showAlert } from '../../../utils/Common/showAlert';
interface DiagnosisSectionProps {
    primaryDiagnoses: IcdDetailDto[];
    associatedDiagnoses: IcdDetailDto[];
    onPrimaryDiagnosesChange: (diagnoses: IcdDetailDto[]) => void;
    onAssociatedDiagnosesChange: (diagnoses: IcdDetailDto[]) => void;
}

const DiagnosisSection: React.FC<DiagnosisSectionProps> = ({
    primaryDiagnoses,
    associatedDiagnoses,
    onPrimaryDiagnosesChange,
    onAssociatedDiagnosesChange,
}) => {
    const icdDetailService = useMemo(() => createEntityService<IcdDetailDto>('IcdDetail', 'clinicalManagementURL'), []);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchIcdSuggestions = useCallback(async (input: string) => {
        try {
            const response = await icdDetailService.find(`iCDDCode.contains("${input}") or iCDDName.contains("${input}")`);
            return response.data.map((icd: IcdDetailDto) => `${icd.icddCode} - ${icd.icddName}`);
        } catch (error) {
            console.error('Error fetching ICD suggestions:', error);
            return [];
        }
    }, [icdDetailService]);

    const handleAddDiagnosis = useCallback(async (type: 'primary' | 'associated') => {
        try {
            const [code] = searchTerm.split(' - ');
            const response = await icdDetailService.find(`iCDDCode == "${code}"`);
            if (response.data && response.data.length > 0) {
                const newDiagnosis = response.data[0];
                const isDuplicate = (type === 'primary' ? primaryDiagnoses : associatedDiagnoses)
                    .some(d => d.icddCode === newDiagnosis.icddCode);

                if (!isDuplicate) {
                    const updateFunction = type === 'primary' ? onPrimaryDiagnosesChange : onAssociatedDiagnosesChange;
                    updateFunction([...(type === 'primary' ? primaryDiagnoses : associatedDiagnoses), newDiagnosis]);
                    setSearchTerm('');
                } else {
                    showAlert('Duplicate Diagnosis', `This ${type} diagnosis has already been added.`, 'warning');
                }
            }
        } catch (error) {
            console.error('Error adding diagnosis:', error);
            showAlert('Error', 'Failed to add diagnosis. Please try again.', 'error');
        }
    }, [searchTerm, primaryDiagnoses, associatedDiagnoses, onPrimaryDiagnosesChange, onAssociatedDiagnosesChange, icdDetailService]);

    const handleRemoveDiagnosis = useCallback((type: 'primary' | 'associated', icddCode: string) => {
        showAlert(
            'Confirm Removal',
            `Are you sure you want to remove this ${type} diagnosis?`,
            'warning',
            {
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Yes, remove it',
                cancelButtonText: 'Cancel',
                onConfirm: () => {
                    const updateFunction = type === 'primary' ? onPrimaryDiagnosesChange : onAssociatedDiagnosesChange;
                    const currentDiagnoses = type === 'primary' ? primaryDiagnoses : associatedDiagnoses;
                    updateFunction(currentDiagnoses.filter(d => d.icddCode !== icddCode));
                    showAlert('Diagnosis Removed', `The ${type} diagnosis has been removed successfully.`, 'success');
                }
            }
        );
    }, [onPrimaryDiagnosesChange, onAssociatedDiagnosesChange, primaryDiagnoses, associatedDiagnoses]);

    const columns: Column<IcdDetailDto & { type: 'primary' | 'associated' }>[] = useMemo(() => [
        { key: 'icddCode', header: 'ICD Code', visible: true },
        { key: 'icddName', header: 'Description', visible: true },
        {
            key: 'actions',
            header: 'Actions',
            visible: true,
            render: (item) => (
                <CustomButton
                    variant="outlined"
                    color="secondary"
                    size="small"
                    text="Remove"
                    onClick={() => handleRemoveDiagnosis(item.type, item.icddCode)}
                />
            ),
        },
    ], [handleRemoveDiagnosis]);

    return (
        <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8F8F8' }}>
            <Typography variant="h6" gutterBottom>Diagnoses</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormField
                        type="autocomplete"
                        label="Search ICD"
                        name="Diagnosis"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fetchSuggestions={fetchIcdSuggestions}
                        onSelectSuggestion={(suggestion) => setSearchTerm(suggestion)}
                        ControlID="icdSearch"
                        placeholder="Search by ICD code or name"
                    />
                </Grid>
                <Grid item xs={6}>
                    <CustomButton
                        variant="contained"
                        color="primary"
                        text="Add Primary Diagnosis"
                        onClick={() => handleAddDiagnosis('primary')}
                        disabled={!searchTerm}
                        sx={{ width: '100%' }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <CustomButton
                        variant="contained"
                        color="primary"
                        text="Add Associated Diagnosis"
                        onClick={() => handleAddDiagnosis('associated')}
                        disabled={!searchTerm}
                        sx={{ width: '100%' }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="subtitle1">Primary Diagnoses</Typography>
                    <CustomGrid
                        columns={columns}
                        data={primaryDiagnoses.map(d => ({ ...d, type: 'primary' as const }))}
                        pagination={false}
                        maxHeight="300px"
                    />
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="subtitle1">Associated Diagnoses</Typography>
                    <CustomGrid
                        columns={columns}
                        data={associatedDiagnoses.map(d => ({ ...d, type: 'associated' as const }))}
                        pagination={false}
                        maxHeight="300px"
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default React.memo(DiagnosisSection);