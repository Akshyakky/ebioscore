import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { InvestigationListDto, LComponentDto, LInvMastDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Add as AddIcon, ArrowDownward, ArrowUpward, Cancel, Delete as DeleteIcon, DragIndicator, Edit as EditIcon, Save, Visibility } from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useInvestigationList } from "../hooks/useInvestigationList";

import { BChargeDto } from "@/interfaces/Billing/BChargeDetails";
import ComponentForm from "./ComponentForm";

interface InvestigationFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: InvestigationListDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  invID: z.number(),
  invCode: z.string(),
  invName: z.string().nonempty("Investigation name is required"),
  invTypeCode: z.string().default(""),
  invReportYN: z.string(),
  invSampleYN: z.string(),
  invTitle: z.string().default(""),
  invSTitle: z.string().default(""),
  invPrintOrder: z.number().min(0),
  bchID: z.number().min(0),
  invType: z.string().default(""),
  invNHCode: z.string().default(""),
  invNHEnglishName: z.string().default(""),
  invNHGreekName: z.string().default(""),
  invSampleType: z.string().default(""),
  invShortName: z.string().default(""),
  methods: z.string().default(""),
  chargeID: z.any().optional(),
  coopLabs: z.string().default(""),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
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
  const { sampleType, serviceType } = useDropdownValues(["sampleType", "serviceType"]);
  const [repEntryServiceTypes, setRepEntryServiceTypes] = useState<any[]>([]);

  // Drag and Drop states for components
  const [draggedComponentIndex, setDraggedComponentIndex] = useState<number | null>(null);
  const [dragOverComponentIndex, setDragOverComponentIndex] = useState<number | null>(null);
  const componentDragCounter = useRef(0);

  useEffect(() => {
    if (Array.isArray(serviceType) && serviceType.length > 0) {
      const fileterefServiceTypes = serviceType.filter((type) => type.isLabYN === "Y");
      setRepEntryServiceTypes(fileterefServiceTypes);
    }
  }, [serviceType]);
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
    invSampleType: "",
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
    formState: { isDirty, isValid },
    watch,
  } = useForm<InvestigationFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const formData = watch();

  const generateInvestigationCode = useCallback(async () => {
    if (!isAddMode) return;

    try {
      const nextCode = await getNextCode("INV", 6);
      if (nextCode) {
        setValue("invCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate investigation code", "warning");
      }
    } catch (error) {
      console.error("Error generating investigation code:", error);
    } finally {
    }
  }, [isAddMode, getNextCode, setValue, showAlert]);

  useEffect(() => {
    if (initialData) {
      const formData: InvestigationFormData = {
        ...defaultValues,
        ...initialData.lInvMastDto,
        invName: initialData.lInvMastDto.invName || "",
        invCode: initialData.lInvMastDto.invCode || "",
        invTypeCode: initialData.lInvMastDto.invTypeCode || "",
        invTitle: initialData.lInvMastDto.invTitle || "",
        invSTitle: initialData.lInvMastDto.invSTitle || "",
        invType: initialData.lInvMastDto.invType || "",
      };
      reset(formData);
      // Set components with compOrder based on their current position
      const orderedComponents = (initialData.lComponentsDto || []).map((comp, index) => ({
        ...comp,
        compOrder: comp.compOrder || index + 1,
      }));
      setComponents(orderedComponents.sort((a, b) => Number(a.compOrder) - Number(b.compOrder)));
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

  const handleViewComponent = (component: LComponentDto) => {
    setSelectedComponent(component);
    setSelectedComponentIndex(-1);
    setIsComponentFormOpen(true);
  };

  const handleDeleteComponent = (index: number) => {
    const updatedComponents = components.filter((_, i) => i !== index);
    // Reorder remaining components
    const reorderedComponents = updatedComponents.map((comp, idx) => ({
      ...comp,
      compOrder: idx + 1,
    }));
    setComponents(reorderedComponents);
  };

  const handleComponentSave = (componentData: LComponentDto) => {
    if (selectedComponentIndex >= 0) {
      // Edit existing component
      const updatedComponents = [...components];
      updatedComponents[selectedComponentIndex] = {
        ...componentData,
        compOrder: updatedComponents[selectedComponentIndex].compOrder,
      };
      setComponents(updatedComponents);
    } else {
      // Add new component at the end
      const newComponent = {
        ...componentData,
        compOrder: components.length + 1,
      };
      setComponents([...components, newComponent]);
    }
    setIsComponentFormOpen(false);
  };

  const moveComponent = (index: number, direction: "up" | "down") => {
    const newComponents = [...components];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newComponents.length) {
      // Swap components
      [newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]];

      // Update compOrder for all components
      const reorderedComponents = newComponents.map((comp, idx) => ({
        ...comp,
        compOrder: idx + 1,
      }));

      setComponents(reorderedComponents);
    }
  };

  // Drag and Drop handlers for components
  const handleComponentDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedComponentIndex(index);
    e.dataTransfer.effectAllowed = "move";
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleComponentDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedComponentIndex(null);
    setDragOverComponentIndex(null);
    componentDragCounter.current = 0;
  };

  const handleComponentDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleComponentDragEnter = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    componentDragCounter.current++;
    if (draggedComponentIndex !== null && draggedComponentIndex !== index) {
      setDragOverComponentIndex(index);
    }
  };

  const handleComponentDragLeave = (_e: React.DragEvent<HTMLTableRowElement>) => {
    componentDragCounter.current--;
    if (componentDragCounter.current === 0) {
      setDragOverComponentIndex(null);
    }
  };

  const handleComponentDrop = (e: React.DragEvent<HTMLTableRowElement>, dropIndex: number) => {
    e.preventDefault();
    componentDragCounter.current = 0;

    if (draggedComponentIndex === null || draggedComponentIndex === dropIndex) {
      return;
    }

    const draggedComponent = components[draggedComponentIndex];
    const newComponents = [...components];

    // Remove the dragged component
    newComponents.splice(draggedComponentIndex, 1);

    // Insert it at the new position
    const adjustedDropIndex = draggedComponentIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newComponents.splice(adjustedDropIndex, 0, draggedComponent);

    // Update compOrder for all components
    const reorderedComponents = newComponents.map((comp, idx) => ({
      ...comp,
      compOrder: idx + 1,
    }));

    setComponents(reorderedComponents);
    setDraggedComponentIndex(null);
    setDragOverComponentIndex(null);
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
        chargeID: data.chargeID,
        rActiveYN: data.rActiveYN as "Y" | "N",
        transferYN: data.transferYN,
      };

      const bChargeData: BChargeDto = {
        chargeID: data.chargeID || 0,
        chargeCode: data.invCode || "",
        chargeDesc: data.invName,
        chargesHDesc: data.invSTitle,
        chargeDescLang: data.invName,
        cShortName: data.invSTitle,
        chargeType: data.invTypeCode,
        bChID: data.bchID,
        sGrpID: 0,
        chargeTo: "",
        chargeBreakYN: "N",
        chargeStatus: "Y",
        rActiveYN: data.rActiveYN,
        transferYN: data.transferYN,
        rNotes: "",
      };
      const investigationListData: InvestigationListDto = {
        lInvMastDto: investigationData,
        bChargeDto: bChargeData,
        lComponentsDto: components,
      };

      console.log("Save", investigationListData);
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
      const orderedComponents = (initialData.lComponentsDto || []).map((comp, index) => ({
        ...comp,
        compOrder: comp.compOrder || index + 1,
      }));
      setComponents(orderedComponents);
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

  const handleCancel = () => {
    if (isDirty || components.length > 0) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleResetConfirm = () => {
    performReset();
    setShowResetConfirmation(false);
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

  // Helper function to display field value
  const DisplayField = ({
    label,
    value,
    chip = false,
    chipColor = "default",
  }: {
    label: string;
    value: any;
    chip?: boolean;
    chipColor?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      {chip ? (
        <Chip size="small" label={value || "N/A"} color={chipColor} />
      ) : (
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || "N/A"}
        </Typography>
      )}
    </Box>
  );

  const getSampleTypeName = (code: string) => {
    const type = sampleType?.find((t) => t.value === code);
    return type ? type.label : code;
  };

  const getServiceTypeName = (id: number) => {
    const type = repEntryServiceTypes?.find((t) => Number(t.value) === id);
    return type ? type.label : "Unknown";
  };

  if (viewOnly) {
    return (
      <>
        <GenericDialog open={open} onClose={() => onClose()} title={dialogTitle} maxWidth="lg" fullWidth showCloseButton actions={dialogActions}>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={3}>
              {/* Basic Information Section */}
              <Grid size={{ sm: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid size={{ sm: 12, md: 4 }}>
                        <DisplayField label="Investigation Code" value={formData.invCode} />
                      </Grid>
                      <Grid size={{ sm: 12, md: 8 }}>
                        <DisplayField label="Investigation Name" value={formData.invName} />
                      </Grid>
                      <Grid size={{ sm: 12, md: 4 }}>
                        <DisplayField label="Short Name" value={formData.invShortName} />
                      </Grid>
                      <Grid size={{ sm: 12, md: 8 }}>
                        <DisplayField label="Title" value={formData.invTitle} />
                      </Grid>
                      <Grid size={{ sm: 12, md: 12 }}>
                        <DisplayField label="Comments" value={initialData?.lInvMastDto.rNotes} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Settings Section */}
              <Grid size={{ sm: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Investigation Settings
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid size={{ sm: 12, md: 3 }}>
                        <DisplayField
                          label="Report Entry Required"
                          value={formData.invReportYN === "Y" ? "Yes" : "No"}
                          chip={true}
                          chipColor={formData.invReportYN === "Y" ? "success" : "error"}
                        />
                      </Grid>
                      <Grid size={{ sm: 12, md: 3 }}>
                        <DisplayField
                          label="Sample Required"
                          value={formData.invSampleYN === "Y" ? "Yes" : "No"}
                          chip={true}
                          chipColor={formData.invSampleYN === "Y" ? "success" : "error"}
                        />
                      </Grid>
                      <Grid size={{ sm: 12, md: 3 }}>
                        <DisplayField
                          label="Status"
                          value={formData.rActiveYN === "Y" ? "Active" : "Inactive"}
                          chip={true}
                          chipColor={formData.rActiveYN === "Y" ? "success" : "error"}
                        />
                      </Grid>
                      <Grid size={{ sm: 12, md: 3 }}>
                        <DisplayField
                          label="Transfer"
                          value={formData.transferYN === "Y" ? "Yes" : "No"}
                          chip={true}
                          chipColor={formData.transferYN === "Y" ? "info" : "default"}
                        />
                      </Grid>
                      <Grid size={{ sm: 12, md: 4 }}>
                        <DisplayField label="Investigation Type" value={getServiceTypeName(formData.bchID)} />
                      </Grid>
                      <Grid size={{ sm: 12, md: 4 }}>
                        <DisplayField label="Sample Type" value={getSampleTypeName(formData.invSampleType)} />
                      </Grid>
                      <Grid size={{ sm: 12, md: 4 }}>
                        <DisplayField label="Methods" value={formData.methods} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Billing Information Section */}
              {initialData?.bChargeDto && (
                <Grid size={{ sm: 12 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Billing Information
                      </Typography>
                      <Divider sx={{ mb: 3 }} />

                      <Grid container spacing={3}>
                        <Grid size={{ sm: 12, md: 3 }}>
                          <DisplayField label="Charge ID" value={initialData.bChargeDto.chargeID} />
                        </Grid>
                        <Grid size={{ sm: 12, md: 3 }}>
                          <DisplayField label="Charge Code" value={initialData.bChargeDto.chargeCode} />
                        </Grid>
                        <Grid size={{ sm: 12, md: 6 }}>
                          <DisplayField label="Charge Description" value={initialData.bChargeDto.chargeDesc} />
                        </Grid>
                        <Grid size={{ sm: 12, md: 4 }}>
                          <DisplayField label="Short Description" value={initialData.bChargeDto.chargesHDesc} />
                        </Grid>
                        <Grid size={{ sm: 12, md: 4 }}>
                          <DisplayField label="Short Name" value={initialData.bChargeDto.cShortName} />
                        </Grid>
                        <Grid size={{ sm: 12, md: 4 }}>
                          <DisplayField
                            label="Charge Status"
                            value={initialData.bChargeDto.chargeStatus === "Y" ? "Active" : "Inactive"}
                            chip={true}
                            chipColor={initialData.bChargeDto.chargeStatus === "Y" ? "success" : "error"}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Components Section */}
              <Grid size={{ sm: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Components ({components.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {components.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                        No components configured for this investigation.
                      </Typography>
                    ) : (
                      <TableContainer component={Paper} sx={{ maxHeight: "500px" }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell width={60}>
                                <strong>Order</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Component Name</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Code</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Unit</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Entry Type</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Section</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Status</strong>
                              </TableCell>
                              <TableCell width={100}>
                                <strong>Actions</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {components.map((component, index) => (
                              <TableRow key={index} hover>
                                <TableCell>
                                  <Typography variant="h6" color="primary">
                                    {component.compOrder}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                      {component.compoName}
                                    </Typography>
                                    {component.compoTitle && (
                                      <Typography variant="caption" color="text.secondary">
                                        {component.compoTitle}
                                      </Typography>
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontFamily="monospace">
                                    {component.compoCode}
                                  </Typography>
                                </TableCell>
                                <TableCell>{component.compUnit || "-"}</TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2">{component.lCentName}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {component.lCentType}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{component.stitName || "-"}</TableCell>
                                <TableCell>
                                  <Chip size="small" color={component.rActiveYN === "Y" ? "success" : "error"} label={component.rActiveYN === "Y" ? "Active" : "Inactive"} />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title="View Component Details">
                                    <IconButton size="small" color="primary" onClick={() => handleViewComponent(component)}>
                                      <Visibility fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
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
            viewOnly={true}
          />
        )}
      </>
    );
  }

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
                        options={repEntryServiceTypes || []}
                        fullWidth
                        onChange={(value) => {
                          const selectedType = repEntryServiceTypes?.find((type) => Number(type.value) === Number(value.value));
                          if (selectedType) {
                            setValue("invType", selectedType.label);
                            setValue("invTypeCode", selectedType.bchCode);
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
                        options={sampleType || []}
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
                    <Box>
                      <Typography variant="h6">Components</Typography>
                      {!viewOnly && (
                        <Typography variant="body2" color="text.secondary">
                          Drag and drop rows or use arrow buttons to reorder components
                        </Typography>
                      )}
                    </Box>
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
                            <TableCell width={60}>Order</TableCell>
                            <TableCell>Component Name</TableCell>
                            <TableCell>Unit</TableCell>
                            <TableCell>Entry Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell width={viewOnly ? 80 : 200}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {components.map((component, index) => (
                            <TableRow
                              key={index}
                              draggable={!viewOnly}
                              onDragStart={!viewOnly ? (e) => handleComponentDragStart(e, index) : undefined}
                              onDragEnd={!viewOnly ? handleComponentDragEnd : undefined}
                              onDragOver={!viewOnly ? handleComponentDragOver : undefined}
                              onDragEnter={!viewOnly ? (e) => handleComponentDragEnter(e, index) : undefined}
                              onDragLeave={!viewOnly ? handleComponentDragLeave : undefined}
                              onDrop={!viewOnly ? (e) => handleComponentDrop(e, index) : undefined}
                              sx={{
                                cursor: !viewOnly ? "move" : "default",
                                backgroundColor: dragOverComponentIndex === index ? "action.hover" : "inherit",
                                opacity: draggedComponentIndex === index ? 0.5 : 1,
                                transition: "background-color 0.2s ease",
                                "&:hover": !viewOnly
                                  ? {
                                      backgroundColor: "action.hover",
                                    }
                                  : {},
                              }}
                            >
                              <TableCell>
                                <Typography variant="h6" color="primary">
                                  {index + 1}
                                </Typography>
                              </TableCell>
                              <TableCell>{component.compoName}</TableCell>
                              <TableCell>{component.compUnit || "-"}</TableCell>
                              <TableCell>{component.lCentName || "-"}</TableCell>
                              <TableCell>
                                <Chip size="small" color={component.rActiveYN === "Y" ? "success" : "error"} label={component.rActiveYN === "Y" ? "Active" : "Inactive"} />
                              </TableCell>
                              <TableCell>
                                {viewOnly ? (
                                  <Tooltip title="View Only">
                                    <IconButton size="small" sx={{ cursor: "default" }}>
                                      <DragIndicator fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Stack direction="row" spacing={1}>
                                    <Tooltip title="Move Up">
                                      <span>
                                        <IconButton size="small" color="primary" onClick={() => moveComponent(index, "up")} disabled={index === 0}>
                                          <ArrowUpward fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    <Tooltip title="Move Down">
                                      <span>
                                        <IconButton size="small" color="primary" onClick={() => moveComponent(index, "down")} disabled={index === components.length - 1}>
                                          <ArrowDownward fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    <Tooltip title="Drag to reorder">
                                      <IconButton size="small" sx={{ cursor: "grab", "&:active": { cursor: "grabbing" } }}>
                                        <DragIndicator fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Component">
                                      <IconButton size="small" color="info" onClick={() => handleEditComponent(component, index)}>
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Component">
                                      <IconButton size="small" color="error" onClick={() => handleDeleteComponent(index)}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                )}
                              </TableCell>
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
          viewOnly={false}
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
