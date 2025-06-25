// src/pages/patientAdministration/AdmissionPage/Components/FamilyHistoryForm.tsx
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { OPIPHistFHDto } from "@/interfaces/ClinicalManagement/OPIPHistFHDto";
import { TemplateMastDto } from "@/interfaces/ClinicalManagement/TemplateDto";
import { useTemplateMast } from "@/pages/clinicalManagement/TemplateList/hooks/useTemplateList";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel as CancelIcon, Description as DescriptionIcon, FamilyRestroom as FamilyIcon, Save as SaveIcon, Search, AdbSharp as TemplateIcon } from "@mui/icons-material";
import { Alert, Autocomplete, Box, Card, CardContent, CircularProgress, Grid, Paper, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

interface FamilyHistoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OPIPHistFHDto) => Promise<void>;
  admission: any;
  existingHistory?: OPIPHistFHDto;
  viewOnly?: boolean;
}

const familyHistorySchema = z.object({
  opipFHID: z.number().default(0),
  opipNo: z.number(),
  opvID: z.number().default(0),
  pChartID: z.number(),
  opipCaseNo: z.number().default(0),
  patOpip: z.string().length(1).default("I"),
  opipFHDate: z.date(),
  opipFHDesc: z.string().min(1, "Family history description is required"),
  opipFHNotes: z.string().optional().nullable(),
  oldPChartID: z.number().default(0),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
});

type FamilyHistoryFormData = z.infer<typeof familyHistorySchema>;

const FamilyHistoryForm: React.FC<FamilyHistoryFormProps> = ({ open, onClose, onSubmit, admission, existingHistory, viewOnly = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [templateSearchValue, setTemplateSearchValue] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMastDto | null>(null);

  const serverDate = useServerDate();
  const { showAlert } = useAlert();
  const { templateList, fetchTemplateList, isLoading: templatesLoading } = useTemplateMast();

  const isEditMode = !!existingHistory;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<FamilyHistoryFormData>({
    resolver: zodResolver(familyHistorySchema),
    mode: "onChange",
    defaultValues: {
      opipFHID: 0,
      opipNo: 0,
      opvID: 0,
      pChartID: 0,
      opipCaseNo: 0,
      patOpip: "I",
      opipFHDate: serverDate,
      opipFHDesc: "",
      opipFHNotes: "",
      oldPChartID: 0,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    },
  });

  // Filter templates for family history type
  const familyHistoryTemplates = useMemo(() => {
    return templateList
      .filter((template) => template.templateType === "FAMILY_HISTORY" && template.rActiveYN === "Y" && (template.displayAllUsers === "Y" || template.displayAllUsers === "C"))
      .sort((a, b) => a.templateName.localeCompare(b.templateName));
  }, [templateList]);

  // Load templates on mount
  useEffect(() => {
    fetchTemplateList();
  }, [fetchTemplateList]);

  // Initialize form with admission data or existing history
  useEffect(() => {
    if (open && admission) {
      const initialData: FamilyHistoryFormData = existingHistory
        ? {
            ...existingHistory,
            opipFHDate: new Date(existingHistory.opipFHDate),
          }
        : {
            opipFHID: 0,
            opipNo: admission.ipAdmissionDto.admitID,
            opvID: 0,
            pChartID: admission.ipAdmissionDto.pChartID,
            opipCaseNo: 0,
            patOpip: "I",
            opipFHDate: serverDate,
            opipFHDesc: "",
            opipFHNotes: "",
            oldPChartID: 0,
            rActiveYN: "Y",
            transferYN: "N",
            rNotes: "",
          };

      reset(initialData);
    }
  }, [open, admission, existingHistory, reset, serverDate]);

  // Handle template selection
  const handleTemplateSelect = useCallback(
    (template: TemplateMastDto | null) => {
      if (template) {
        setSelectedTemplate(template);
        // Set the template description to the family history description field
        setValue("opipFHDesc", template.templateDescription, {
          shouldValidate: true,
          shouldDirty: true,
        });
        showAlert("Success", "Template content applied", "success");
      } else {
        setSelectedTemplate(null);
      }
    },
    [setValue, showAlert]
  );

  // Handle form submission
  const onFormSubmit = async (data: FamilyHistoryFormData) => {
    try {
      setIsSubmitting(true);
      //   await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error submitting family history:", error);
      showAlert("Error", "Failed to save family history", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const performReset = () => {
    if (existingHistory) {
      reset({
        ...existingHistory,
        opipFHDate: new Date(existingHistory.opipFHDate),
      });
    } else {
      reset();
    }
    setSelectedTemplate(null);
    setTemplateSearchValue("");
  };

  const patientName = admission
    ? `${admission.ipAdmissionDto.pTitle} ${admission.ipAdmissionDto.pfName} ${admission.ipAdmissionDto.pmName || ""} ${admission.ipAdmissionDto.plName}`.trim()
    : "Patient";

  const dialogTitle = viewOnly ? "View Family History" : isEditMode ? "Edit Family History" : "Add Family History";

  return (
    <>
      <GenericDialog
        open={open}
        onClose={onClose}
        title={dialogTitle}
        maxWidth="md"
        fullWidth
        disableBackdropClick={isSubmitting}
        disableEscapeKeyDown={isSubmitting}
        actions={
          viewOnly ? (
            <SmartButton text="Close" onClick={onClose} variant="contained" color="primary" size="small" />
          ) : (
            <Box display="flex" justifyContent="space-between" width="100%" gap={1}>
              <SmartButton text="Cancel" onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting} size="small" />
              <Box display="flex" gap={1}>
                <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={CancelIcon} disabled={isSubmitting || !isDirty} size="small" />
                <SmartButton
                  text={isEditMode ? "Update" : "Save"}
                  onClick={handleSubmit(onFormSubmit)}
                  variant="contained"
                  color="primary"
                  icon={SaveIcon}
                  disabled={isSubmitting || !isValid}
                  asynchronous
                  showLoadingIndicator
                  loadingText={isEditMode ? "Updating..." : "Saving..."}
                  successText={isEditMode ? "Updated!" : "Saved!"}
                  size="small"
                />
              </Box>
            </Box>
          )
        }
      >
        <Box sx={{ p: 2 }}>
          {/* Patient Info Header */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: "primary.50",
              border: "1px solid",
              borderColor: "primary.200",
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <FamilyIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" fontWeight="600">
                  {patientName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  UHID: {admission?.ipAdmissionDto.pChartCode} | Admission: {admission?.ipAdmissionDto.admitCode}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={2}>
            {/* Template Selection Section */}
            {!viewOnly && (
              <Grid size={{ sm: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TemplateIcon fontSize="small" />
                      Template Selection (Optional)
                    </Typography>

                    <Controller
                      name="opipFHDesc"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          options={familyHistoryTemplates}
                          getOptionLabel={(option) => option.templateName}
                          value={selectedTemplate}
                          onChange={(_, newValue) => handleTemplateSelect(newValue)}
                          loading={templatesLoading}
                          disabled={viewOnly}
                          size="small"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Search Templates"
                              placeholder="Type to search family history templates..."
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />,
                                endAdornment: (
                                  <>
                                    {templatesLoading ? <CircularProgress size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <Box component="li" {...props}>
                              <Box>
                                <Typography variant="body2">{option.templateName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.templateCode}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                          noOptionsText="No templates found"
                        />
                      )}
                    />

                    {selectedTemplate && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        Template "{selectedTemplate.templateName}" has been applied to the description.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Family History Details */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DescriptionIcon fontSize="small" />
                    Family History Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <EnhancedFormField name="opipFHDate" control={control} type="datepicker" label="Date" required disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <EnhancedFormField name="rActiveYN" control={control} type="switch" label="Active" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <EnhancedFormField
                        name="opipFHDesc"
                        control={control}
                        type="textarea"
                        label="Family History Description"
                        required
                        disabled={viewOnly}
                        rows={6}
                        placeholder="Enter detailed family history information..."
                        helperText="Describe any relevant family medical history, conditions, or genetic factors"
                      />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <EnhancedFormField
                        name="opipFHNotes"
                        control={control}
                        type="textarea"
                        label="Additional Notes"
                        disabled={viewOnly}
                        rows={3}
                        placeholder="Any additional notes or observations..."
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
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={() => {
          performReset();
          setShowResetConfirmation(false);
        }}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
      />
    </>
  );
};

export default FamilyHistoryForm;
