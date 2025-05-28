// src/pages/billing/DepartmentListPage/Form/DepartmentListForm.tsx
import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, CircularProgress } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DepartmentDto } from "@/interfaces/Billing/DepartmentDto";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { useDepartmentList } from "../hooks/useDepartmentList";

interface DepartmentListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: DepartmentDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  deptID: z.number(),
  deptCode: z.string().nonempty("Department code is required"),
  deptName: z.string().nonempty("Department name is required"),
  deptType: z.string().optional(),
  deptStore: z.string().optional(),
  rActiveYN: z.string(),
  rNotes: z.string().nullable().optional(),
  deptLocation: z.string().optional(),
  deptSalesYN: z.string(),
  deptStorePhYN: z.string(),
  dlNumber: z.string().optional(),
  isUnitYN: z.string(),
  superSpecialityYN: z.string(),
  unit: z.string().optional(),
  isStoreYN: z.string(),
  autoConsumptionYN: z.string(),
  dischargeNoteYN: z.string(),
  transferYN: z.string().optional(),
});

type DepartmentListFormData = z.infer<typeof schema>;

const departmentTypeOptions = [
  { value: "CLINICAL", label: "Clinical" },
  { value: "NON_CLINICAL", label: "Non-Clinical" },
  { value: "ADMIN", label: "Administrative" },
  { value: "SUPPORT", label: "Support" },
];

const DepartmentListForm: React.FC<DepartmentListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveDepartment } = useDepartmentList();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const isAddMode = !initialData;

  const defaultValues: DepartmentListFormData = {
    deptID: 0,
    deptCode: "",
    deptName: "",
    deptType: "CLINICAL",
    deptStore: "",
    rActiveYN: "Y",
    rNotes: "",
    deptLocation: "",
    deptSalesYN: "N",
    deptStorePhYN: "N",
    dlNumber: "",
    isUnitYN: "N",
    superSpecialityYN: "N",
    unit: "",
    isStoreYN: "N",
    autoConsumptionYN: "N",
    dischargeNoteYN: "N",
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<DepartmentListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });
  const isStoreYN = useWatch({ control, name: "isStoreYN" });
  const isUnitYN = useWatch({ control, name: "isUnitYN" });

  const generateDepartmentCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("DEP", 3);
      if (nextCode) {
        setValue("deptCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate department code", "warning");
      }
    } catch (error) {
      console.error("Error generating department code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData as DepartmentListFormData);
    } else {
      reset(defaultValues);
      generateDepartmentCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: DepartmentListFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const departmentData: DepartmentDto = {
        deptID: data.deptID,
        deptCode: data.deptCode,
        deptName: data.deptName,
        deptType: data.deptType || "",
        deptStore: data.deptStore || "",
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes || "",
        deptLocation: data.deptLocation || "",
        deptSalesYN: data.deptSalesYN,
        deptStorePhYN: data.deptStorePhYN,
        dlNumber: data.dlNumber || "",
        isUnitYN: data.isUnitYN,
        superSpecialityYN: data.superSpecialityYN,
        unit: data.unit || "",
        isStoreYN: data.isStoreYN,
        autoConsumptionYN: data.autoConsumptionYN,
        dischargeNoteYN: data.dischargeNoteYN,
        transferYN: data.transferYN || "N",
      };

      const response = await saveDepartment(departmentData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Department created successfully" : "Department updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save department");
      }
    } catch (error) {
      console.error("Error saving department:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save department";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as DepartmentListFormData) : defaultValues);
    setFormError(null);

    if (isAddMode) {
      generateDepartmentCode();
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const handleResetConfirm = () => {
    performReset();
    setShowResetConfirmation(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirmation(false);
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirmation(false);
    onClose();
  };

  const handleCancelCancel = () => {
    setShowCancelConfirmation(false);
  };

  const dialogTitle = viewOnly ? "View Department Details" : isAddMode ? "Create New Department" : `Edit Department - ${initialData?.deptName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Department" : "Update Department"}
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
      generateDepartmentCode();
    }
  };

  return (
    <>
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
                        name="deptCode"
                        control={control}
                        label="Department Code"
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
                      <FormField name="deptName" control={control} label="Department Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="deptType"
                        control={control}
                        label="Department Type"
                        type="select"
                        disabled={viewOnly}
                        size="small"
                        options={departmentTypeOptions}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="deptLocation" control={control} label="Location" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Department Settings */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Department Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="isUnitYN" control={control} label="Is Unit" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="superSpecialityYN" control={control} label="Super Speciality" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    {isUnitYN === "Y" && (
                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField name="unit" control={control} label="Unit" type="text" disabled={viewOnly} size="small" fullWidth />
                      </Grid>
                    )}

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="isStoreYN" control={control} label="Is Store" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    {isStoreYN === "Y" && (
                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField name="deptStore" control={control} label="Store Name" type="text" disabled={viewOnly} size="small" fullWidth />
                      </Grid>
                    )}

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="deptStorePhYN" control={control} label="Store Pharmacy" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="deptSalesYN" control={control} label="Sales Department" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="autoConsumptionYN" control={control} label="Auto Consumption" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="dischargeNoteYN" control={control} label="Discharge Note" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="dlNumber" control={control} label="DL Number" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Notes Section */}
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
                        rows={4}
                        placeholder="Enter any additional information about this department"
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
    </>
  );
};

export default DepartmentListForm;
