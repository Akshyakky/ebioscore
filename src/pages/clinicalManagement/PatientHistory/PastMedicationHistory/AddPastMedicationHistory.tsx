// src/pages/clinicalManagement/PatientHistory/PastMedication/AddPastMedicationHistory.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { Grid, Typography, Box } from '@mui/material';
import FormField from "../../../../components/FormField/FormField";
import CustomGrid, { Column } from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { MedicationListDto } from '../../../../interfaces/ClinicalManagement/MedicationListDto';
import { pastMedicationService } from '../../../../services/ClinicalManagementServices/pastMedicationService';
import { showAlert } from "../../../../utils/Common/showAlert";
import { PastMedicationDto, PastMedicationDetailDto } from '../../../../interfaces/ClinicalManagement/PastMedicationDto';
import { createEntityService } from '../../../../utils/Common/serviceFactory';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import useDropdownValues from '../../../../hooks/PatientAdminstration/useDropdownValues';

interface AddPastMedicationHistoryProps {
    pchartId: number;
    opipNo: number;
    opipCaseNo: number;
}

const AddPastMedicationHistory: React.FC<AddPastMedicationHistoryProps> = ({ pchartId, opipNo, opipCaseNo }) => {
    const [pastMedications, setPastMedications] = useState<PastMedicationDetailDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const medicationListService = useMemo(() => createEntityService<MedicationListDto>('MedicationList', 'clinicalManagementURL'), []);
    const dropdownValues = useDropdownValues(['medicationForm', 'medicationDosage', 'medicationFrequency', 'medicationInstruction']);

    const fetchMedicationSuggestions = useCallback(async (input: string) => {
        try {
            const response = await medicationListService.find(`medText.contains("${input}") or mGenName.contains("${input}")`);
            return response.data.map((med: MedicationListDto) => `${med.medText} - ${med.mGenName}`);
        } catch (error) {
            console.error('Error fetching medication suggestions:', error);
            return [];
        }
    }, [medicationListService]);

    const handleAddMedication = useCallback(async () => {
        try {
            const [medText] = searchTerm.split(' - ');
            const response = await medicationListService.find(`medText == "${medText}"`);
            if (response.data && response.data.length > 0) {
                const selectedMedication = response.data[0];
                const newMedication: PastMedicationDetailDto = {
                    opipPastMedDtlID: 0,
                    opipPastMedID: 0,
                    mfID: selectedMedication.mfID,
                    mfName: selectedMedication.mfName,
                    mGenID: selectedMedication.mGenID,
                    mGenCode: selectedMedication.mGenCode,
                    mGenName: selectedMedication.mGenName,
                    mlID: selectedMedication.mlID,
                    medText: selectedMedication.medText,
                    mdID: null,
                    mdName: '',
                    mFrqID: null,
                    mFrqName: '',
                    mInsID: null,
                    mInsName: '',
                    fromDate: null,
                    toDate: null,
                    rActiveYN: 'Y',
                    compID: 0,
                    compCode: '',
                    compName: '',
                    transferYN: 'N',
                    rNotes: '',
                };
                setPastMedications(prevMedications => [...prevMedications, newMedication]);
                setSearchTerm('');
            }
        } catch (error) {
            console.error('Error adding medication:', error);
            showAlert('Error', 'Failed to add medication. Please try again.', 'error');
        }
    }, [searchTerm, medicationListService]);

    const handleRemoveMedication = useCallback((medText: string) => {
        setPastMedications(prevMedications => prevMedications.filter(m => m.medText !== medText));
    }, []);

    const handleSaveMedications = useCallback(async () => {
        const pastMedicationMast: PastMedicationDto = {
            opipPastMedID: 0,
            opipNo,
            pChartID: pchartId,
            opvID: 0,
            opipCaseNo,
            patOpip: 'P',
            opipDate: new Date(),
            details: pastMedications,
            rActiveYN: 'Y',
            compID: 0,
            compCode: '',
            compName: '',
            transferYN: 'N',
            rNotes: '',
        };

        try {
            await pastMedicationService.createOrUpdatePastMedication(pastMedicationMast);
            showAlert("Success", "Past medications saved successfully!", "success");
            setPastMedications([]);
        } catch (error) {
            console.error("Error saving past medications:", error);
            showAlert("Error", "Failed to save past medications.", "error");
        }
    }, [pastMedications, pchartId, opipNo, opipCaseNo]);

    const handleInputChange = useCallback((index: number, field: keyof PastMedicationDetailDto, value: any) => {
        setPastMedications(prev => prev.map((med, i) =>
            i === index ? { ...med, [field]: value } : med
        ));
    }, []);

    const columns: Column<PastMedicationDetailDto>[] = [
        { key: 'medText', header: 'Medication Name', visible: true },
        { key: 'mfName', header: 'Form Name', visible: true },
        { key: 'mGenName', header: 'Generic Name', visible: true },
        {
            key: 'mdID',
            header: 'Dosage',
            visible: true,
            width: 200,
            render: (item, rowIndex) => (
                <FormField
                    type="select"
                    label="Dosage"
                    value={item.mdID?.toString() || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'mdID', Number(e.target.value))}
                    options={dropdownValues.medicationDosage}
                    ControlID={`dosage-${rowIndex}`}
                    name={`dosage-${rowIndex}`}
                    size="small"
                    fullWidth
                    gridProps={{ xs: 12 }}
                />
            )
        },
        {
            key: 'mFrqID',
            header: 'Frequency',
            visible: true,
            width: 200,
            render: (item, rowIndex) => (
                <FormField
                    type="select"
                    label="Frequency"
                    value={item.mFrqID?.toString() || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'mFrqID', Number(e.target.value))}
                    options={dropdownValues.medicationFrequency}
                    ControlID={`frequency-${rowIndex}`}
                    name={`frequency-${rowIndex}`}
                    size="small"
                    fullWidth
                    gridProps={{ xs: 12 }}
                />
            )
        },
        {
            key: 'mInsID',
            header: 'Instruction',
            visible: true,
            width: 200,
            render: (item, rowIndex) => (
                <FormField
                    type="select"
                    label="Instruction"
                    value={item.mInsID?.toString() || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'mInsID', Number(e.target.value))}
                    options={dropdownValues.medicationInstruction}
                    ControlID={`instruction-${rowIndex}`}
                    name={`instruction-${rowIndex}`}
                    size="small"
                    fullWidth
                    gridProps={{ xs: 12 }}
                />
            )
        },
        {
            key: 'fromDate',
            header: 'From Date',
            visible: true,
            width: 200,
            render: (item, rowIndex) => (
                <FormField
                    type="datepicker"
                    label="From Date"
                    value={item.fromDate}
                    onChange={(date) => handleInputChange(rowIndex, 'fromDate', date)}
                    ControlID={`fromDate-${rowIndex}`}
                    name={`fromDate-${rowIndex}`}
                    size="small"
                    fullWidth
                    gridProps={{ xs: 12 }}
                />
            )
        },
        {
            key: 'toDate',
            header: 'To Date',
            visible: true,
            width: 200,
            render: (item, rowIndex) => (
                <FormField
                    type="datepicker"
                    label="To Date"
                    value={item.toDate}
                    onChange={(date) => handleInputChange(rowIndex, 'toDate', date)}
                    ControlID={`toDate-${rowIndex}`}
                    name={`toDate-${rowIndex}`}
                    size="small"
                    fullWidth
                    gridProps={{ xs: 12 }}
                />
            )
        },
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
                    icon={DeleteIcon}
                    onClick={() => handleRemoveMedication(item.medText)}
                />
            ),
        },
    ];

    return (
        <Box>
            <Typography variant="h6" gutterBottom color="textPrimary">Past Medication</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormField
                        type="autocomplete"
                        label="Search Medications"
                        name="medicationSearch"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fetchSuggestions={fetchMedicationSuggestions}
                        onSelectSuggestion={(suggestion) => setSearchTerm(suggestion)}
                        ControlID="medicationSearch"
                        placeholder="Search by medication name or generic name"
                    />
                </Grid>
                <Grid item xs={3}>
                    <CustomButton
                        variant="contained"
                        color="primary"
                        text="Add Medication"
                        onClick={handleAddMedication}
                        disabled={!searchTerm}
                        icon={AddIcon}
                        sx={{ width: '100%' }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomGrid
                        columns={columns}
                        data={pastMedications}
                        pagination={false}
                        maxHeight="300px"
                    />
                </Grid>
                <Grid item xs={3}>
                    <CustomButton
                        variant="contained"
                        color="success"
                        text="Save Medications"
                        onClick={handleSaveMedications}
                        disabled={pastMedications.length === 0}
                        icon={SaveIcon}
                        sx={{ width: '100%' }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default React.memo(AddPastMedicationHistory);