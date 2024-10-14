import React, { useState, useCallback, useMemo } from 'react';
import { Grid, Typography, Button, Box, Paper } from '@mui/material';
import FormField from '../../../components/FormField/FormField';
import CustomGrid from '../../../components/CustomGrid/CustomGrid';
import { Column } from '../../../components/CustomGrid/CustomGrid';
import { IcdDetailDto } from '../../../interfaces/ClinicalManagement/IcdDetailDto';
import { createEntityService } from '../../../utils/Common/serviceFactory';

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
                if (type === 'primary') {
                    if (!primaryDiagnoses.some(d => d.icddCode === newDiagnosis.icddCode)) {
                        onPrimaryDiagnosesChange([...primaryDiagnoses, newDiagnosis]);
                    } else {
                        alert('This primary diagnosis has already been added.');
                    }
                } else {
                    if (!associatedDiagnoses.some(d => d.icddCode === newDiagnosis.icddCode)) {
                        onAssociatedDiagnosesChange([...associatedDiagnoses, newDiagnosis]);
                    } else {
                        alert('This associated diagnosis has already been added.');
                    }
                }
                setSearchTerm('');
            }
        } catch (error) {
            console.error('Error adding diagnosis:', error);
        }
    }, [searchTerm, primaryDiagnoses, associatedDiagnoses, onPrimaryDiagnosesChange, onAssociatedDiagnosesChange, icdDetailService]);

    const handleRemoveDiagnosis = useCallback((type: 'primary' | 'associated', icddCode: string) => {
        if (type === 'primary') {
            const newDiagnoses = primaryDiagnoses.filter(d => d.icddCode !== icddCode);
            onPrimaryDiagnosesChange(newDiagnoses);
        } else {
            const newDiagnoses = associatedDiagnoses.filter(d => d.icddCode !== icddCode);
            onAssociatedDiagnosesChange(newDiagnoses);
        }
    }, [primaryDiagnoses, associatedDiagnoses, onPrimaryDiagnosesChange, onAssociatedDiagnosesChange]);

    const columns: Column<IcdDetailDto & { type: 'primary' | 'associated' }>[] = [
        { key: 'icddCode', header: 'ICD Code', visible: true },
        { key: 'icddName', header: 'Description', visible: true },
        {
            key: 'actions',
            header: 'Actions',
            visible: true,
            render: (item) => (
                <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => handleRemoveDiagnosis(item.type, item.icddCode)}
                >
                    Remove
                </Button>
            ),
        },
    ];

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
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleAddDiagnosis('primary')}
                        disabled={!searchTerm}
                    >
                        Add Primary Diagnosis
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleAddDiagnosis('associated')}
                        disabled={!searchTerm}
                    >
                        Add Associated Diagnosis
                    </Button>
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

export default DiagnosisSection;