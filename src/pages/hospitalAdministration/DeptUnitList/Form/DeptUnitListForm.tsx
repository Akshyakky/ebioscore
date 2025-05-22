import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, CircularProgress } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DeptUnitListDto } from "@/interfaces/HospitalAdministration/DeptUnitListDto";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { showAlert } from "@/utils/Common/showAlert";
import { useDeptUnitList } from "../hooks/useDeptUnitList";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

interface DeptUnitListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: DeptUnitListDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  dulID: z.number(),
  deptID: z.number().min(1, "Department is required"),
  deptName: z.string().optional(),
  unitDesc: z.string().nonempty("Unit description is required"),
  rActiveYN: z.string(),
  rNotes: z.string().nullable().optional(),
});

type DeptUnitListFormData = z.infer<typeof schema>;

const DeptUnitListForm: React.FC<DeptUnitListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveDeptUnit } = useDeptUnitList();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const { department } = useDropdownValues(["department"]);
  const isAddMode = !initialData;

  const defaultValues: DeptUnitListFormData = {
    dulID: 0,
    deptID: 0,
    deptName: "",
    unitDesc: "",
    rActiveYN: "Y",
    rNotes: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<DeptUnitListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });

  const generateUnitCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("UNIT", 3);
      if (nextCode) {
        setValue("unitDesc", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate unit code", "warning");
      }
    } catch (error) {
      console.error("Error generating unit code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData as DeptUnitListFormData);
    } else {
      reset(defaultValues);
      generateUnitCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: DeptUnitListFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const deptUnitData: DeptUnitListDto = {
        dulID: data.dulID,
        deptID: data.deptID,
        deptName: data.deptName || "",
        unitDesc: data.unitDesc,
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes || "",
        transferYN: "N", // Always set to 'N' as per requirement
      };

      const response = await saveDeptUnit(deptUnitData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Department unit created successfully" : "Department unit updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save department unit");
      }
    } catch (error) {
      console.error("Error saving department unit:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save department unit";
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
        reset(initialData ? (initialData as DeptUnitListFormData) : defaultValues);
        setFormError(null);

        if (isAddMode) {
          generateUnitCode();
        }
      }
    } else {
      reset(initialData ? (initialData as DeptUnitListFormData) : defaultValues);
      setFormError(null);

      if (isAddMode) {
        generateUnitCode();
      }
    }
  };

  const dialogTitle = viewOnly ? "View Department Unit Details" : isAddMode ? "Create New Department Unit" : `Edit Department Unit - ${initialData?.unitDesc}`;

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
          text={isAddMode ? "Create Unit" : "Update Unit"}
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
      generateUnitCode();
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
                  Department Unit Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField
                      name="deptID"
                      control={control}
                      label="Department"
                      type="select"
                      required
                      disabled={viewOnly}
                      size="small"
                      options={department}
                      fullWidth
                      onChange={(value) => {
                        const selectedDept = department?.find((dept) => Number(dept.value) === Number(value.value));
                        setValue("deptName", selectedDept?.label || "");
                      }}
                    />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField
                      name="unitDesc"
                      control={control}
                      label="Unit Description"
                      type="text"
                      required
                      disabled={viewOnly}
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
                      placeholder="Enter any additional information about this department unit"
                    />
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

export default DeptUnitListForm;
