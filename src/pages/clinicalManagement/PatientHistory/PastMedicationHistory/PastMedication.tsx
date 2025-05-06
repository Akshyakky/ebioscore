// src/pages/clinicalManagement/PatientHistory/PastMedication/PastMedication.tsx
import CustomButton from "@/components/Button/CustomButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/FormField/FormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import { PastMedicationDetailDto, PastMedicationDto } from "@/interfaces/ClinicalManagement/PastMedicationDto";
import { useAppSelector } from "@/store/hooks";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";
import { Box, Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import MedicationIcon from "@mui/icons-material/Medication";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";

interface PastMedicationProps {
  pChartID: number;
  opipNo: number;
  opipCaseNo: number;
  medicationData?: PastMedicationDto;
  onMedicationChange: (medication: PastMedicationDto) => void;
}

const PastMedication: React.FC<PastMedicationProps> = ({ pChartID, opipNo, opipCaseNo, medicationData, onMedicationChange }) => {
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const dropdownValues = useDropdownValues(["medicationForm", "medicationDosage", "medicationFrequency", "medicationInstruction"]);

  const [selectedMedication, setSelectedMedication] = useState<string>("");
  const medicationListService = useMemo(() => createEntityService<MedicationListDto>("MedicationList", "clinicalManagementURL"), []);

  const initialMedicationState = useMemo(
    () => ({
      opipPastMedID: 0,
      opipNo,
      opvID: 0,
      pChartID,
      opipCaseNo,
      patOpip: "I",
      opipDate: new Date(),
      details: [],
      rActiveYN: "Y",
      compID: compID ?? 0,
      compCode: compCode ?? "",
      compName: compName ?? "",
      transferYN: "N",
      rNotes: "",
      oldPChartID: 0,
    }),
    [pChartID, opipNo, opipCaseNo, compID, compCode, compName]
  );

  const [formState, setFormState] = useState<PastMedicationDto>(medicationData || initialMedicationState);

  useEffect(() => {
    if (medicationData) {
      setFormState(medicationData);
    }
  }, [medicationData]);

  const fetchMedicationSuggestions = useCallback(
    async (input: string) => {
      try {
        const response = await medicationListService.find(`medText.contains("${input}") or mGenName.contains("${input}")`);
        return (response.data ?? []).map((med: MedicationListDto) => `${med.medText} - ${med.mGenName}`);
      } catch (error) {
        console.error("Error fetching medication suggestions:", error);
        return [];
      }
    },
    [medicationListService]
  );

  const handleMedicationSelect = useCallback(
    async (suggestion: string) => {
      const [medText] = suggestion.split(" - ");
      const existingMedication = formState.details.find((detail) => detail.medText === medText);

      if (existingMedication) {
        showAlert("Warning", "This medication is already added", "warning");
        return;
      }

      const newDetail: PastMedicationDetailDto = {
        opipPastMedDtlID: 0,
        opipPastMedID: formState.opipPastMedID,
        mfID: 0,
        mfName: "",
        mGenID: 0,
        mGenCode: "",
        mGenName: "",
        mlID: 0,
        medText,
        mdID: 0,
        mdName: "",
        mFrqID: 0,
        mFrqName: "",
        mInsID: 0,
        mInsName: "",
        fromDate: new Date(),
        toDate: new Date(),
        rActiveYN: "Y",
        compID,
        compCode,
        compName,
        transferYN: "N",
        rNotes: "",
      };

      const updatedState = {
        ...formState,
        details: [...formState.details, newDetail],
      };
      setFormState(updatedState);
      onMedicationChange(updatedState);
      setSelectedMedication("");
    },
    [formState, compID, compCode, compName, onMedicationChange]
  );

  const handleInputChange = useCallback(
    (rowIndex: number, field: keyof PastMedicationDetailDto, value: any) => {
      const updatedState = {
        ...formState,
        details: formState.details.map((detail, index) => (index === rowIndex ? { ...detail, [field]: value } : detail)),
      };
      setFormState(updatedState);
      onMedicationChange(updatedState);
    },
    [formState, onMedicationChange]
  );

  const handleRemoveMedication = useCallback(
    (medText: string) => {
      const updatedState = {
        ...formState,
        details: formState.details.filter((detail) => detail.medText !== medText),
      };
      setFormState(updatedState);
      onMedicationChange(updatedState);
    },
    [formState, onMedicationChange]
  );

  const columns = useMemo<Column<PastMedicationDetailDto>[]>(
    () => [
      { key: "medText", header: "Medication Name", visible: true },
      { key: "mfName", header: "Form Name", visible: true },
      { key: "mGenName", header: "Generic Name", visible: true },
      {
        key: "mdID",
        header: "Dosage",
        visible: true,
        width: 200,
        render: (item, rowIndex) => (
          <FormField
            type="select"
            label="Dosage"
            value={item.mdID?.toString() || ""}
            onChange={(e) => handleInputChange(rowIndex, "mdID", Number(e.target.value))}
            options={dropdownValues.medicationDosage || []}
            ControlID={`dosage-${rowIndex}`}
            name={`dosage-${rowIndex}`}
            size="small"
            fullWidth
            gridProps={{ xs: 12 }}
          />
        ),
      },
      {
        key: "mFrqID",
        header: "Frequency",
        visible: true,
        width: 200,
        render: (item, rowIndex) => (
          <FormField
            type="select"
            label="Frequency"
            value={item.mFrqID?.toString() || ""}
            onChange={(e) => handleInputChange(rowIndex, "mFrqID", Number(e.target.value))}
            options={dropdownValues.medicationFrequency || []}
            ControlID={`frequency-${rowIndex}`}
            name={`frequency-${rowIndex}`}
            size="small"
            fullWidth
            gridProps={{ xs: 12 }}
          />
        ),
      },
      {
        key: "mInsID",
        header: "Instruction",
        visible: true,
        width: 200,
        render: (item, rowIndex) => (
          <FormField
            type="select"
            label="Instruction"
            value={item.mInsID?.toString() || ""}
            onChange={(e) => handleInputChange(rowIndex, "mInsID", Number(e.target.value))}
            options={dropdownValues.medicationInstruction || []}
            ControlID={`instruction-${rowIndex}`}
            name={`instruction-${rowIndex}`}
            size="small"
            fullWidth
            gridProps={{ xs: 12 }}
          />
        ),
      },
      {
        key: "fromDate",
        header: "From Date",
        visible: true,
        width: 200,
        render: (item, rowIndex) => (
          <FormField
            type="datepicker"
            label="From Date"
            value={item.fromDate}
            onChange={(date) => handleInputChange(rowIndex, "fromDate", date)}
            ControlID={`fromDate-${rowIndex}`}
            name={`fromDate-${rowIndex}`}
            size="small"
            fullWidth
            gridProps={{ xs: 12 }}
          />
        ),
      },
      {
        key: "toDate",
        header: "To Date",
        visible: true,
        width: 200,
        render: (item, rowIndex) => (
          <FormField
            type="datepicker"
            label="To Date"
            value={item.toDate}
            onChange={(date) => handleInputChange(rowIndex, "toDate", date)}
            ControlID={`toDate-${rowIndex}`}
            name={`toDate-${rowIndex}`}
            size="small"
            fullWidth
            gridProps={{ xs: 12 }}
          />
        ),
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        render: (item) => <CustomButton variant="outlined" color="secondary" size="small" text="Remove" icon={DeleteIcon} onClick={() => handleRemoveMedication(item.medText)} />,
      },
    ],
    [dropdownValues, handleInputChange, handleRemoveMedication]
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
          <MedicationIcon color="primary" sx={{ mr: 1 }} />
          <LocalPharmacyIcon color="primary" sx={{ mr: 1 }} />
          <EventNoteIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            Past Medication History
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
            ControlID="medicationSearch"
            name="medicationSearch"
            placeholder="Type to search medications"
            size="small"
            gridProps={{ xs: 12, md: 6 }}
          />
        </Grid>

        <Box mt={3}>
          <CustomGrid columns={columns} data={formState.details} maxHeight="400px" minHeight="200px" showExportCSV showExportPDF exportFileName="past_medications" />
        </Box>
      </Paper>
    </Box>
  );
};

export default React.memo(PastMedication);
