// src/pages/clinicalManagement/PatientHistory/Allergies/AddAllergiesHistory.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Grid, Typography, Box } from '@mui/material';
import FormField from "../../../../components/FormField/FormField";
import CustomGrid, { Column } from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { MedicationListDto } from '../../../../interfaces/ClinicalManagement/MedicationListDto';
import { allergyService } from '../../../../services/ClinicalManagementServices/allergyService';
import { showAlert } from "../../../../utils/Common/showAlert";
import { OPIPHistAllergyDetailDto, OPIPHistAllergyMastDto } from '../../../../interfaces/ClinicalManagement/AllergyDto';
import { createEntityService } from '../../../../utils/Common/serviceFactory';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

interface AddAllergiesHistoryProps {
    pChartId: number;
    opipNo: number;
    opipCaseNo: number;
    onHistoryChange: (historyData: any) => void;
    showImmediateSave: boolean;
    allergiesData: OPIPHistAllergyDetailDto[];
}

const AddAllergiesHistory: React.FC<AddAllergiesHistoryProps> = ({
    pChartId,
    opipNo,
    opipCaseNo,
    onHistoryChange,
    showImmediateSave,
    allergiesData
}) => {
    const [allergies, setAllergies] = useState<OPIPHistAllergyDetailDto[]>(allergiesData || []);
    const [searchTerm, setSearchTerm] = useState('');

    const medicationListService = useMemo(() => createEntityService<MedicationListDto>('MedicationList', 'clinicalManagementURL'), []);

    const fetchMedicationSuggestions = useCallback(async (input: string) => {
        try {
            const response = await medicationListService.find(`medText.contains("${input}") or mGenName.contains("${input}")`);
            return response.data.map((med: MedicationListDto) => `${med.medText} - ${med.mGenName}`);
        } catch (error) {
            console.error('Error fetching medication suggestions:', error);
            return [];
        }
    }, [medicationListService]);

    const handleAddAllergy = useCallback(async () => {
        try {
            const [medText] = searchTerm.split(' - ');
            const response = await medicationListService.find(`medText == "${medText}"`);
            if (response.data && response.data.length > 0) {
                const selectedMedication = response.data[0];
                const isDuplicate = allergies.some(a => a.medicationName === selectedMedication.medText);

                if (!isDuplicate) {
                    const newAllergy: OPIPHistAllergyDetailDto = {
                        opipAlgId: 0,
                        medicationName: selectedMedication.medText,
                        formName: selectedMedication.mfName,
                        genericName: selectedMedication.mGenName,
                    };
                    setAllergies(prevAllergies => [...prevAllergies, newAllergy]);
                    setSearchTerm('');
                } else {
                    showAlert('Duplicate Allergy', 'This allergy has already been added.', 'warning');
                }
            }
        } catch (error) {
            console.error('Error adding allergy:', error);
            showAlert('Error', 'Failed to add allergy. Please try again.', 'error');
        }
    }, [searchTerm, allergies, medicationListService]);

    const handleRemoveAllergy = useCallback((medicationName: string) => {
        showAlert(
            'Confirm Removal',
            'Are you sure you want to remove this allergy?',
            'warning',
            {
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Yes, remove it',
                cancelButtonText: 'Cancel',
                onConfirm: () => {
                    setAllergies(prevAllergies => prevAllergies.filter(a => a.medicationName !== medicationName));
                    showAlert('Allergy Removed', 'The allergy has been removed successfully.', 'success');
                }
            }
        );
    }, []);

    const handleSaveAllergies = useCallback(async () => {
        const allergyMast: OPIPHistAllergyMastDto = {
            pchartId: pChartId,
            opipNo: opipNo,
            opipCaseNo: opipCaseNo,
            allergyDetails: allergies,
        };

        try {
            await allergyService.createOrUpdateAllergy(allergyMast);
            showAlert("Success", "Allergies saved successfully!", "success");
            setAllergies([]);
        } catch (error) {
            console.error("Error saving allergies:", error);
            showAlert("Error", "Failed to save allergies.", "error");
        }
    }, [allergies, pChartId, opipNo, opipCaseNo]);

    useEffect(() => {
        onHistoryChange(allergies);
    }, [allergies, onHistoryChange]);

    const columns: Column<OPIPHistAllergyDetailDto>[] = [
        { key: 'medicationName', header: 'Medication Name', visible: true },
        { key: 'formName', header: 'Form Name', visible: true },
        { key: 'genericName', header: 'Generic Name', visible: true },
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
                    onClick={() => handleRemoveAllergy(item.medicationName)}
                />
            ),
        },
    ];

    return (
        <Box>
            <Typography variant="h6" gutterBottom color="textPrimary">Allergies</Typography>
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
                        text="Add Allergy"
                        onClick={handleAddAllergy}
                        disabled={!searchTerm}
                        icon={AddIcon}
                        sx={{ width: '100%' }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomGrid
                        columns={columns}
                        data={allergies}
                        pagination={false}
                        maxHeight="300px"
                    />
                </Grid>
                {showImmediateSave && (
                    <Grid item xs={3}>
                        <CustomButton
                            variant="contained"
                            color="success"
                            text="Save Allergies"
                            onClick={handleSaveAllergies}
                            disabled={allergies.length === 0}
                            icon={SaveIcon}
                            sx={{ width: '100%' }}
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default React.memo(AddAllergiesHistory);