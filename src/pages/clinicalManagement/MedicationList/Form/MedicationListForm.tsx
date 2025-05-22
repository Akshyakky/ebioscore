import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, CircularProgress } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { showAlert } from "@/utils/Common/showAlert";
import { useMedicationList } from "../hooks/useMedicationList";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

interface MedicationListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: MedicationListDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  mlID: z.number(),
  mlCode: z.string().nonempty("Medication code is required"),
  mGrpID: z.number().min(1, "Medication group is required"),
  mfID: z.number().min(1, "Manufacturer is required"),
  mfName: z.string().nonempty("Manufacturer name is required"),
  medText: z.string().nonempty("Medication name is required"),
  medText1: z.string().nullable().optional(),
  mGenID: z.number().min(1, "Generic medication is required"),
  mGenCode: z.string().nonempty("Generic code is required"),
  mGenName: z.string().nonempty("Generic name is required"),
  productID: z.number().nullable().optional(),
  calcQtyYN: z.string(),
  rActiveYN: z.string(),
});

type MedicationListFormData = z.infer<typeof schema>;

const MedicationListForm: React.FC<MedicationListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveMedication } = useMedicationList();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  // const { medicationGroupList, manufacturerList, medicationGeneric } = useDropdownValues(["medicationGroupList", "manufacturerList", "medicationGeneric"]);
  const dropdownValues = useDropdownValues(["medicationForm", "medicationGeneric"]);
  const medicationGroupList = [];
  const manufacturerList = [];
  const genericMedicationList = [];
  const isAddMode = !initialData;

  const defaultValues: MedicationListFormData = {
    mlID: 0,
    mlCode: "",
    mGrpID: 0,
    mfID: 0,
    mfName: "",
    medText: "",
    medText1: null,
    mGenID: 0,
    mGenCode: "",
    mGenName: "",
    productID: null,
    calcQtyYN: "N",
    rActiveYN: "Y",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<MedicationListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });
  const calcQtyYN = useWatch({ control, name: "calcQtyYN" });

  const generateMedicationCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("MED", 3);
      if (nextCode) {
        setValue("mlCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate medication code", "warning");
      }
    } catch (error) {
      console.error("Error generating medication code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData as MedicationListFormData);
    } else {
      reset(defaultValues);
      generateMedicationCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: MedicationListFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const medicationData: MedicationListDto = {
        mlID: data.mlID,
        mlCode: data.mlCode,
        mGrpID: data.mGrpID,
        mfID: data.mfID,
        mfName: data.mfName,
        medText: data.medText,
        medText1: data.medText1,
        mGenID: data.mGenID,
        mGenCode: data.mGenCode,
        mGenName: data.mGenName,
        productID: data.productID,
        calcQtyYN: data.calcQtyYN,
        rActiveYN: data.rActiveYN,
      };

      const response = await saveMedication(medicationData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Medication created successfully" : "Medication updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save medication");
      }
    } catch (error) {
      console.error("Error saving medication:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save medication";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (isDirty) {
      if (window.confirm("Are you sure you want to reset the form? All unsaved changes will be lost.")) {
        reset(initialData ? (initialData as MedicationListFormData) : defaultValues);
        setFormError(null);

        if (isAddMode) {
          generateMedicationCode();
        }
      }
    } else {
      reset(initialData ? (initialData as MedicationListFormData) : defaultValues);
      setFormError(null);

      if (isAddMode) {
        generateMedicationCode();
      }
    }
  };

  const dialogTitle = viewOnly ? "View Medication Details" : isAddMode ? "Create New Medication" : `Edit Medication - ${initialData?.medText}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton
        text="Cancel"
        onClick={() => onClose()}
        variant="outlined"
        color="inherit"
        disabled={isSaving}
        confirmBeforeAction={isDirty}
        confirmationMessage="You have unsaved changes. Are you sure you want to cancel?"
      />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Medication" : "Update Medication"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={Save}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isAddMode ? "Creating..." : "Updating..."}
          successText={isAddMode ? "Created!" : "Updated!"}
          disabled={isSaving || !isValid}
        />
      </Box>
    </Box>
  );

  const handleRefreshCode = () => {
    if (isAddMode) {
      generateMedicationCode();
    }
  };

  return (
    <GenericDialog
      open={open}
      onClose={() => onClose()}
      title={dialogTitle}
      maxWidth="md"
      fullWidth
      showCloseButton
      disableBackdropClick={!viewOnly && (isDirty || isSaving)}
      disableEscapeKeyDown={!viewOnly && (isDirty || isSaving)}
      actions={dialogActions}
    >
      <Box component="form" noValidate sx={{ p: 1 }}>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Status Toggle - Prominent Position */}
          <Grid size={{ sm: 12 }}>
            <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
            </Box>
          </Grid>

          {/* Basic Information Section */}
          <Grid size={{ sm: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField
                      name="mlCode"
                      control={control}
                      label="Medication Code"
                      type="text"
                      required
                      disabled={viewOnly || !isAddMode}
                      size="small"
                      fullWidth
                      InputProps={{
                        endAdornment:
                          isAddMode && !viewOnly ? (
                            <InputAdornment position="end">
                              {isGeneratingCode ? (
                                <CircularProgress size={20} />
                              ) : (
                                <SmartButton icon={Refresh} variant="text" size="small" onClick={handleRefreshCode} tooltip="Generate new code" sx={{ minWidth: "unset" }} />
                              )}
                            </InputAdornment>
                          ) : null,
                      }}
                    />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField name="medText" control={control} label="Medication Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField name="medText1" control={control} label="Alternative Name" type="text" disabled={viewOnly} size="small" fullWidth />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Medication Details Section */}
          <Grid size={{ sm: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Medication Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField
                      name="mGrpID"
                      control={control}
                      label="Medication Group"
                      type="select"
                      options={medicationGroupList}
                      required
                      disabled={viewOnly}
                      size="small"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField
                      name="mfID"
                      control={control}
                      label="Manufacturer"
                      type="select"
                      options={manufacturerList}
                      required
                      disabled={viewOnly}
                      size="small"
                      fullWidth
                      onChange={(value) => {
                        const selectedManufacturer = manufacturerList?.find((manufacturer) => Number(manufacturer.value) === Number(value.value));
                        if (selectedManufacturer) {
                          setValue("mfName", selectedManufacturer.label);
                        }
                      }}
                    />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField
                      name="mGenID"
                      control={control}
                      label="Generic Medication"
                      type="select"
                      options={genericMedicationList}
                      required
                      disabled={viewOnly}
                      size="small"
                      fullWidth
                      onChange={(value) => {
                        const selectedGeneric = genericMedicationList?.find((generic) => Number(generic.value) === Number(value.value));
                        if (selectedGeneric) {
                          setValue("mGenName", selectedGeneric.label);
                          setValue("mGenCode", selectedGeneric.code || "");
                        }
                      }}
                    />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField name="calcQtyYN" control={control} label="Calculate Quantity" type="switch" disabled={viewOnly} size="small" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </GenericDialog>
  );
};

export default MedicationListForm;
