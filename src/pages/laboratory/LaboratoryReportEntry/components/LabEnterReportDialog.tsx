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
import { ExpandMore, GroupWork, Save as SaveIcon } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
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

// Create dynamic schema based on component types and investigation approvals
const createDynamicSchema = (investigations: LabResultItemDto[]) => {
  const shape: Record<string, any> = {};

  investigations.forEach((investigation) => {
    // Add approval fields for each investigation
    const invPrefix = `inv_${investigation.investigationId}`;
    shape[`${invPrefix}_technicianId`] = z.number().optional();
    shape[`${invPrefix}_technicianName`] = z.string().optional();
    shape[`${invPrefix}_technicianApproval`] = z.enum(["Y", "N"]).default("N");
    shape[`${invPrefix}_consultantId`] = z.number().optional();
    shape[`${invPrefix}_consultantName`] = z.string().optional();
    shape[`${invPrefix}_consultantApproval`] = z.enum(["Y", "N"]).default("N");
    shape[`${invPrefix}_remarks`] = z.string().optional();

    // Add component fields
    investigation.componentResults?.forEach((component) => {
      const fieldName = `component_${component.componentId}`;

      switch (component.resultTypeId) {
        case LCENT_ID.SINGLELINE_NUMERIC_VALUES:
        case LCENT_ID.REFERENCE_VALUES:
          shape[fieldName] = z
            .string()
            .nonempty(`${component.componentName} is required`)
            .refine((val) => !isNaN(Number(val)), {
              message: "Please enter a valid number",
            });
          break;
        case LCENT_ID.MULTIPLE_SELECTION:
          shape[fieldName] = z.string().nonempty(`Please select a value for ${component.componentName}`);
          break;
        default:
          shape[fieldName] = z.string().nonempty(`${component.componentName} is required`);
          break;
      }

      shape[`${fieldName}_remarks`] = z.string().optional();
      shape[`${fieldName}_comments`] = z.string().optional();
    });
  });

  return z.object(shape);
};

type LabReportFormData = {
  [key: string]: any; // For dynamic fields
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
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>("bulk-approval");

  const { contacts: labTechnicians } = useContactMastByCategory({ consValue: "PHY" });
  const { contacts: labConsultants } = useContactMastByCategory({ consValue: "PHY" });

  // Initialize form
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<LabReportFormData>({
    defaultValues: {},
    resolver: componentSchema ? zodResolver(componentSchema) : undefined,
    mode: "onChange",
  });

  // Watch all form values for validation
  const formValues = useWatch({ control });

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

        // Create schema based on investigations and components
        const schema = createDynamicSchema(response.data.results);
        setComponentSchema(schema);

        // Set form default values
        const defaultValues: LabReportFormData = {};

        // Initialize investigation-wise approval values
        response.data.results.forEach((investigation) => {
          const invPrefix = `inv_${investigation.investigationId}`;
          defaultValues[`${invPrefix}_technicianId`] = investigation.technicianId;
          defaultValues[`${invPrefix}_technicianName`] = investigation.technicianName || "";
          defaultValues[`${invPrefix}_technicianApproval`] = investigation.isTechnicianApproved || "N";
          defaultValues[`${invPrefix}_consultantId`] = investigation.labConsultantId;
          defaultValues[`${invPrefix}_consultantName`] = investigation.labConsultantName || "";
          defaultValues[`${invPrefix}_consultantApproval`] = investigation.isLabConsultantApproved || "N";
          defaultValues[`${invPrefix}_remarks`] = investigation.remarks || "";

          // Initialize component values
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

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const handleBulkApproval = (type: "technician" | "consultant") => {
    if (!labData) return;

    // Get the first selected value to apply to all
    const firstInvestigation = labData.results[0];
    if (!firstInvestigation) return;

    const invPrefix = `inv_${firstInvestigation.investigationId}`;

    if (type === "technician") {
      const technicianId = watch(`${invPrefix}_technicianId`);
      const technicianName = watch(`${invPrefix}_technicianName`);
      const technicianApproval = watch(`${invPrefix}_technicianApproval`);

      if (!technicianId) {
        showAlert("Warning", "Please select a technician from the first investigation to apply to all", "warning");
        return;
      }

      // Apply to all investigations
      labData.results.forEach((investigation) => {
        const prefix = `inv_${investigation.investigationId}`;
        setValue(`${prefix}_technicianId`, technicianId);
        setValue(`${prefix}_technicianName`, technicianName);
        setValue(`${prefix}_technicianApproval`, technicianApproval || "N");
      });

      showAlert("Success", "Technician details applied to all investigations", "success");
    } else {
      const consultantId = watch(`${invPrefix}_consultantId`);
      const consultantName = watch(`${invPrefix}_consultantName`);
      const consultantApproval = watch(`${invPrefix}_consultantApproval`);

      if (!consultantId) {
        showAlert("Warning", "Please select a consultant from the first investigation to apply to all", "warning");
        return;
      }

      // Apply to all investigations
      labData.results.forEach((investigation) => {
        const prefix = `inv_${investigation.investigationId}`;
        setValue(`${prefix}_consultantId`, consultantId);
        setValue(`${prefix}_consultantName`, consultantName);
        setValue(`${prefix}_consultantApproval`, consultantApproval || "N");
      });

      showAlert("Success", "Consultant details applied to all investigations", "success");
    }
  };

  const getComponentStatus = (component: ComponentResultDto, value: string): "Normal" | "Abnormal" => {
    if (component.resultTypeId === LCENT_ID.REFERENCE_VALUES && value && component.referenceRange) {
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
    if (component.resultTypeId !== LCENT_ID.REFERENCE_VALUES) {
      return null;
    }
    const status = getComponentStatus(component, value);
    return <Chip size="small" label={status} color={status === "Normal" ? "success" : "error"} />;
  };

  const renderComponentField = (component: ComponentResultDto) => {
    const fieldName = `component_${component.componentId}`;

    switch (component.resultTypeId) {
      case LCENT_ID.SINGLELINE_ALPHANUMERIC_VALUES:
        return <FormField name={fieldName} control={control} label={component.componentName} type="text" required size="small" fullWidth placeholder="Enter value" />;

      case LCENT_ID.SINGLELINE_NUMERIC_VALUES:
      case LCENT_ID.REFERENCE_VALUES:
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
            {component.resultTypeId === LCENT_ID.REFERENCE_VALUES && component.referenceRange && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                Reference Range: {component.referenceRange.referenceRange} {component.unit}
              </Typography>
            )}
          </Box>
        );

      case LCENT_ID.MULTILINE_VALUES:
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

      case LCENT_ID.MULTIPLE_SELECTION:
        const selectionOptions = [
          { value: "Positive", label: "Positive" },
          { value: "Negative", label: "Negative" },
          { value: "Not Detected", label: "Not Detected" },
        ];

        return <FormField name={fieldName} control={control} label={component.componentName} type="select" required size="small" fullWidth options={selectionOptions} />;

      case LCENT_ID.TEMPLATE_VALUES:
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

    const updatedResults = labData.results.map((investigation) => {
      const invPrefix = `inv_${investigation.investigationId}`;

      return {
        ...investigation,
        technicianId: formData[`${invPrefix}_technicianId`],
        technicianName: formData[`${invPrefix}_technicianName`],
        isTechnicianApproved: formData[`${invPrefix}_technicianApproval`],
        labConsultantId: formData[`${invPrefix}_consultantId`],
        labConsultantName: formData[`${invPrefix}_consultantName`],
        isLabConsultantApproved: formData[`${invPrefix}_consultantApproval`],
        remarks: formData[`${invPrefix}_remarks`],
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
      };
    });

    return {
      ...labData,
      results: updatedResults as LabResultItemDto[],
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

          {/* Bulk Approval Section */}
          {labData.results.length > 1 && (
            <Accordion expanded={expandedAccordion === "bulk-approval"} onChange={handleAccordionChange("bulk-approval")} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center" }}>
                  <GroupWork sx={{ mr: 1 }} />
                  Bulk Approval Settings (Apply to All Investigations)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Configure the approval settings for the first investigation, then use the buttons below to apply to all investigations.
                </Alert>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" color="secondary" onClick={() => handleBulkApproval("technician")} size="small">
                    Apply Technician to All
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleBulkApproval("consultant")} size="small">
                    Apply Consultant to All
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

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
                  {/* Investigation Header with Approval Section */}
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {investigation.investigationName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Code: {investigation.investigationCode}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle1" gutterBottom>
                        Investigation Approvals
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack spacing={2}>
                            <FormField
                              name={`inv_${investigation.investigationId}_technicianId`}
                              control={control}
                              label="Technician"
                              type="select"
                              size="small"
                              fullWidth
                              options={technicianOptions}
                              placeholder="Select Technician"
                              onChange={(value) => {
                                const selectedTechnician = labTechnicians.find((tech) => Number(tech.value) === value.value);
                                if (selectedTechnician) {
                                  setValue(`inv_${investigation.investigationId}_technicianName`, selectedTechnician.label || "");
                                }
                              }}
                            />
                            <FormField
                              name={`inv_${investigation.investigationId}_technicianApproval`}
                              control={control}
                              label="Technician Approved"
                              type="switch"
                              size="small"
                              disabled={!watch(`inv_${investigation.investigationId}_technicianId`)}
                            />
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack spacing={2}>
                            <FormField
                              name={`inv_${investigation.investigationId}_consultantId`}
                              control={control}
                              label="Lab Consultant"
                              type="select"
                              size="small"
                              fullWidth
                              options={consultantOptions}
                              placeholder="Select Consultant"
                              onChange={(value) => {
                                const selectedConsultant = labConsultants.find((cons) => Number(cons.value) === value.value);
                                if (selectedConsultant) {
                                  setValue(`inv_${investigation.investigationId}_consultantName`, selectedConsultant.label || "");
                                }
                              }}
                            />
                            <FormField
                              name={`inv_${investigation.investigationId}_consultantApproval`}
                              control={control}
                              label="Consultant Approved"
                              type="switch"
                              size="small"
                              disabled={!watch(`inv_${investigation.investigationId}_consultantId`)}
                            />
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <FormField
                            name={`inv_${investigation.investigationId}_remarks`}
                            control={control}
                            label="Remarks"
                            type="textarea"
                            size="small"
                            fullWidth
                            rows={2}
                            placeholder="Enter any remarks for this investigation"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Component Results */}
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
