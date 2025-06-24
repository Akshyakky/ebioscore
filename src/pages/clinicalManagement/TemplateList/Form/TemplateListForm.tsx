import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { RichTextEditor } from "@/components/RichTextEditor/RichTextEditor";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { TemplateDetailDto, TemplateMastDto } from "@/interfaces/ClinicalManagement/TemplateDto";
import { useUserList } from "@/pages/securityManagement/UserListPage/hooks/useUserList";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Refresh, Save } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, CircularProgress, Divider, FormControlLabel, Grid, InputAdornment, Radio, RadioGroup, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useTemplateDetail, useTemplateMast } from "../hooks/useTemplateList";

interface TemplateListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: TemplateMastDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  templateID: z.number(),
  templateCode: z.string().max(50, "Template code cannot exceed 50 characters").optional(),
  templateName: z.string().nonempty("Template name is required").max(100, "Template name cannot exceed 100 characters"),
  templateDescription: z.string().nonempty("Template description is required"),
  templateType: z.string().nonempty("Template type is required").max(20, "Template type cannot exceed 20 characters"),
  displayAllUsers: z.enum(["Y", "N", "C"], {
    required_error: "Display option is required",
    invalid_type_error: "Display option must be 'Y', 'N', or 'C'",
  }),
  rActiveYN: z.enum(["Y", "N"]),
  transferYN: z.enum(["Y", "N"]),
  rNotes: z.string().nullable().optional(),
});

type TemplateFormData = z.infer<typeof schema>;

const TemplateListForm: React.FC<TemplateListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveTemplate } = useTemplateMast();
  const { saveTemplateDetail, deleteTemplateDetail, fetchTemplateDetailList, templateDetailList } = useTemplateDetail();
  const { fetchUsersList, userList } = useUserList();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const { showAlert } = useAlert();
  const isAddMode = !initialData;

  const { cmTemplateType } = useDropdownValues(["cmTemplateType"]);
  const defaultValues: TemplateFormData = {
    templateID: 0,
    templateCode: "",
    templateName: "",
    templateDescription: "",
    templateType: "",
    displayAllUsers: "Y",
    rActiveYN: "Y",
    rNotes: "",
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isValid },
  } = useForm<TemplateFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const displayAllUsers = useWatch({ control, name: "displayAllUsers" });

  const generateTemplateCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("TMP", 5);
      if (nextCode) {
        setValue("templateCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate template code", "warning");
      }
    } catch (error) {
      console.error("Error generating template code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData as TemplateFormData);

      if (initialData.displayAllUsers === "C") {
        loadTemplateDetails(initialData.templateID);
      }
    } else {
      reset(defaultValues);
      generateTemplateCode();
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (displayAllUsers === "C") {
      fetchUsersList();
    }
  }, [displayAllUsers]);

  const loadTemplateDetails = async (templateId: number) => {
    try {
      await fetchTemplateDetailList();
      const details = templateDetailList.filter((detail: TemplateDetailDto) => detail.templateID === templateId);
      setSelectedUsers(details.map((detail: TemplateDetailDto) => detail.appID));
    } catch (error) {
      console.error("Error loading template details:", error);
    }
  };

  const onSubmit = async (data: TemplateFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const templateData: TemplateMastDto = {
        templateID: data.templateID,
        templateCode: data.templateCode || "",
        templateName: data.templateName,
        templateDescription: data.templateDescription,
        templateType: data.templateType,
        displayAllUsers: data.displayAllUsers,
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes || "",
        transferYN: data.transferYN || "N",
      };

      const response = await saveTemplate(templateData);

      if (response.success) {
        const savedTemplateId = response.data?.templateID || data.templateID;

        if (data.displayAllUsers === "C" && selectedUsers.length > 0) {
          if (!isAddMode) {
            const existingDetails = templateDetailList.filter((detail: TemplateDetailDto) => detail.templateID === savedTemplateId);
            for (const detail of existingDetails) {
              await deleteTemplateDetail(detail.templateDetailID);
            }
          }

          for (const userId of selectedUsers) {
            const templateDetail: TemplateDetailDto = {
              templateDetailID: 0,
              templateID: savedTemplateId,
              appID: userId,
              rActiveYN: "Y",
              transferYN: "N",
              rNotes: "",
            };
            await saveTemplateDetail(templateDetail);
          }
        }

        showAlert("Success", isAddMode ? "Template created successfully" : "Template updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save template";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as TemplateFormData) : defaultValues);
    setFormError(null);
    setSelectedUsers([]);

    if (isAddMode) {
      generateTemplateCode();
    } else if (initialData?.displayAllUsers === "C") {
      loadTemplateDetails(initialData.templateID);
    }
  };

  const handleReset = () => {
    if (isDirty || selectedUsers.length > 0) {
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
    if (isDirty || selectedUsers.length > 0) {
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

  const dialogTitle = viewOnly ? "View Template Details" : isAddMode ? "Create New Template" : `Edit Template - ${initialData?.templateName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton
          text="Reset"
          onClick={handleReset}
          variant="outlined"
          color="error"
          icon={Cancel}
          disabled={isSaving || (!isDirty && !formError && selectedUsers.length === 0)}
        />
        <SmartButton
          text={isAddMode ? "Create Template" : "Update Template"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={Save}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isAddMode ? "Creating..." : "Updating..."}
          successText={isAddMode ? "Created!" : "Updated!"}
          disabled={isSaving || !isValid || (displayAllUsers === "C" && selectedUsers.length === 0)}
        />
      </Box>
    </Box>
  );

  const handleRefreshCode = () => {
    if (isAddMode) {
      generateTemplateCode();
    }
  };

  const handleUserSelection = (userId: number) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const userColumns: Column<any>[] = [
    {
      key: "appID",
      header: "Select",
      visible: true,
      sortable: false,
      filterable: false,
      width: 80,
      render: (user) => <input type="checkbox" checked={selectedUsers.includes(user.appID)} onChange={() => handleUserSelection(user.appID)} disabled={viewOnly} />,
    },
    {
      key: "appUserName",
      header: "User",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "appUcatType",
      header: "User Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
  ];

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
                        name="templateCode"
                        control={control}
                        label="Template Code"
                        type="text"
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
                      <FormField name="templateName" control={control} label="Template Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="templateType"
                        control={control}
                        label="Template Type"
                        type="select"
                        required
                        options={cmTemplateType || []}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        placeholder="E.g., Clinical, Administrative, Report"
                      />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <Controller
                        name="templateDescription"
                        control={control}
                        render={({ field, fieldState }) => (
                          <RichTextEditor value={field.value} onChange={field.onChange} disabled={viewOnly} error={!!fieldState.error} helperText={fieldState.error?.message} />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Display Settings Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Display Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12 }}>
                      <Typography variant="body2" gutterBottom>
                        Who can see this template?
                      </Typography>
                      <RadioGroup row value={displayAllUsers} onChange={(e) => setValue("displayAllUsers", e.target.value as "Y" | "N" | "C", { shouldValidate: true })}>
                        <FormControlLabel value="Y" control={<Radio size="small" />} label="All Users" disabled={viewOnly} />
                        <FormControlLabel value="N" control={<Radio size="small" />} label="Only Me" disabled={viewOnly} />
                        <FormControlLabel value="C" control={<Radio size="small" />} label="Specific Users" disabled={viewOnly} />
                      </RadioGroup>
                    </Grid>

                    {displayAllUsers === "C" && (
                      <Grid size={{ sm: 12 }}>
                        <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                          Select users who can access this template ({selectedUsers.length} selected):
                        </Typography>
                        <Box sx={{ height: 300, mt: 1 }}>
                          <CustomGrid
                            columns={userColumns}
                            data={userList.filter((user) => user.rActiveYN === "Y") || []}
                            maxHeight="280px"
                            emptyStateMessage="No users found"
                            loading={false}
                          />
                        </Box>
                      </Grid>
                    )}
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
                        placeholder="Enter any additional information about this template"
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

export default TemplateListForm;
