import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, CircularProgress, Tabs, Tab } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { showAlert } from "@/utils/Common/showAlert";
import PermissionManager from "../../CommonPage/PermissionManager";
import { useProfileList } from "../hooks/useProfileListPage";

interface ProfileListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ProfileMastDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  profileID: z.number(),
  profileCode: z.string().nonempty("Profile code is required"),
  profileName: z.string().nonempty("Profile name is required"),
  rActiveYN: z.string(),
  transferYN: z.string(),
  rNotes: z.string().nullable().optional(),
});

type ProfileListFormData = z.infer<typeof schema>;

const ProfileListForm: React.FC<ProfileListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveProfile } = useProfileList();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "modulePermissions" | "reportPermissions">("details");
  const isAddMode = !initialData;

  const defaultValues: ProfileListFormData = {
    profileID: 0,
    profileCode: "",
    profileName: "",
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, isValid },
  } = useForm<ProfileListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const watchedData = watch();

  const generateProfileCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("PR", 3);
      if (nextCode) {
        setValue("profileCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate profile code", "warning");
      }
    } catch (error) {
      console.error("Error generating profile code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData as ProfileListFormData);
    } else {
      reset(defaultValues);
      generateProfileCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: ProfileListFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const formData: ProfileMastDto = {
        profileID: data.profileID,
        profileCode: data.profileCode,
        profileName: data.profileName,
        rActiveYN: data.rActiveYN,
        transferYN: data.transferYN,
        rNotes: data.rNotes || "",
      };

      const response = await saveProfile(formData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Profile created successfully" : "Profile updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save profile";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as ProfileListFormData) : defaultValues);
    setFormError(null);
    setActiveTab("details");

    if (isAddMode) {
      generateProfileCode();
    }
  };

  const handleReset = () => {
    if (isDirty) {
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
    if (isDirty) {
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

  const dialogTitle = viewOnly ? "View Profile Details" : isAddMode ? "Create New Profile" : `Edit Profile - ${initialData?.profileName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Profile" : "Update Profile"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={Save}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isAddMode ? "Creating..." : "Updating..."}
          successText={isAddMode ? "Created!" : "Updated!"}
          disabled={isSaving || !isValid || activeTab !== "details"}
        />
      </Box>
    </Box>
  );

  const handleRefreshCode = () => {
    if (isAddMode) {
      generateProfileCode();
    }
  };

  const renderTabButtons = () => (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mb: 2 }}>
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => {
          if (newValue) {
            setActiveTab(newValue);
          }
        }}
        aria-label="permissions navigation"
        variant="standard"
        sx={{ minHeight: 40 }}
      >
        <Tab
          label="Profile Details"
          value="details"
          sx={{
            minHeight: 40,
            textTransform: "none",
            fontSize: "0.875rem",
          }}
        />

        {!isAddMode && (
          <Tab
            label="Module Permissions"
            value="modulePermissions"
            disabled={!watchedData.profileID}
            sx={{
              minHeight: 40,
              textTransform: "none",
              fontSize: "0.875rem",
            }}
          />
        )}

        {!isAddMode && (
          <Tab
            label="Report Permissions"
            value="reportPermissions"
            disabled={!watchedData.profileID}
            sx={{
              minHeight: 40,
              textTransform: "none",
              fontSize: "0.875rem",
            }}
          />
        )}
      </Tabs>
    </Box>
  );

  const renderDetailsTab = () => (
    <Grid container spacing={3}>
      <Grid size={{ sm: 12 }}>
        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Status:
          </Typography>
          <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
        </Box>
      </Grid>

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
                  name="profileCode"
                  control={control}
                  label="Profile Code"
                  type="text"
                  required
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
                <FormField name="profileName" control={control} label="Profile Name" type="text" required disabled={viewOnly} size="small" fullWidth />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

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
                  placeholder="Enter any additional information about this profile"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderModulePermissionsTab = () =>
    !isAddMode && watchedData.profileID ? (
      <Card variant="outlined">
        <CardContent>
          <PermissionManager mode="profile" details={watchedData as ProfileMastDto} title="Module Permissions" type="M" useMainModules={true} useSubModules={true} />
        </CardContent>
      </Card>
    ) : (
      <Alert severity="info">Profile must be saved before managing module permissions.</Alert>
    );

  const renderReportPermissionsTab = () =>
    !isAddMode && watchedData.profileID ? (
      <Card variant="outlined">
        <CardContent>
          <PermissionManager mode="profile" details={watchedData as ProfileMastDto} title="Report Permissions" type="R" useMainModules={true} useSubModules={false} />
        </CardContent>
      </Card>
    ) : (
      <Alert severity="info">Profile must be saved before managing report permissions.</Alert>
    );

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return renderDetailsTab();
      case "modulePermissions":
        return renderModulePermissionsTab();
      case "reportPermissions":
        return renderReportPermissionsTab();
      default:
        return renderDetailsTab();
    }
  };

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

          {renderTabButtons()}
          {renderTabContent()}
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

export default ProfileListForm;
