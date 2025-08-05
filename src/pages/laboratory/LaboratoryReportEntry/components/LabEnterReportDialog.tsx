import SmartButton from "@/components/Button/SmartButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useContactMastByCategory from "@/hooks/hospitalAdministration/useContactMastByCategory";
import { ComponentResultDto, LabEnterResultDto, LabResultItemDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { useAlert } from "@/providers/AlertProvider";
import { laboratoryService } from "@/services/Laboratory/LaboratoryService";
import { LCENT_ID } from "@/types/lCentConstants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save as SaveIcon } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Chip, CircularProgress, Divider, Grid, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

interface LabEnterReportDialogProps {
  open: boolean;
  onClose: () => void;
  labRegNo: number;
  serviceTypeId: number;
  patientName?: string;
  onSave?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`investigation-tabpanel-${index}`} aria-labelledby={`investigation-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// Create dynamic schema based on component types
const createComponentSchema = (components: ComponentResultDto[]) => {
  const shape: Record<string, any> = {
    technicianApproval: z.string(),
    consultantApproval: z.string(),
    technicianId: z.number().optional(),
    consultantId: z.number().optional(),
  };

  components.forEach((component) => {
    const fieldName = `component_${component.componentId}`;

    switch (component.resultTypeId) {
      case LCENT_ID.SINGLELINE_NUMERIC_VALUES: // Single Line [Numbers only]
      case LCENT_ID.REFERENCE_VALUES: // Reference Values [Numeric Only]
        shape[fieldName] = z
          .string()
          .nonempty(`${component.componentName} is required`)
          .refine((val) => !isNaN(Number(val)), {
            message: "Please enter a valid number",
          });
        break;
      case LCENT_ID.MULTIPLE_SELECTION: // Selection Type
        shape[fieldName] = z.string().nonempty(`Please select a value for ${component.componentName}`);
        break;
      default:
        shape[fieldName] = z.string().nonempty(`${component.componentName} is required`);
        break;
    }

    // Add fields for remarks and comments if needed
    shape[`${fieldName}_remarks`] = z.string().optional();
    shape[`${fieldName}_comments`] = z.string().optional();
  });

  return z.object(shape);
};

type LabReportFormData = {
  technicianApproval: "Y" | "N";
  consultantApproval: "Y" | "N";
  technicianId?: number;
  consultantId?: number;
  [key: string]: any; // For dynamic component fields
};

const LabEnterReportDialog: React.FC<LabEnterReportDialogProps> = ({ open, onClose, labRegNo, serviceTypeId, patientName = "Unknown Patient", onSave }) => {
  const { showAlert } = useAlert();
  const { setLoading } = useLoading();
  const [labData, setLabData] = useState<LabEnterResultDto | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [componentSchema, setComponentSchema] = useState<z.ZodSchema<any> | null>(null);

  const { contacts: labTechnicians } = useContactMastByCategory({ consValue: "PHY" });
  const { contacts: labConsultants } = useContactMastByCategory({ consValue: "PHY" });

  // Initialize form with default values
  const {
    control,
    handleSubmit,
    reset,
    setValue: _setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<LabReportFormData>({
    defaultValues: {
      technicianApproval: "N",
      consultantApproval: "N",
      technicianId: undefined,
      consultantId: undefined,
    },
    resolver: componentSchema ? zodResolver(componentSchema) : undefined,
    mode: "onChange",
  });

  // Watch all form values for validation
  const formValues = useWatch({ control });
  useEffect(() => {
    console.log("formValues", formValues);
  }, [formValues]);
  // Fetch lab result data when dialog opens
  useEffect(() => {
    if (open && labRegNo && serviceTypeId) {
      fetchLabResult();
    }
  }, [open, labRegNo, serviceTypeId]);

  const fetchLabResult = async () => {
    setDataLoading(true);
    setError(null);
    try {
      const response = await laboratoryService.getLabEnterResult(labRegNo, serviceTypeId);
      if (response.success && response.data) {
        setLabData(response.data);

        // Create schema based on components
        const allComponents: ComponentResultDto[] = [];
        response.data.results.forEach((investigation) => {
          if (investigation.componentResults) {
            allComponents.push(...investigation.componentResults);
          }
        });

        const schema = createComponentSchema(allComponents);
        setComponentSchema(schema);

        // Set form default values
        const defaultValues: LabReportFormData = {
          technicianApproval: response.data.isTechnicianApproved || "N",
          consultantApproval: response.data.isLabConsultantApproved || "N",
          technicianId: response.data.technicianId,
          consultantId: response.data.labConsultantId,
        };

        // Initialize component values
        response.data.results.forEach((investigation) => {
          investigation.componentResults?.forEach((component) => {
            defaultValues[`component_${component.componentId}`] = component.patuentValue || "";
            if (component.comments) {
              defaultValues[`component_${component.componentId}_comments`] = component.comments;
            }
          });
        });

        reset(defaultValues);
      } else {
        setError(response.errorMessage || "Failed to fetch lab result data");
      }
    } catch (err) {
      console.error("Error fetching lab result:", err);
      setError("An unexpected error occurred while fetching lab result");
    } finally {
      setDataLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getComponentStatus = (component: ComponentResultDto, value: string): "Normal" | "Abnormal" => {
    if (component.resultTypeId === 6 && value && component.referenceRange) {
      const numValue = Number(value);
      const { lowerValue = 0, upperValue = 0 } = component.referenceRange;
      if (numValue < lowerValue || numValue > upperValue) {
        return "Abnormal";
      }
    }
    return "Normal";
  };

  const getStatusChip = (component: ComponentResultDto) => {
    const value = watch(`component_${component.componentId}`);
    if (!value) return null;

    const status = getComponentStatus(component, value);
    return <Chip size="small" label={status} color={status === "Normal" ? "success" : "error"} />;
  };

  const renderComponentField = (component: ComponentResultDto) => {
    const fieldName = `component_${component.componentId}`;
    const errorMessage = errors[fieldName]?.message;

    switch (component.resultTypeId) {
      case LCENT_ID.SINGLELINE_ALPHANUMERIC_VALUES: // Single Line [Alpha Numeric]
        return <FormField name={fieldName} control={control} label={component.componentName} type="text" required size="small" fullWidth placeholder="Enter value" />;

      case LCENT_ID.SINGLELINE_NUMERIC_VALUES: // Single Line [Numbers only]
      case LCENT_ID.REFERENCE_VALUES: // Reference Values [Numeric Only]
        return (
          <Box>
            <FormField
              name={fieldName}
              control={control}
              label={component.componentName}
              type="number"
              required
              size="small"
              fullWidth
              placeholder="Enter numeric value"
              adornment={component.unit}
              adornmentPosition="end"
            />
            {component.resultTypeId === 6 && component.referenceRange && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                Reference Range: {component.referenceRange.referenceRange} {component.unit}
              </Typography>
            )}
          </Box>
        );

      case LCENT_ID.MULTILINE_VALUES: // Multi Line [Alpha Numeric]
        return (
          <FormField
            name={fieldName}
            control={control}
            label={component.componentName}
            type="textarea"
            required
            size="small"
            fullWidth
            rows={3}
            placeholder="Enter detailed text"
          />
        );

      case LCENT_ID.MULTIPLE_SELECTION: // Selection Type [Alpha Numeric]
        // In a real implementation, you would fetch these options from the backend
        const selectionOptions = [
          { value: "Positive", label: "Positive" },
          { value: "Negative", label: "Negative" },
          { value: "Not Detected", label: "Not Detected" },
        ];

        return <FormField name={fieldName} control={control} label={component.componentName} type="select" required size="small" fullWidth options={selectionOptions} />;

      case LCENT_ID.TEMPLATE_VALUES: // Template Values [Alpha Numeric]
        return (
          <FormField
            name={fieldName}
            control={control}
            label={component.componentName}
            type="textarea"
            required
            size="small"
            fullWidth
            rows={5}
            placeholder="Enter or modify template text"
          />
        );

      default:
        return <FormField name={fieldName} control={control} label={component.componentName} type="text" required size="small" fullWidth placeholder="Enter value" />;
    }
  };

  const prepareDataForSave = (formData: LabReportFormData): LabEnterResultDto => {
    if (!labData) throw new Error("No lab data available");

    const updatedResults = labData.results.map((investigation) => ({
      ...investigation,
      componentResults: investigation.componentResults?.map((component) => {
        const value = formData[`component_${component.componentId}`] || "";
        const status = getComponentStatus(component, value);

        return {
          ...component,
          patuentValue: value,
          status: status,
          resultStatus: status,
          comments: formData[`component_${component.componentId}_comments`] || component.comments,
        };
      }),
    }));

    return {
      ...labData,
      technicianId: formData.technicianId,
      isTechnicianApproved: formData.technicianApproval,
      labConsultantId: formData.consultantId,
      isLabConsultantApproved: formData.consultantApproval,
      results: updatedResults as unknown as LabResultItemDto[],
    };
  };

  const onSubmit = async (formData: LabReportFormData) => {
    setSaving(true);
    setLoading(true);

    try {
      const dataToSave = prepareDataForSave(formData);
      const response = await laboratoryService.saveLabEnterResult(dataToSave);

      if (response.success) {
        showAlert("Success", "Lab results saved successfully", "success");
        if (onSave) onSave();
        onClose();
      } else {
        throw new Error(response.errorMessage || "Failed to save lab results");
      }
    } catch (err) {
      console.error("Error saving lab results:", err);
      showAlert("Error", err instanceof Error ? err.message : "Failed to save lab results", "error");
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  // Prepare options for technicians and consultants dropdowns
  const technicianOptions = labTechnicians.map((tech) => ({
    value: Number(tech.value) || 0,
    label: tech.label || "",
  }));

  const consultantOptions = labConsultants.map((cons) => ({
    value: Number(cons.value) || 0,
    label: cons.label || "",
  }));

  if (!open) return null;

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title="Enter Laboratory Report"
      maxWidth="xl"
      fullWidth
      disableBackdropClick={saving}
      disableEscapeKeyDown={saving}
      showCloseButton={!saving}
      actions={
        <>
          <SmartButton text="Cancel" onClick={onClose} variant="outlined" color="inherit" disabled={saving} />
          <SmartButton
            text="Save Results"
            icon={SaveIcon}
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            disabled={saving || dataLoading || !isValid}
            loadingText="Saving..."
            asynchronous={true}
            showLoadingIndicator={true}
          />
        </>
      }
    >
      {dataLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : labData ? (
        <Box component="form" noValidate>
          {/* Header Information */}
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Lab Reg No
                </Typography>
                <Typography variant="h6">{labData.labRegNo}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <Typography variant="body2" color="text.secondary">
                  Patient Name
                </Typography>
                <Typography variant="h6">{patientName}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="h6">{labData.departmentName}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Approval Section */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Approvals
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={2}>
                    <FormField
                      name="technicianId"
                      control={control}
                      label="Technician"
                      type="select"
                      size="small"
                      fullWidth
                      options={technicianOptions}
                      placeholder="Select Technician"
                    />
                    <FormField name="technicianApproval" control={control} label="Technician Approved" type="switch" size="small" disabled={!watch("technicianId")} />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={2}>
                    <FormField
                      name="consultantId"
                      control={control}
                      label="Lab Consultant"
                      type="select"
                      size="small"
                      fullWidth
                      options={consultantOptions}
                      placeholder="Select Consultant"
                    />
                    <FormField name="consultantApproval" control={control} label="Consultant Approved" type="switch" size="small" disabled={!watch("consultantId")} />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Investigation Tabs */}
          <Paper sx={{ mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="investigation tabs" variant="scrollable" scrollButtons="auto">
              {labData.results.map((investigation) => (
                <Tab
                  key={investigation.investigationId}
                  label={
                    <Box>
                      <Typography variant="body2">{investigation.investigationName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {investigation.investigationCode}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </Tabs>

            {labData.results.map((investigation, index) => (
              <TabPanel key={investigation.investigationId} value={activeTab} index={index}>
                <Box sx={{ p: 2 }}>
                  {/* Investigation Header */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">{investigation.investigationName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Code: {investigation.investigationCode}
                    </Typography>
                  </Box>

                  {/* Group components by subtitle */}
                  {(() => {
                    const groupedComponents = (investigation.componentResults || []).reduce((acc, component) => {
                      const subtitle = component.subTitleName || "Other";
                      if (!acc[subtitle]) acc[subtitle] = [];
                      acc[subtitle].push(component);
                      return acc;
                    }, {} as Record<string, ComponentResultDto[]>);

                    return Object.entries(groupedComponents).map(([subtitle, components]) => (
                      <Box key={subtitle} sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                          {subtitle}
                        </Typography>
                        <Grid container spacing={2}>
                          {components
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((component) => (
                              <Grid key={component.componentId} size={{ xs: 12, md: 6 }}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                                      <Box flex={1}>{renderComponentField(component)}</Box>
                                      <Box ml={1}>{getStatusChip(component)}</Box>
                                    </Stack>

                                    {component.interpretation && (
                                      <Box sx={{ mt: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                          Interpretation:
                                        </Typography>
                                        <Typography variant="body2">{component.interpretation}</Typography>
                                      </Box>
                                    )}

                                    <Box sx={{ mt: 2 }}>
                                      <FormField
                                        name={`component_${component.componentId}_comments`}
                                        control={control}
                                        label="Comments"
                                        type="textarea"
                                        size="small"
                                        fullWidth
                                        rows={2}
                                      />
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                        </Grid>
                      </Box>
                    ));
                  })()}
                </Box>
              </TabPanel>
            ))}
          </Paper>
        </Box>
      ) : (
        <Alert severity="info">No data available</Alert>
      )}
    </GenericDialog>
  );
};

export default LabEnterReportDialog;
