import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Add as AddIcon, Save, Cancel } from "@mui/icons-material";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";

interface InsuranceFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  onSave: (insuranceData: OPIPInsurancesDto) => void;
  initialData: OPIPInsurancesDto | null;
  pChartID: number;
  pChartCode?: string;
  viewOnly?: boolean;
}

const schema = z
  .object({
    ID: z.number().default(0),
    oPIPInsID: z.number().default(0),
    pChartID: z.number().default(0),
    insurID: z.number().min(1, "Insurance is required"),
    insurCode: z.string().optional().default(""),
    insurName: z.string().min(1, "Insurance name is required"),
    policyNumber: z.string().min(1, "Policy number is required"),
    policyHolder: z.string().optional().default(""),
    groupNumber: z.string().optional().default(""),
    policyStartDt: z.date(),
    policyEndDt: z.date(),
    guarantor: z.string().optional().default(""),
    relationVal: z.string().optional().default(""),
    relation: z.string().optional().default(""),
    address1: z.string().optional().default(""),
    address2: z.string().optional().default(""),
    phone1: z.string().optional().default(""),
    phone2: z.string().optional().default(""),
    rActiveYN: z.string().default("Y"),
    rNotes: z.string().optional().default(""),
    insurStatusCode: z.string().optional().default(""),
    insurStatusName: z.string().optional().default(""),
    pChartCode: z.string().optional().default(""),
    pChartCompID: z.number().optional().default(0),
    referenceNo: z.string().optional().default(""),
    transferYN: z.string().default("N"),
    coveredVal: z.string().optional().default(""),
    coveredFor: z.string().optional().default(""),
  })
  .refine((data) => data.policyEndDt >= data.policyStartDt, {
    message: "Policy end date must be after or equal to start date",
    path: ["policyEndDt"],
  });

type InsuranceFormData = z.infer<typeof schema>;
const InsuranceForm: React.FC<InsuranceFormProps> = ({ open, onClose, onSave, initialData, pChartID, pChartCode, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const { refreshDropdownValues, ...dropdownValues } = useDropdownValues(["insurance", "relation", "coverFor"]);
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");

  const isAddMode = !initialData || (!initialData.oPIPInsID && !initialData.ID);

  const defaultValues: InsuranceFormData = useMemo(
    () => ({
      ID: 0,
      oPIPInsID: 0,
      pChartID: pChartID,
      insurID: 0,
      insurCode: "",
      insurName: "",
      policyNumber: "",
      policyHolder: "",
      groupNumber: "",
      policyStartDt: serverDate,
      policyEndDt: serverDate,
      guarantor: "",
      relationVal: "",
      relation: "",
      address1: "",
      address2: "",
      phone1: "",
      phone2: "",
      rActiveYN: "Y",
      rNotes: "",
      insurStatusCode: "",
      insurStatusName: "",
      pChartCode: pChartCode || "",
      pChartCompID: 0,
      referenceNo: "",
      transferYN: "N",
      coveredVal: "",
      coveredFor: "",
    }),
    [pChartID, pChartCode, serverDate]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isValid, errors },
  } = useForm<InsuranceFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        const formData = {
          ...initialData,
          policyStartDt: initialData.policyStartDt ? new Date(initialData.policyStartDt) : serverDate,
          policyEndDt: initialData.policyEndDt ? new Date(initialData.policyEndDt) : serverDate,
          pChartID: pChartID,
          pChartCode: pChartCode || "",
        };
        reset(formData as InsuranceFormData);
      } else {
        reset(defaultValues);
      }
    }
  }, [open, initialData, reset, serverDate, pChartID, pChartCode]);

  const handleInsuranceChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.insurance?.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("insurID", Number(value), { shouldValidate: true, shouldDirty: true });
        setValue("insurName", selectedOption.label, { shouldValidate: true, shouldDirty: true });
        setValue("insurCode", selectedOption.value?.toString() || "", { shouldDirty: true });
      } else if (value === "" || value === 0) {
        setValue("insurID", 0, { shouldValidate: true, shouldDirty: true });
        setValue("insurName", "", { shouldValidate: true, shouldDirty: true });
        setValue("insurCode", "", { shouldDirty: true });
      }
    },
    [dropdownValues.insurance, setValue]
  );

  const handleRelationChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.relation?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("relationVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("relation", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      } else if (value === "" || value === 0) {
        setValue("relationVal", "", { shouldValidate: true, shouldDirty: true });
        setValue("relation", "", { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.relation, setValue]
  );

  const handleCoveredForChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.coverFor?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("coveredVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("coveredFor", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      } else if (value === "" || value === 0) {
        setValue("coveredVal", "", { shouldValidate: true, shouldDirty: true });
        setValue("coveredFor", "", { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.coverFor, setValue]
  );

  const onSubmit = useCallback(
    async (data: InsuranceFormData) => {
      if (viewOnly) return;
      setFormError(null);
      try {
        setIsSaving(true);
        setLoading(true);
        if (!data.insurID || data.insurID === 0) {
          setFormError("Insurance selection is required");
          return;
        }
        if (!data.policyNumber?.trim()) {
          setFormError("Policy number is required");
          return;
        }

        const formattedData: OPIPInsurancesDto = {
          ...data,
          ID: data.ID || 0,
          oPIPInsID: data.oPIPInsID || 0,
          insurID: data.insurID,
          insurName: data.insurName || "",
          relationVal: data.relationVal || "",
          rActiveYN: data.rActiveYN || "Y",
          policyStartDt: data.policyStartDt instanceof Date ? data.policyStartDt : new Date(data.policyStartDt),
          policyEndDt: data.policyEndDt instanceof Date ? data.policyEndDt : new Date(data.policyEndDt),
          pChartID: pChartID,
          pChartCode: pChartCode || "",
          policyNumber: data.policyNumber || "",
          policyHolder: data.policyHolder || "",
          groupNumber: data.groupNumber || "",
          guarantor: data.guarantor || "",
          relation: data.relation || "",
          address1: data.address1 || "",
          address2: data.address2 || "",
          phone1: data.phone1 || "",
          phone2: data.phone2 || "",
          rNotes: data.rNotes || "",
          insurStatusCode: data.insurStatusCode || "",
          insurStatusName: data.insurStatusName || "",
          pChartCompID: data.pChartCompID || 0,
          referenceNo: data.referenceNo || "",
          transferYN: data.transferYN || "N",
          coveredVal: data.coveredVal || "",
          coveredFor: data.coveredFor || "",
          insurCode: data.insurCode || "",
        };
        onSave(formattedData);
        showAlert("Success", isAddMode ? "Insurance record created successfully" : "Insurance record updated successfully", "success");
        onClose(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save insurance record";
        setFormError(errorMessage);
        showAlert("Error", errorMessage, "error");
      } finally {
        setIsSaving(false);
        setLoading(false);
      }
    },
    [viewOnly, setLoading, onSave, isAddMode, onClose, pChartID, pChartCode]
  );

  const performReset = useCallback(() => {
    if (initialData) {
      const formData = {
        ...initialData,
        policyStartDt: initialData.policyStartDt ? new Date(initialData.policyStartDt) : serverDate,
        policyEndDt: initialData.policyEndDt ? new Date(initialData.policyEndDt) : serverDate,
        pChartID: pChartID,
        pChartCode: pChartCode || "",
      };
      reset(formData as InsuranceFormData);
    } else {
      reset(defaultValues);
    }
    setFormError(null);
  }, [reset, initialData, defaultValues, serverDate, pChartID, pChartCode]);

  const handleReset = useCallback(() => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  }, [isDirty, performReset]);

  const handleResetConfirm = useCallback(() => {
    performReset();
    setShowResetConfirmation(false);
  }, [performReset]);

  const handleResetCancel = useCallback(() => {
    setShowResetConfirmation(false);
  }, []);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleCancelConfirm = useCallback(() => {
    setShowCancelConfirmation(false);
    onClose();
  }, [onClose]);

  const handleCancelCancel = useCallback(() => {
    setShowCancelConfirmation(false);
  }, []);

  const [, setFormDataDialog] = useState<AppModifyFieldDto>({
    amlID: 0,
    amlName: "",
    amlCode: "",
    amlField: "",
    defaultYN: "N",
    modifyYN: "N",
    rNotes: "",
    rActiveYN: "Y",
    transferYN: "N",
  });

  const handleAddField = useCallback((category: string) => {
    setDialogCategory(category);
    setFormDataDialog({
      amlID: 0,
      amlName: "",
      amlCode: "",
      amlField: category,
      defaultYN: "N",
      modifyYN: "N",
      rNotes: "",
      rActiveYN: "Y",
      transferYN: "N",
    });
    setIsFieldDialogOpen(true);
  }, []);

  const handleFieldDialogClose = useCallback(() => {
    setIsFieldDialogOpen(false);
  }, []);

  const onFieldAddedOrUpdated = useCallback(() => {
    if (dialogCategory) {
      const dropdownMap: Record<string, DropdownType> = {
        RELATION: "relation",
        COVERFOR: "coverFor",
      };
      const dropdownType = dropdownMap[dialogCategory];
      if (dropdownType) {
        refreshDropdownValues(dropdownType);
      }
    }
  }, [dialogCategory, refreshDropdownValues]);

  const dialogTitle = viewOnly ? "View Insurance Details" : isAddMode ? "Create New Insurance Record" : `Edit Insurance Record - ${initialData?.insurName}`;
  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Insurance Record" : "Update Insurance Record"}
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

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={dialogTitle}
        maxWidth="lg"
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
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Insurance Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="insurID"
                        control={control}
                        label="Insurance Provider"
                        type="select"
                        required
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        options={dropdownValues.insurance || []}
                        onChange={handleInsuranceChange}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="policyNumber" control={control} label="Policy Number" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="policyHolder" control={control} label="Policy Holder" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="groupNumber" control={control} label="Group Number" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="policyStartDt" control={control} label="Policy Start Date" type="datepicker" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="policyEndDt" control={control} label="Policy End Date" type="datepicker" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="guarantor" control={control} label="Guarantor" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="referenceNo" control={control} label="Reference Number" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Relationship and Coverage
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="relationVal"
                        control={control}
                        label="Relationship"
                        type="select"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        options={dropdownValues.relation || []}
                        onChange={handleRelationChange}
                        adornment={!viewOnly ? <SmartButton text="" icon={AddIcon} onClick={() => handleAddField("RELATION")} size="small" variant="text" color="primary" /> : null}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="coveredVal"
                        control={control}
                        label="Covered For"
                        type="select"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        options={dropdownValues.coverFor || []}
                        onChange={handleCoveredForChange}
                        adornment={!viewOnly ? <SmartButton text="" icon={AddIcon} onClick={() => handleAddField("COVERFOR")} size="small" variant="text" color="primary" /> : null}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="address1" control={control} label="Address Line 1" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="address2" control={control} label="Address Line 2" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="phone1" control={control} label="Phone Number 1" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="phone2" control={control} label="Phone Number 2" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={3}
                        placeholder="Enter any additional notes about this insurance record"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={handleResetCancel}
        onConfirm={handleResetConfirm}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />

      <ConfirmationDialog
        open={showCancelConfirmation}
        onClose={handleCancelCancel}
        onConfirm={handleCancelConfirm}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel?"
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        type="warning"
        maxWidth="sm"
      />

      <ModifiedFieldDialog
        open={isFieldDialogOpen}
        onClose={handleFieldDialogClose}
        selectedCategoryCode={dialogCategory}
        onFieldAddedOrUpdated={onFieldAddedOrUpdated}
        isFieldCodeDisabled={true}
      />
    </>
  );
};

export default InsuranceForm;
