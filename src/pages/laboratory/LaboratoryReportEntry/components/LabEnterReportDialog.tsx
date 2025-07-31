import SmartButton from "@/components/Button/SmartButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { ComponentResultDto, LabEnterResultDto, LabResultItemDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { useAlert } from "@/providers/AlertProvider";
import { laboratoryService } from "@/services/Laboratory/LaboratoryService";
import { Person as PersonIcon, Save as SaveIcon, Science as ScienceIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

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

const LabEnterReportDialog: React.FC<LabEnterReportDialogProps> = ({ open, onClose, labRegNo, serviceTypeId, patientName = "Unknown Patient", onSave }) => {
  const { showAlert } = useAlert();
  const { setLoading } = useLoading();
  const [labData, setLabData] = useState<LabEnterResultDto | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [componentValues, setComponentValues] = useState<Record<number, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const [technicianApproval, setTechnicianApproval] = useState(false);
  const [consultantApproval, setConsultantApproval] = useState(false);

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
        setTechnicianApproval(response.data.isTechnicianApproved || false);
        setConsultantApproval(response.data.isLabConsultantApproved || false);

        // Initialize component values
        const initialValues: Record<number, string> = {};
        response.data.results.forEach((investigation) => {
          investigation.componentResults?.forEach((component) => {
            initialValues[component.componentId] = component.patuentValue || "";
          });
        });
        setComponentValues(initialValues);
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

  const handleComponentValueChange = (componentId: number, value: string, resultTypeId: number) => {
    setComponentValues((prev) => ({
      ...prev,
      [componentId]: value,
    }));

    // Clear validation error when value changes
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[componentId];
      return newErrors;
    });

    // Validate numeric fields
    if (resultTypeId === 3 || resultTypeId === 6) {
      // Numeric only types
      if (value && isNaN(Number(value))) {
        setValidationErrors((prev) => ({
          ...prev,
          [componentId]: "Please enter a valid number",
        }));
      }
    }
  };

  const validateComponentValue = (component: ComponentResultDto, value: string): { isValid: boolean; error?: string } => {
    // Check if value is required (you might want to add a required field to the component)
    if (!value && component.resultTypeId !== 7) {
      // Template values might be optional
      return { isValid: false, error: "This field is required" };
    }

    // Validate numeric fields
    if ((component.resultTypeId === 3 || component.resultTypeId === 6) && value) {
      if (isNaN(Number(value))) {
        return { isValid: false, error: "Please enter a valid number" };
      }

      // Check reference range for Reference Values type
      if (component.resultTypeId === 6 && component.referenceRange) {
        const numValue = Number(value);
        const { lowerValue = 0, upperValue = 0 } = component.referenceRange;
        if (numValue < lowerValue || numValue > upperValue) {
          // This is not an error, but we'll mark it as abnormal
          // You might want to show a warning instead
        }
      }
    }

    return { isValid: true };
  };

  const validateAllComponents = (): boolean => {
    if (!labData) return false;

    let isValid = true;
    const errors: Record<number, string> = {};

    labData.results.forEach((investigation) => {
      investigation.componentResults?.forEach((component) => {
        const value = componentValues[component.componentId] || "";
        const validation = validateComponentValue(component, value);
        if (!validation.isValid) {
          isValid = false;
          errors[component.componentId] = validation.error || "Invalid value";
        }
      });
    });

    setValidationErrors(errors);
    return isValid;
  };

  const prepareDataForSave = (): LabEnterResultDto => {
    if (!labData) throw new Error("No lab data available");

    const updatedResults = labData.results.map((investigation) => ({
      ...investigation,
      componentResults: investigation.componentResults?.map((component) => {
        const value = componentValues[component.componentId] || "";
        let status = "Normal";

        // Determine status based on reference range for numeric values
        if (component.resultTypeId === 6 && value && component.referenceRange) {
          const numValue = Number(value);
          const { lowerValue = 0, upperValue = 0 } = component.referenceRange;
          if (numValue < lowerValue || numValue > upperValue) {
            status = "Abnormal";
          }
        }

        return {
          ...component,
          patuentValue: value,
          status: status,
          resultStatus: status,
        };
      }),
    }));

    return {
      ...labData,
      isTechnicianApproved: technicianApproval,
      isLabConsultantApproved: consultantApproval,
      results: updatedResults as unknown as LabResultItemDto[],
    };
  };

  const handleSave = async () => {
    if (!validateAllComponents()) {
      showAlert("Error", "Please fill all required fields correctly", "error");
      return;
    }

    setSaving(true);
    setLoading(true);

    try {
      const dataToSave = prepareDataForSave();
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

  const renderComponentInput = (component: ComponentResultDto) => {
    const value = componentValues[component.componentId] || "";
    const error = validationErrors[component.componentId];

    switch (component.resultTypeId) {
      case 1: // Single Line [Alpha Numeric]
      case 2: // Single Line [Alpha Numeric]
        return (
          <TextField
            fullWidth
            size="small"
            value={value}
            onChange={(e) => handleComponentValueChange(component.componentId, e.target.value, component.resultTypeId)}
            error={!!error}
            helperText={error}
            placeholder="Enter value"
          />
        );

      case 3: // Single Line [Numbers only]
      case 6: // Reference Values [Numeric Only]
        return (
          <Box>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={value}
              onChange={(e) => handleComponentValueChange(component.componentId, e.target.value, component.resultTypeId)}
              error={!!error}
              helperText={error}
              placeholder="Enter numeric value"
              InputProps={{
                endAdornment: component.unit && (
                  <Typography variant="body2" color="text.secondary">
                    {component.unit}
                  </Typography>
                ),
              }}
            />
            {component.resultTypeId === 6 && component.referenceRange && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                Reference Range: {component.referenceRange.referenceRange} {component.unit}
              </Typography>
            )}
          </Box>
        );

      case 4: // Multi Line [Alpha Numeric]
        return (
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            value={value}
            onChange={(e) => handleComponentValueChange(component.componentId, e.target.value, component.resultTypeId)}
            error={!!error}
            helperText={error}
            placeholder="Enter detailed text"
          />
        );

      case 5: // Selection Type [Alpha Numeric]
        // In a real implementation, you would fetch the selection options
        // For now, we'll use a simple example
        return (
          <FormControl fullWidth size="small" error={!!error}>
            <InputLabel>Select Value</InputLabel>
            <Select value={value} onChange={(e) => handleComponentValueChange(component.componentId, e.target.value as string, component.resultTypeId)} label="Select Value">
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Positive">Positive</MenuItem>
              <MenuItem value="Negative">Negative</MenuItem>
              <MenuItem value="Not Detected">Not Detected</MenuItem>
            </Select>
            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}
          </FormControl>
        );

      case 7: // Template Values [Alpha Numeric]
        return (
          <TextField
            fullWidth
            size="small"
            multiline
            rows={5}
            value={value}
            onChange={(e) => handleComponentValueChange(component.componentId, e.target.value, component.resultTypeId)}
            error={!!error}
            helperText={error || "You can modify the template text as needed"}
            placeholder="Enter or modify template text"
          />
        );

      default:
        return (
          <TextField
            fullWidth
            size="small"
            value={value}
            onChange={(e) => handleComponentValueChange(component.componentId, e.target.value, component.resultTypeId)}
            error={!!error}
            helperText={error}
            placeholder="Enter value"
          />
        );
    }
  };

  const getStatusChip = (component: ComponentResultDto) => {
    const value = componentValues[component.componentId];
    if (!value) return null;

    if (component.resultTypeId === 6 && component.referenceRange) {
      const numValue = Number(value);
      const { lowerValue = 0, upperValue = 0 } = component.referenceRange;
      if (numValue < lowerValue || numValue > upperValue) {
        return <Chip size="small" label="Abnormal" color="error" />;
      }
      return <Chip size="small" label="Normal" color="success" />;
    }

    return null;
  };

  if (!open) return null;

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title="Enter Laboratory Report"
      maxWidth="lg"
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
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={saving || dataLoading}
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
        <Box>
          {/* Header Information */}
          <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
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
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PersonIcon color="action" />
                    <Box flex={1}>
                      <Typography variant="body2">Technician</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {labData.technicianName || "Not assigned"}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={<Radio checked={technicianApproval} onChange={(e) => setTechnicianApproval(e.target.checked)} disabled={!labData.technicianId} />}
                      label="Approved"
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <ScienceIcon color="action" />
                    <Box flex={1}>
                      <Typography variant="body2">Lab Consultant</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {labData.labConsultantName || "Not assigned"}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={<Radio checked={consultantApproval} onChange={(e) => setConsultantApproval(e.target.checked)} disabled={!labData.labConsultantId} />}
                      label="Approved"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Investigation Tabs */}
          <Paper sx={{ mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="investigation tabs" variant="scrollable" scrollButtons="auto">
              {labData.results.map((investigation, _index) => (
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
                    {investigation.remarks && <TextField fullWidth size="small" label="Investigation Remarks" value={investigation.remarks} multiline rows={2} sx={{ mt: 2 }} />}
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
                                      <Box>
                                        <Typography variant="subtitle2">{component.componentName}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {component.componentCode} | {component.resultTypeName}
                                        </Typography>
                                      </Box>
                                      {getStatusChip(component)}
                                    </Stack>
                                    <Box sx={{ mt: 2 }}>{renderComponentInput(component)}</Box>
                                    {component.interpretation && (
                                      <Box sx={{ mt: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                          Interpretation:
                                        </Typography>
                                        <Typography variant="body2">{component.interpretation}</Typography>
                                      </Box>
                                    )}
                                    {component.comments && <TextField fullWidth size="small" label="Comments" value={component.comments} multiline rows={2} sx={{ mt: 2 }} />}
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
