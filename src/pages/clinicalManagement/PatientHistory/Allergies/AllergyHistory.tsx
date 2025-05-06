// src/pages/clinicalManagement/AllergyHistory/AllergyHistory.tsx
import CustomButton from "@/components/Button/CustomButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/FormField/FormField";
import { AllergyDto, OPIPHistAllergyDetailDto } from "@/interfaces/ClinicalManagement/AllergyDto";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import { useAppSelector } from "@/store/hooks";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";
import { Box, Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import MedicationIcon from "@mui/icons-material/Medication";
import WarningIcon from "@mui/icons-material/Warning";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

interface AllergyHistoryProps {
  pChartID: number;
  opipNo: number;
  opipCaseNo: number;
  historyList?: AllergyDto;
  onHistoryChange: (allergy: AllergyDto) => void;
}

const AllergyHistory: React.FC<AllergyHistoryProps> = ({ pChartID, opipNo, opipCaseNo, historyList, onHistoryChange }) => {
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const medicationListService = useMemo(() => createEntityService<MedicationListDto>("MedicationList", "clinicalManagementURL"), []);

  const initialAllergyState: AllergyDto = useMemo(
    () => ({
      opIPHistAllergyMastDto: {
        opipAlgId: 0,
        opipNo,
        opvID: 0,
        pChartID,
        opipCaseNo,
        patOpip: "I",
        opipDate: new Date(),
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
        transferYN: "N",
        rNotes: "",
        oldPChartID: 0,
      },
      allergyDetails: [],
    }),
    [pChartID, opipNo, opipCaseNo, compID, compCode, compName]
  );

  const [formState, setFormState] = useState<AllergyDto>(historyList || initialAllergyState);
  const [selectedMedication, setSelectedMedication] = useState<string>("");

  useEffect(() => {
    if (historyList) {
      setFormState(historyList);
    }
  }, [historyList]);

  const fetchMedicationSuggestions = useCallback(
    async (input: string) => {
      try {
        const response = await medicationListService.find(`medText.contains("${input}") or mGenName.contains("${input}")`);
        return (response.data ?? []).map((med: MedicationListDto) => `${med.medText} - ${med.mGenName} (${med.mfName})`);
      } catch (error) {
        console.error("Error fetching medication suggestions:", error);
        return [];
      }
    },
    [medicationListService]
  );

  const handleMedicationSelect = useCallback(
    async (suggestion: string) => {
      try {
        const [medText] = suggestion.split(" - ");
        const existingAllergy = formState.allergyDetails.find((detail) => detail.medText === medText);

        if (existingAllergy) {
          showAlert("Warning", "This medication allergy is already added", "warning");
          return;
        }

        const medicationResponse = await medicationListService.find(`medText.equals("${medText}")`);

        if (!medicationResponse.success || !(medicationResponse.data ?? []).length) {
          showAlert("Error", "Medication not found", "error");
          return;
        }

        const medication = (medicationResponse.data ?? [])[0];
        const newDetail: OPIPHistAllergyDetailDto = {
          opipAlgDetailId: 0,
          opipAlgId: formState.opIPHistAllergyMastDto.opipAlgId || 0,
          mfId: medication.mfID,
          mfName: medication.mfName,
          mlId: medication.mlID,
          medText: medication.medText,
          mGenId: medication.mGenID,
          mGenName: medication.mGenName,
          rActiveYN: "Y",
          compID: formState.opIPHistAllergyMastDto.compID,
          compCode: formState.opIPHistAllergyMastDto.compCode,
          compName: formState.opIPHistAllergyMastDto.compName,
          transferYN: "N",
          rNotes: "",
        };

        const updatedState = {
          ...formState,
          allergyDetails: [...formState.allergyDetails, newDetail],
        };
        setFormState(updatedState);
        onHistoryChange(updatedState);
        setSelectedMedication("");
      } catch (error) {
        console.error("Error adding medication allergy:", error);
        showAlert("Error", "Failed to add medication allergy", "error");
      }
    },
    [formState, medicationListService, onHistoryChange]
  );

  const handleRemoveAllergy = useCallback(
    (medText: string) => {
      const updatedState = {
        ...formState,
        allergyDetails: formState.allergyDetails.filter((detail) => detail.medText !== medText),
      };
      setFormState(updatedState);
      onHistoryChange(updatedState);
    },
    [formState, onHistoryChange]
  );

  const columns = useMemo<Column<OPIPHistAllergyDetailDto>[]>(
    () => [
      { key: "medText", header: "Medication Name", visible: true, width: 200 },
      { key: "mGenName", header: "Generic Name", visible: true, width: 200 },
      { key: "mfName", header: "Form", visible: true, width: 150 },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 100,
        render: (item) => <CustomButton variant="outlined" color="secondary" size="small" text="Remove" icon={DeleteIcon} onClick={() => handleRemoveAllergy(item.medText)} />,
      },
    ],
    [handleRemoveAllergy]
  );

  return (
    <Box>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: (theme) => theme.palette.background.paper,
          borderRadius: 2,
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <MedicationIcon color="error" sx={{ mr: 1 }} />
          <WarningIcon color="error" sx={{ mr: 1 }} />
          <ReportProblemIcon color="error" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2" color="error">
            Medication Allergies
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <FormField
            type="autocomplete"
            label="Search Medication"
            value={selectedMedication}
            onChange={(e) => setSelectedMedication(e.target.value)}
            onSelectSuggestion={handleMedicationSelect}
            fetchSuggestions={fetchMedicationSuggestions}
            ControlID="allergySearch"
            name="allergySearch"
            placeholder="Type to search medications"
            size="small"
            gridProps={{ xs: 12, md: 6 }}
          />
        </Grid>

        <Box mt={3}>
          <CustomGrid columns={columns} data={formState.allergyDetails} maxHeight="400px" minHeight="200px" />
        </Box>
      </Paper>
    </Box>
  );
};

export default React.memo(AllergyHistory);
