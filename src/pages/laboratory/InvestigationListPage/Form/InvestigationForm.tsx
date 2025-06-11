import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  Divider,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Save, Cancel } from "@mui/icons-material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { InvestigationListDto, LInvMastDto, LComponentDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { useInvestigationList } from "../hooks/useInvestigationList";
import ComponentForm from "./ComponentForm";

interface InvestigationFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: InvestigationListDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  invID: z.number(),
  invName: z.string().nonempty("Investigation name is required"),
  invTypeCode: z.string().optional(),
  invReportYN: z.string(),
  invSampleYN: z.string(),
  invTitle: z.string().optional(),
  invSTitle: z.string().optional(),
  invPrintOrder: z.number().min(0),
  bchID: z.number().min(0),
  invCode: z.string().optional(),
  invType: z.string().optional(),
  invNHCode: z.string().optional(),
  invNHEnglishName: z.string().optional(),
  invNHGreekName: z.string().optional(),
  invSampleType: z.number().optional(),
  invShortName: z.string().optional(),
  methods: z.string().optional(),
  coopLabs: z.string().optional(),
  rActiveYN: z.string(),
  transferYN: z.string().optional(),
});

type InvestigationFormData = z.infer<typeof schema>;

const InvestigationForm: React.FC<InvestigationFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { saveInvestigation, getNextCode } = useInvestigationList();

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isComponentFormOpen, setIsComponentFormOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<LComponentDto | null>(null);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number>(-1);
  const [components, setComponents] = useState<LComponentDto[]>([]);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const sampleTypes = [
    { value: 1, code: "LAB", label: "Laboratory" },
    { value: 2, code: "RAD", label: "Radiology" },
    { value: 3, code: "UTS", label: "Ultrasound" },
  ];
  const isAddMode = !initialData;

  const defaultValues: InvestigationFormData = {
    invID: 0,
    invName: "",
    invTypeCode: "",
    invReportYN: "Y",
    invSampleYN: "Y",
    invTitle: "",
    invSTitle: "",
    invPrintOrder: 0,
    bchID: 0,
    invCode: "",
    invType: "",
    invNHCode: "",
    invNHEnglishName: "",
    invNHGreekName: "",
    invSampleType: 0,
    invShortName: "",
    methods: "",
    coopLabs: "",
    rActiveYN: "Y",
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
    watch,
  } = useForm<InvestigationFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const generateInvestigationCode = useCallback(async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("INV", 6);
      if (nextCode) {
        setValue("invCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate investigation code", "warning");
      }
    } catch (error) {
      console.error("Error generating investigation code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isAddMode, getNextCode, setValue, showAlert]);

  useEffect(() => {
    if (initialData) {
      const formData: InvestigationFormData = {
        ...initialData.lInvMastDto,
      };
      reset(formData);
      setComponents(initialData.lComponentsDto || []);
    } else {
      reset(defaultValues);
      setComponents([]);
      generateInvestigationCode();
    }
  }, [initialData, reset]);

  const handleAddComponent = () => {
    setSelectedComponent(null);
    setSelectedComponentIndex(-1);
    setIsComponentFormOpen(true);
  };

  const handleEditComponent = (component: LComponentDto, index: number) => {
    setSelectedComponent(component);
    setSelectedComponentIndex(index);
    setIsComponentFormOpen(true);
  };

  const handleDeleteComponent = (index: number) => {
    const updatedComponents = components.filter((_, i) => i !== index);
    setComponents(updatedComponents);
  };

  const handleComponentSave = (componentData: LComponentDto) => {
    if (selectedComponentIndex >= 0) {
      // Edit existing component
      const updatedComponents = [...components];
      updatedComponents[selectedComponentIndex] = componentData;
      setComponents(updatedComponents);
    } else {
      // Add new component
      setComponents([...components, componentData]);
    }
    setIsComponentFormOpen(false);
  };

  const onSubmit = async (data: InvestigationFormData) => {
    if (viewOnly) return;

    if (components.length === 0) {
      return showAlert("Warning", "Please add at least one component", "warning");
    }

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const investigationData: LInvMastDto = {
        invID: data.invID,
        invName: data.invName,
        invTypeCode: data.invTypeCode,
        invReportYN: data.invReportYN as "Y" | "N",
        invSampleYN: data.invSampleYN as "Y" | "N",
        invTitle: data.invTitle,
        invSTitle: data.invSTitle,
        invPrintOrder: data.invPrintOrder,
        bchID: data.bchID,
        invCode: data.invCode,
        invType: data.invType,
        invNHCode: data.invNHCode,
        invNHEnglishName: data.invNHEnglishName,
        invNHGreekName: data.invNHGreekName,
        invSampleType: data.invSampleType,
        invShortName: data.invShortName,
        methods: data.methods,
        coopLabs: data.coopLabs,
        rActiveYN: data.rActiveYN as "Y" | "N",
        transferYN: data.transferYN,
      };

      const investigationListData: InvestigationListDto = {
        lInvMastDto: investigationData,
        lComponentsDto: components,
      };
      console.log("Save", investigationListData);
      return;
      const response = await saveInvestigation(investigationListData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Investigation created successfully" : "Investigation updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save investigation");
      }
    } catch (error) {
      console.error("Error saving investigation:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save investigation";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    if (initialData) {
      reset(initialData.lInvMastDto as InvestigationFormData);
      setComponents(initialData.lComponentsDto || []);
    } else {
      reset(defaultValues);
      setComponents([]);
      generateInvestigationCode();
    }
    setFormError(null);
  };

  const handleReset = () => {
    if (isDirty || components.length > 0) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const handleResetConfirm = () => {
    performReset();
    setShowResetConfirmation(false);
  };

  const handleCancel = () => {
    if (isDirty || components.length > 0) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirmation(false);
    onClose();
  };

  const dialogTitle = viewOnly ? "View Investigation Details" : isAddMode ? "Create New Investigation" : "Edit Investigation";

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && components.length === 0)} />
        <SmartButton
          text={isAddMode ? "Create Investigation" : "Update Investigation"}
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
            {/* Basic Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="invCode" control={control} label="Investigation Code" type="text" disabled={viewOnly || !isAddMode} size="small" fullWidth />
                    </Grid>
                    <Grid size={{ sm: 12, md: 8 }}>
                      <FormField name="invName" control={control} label="Investigation Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="invShortName" control={control} label="Short Name" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                    <Grid size={{ sm: 12, md: 8 }}>
                      <FormField name="invTitle" control={control} label="Title" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                    <Grid size={{ sm: 12, md: 12 }}>
                      <FormField name="rNotes" control={control} label="Comments" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Settings Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Investigation Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="invReportYN" control={control} label="Report Entry Required" type="switch" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="invSampleYN" control={control} label="Sample Required" type="switch" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="bchID"
                        control={control}
                        label="Investigation Type"
                        type="select"
                        required
                        disabled={viewOnly}
                        size="small"
                        options={sampleTypes}
                        fullWidth
                        onChange={(value) => {
                          const selectedType = sampleTypes.find((type) => Number(type.value) === Number(value.value));
                          if (selectedType) {
                            setValue("invType", selectedType.label);
                            setValue("invTypeCode", selectedType.code);
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="invSampleType"
                        control={control}
                        label="Sample Type"
                        type="select"
                        required
                        disabled={viewOnly}
                        size="small"
                        options={[
                          { value: 1, label: "Blood" },
                          { value: 2, label: "Urine" },
                          { value: 3, label: "Stool" },
                        ]}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="methods" control={control} label="Methods" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Components Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">Components</Typography>
                    {!viewOnly && <SmartButton text="Add Component" icon={AddIcon} onClick={handleAddComponent} variant="contained" color="primary" size="small" />}
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {components.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                      No components added yet. Click "Add Component" to add components.
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} sx={{ maxHeight: "400px" }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Component Name</TableCell>
                            <TableCell>Unit</TableCell>
                            <TableCell>Order</TableCell>
                            <TableCell>Entry Type</TableCell>
                            <TableCell>Status</TableCell>
                            {!viewOnly && <TableCell>Actions</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {components.map((component, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{component.compoNameCD}</TableCell>
                              <TableCell>{component.compUnitCD || "-"}</TableCell>
                              <TableCell>{component.compOrder || "-"}</TableCell>
                              <TableCell>{component.lCentNameCD || "-"}</TableCell>
                              <TableCell>
                                <Chip size="small" color={component.rActiveYN === "Y" ? "success" : "error"} label={component.rActiveYN === "Y" ? "Active" : "Inactive"} />
                              </TableCell>
                              {!viewOnly && (
                                <TableCell>
                                  <Stack direction="row" spacing={1}>
                                    <Tooltip title="Edit Component">
                                      <IconButton size="small" color="primary" onClick={() => handleEditComponent(component, index)}>
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Component">
                                      <IconButton size="small" color="error" onClick={() => handleDeleteComponent(index)}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      {isComponentFormOpen && (
        <ComponentForm
          open={isComponentFormOpen}
          onClose={() => setIsComponentFormOpen(false)}
          onSave={handleComponentSave}
          initialData={selectedComponent}
          invID={watch("invID")}
        />
      )}

      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
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
        onClose={() => setShowCancelConfirmation(false)}
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

export default InvestigationForm;
