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
import { CheckCircle, ExpandMore, GroupWork, PersonAdd, Save as SaveIcon, SupervisorAccount, Warning } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

const createDynamicSchema = (investigations: LabResultItemDto[]) => {
  const shape: Record<string, any> = {};

  shape["global_technicianId"] = z.number().optional();
  shape["global_technicianName"] = z.string().optional();
  shape["global_technicianApproval"] = z.enum(["Y", "N"]).default("N");
  shape["global_consultantId"] = z.number().optional();
  shape["global_consultantName"] = z.string().optional();
  shape["global_consultantApproval"] = z.enum(["Y", "N"]).default("N");

  investigations.forEach((investigation) => {
    const invPrefix = `inv_${investigation.investigationId}`;
    shape[`${invPrefix}_technicianId`] = z.number().optional();
    shape[`${invPrefix}_technicianName`] = z.string().optional();
    shape[`${invPrefix}_technicianApproval`] = z.enum(["Y", "N"]).default("N");
    shape[`${invPrefix}_consultantId`] = z.number().optional();
    shape[`${invPrefix}_consultantName`] = z.string().optional();
    shape[`${invPrefix}_consultantApproval`] = z.enum(["Y", "N"]).default("N");
    shape[`${invPrefix}_remarks`] = z.string().optional();

    investigation.componentResults?.forEach((component) => {
      const fieldName = `component_${component.componentId}`;

      switch (component.resultTypeId) {
        case LCENT_ID.SINGLELINE_NUMERIC_VALUES:
        case LCENT_ID.REFERENCE_VALUES:
          shape[fieldName] = z
            .string()
            .nonempty(`${component.componentName} is required`)
            .refine((val) => !isNaN(Number(val)) && val.trim() !== "", {
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
  [key: string]: any;
};

const LabEnterReportDialog: React.FC<LabEnterReportDialogProps> = ({ open, onClose, labRegNo, serviceTypeId, patientName = "Unknown Patient", onSave }) => {
  const { showAlert } = useAlert();
  const { setLoading } = useLoading();
  const [labData, setLabData] = useState<LabEnterResultDto | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [componentSchema, setComponentSchema] = useState<z.ZodSchema<any> | null>(null);
  const [expandedInvestigations, setExpandedInvestigations] = useState<Record<number, boolean>>({});
  const [showIndividualApprovals, setShowIndividualApprovals] = useState<Record<number, boolean>>({});

  const { contacts: labTechnicians } = useContactMastByCategory({ consValue: "PHY" });
  const { contacts: labConsultants } = useContactMastByCategory({ consValue: "PHY" });

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
  useEffect(() => {
    if (errors.root) {
      console.error("errors.root", errors.root);
    }
  }, [errors.root]);

  const formValues = useWatch({ control });

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
        const schema = createDynamicSchema(response.data.results);
        setComponentSchema(schema);

        const defaultValues: LabReportFormData = {};

        if (response.data.results.length > 0) {
          const firstInv = response.data.results[0];
          defaultValues["global_technicianId"] = firstInv.technicianId;
          defaultValues["global_technicianName"] = firstInv.technicianName || "";
          defaultValues["global_technicianApproval"] = firstInv.isTechnicianApproved || "N";
          defaultValues["global_consultantId"] = firstInv.labConsultantId;
          defaultValues["global_consultantName"] = firstInv.labConsultantName || "";
          defaultValues["global_consultantApproval"] = firstInv.isLabConsultantApproved || "N";
        }

        response.data.results.forEach((investigation) => {
          const invPrefix = `inv_${investigation.investigationId}`;
          defaultValues[`${invPrefix}_technicianId`] = investigation.technicianId;
          defaultValues[`${invPrefix}_technicianName`] = investigation.technicianName || "";
          defaultValues[`${invPrefix}_technicianApproval`] = investigation.isTechnicianApproved || "N";
          defaultValues[`${invPrefix}_consultantId`] = investigation.labConsultantId;
          defaultValues[`${invPrefix}_consultantName`] = investigation.labConsultantName || "";
          defaultValues[`${invPrefix}_consultantApproval`] = investigation.isLabConsultantApproved || "N";
          defaultValues[`${invPrefix}_remarks`] = investigation.remarks || "";

          investigation.componentResults?.forEach((component) => {
            defaultValues[`component_${component.componentId}`] = component.patuentValue ? String(component.patuentValue) : "";
            if (component.comments) {
              defaultValues[`component_${component.componentId}_comments`] = component.comments;
            }
          });
        });

        reset(defaultValues);

        if (response.data.results.length > 0) {
          setExpandedInvestigations({ [response.data.results[0].investigationId]: true });
        }
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

  const handleAccordionToggle = useCallback((investigationId: number) => {
    setExpandedInvestigations((prev) => ({
      ...prev,
      [investigationId]: !prev[investigationId],
    }));
  }, []);

  const applyGlobalTechnician = useCallback(() => {
    if (!labData) return;

    const technicianId = watch("global_technicianId");
    const technicianName = watch("global_technicianName");
    const technicianApproval = watch("global_technicianApproval");

    labData.results.forEach((investigation) => {
      const prefix = `inv_${investigation.investigationId}`;
      setValue(`${prefix}_technicianId`, technicianId);
      setValue(`${prefix}_technicianName`, technicianName);
      setValue(`${prefix}_technicianApproval`, technicianApproval || "N");
    });

    showAlert("Success", "Technician details applied to all investigations", "success");
  }, [labData, watch, setValue, showAlert]);

  const applyGlobalConsultant = useCallback(() => {
    if (!labData) return;

    const consultantId = watch("global_consultantId");
    const consultantName = watch("global_consultantName");
    const consultantApproval = watch("global_consultantApproval");

    labData.results.forEach((investigation) => {
      const prefix = `inv_${investigation.investigationId}`;
      setValue(`${prefix}_consultantId`, consultantId);
      setValue(`${prefix}_consultantName`, consultantName);
      setValue(`${prefix}_consultantApproval`, consultantApproval || "N");
    });

    showAlert("Success", "Consultant details applied to all investigations", "success");
  }, [labData, watch, setValue, showAlert]);

  const getComponentStatus = useCallback((component: ComponentResultDto, value: string): "Normal" | "Abnormal" => {
    if (component.resultTypeId === LCENT_ID.REFERENCE_VALUES && value && component.referenceRange) {
      const numValue = Number(value);
      const { lowerValue = 0, upperValue = 0 } = component.referenceRange;
      if (numValue < lowerValue || numValue > upperValue) {
        return "Abnormal";
      }
    }
    return "Normal";
  }, []);

  const getInvestigationCompletionStatus = useCallback(
    (investigation: LabResultItemDto) => {
      const filledComponents = investigation.componentResults?.filter((comp) => watch(`component_${comp.componentId}`)).length || 0;
      const totalComponents = investigation.componentResults?.length || 0;

      return {
        filled: filledComponents,
        total: totalComponents,
        percentage: totalComponents > 0 ? (filledComponents / totalComponents) * 100 : 0,
      };
    },
    [watch]
  );

  const renderComponentField = useCallback(
    (component: ComponentResultDto) => {
      const fieldName = `component_${component.componentId}`;
      const value = watch(fieldName);

      return (
        <Box>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box flex={1}>
              {component.resultTypeId === LCENT_ID.SINGLELINE_ALPHANUMERIC_VALUES && (
                <FormField name={fieldName} control={control} label={component.componentName} type="text" required size="small" fullWidth placeholder="Enter value" />
              )}

              {(component.resultTypeId === LCENT_ID.SINGLELINE_NUMERIC_VALUES || component.resultTypeId === LCENT_ID.REFERENCE_VALUES) && (
                <Box>
                  <FormField
                    name={fieldName}
                    control={control}
                    label={component.componentName}
                    type="text"
                    required
                    size="small"
                    placeholder="Enter numeric value"
                    adornment={component.unit}
                    adornmentPosition="end"
                  />
                </Box>
              )}

              {component.resultTypeId === LCENT_ID.MULTILINE_VALUES && (
                <FormField name={fieldName} control={control} label={component.componentName} type="textarea" required size="small" rows={3} placeholder="Enter detailed text" />
              )}

              {component.resultTypeId === LCENT_ID.MULTIPLE_SELECTION && (
                <FormField
                  name={fieldName}
                  control={control}
                  label={component.componentName}
                  type="select"
                  required
                  size="small"
                  fullWidth
                  options={[
                    { value: "Positive", label: "Positive" },
                    { value: "Negative", label: "Negative" },
                    { value: "Not Detected", label: "Not Detected" },
                  ]}
                />
              )}

              {component.resultTypeId === LCENT_ID.TEMPLATE_VALUES && (
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
              )}
            </Box>

            {component.resultTypeId === LCENT_ID.REFERENCE_VALUES && component.referenceRange && (
              <>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  Reference Range: {component.referenceRange.referenceRange} {component.unit}
                </Typography>
                {value && (
                  <Chip size="small" label={getComponentStatus(component, value)} color={getComponentStatus(component, value) === "Normal" ? "success" : "error"} sx={{ mt: 3 }} />
                )}
              </>
            )}
          </Stack>
        </Box>
      );
    },
    [control, watch, getComponentStatus]
  );

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

  const technicianOptions = labTechnicians.map((tech) => ({
    value: Number(tech.value) || 0,
    label: tech.label || "",
  }));

  const consultantOptions = labConsultants.map((cons) => ({
    value: Number(cons.value) || 0,
    label: cons.label || "",
  }));

  const overallProgress = useMemo(() => {
    if (!labData) return 0;
    let totalComponents = 0;
    let filledComponents = 0;

    labData.results.forEach((investigation) => {
      const total = investigation.componentResults?.length || 0;
      const filled = investigation.componentResults?.filter((comp) => watch(`component_${comp.componentId}`)).length || 0;
      totalComponents += total;
      filledComponents += filled;
    });

    return totalComponents > 0 ? (filledComponents / totalComponents) * 100 : 0;
  }, [labData, formValues]);

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
              <Grid size={3}>
                <Typography variant="body2" color="text.secondary">
                  Lab Reg No
                </Typography>
                <Typography variant="h6">{labData.labRegNo}</Typography>
              </Grid>
              <Grid size={5}>
                <Typography variant="body2" color="text.secondary">
                  Patient Name
                </Typography>
                <Typography variant="h6">{patientName}</Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant="body2" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="h6">{labData.departmentName}</Typography>
              </Grid>
            </Grid>

            {/* Overall Progress */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Overall Progress: {Math.round(overallProgress)}%
              </Typography>
              <LinearProgress variant="determinate" value={overallProgress} color={overallProgress === 100 ? "success" : "primary"} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          </Paper>

          {/* Global Approval Section */}
          <Card elevation={2} sx={{ mb: 3, backgroundColor: "primary.50" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", color: "primary.main" }}>
                <GroupWork sx={{ mr: 1 }} />
                Investigation Approvals
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                {/* Technician Section */}
                <Grid size={6}>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: "background.paper" }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>
                      <PersonAdd sx={{ mr: 1, fontSize: 20 }} />
                      Technician Details
                    </Typography>
                    <Stack spacing={2}>
                      <FormField
                        name="global_technicianId"
                        control={control}
                        label="Select Technician"
                        type="select"
                        size="small"
                        fullWidth
                        options={technicianOptions}
                        placeholder="Choose Technician"
                        onChange={(value) => {
                          const selectedTechnician = labTechnicians.find((tech) => Number(tech.value) === value.value);
                          if (selectedTechnician) {
                            setValue("global_technicianName", selectedTechnician.label || "");
                          } else if (!value.value) {
                            setValue("global_technicianId", 0);
                            setValue("global_technicianName", "");
                            setValue("global_technicianApproval", "N");
                          }
                        }}
                      />
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <FormField name="global_technicianApproval" control={control} label="Approved" type="switch" size="small" disabled={!watch("global_technicianId")} />

                        <SmartButton
                          text="Apply to All"
                          icon={CheckCircle}
                          onClick={applyGlobalTechnician}
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ minWidth: 150 }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Consultant Section */}
                <Grid size={6}>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: "background.paper" }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>
                      <SupervisorAccount sx={{ mr: 1, fontSize: 20 }} />
                      Lab Consultant Details
                    </Typography>
                    <Stack spacing={2}>
                      <FormField
                        name="global_consultantId"
                        control={control}
                        label="Select Consultant"
                        type="select"
                        size="small"
                        fullWidth
                        options={consultantOptions}
                        placeholder="Choose Consultant"
                        onChange={(value) => {
                          const selectedConsultant = labConsultants.find((cons) => Number(cons.value) === value.value);
                          if (selectedConsultant) {
                            setValue("global_consultantName", selectedConsultant.label || "");
                          } else if (!value.value) {
                            setValue("global_consultantId", 0);
                            setValue("global_consultantName", "");
                            setValue("global_consultantApproval", "N");
                          }
                        }}
                      />
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <FormField name="global_consultantApproval" control={control} label="Approved" type="switch" size="small" disabled={!watch("global_consultantId")} />
                        <SmartButton
                          text="Apply to All"
                          icon={CheckCircle}
                          onClick={applyGlobalConsultant}
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ minWidth: 150 }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Investigations as Accordions */}
          <Stack spacing={2}>
            {labData.results.map((investigation, index) => {
              const completionStatus = getInvestigationCompletionStatus(investigation);
              const isExpanded = expandedInvestigations[investigation.investigationId];
              const showApprovals = showIndividualApprovals[investigation.investigationId];

              return (
                <Accordion key={investigation.investigationId} expanded={isExpanded} onChange={() => handleAccordionToggle(investigation.investigationId)}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", pr: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {investigation.investigationCode} : {investigation.investigationName}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Badge badgeContent={`${completionStatus.filled}/${completionStatus.total}`} color={completionStatus.percentage === 100 ? "success" : "warning"}>
                          {completionStatus.percentage === 100 ? <CheckCircle color="success" /> : <Warning color="warning" />}
                        </Badge>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(completionStatus.percentage)}% Complete
                        </Typography>
                      </Stack>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {/* Compact Approval Section */}
                    <Box sx={{ mb: 2 }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setShowIndividualApprovals((prev) => ({ ...prev, [investigation.investigationId]: !prev[investigation.investigationId] }))}
                        sx={{ mb: 1 }}
                      >
                        {showApprovals ? "Hide" : "Show"} Individual Approvals
                      </Button>

                      <Collapse in={showApprovals}>
                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: "grey.50" }}>
                          <Grid container spacing={2}>
                            <Grid size={6}>
                              <Stack spacing={1}>
                                <FormField
                                  name={`inv_${investigation.investigationId}_technicianId`}
                                  control={control}
                                  label="Technician"
                                  type="select"
                                  size="small"
                                  fullWidth
                                  options={technicianOptions}
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
                                  label="Approved"
                                  type="switch"
                                  size="small"
                                  disabled={!watch(`inv_${investigation.investigationId}_technicianId`)}
                                />
                              </Stack>
                            </Grid>
                            <Grid size={6}>
                              <Stack spacing={1}>
                                <FormField
                                  name={`inv_${investigation.investigationId}_consultantId`}
                                  control={control}
                                  label="Consultant"
                                  type="select"
                                  size="small"
                                  fullWidth
                                  options={consultantOptions}
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
                                  label="Approved"
                                  type="switch"
                                  size="small"
                                  disabled={!watch(`inv_${investigation.investigationId}_consultantId`)}
                                />
                              </Stack>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Collapse>
                    </Box>

                    {/* Component Results - One per row */}
                    <Box>
                      {(() => {
                        const groupedComponents = (investigation.componentResults || []).reduce((acc, component) => {
                          const subtitle = component.subTitleName || "General";
                          if (!acc[subtitle]) acc[subtitle] = [];
                          acc[subtitle].push(component);
                          return acc;
                        }, {} as Record<string, ComponentResultDto[]>);

                        return Object.entries(groupedComponents).map(([subtitle, components]) => (
                          <Box key={subtitle} sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: "bold" }}>
                              {subtitle}
                            </Typography>
                            <Stack spacing={2}>
                              {components
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map((component) => (
                                  <Card key={component.componentId} variant="outlined">
                                    <CardContent>{renderComponentField(component)}</CardContent>
                                  </Card>
                                ))}
                            </Stack>
                          </Box>
                        ));
                      })()}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        </Box>
      ) : (
        <Alert severity="info">No data available</Alert>
      )}
    </GenericDialog>
  );
};

export default LabEnterReportDialog;
