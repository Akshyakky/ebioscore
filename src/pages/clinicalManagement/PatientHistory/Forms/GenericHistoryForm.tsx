import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { RichTextEditor } from "@/components/RichTextEditor/RichTextEditor";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { useTemplateMast } from "@/pages/clinicalManagement/TemplateList/hooks/useTemplateList";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel as CancelIcon, Description as DescriptionIcon, Save as SaveIcon, Search, AdbSharp as TemplateIcon } from "@mui/icons-material";
import { Alert, Autocomplete, Box, Card, CardContent, CircularProgress, Grid, Paper, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

interface GenericHistoryFormProps<T> {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  admission: any;
  existingHistory?: T;
  viewOnly?: boolean;
  title: string;
  icon: React.ReactNode;
  templateType: string;
  formSchema: z.ZodSchema<T>;
  fields: {
    dateField: keyof T;
    descField: keyof T;
    notesField: keyof T;
    activeField: keyof T;
  };
}

export const GenericHistoryForm = <T extends Record<string, any>>({
  open,
  onClose,
  onSubmit,
  admission,
  existingHistory,
  viewOnly = false,
  title,
  icon,
  templateType,
  formSchema,
  fields,
}: GenericHistoryFormProps<T>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const serverDate = useServerDate();
  const { templateList, isLoading: templatesLoading } = useTemplateMast();

  const isEditMode = !!existingHistory;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isValid },
  } = useForm<T>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const filteredTemplates = useMemo(() => {
    return templateList
      .filter((template) => template.templateType === templateType && template.rActiveYN === "Y" && (template.displayAllUsers === "Y" || template.displayAllUsers === "C"))
      .sort((a, b) => a.templateName.localeCompare(b.templateName));
  }, [templateList, templateType]);

  useEffect(() => {
    if (open && admission) {
      let initialData: T;

      if (existingHistory) {
        // When editing, ensure all required fields are properly set
        initialData = {
          ...existingHistory,
          // Ensure date field is a Date object
          [fields.dateField]: existingHistory[fields.dateField] ? new Date(existingHistory[fields.dateField] as any) : serverDate,
          // Ensure all required base fields are present
          pChartID: existingHistory.pChartID || admission.ipAdmissionDto.pChartID,
          opipNo: existingHistory.opipNo || admission.ipAdmissionDto.admitID,
          opipCaseNo: existingHistory.opipCaseNo || admission.ipAdmissionDto.oPIPCaseNo || 0,
          patOpip: existingHistory.patOpip || admission.ipAdmissionDto.patOpip || "I",
          opvID: existingHistory.opvID || 0,
          oldPChartID: existingHistory.oldPChartID || 0,
          transferYN: existingHistory.transferYN || "N",
          rActiveYN: existingHistory.rActiveYN || "Y",
          rNotes: existingHistory.rNotes || null,
        } as T;
      } else {
        // New record
        initialData = {
          [fields.dateField]: serverDate,
          [fields.activeField]: "Y",
          pChartID: admission.ipAdmissionDto.pChartID,
          opipNo: admission.ipAdmissionDto.admitID,
          opipCaseNo: admission.ipAdmissionDto.oPIPCaseNo || 0,
          patOpip: admission.ipAdmissionDto.patOpip || "I",
          opvID: 0,
          oldPChartID: 0,
          transferYN: "N",
          rNotes: null,
        } as unknown as T;
      }

      reset(initialData);
    }
  }, [open, admission, existingHistory, reset, serverDate, fields]);

  const handleTemplateSelect = useCallback(
    (template: any) => {
      if (template) {
        setSelectedTemplate(template);
        setValue(fields.descField as any, template.templateDescription, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        setSelectedTemplate(null);
      }
    },
    [setValue, fields.descField]
  );

  const onFormSubmit = async (data: T) => {
    try {
      setIsSubmitting(true);
      const formData = { ...data, opipCaseNo: admission.ipAdmissionDto.oPIPCaseNo };
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(`Error submitting ${title.toLowerCase()}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const performReset = () => {
    if (existingHistory) {
      reset(existingHistory);
    } else {
      reset();
    }
    setSelectedTemplate(null);
  };

  const patientName = admission
    ? `${admission.ipAdmissionDto.pTitle} ${admission.ipAdmissionDto.pfName} ${admission.ipAdmissionDto.pmName || ""} ${admission.ipAdmissionDto.plName}`.trim()
    : "Patient";

  const dialogTitle = viewOnly ? `View ${title}` : isEditMode ? `Edit ${title}` : `Add ${title}`;

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
              {icon}
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
                      name={fields.descField as any}
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          options={filteredTemplates}
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
                              placeholder={`Type to search ${title.toLowerCase()} templates...`}
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

            {/* History Details */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DescriptionIcon fontSize="small" />
                    {title} Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <EnhancedFormField name={fields.dateField as string} control={control} type="datepicker" label="Date" required disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <EnhancedFormField name={fields.activeField as string} control={control} type="switch" label="Active" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <Controller
                        name={fields.descField as any}
                        control={control}
                        render={({ field, fieldState }) => (
                          <RichTextEditor value={field.value} onChange={field.onChange} disabled={viewOnly} error={!!fieldState.error} helperText={fieldState.error?.message} />
                        )}
                      />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <EnhancedFormField
                        name={fields.notesField as string}
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
