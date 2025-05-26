import CustomButton from "@/components/Button/CustomButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/FormField/FormField";
import { AssocDiagnosisDetailDto, DiagnosisDetailDto } from "@/interfaces/ClinicalManagement/DiagnosisDto";
import { icdDetailService } from "@/services/ClinicalManagementServices/clinicalManagementService";
import { showAlert } from "@/utils/Common/showAlert";
import { Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
interface DiagnosisSectionProps {
  primaryDiagnoses: DiagnosisDetailDto[];
  associatedDiagnoses: AssocDiagnosisDetailDto[];
  onPrimaryDiagnosesChange: (diagnoses: DiagnosisDetailDto[]) => void;
  onAssociatedDiagnosesChange: (diagnoses: AssocDiagnosisDetailDto[]) => void;
}

const DiagnosisSection: React.FC<DiagnosisSectionProps> = ({ primaryDiagnoses, associatedDiagnoses, onPrimaryDiagnosesChange, onAssociatedDiagnosesChange }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const fetchIcdSuggestions = useCallback(
    async (input: string) => {
      try {
        const response = await icdDetailService.find(`iCDDCode.contains("${input}") or iCDDName.contains("${input}")`);
        return (response.data ?? []).map((icd: DiagnosisDetailDto) => `${icd.icddCode} - ${icd.icddName}`);
      } catch (error) {
        console.error("Error fetching ICD suggestions:", error);
        return [];
      }
    },
    [icdDetailService]
  );

  const convertToAssocDiagnosis = (diagnosis: DiagnosisDetailDto): AssocDiagnosisDetailDto => ({
    ...diagnosis,
    opipAssocDiagDtlId: 0, // Set default value for new associated diagnoses
    opipAdmDtlId: 0, // Set appropriate default value
    primaryYN: "N", // Associated diagnoses are not primary
  });

  const handleAddDiagnosis = useCallback(
    async (type: "primary" | "associated") => {
      try {
        const [code] = searchTerm.split(" - ");
        const response = await icdDetailService.find(`iCDDCode == "${code}"`);

        if (response.data && response.data.length > 0) {
          const icdDetail = response.data[0];

          if (type === "primary") {
            const isDuplicate = primaryDiagnoses.some((d) => d.icddCode === icdDetail.icddCode);
            if (!isDuplicate) {
              onPrimaryDiagnosesChange([...primaryDiagnoses, icdDetail]);
            } else {
              showAlert("Duplicate Diagnosis", "This primary diagnosis has already been added.", "warning");
            }
          } else {
            const associatedDiagnosis = convertToAssocDiagnosis(icdDetail);
            const isDuplicate = associatedDiagnoses.some((d) => d.icddCode === associatedDiagnosis.icddCode);
            if (!isDuplicate) {
              onAssociatedDiagnosesChange([...associatedDiagnoses, associatedDiagnosis]);
            } else {
              showAlert("Duplicate Diagnosis", "This associated diagnosis has already been added.", "warning");
            }
          }
          setSearchTerm("");
        }
      } catch (error) {
        console.error("Error adding diagnosis:", error);
        showAlert("Error", "Failed to add diagnosis. Please try again.", "error");
      }
    },
    [searchTerm, primaryDiagnoses, associatedDiagnoses, onPrimaryDiagnosesChange, onAssociatedDiagnosesChange, icdDetailService]
  );

  const handleRemoveDiagnosis = useCallback(
    (type: "primary" | "associated", icddCode: string) => {
      showAlert("Confirm Removal", `Are you sure you want to remove this ${type} diagnosis?`, "warning", {
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes, remove it",
        cancelButtonText: "Cancel",
        onConfirm: () => {
          if (type === "primary") {
            onPrimaryDiagnosesChange(primaryDiagnoses.filter((d) => d.icddCode !== icddCode));
          } else {
            onAssociatedDiagnosesChange(associatedDiagnoses.filter((d) => d.icddCode !== icddCode));
          }
          showAlert("Diagnosis Removed", `The ${type} diagnosis has been removed successfully.`, "success");
        },
      });
    },
    [onPrimaryDiagnosesChange, onAssociatedDiagnosesChange, primaryDiagnoses, associatedDiagnoses]
  );

  const primaryColumns: Column<DiagnosisDetailDto>[] = useMemo(
    () => [
      { key: "icddCode", header: "ICD Code", visible: true },
      { key: "icddName", header: "Description", visible: true },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        render: (item) => <CustomButton variant="outlined" color="secondary" size="small" text="Remove" onClick={() => handleRemoveDiagnosis("primary", item.icddCode)} />,
      },
    ],
    [handleRemoveDiagnosis]
  );

  const associatedColumns: Column<AssocDiagnosisDetailDto>[] = useMemo(
    () => [
      { key: "icddCode", header: "ICD Code", visible: true },
      { key: "icddName", header: "Description", visible: true },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        render: (item) => <CustomButton variant="outlined" color="secondary" size="small" text="Remove" onClick={() => handleRemoveDiagnosis("associated", item.icddCode)} />,
      },
    ],
    [handleRemoveDiagnosis]
  );

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: "#F8F8F8" }}>
      <Typography variant="h6" gutterBottom>
        Diagnoses
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
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
        <Grid size={{ xs: 6 }}>
          <CustomButton
            variant="contained"
            color="primary"
            text="Add Primary Diagnosis"
            onClick={() => handleAddDiagnosis("primary")}
            disabled={!searchTerm}
            sx={{ width: "100%" }}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <CustomButton
            variant="contained"
            color="primary"
            text="Add Associated Diagnosis"
            onClick={() => handleAddDiagnosis("associated")}
            disabled={!searchTerm}
            sx={{ width: "100%" }}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle1">Primary Diagnoses</Typography>
          <CustomGrid columns={primaryColumns} data={primaryDiagnoses} pagination={false} maxHeight="300px" />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle1">Associated Diagnoses</Typography>
          <CustomGrid columns={associatedColumns} data={associatedDiagnoses} pagination={false} maxHeight="300px" />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(DiagnosisSection);
