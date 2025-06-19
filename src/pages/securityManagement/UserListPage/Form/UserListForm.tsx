import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { UserListDto } from "@/interfaces/SecurityManagement/UserListData";
import { useAlert } from "@/providers/AlertProvider";
import { CompanyService } from "@/services/NotGenericPaternServices/CompanyService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Edit, Save, Visibility } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Divider, Grid, ImageList, ImageListItem, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import PermissionManager from "../../CommonPage/PermissionManager";
import { useUserList } from "../hooks/useUserList";
import ProfilePermissionsListModal from "../SubPage/ProfilePermissionsListModal";
import ProfilePermissionsModifyModal from "../SubPage/ProfilePermissionsModifyModal";

interface UserListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: UserListDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  appID: z.number(),
  appCode: z.string().nonempty("Username is required"),
  appUserName: z.string().optional(),
  appGeneralCode: z.string().optional(),
  conID: z.number(),
  appUcatCode: z.string().optional(),
  appUcatType: z.string(),
  adminUserYN: z.string(),
  conCompId: z.number().optional(),
  digSignPath: z.any().optional(),
  appUAccess: z.string().optional(),
  confirmPassword: z.string().optional(),
  profileID: z.number().optional(),
  rActiveYN: z.string(),
  rNotes: z.string().nullable().optional(),
  transferYN: z.string().optional(),
});

type UserListFormData = z.infer<typeof schema>;

const UserListForm: React.FC<UserListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { saveUserList } = useUserList();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "modulePermissions" | "reportPermissions" | "departmentPermissions">("details");
  const [digSignImageName, setDigSignImageName] = useState<string>("");
  const [newPassword, setNewPassword] = useState<boolean>(true);
  const [companyDropdown, setCompanyDropdown] = useState<DropdownOption[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isProfileModifyModalOpen, setIsProfileModifyModalOpen] = useState<boolean>(false);
  const { usersWithoutLogin, profiles } = useDropdownValues(["usersWithoutLogin", "profiles"]);
  const { showAlert } = useAlert();
  const isAddMode = !initialData;
  const defaultValues: UserListFormData = {
    appID: 0,
    appCode: "",
    appUserName: "",
    appGeneralCode: "",
    conID: 0,
    appUcatCode: "",
    appUcatType: "",
    adminUserYN: "N",
    conCompId: 0,
    digSignPath: "",
    appUAccess: "",
    confirmPassword: "",
    profileID: 0,
    rActiveYN: "Y",
    rNotes: "",
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, isValid },
  } = useForm<UserListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const watchedData = watch();
  const permissionView = watchedData.appID > 0 && watchedData.adminUserYN === "N" && !watchedData.profileID;
  const newPasswordEnabled = isAddMode || newPassword;
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyData = await CompanyService.getCompanies();
        const companies: DropdownOption[] = companyData.map((company: any) => ({
          value: company.compIDCompCode.split(",")[0],
          label: company.compName,
        }));
        setCompanyDropdown(companies);
      } catch (error) {
        console.error("Fetching companies failed: ", error);
      }
    };
    fetchCompanies();
  }, [CompanyService]);

  useEffect(() => {
    if (initialData) {
      reset(initialData as UserListFormData);
      setNewPassword(false);
      setDigSignImageName("");
    } else {
      reset(defaultValues);
      setNewPassword(true);
      setDigSignImageName("");
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (!newPassword && Boolean(watchedData.appID)) {
      setValue("appUAccess", "");
      setValue("confirmPassword", "");
    }
  }, [newPassword, watchedData.appID, setValue]);

  const onSubmit = async (data: UserListFormData) => {
    if (viewOnly) return;

    if (newPasswordEnabled) {
      if (data.appUAccess !== data.confirmPassword) {
        setFormError("Passwords do not match");
        return;
      }
      if (!data.appUAccess) {
        setFormError("Password is required");
        return;
      }
    }

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const formData: UserListDto = {
        ...data,
        appID: data.appID ?? 0,
        appGeneralCode: data.appGeneralCode ?? "",
        profileID: data.profileID || 0,
        conID: data.conID || 0,
        conCompId: data.conCompId || 0,
        appUserName: data.appUserName ?? "",
        rNotes: data.rNotes ?? "",
        appUcatCode: data.appUcatCode ?? "",
        appUcatType: data.appUcatType ?? "",
        adminUserYN: data.adminUserYN ?? "",
        digSignPath: data.digSignPath ?? "",
        appCode: data.appCode ?? "",
        appUAccess: data.appUAccess ?? "",
        rActiveYN: data.rActiveYN ?? "Y",
        transferYN: data.transferYN ?? "N",
      };

      const response: any = await saveUserList(formData);
      if (response.success) {
        showAlert("Success", isAddMode ? "User created successfully" : "User updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save user");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save user";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as UserListFormData) : defaultValues);
    setFormError(null);
    setActiveTab("details");
    setDigSignImageName(initialData?.digSignPath ? "Existing signature" : "");
    setNewPassword(!initialData);
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

  const handleDigitalSignatureChange = (file: File): void => {
    if (file.size > 51200) {
      showAlert(`Image size exceeds 50kb limit (current file size: ${(file.size / 1024).toFixed(1)}kb)`, "Please select an image smaller than 50kb.", "warning");
      return;
    }

    setDigSignImageName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setValue("digSignPath", base64String, { shouldDirty: true });
    };
  };

  const handleDigSignClear = () => {
    setValue("digSignPath", "", { shouldDirty: true });
    setDigSignImageName("");
  };

  const handleChangeUserName = (item: DropdownOption) => {
    setValue("conID", Number(item.value), { shouldDirty: true });
    setValue("appUserName", item.label, { shouldDirty: true });
  };

  const handleViewProfilePermissions = async () => {
    if (!watchedData.profileID) {
      showAlert("Warning", "Please select a profile first", "warning");
      return;
    }
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleModifyProfilePermissions = () => {
    if (!watchedData.profileID) {
      showAlert("Warning", "Please select a profile first", "warning");
      return;
    }
    setIsProfileModifyModalOpen(true);
  };

  const handleCloseProfileModifyModal = () => {
    setIsProfileModifyModalOpen(false);
  };

  const dialogTitle = viewOnly ? "View User Details" : isAddMode ? "Create New User" : `Edit User - ${initialData?.appUserName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create User" : "Update User"}
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

  const renderTabButtons = () => (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mb: 2 }}>
      <Tabs
        value={activeTab}
        onChange={(_event, newValue) => {
          if (newValue) {
            setActiveTab(newValue);
          }
        }}
        aria-label="permissions navigation"
        variant="standard"
        sx={{ minHeight: 40 }}
      >
        <Tab
          label="User Details"
          value="details"
          sx={{
            minHeight: 40,
            textTransform: "none",
            fontSize: "0.875rem",
          }}
        />

        {!isAddMode && permissionView && (
          <Tab
            label="Module Permissions"
            value="modulePermissions"
            sx={{
              minHeight: 40,
              textTransform: "none",
              fontSize: "0.875rem",
            }}
          />
        )}

        {!isAddMode && permissionView && (
          <Tab
            label="Report Permissions"
            value="reportPermissions"
            sx={{
              minHeight: 40,
              textTransform: "none",
              fontSize: "0.875rem",
            }}
          />
        )}
        {!isAddMode && permissionView && (
          <Tab
            label="Department Permissions"
            value="departmentPermissions"
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
              {isAddMode && (
                <Grid size={{ sm: 12, md: 6 }}>
                  <FormField
                    name="conID"
                    control={control}
                    label="Select User"
                    type="select"
                    required
                    disabled={viewOnly || Boolean(watchedData.appID)}
                    size="small"
                    fullWidth
                    options={usersWithoutLogin ?? []}
                    defaultText="Select User"
                    onChange={(item) => handleChangeUserName(item)}
                  />
                </Grid>
              )}

              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="appCode" control={control} label="Username" type="text" required disabled={viewOnly} size="small" fullWidth />
              </Grid>

              {!isAddMode && (
                <Grid size={{ sm: 12, md: 6 }}>
                  <FormField
                    name="newPassword"
                    control={control}
                    label="Change Password"
                    type="switch"
                    disabled={viewOnly}
                    size="small"
                    onChange={(checked) => setNewPassword(checked === "Y")}
                  />
                </Grid>
              )}

              {newPasswordEnabled && (
                <>
                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField name="appUAccess" control={control} label="Password" type="password" required={newPasswordEnabled} disabled={viewOnly} size="small" fullWidth />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField
                      name="confirmPassword"
                      control={control}
                      label="Confirm Password"
                      type="password"
                      required={newPasswordEnabled}
                      disabled={viewOnly}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                </>
              )}
              <Grid size={{ sm: 12, md: 6 }}>
                <FormField
                  name="conCompId"
                  control={control}
                  label="Company"
                  type="select"
                  required
                  disabled={viewOnly}
                  size="small"
                  fullWidth
                  options={companyDropdown}
                  defaultText="Select Company"
                  onChange={(item) => setValue("conCompId", Number(item.value), { shouldDirty: true })}
                />
              </Grid>

              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="adminUserYN" control={control} label="Super User" type="switch" disabled={viewOnly} size="small" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ sm: 12 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile & Permissions
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4 }}>
                <FormField
                  name="profileID"
                  control={control}
                  label="Profile"
                  type="select"
                  disabled={viewOnly}
                  size="small"
                  fullWidth
                  options={profiles?.filter((profile) => profile.rActiveYN === "Y") ?? []}
                  defaultText="Select Profile"
                  onChange={(item) => {
                    setValue("profileID", Number(item.value), { shouldDirty: true });
                  }}
                />
              </Grid>
              {watchedData.profileID && watchedData.profileID > 0 ? (
                <Grid size={{ sm: 12, md: 6 }}>
                  <Box display="flex" gap={2}>
                    <Tooltip title="View Profile Permissions">
                      <SmartButton text="View" onClick={handleViewProfilePermissions} variant="outlined" color="primary" icon={Visibility} disabled={viewOnly} />
                    </Tooltip>
                    <Tooltip title="Modify Profile Permissions">
                      <SmartButton text="Modify" onClick={handleModifyProfilePermissions} variant="outlined" color="secondary" icon={Edit} disabled={viewOnly} />
                    </Tooltip>
                  </Box>
                </Grid>
              ) : null}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ sm: 12 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Digital Signature
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {!watchedData.digSignPath ? (
                <Grid size={{ sm: 12 }}>
                  <FormField
                    name="digSignPath"
                    control={control}
                    label="Digital Signature"
                    type="file"
                    disabled={viewOnly}
                    size="small"
                    fullWidth
                    accept=".jpg,.jpeg,.png"
                    placeholder="Choose an image (max 50kb)"
                    onChange={handleDigitalSignatureChange}
                  />
                </Grid>
              ) : (
                <Grid size={{ sm: 12 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <ImageList cols={1}>
                      <ImageListItem>
                        <img src={watchedData.digSignPath} alt={digSignImageName || "Digital Signature"} loading="lazy" />
                      </ImageListItem>
                    </ImageList>
                    <Typography variant="body2" color="text.secondary">
                      {digSignImageName}
                    </Typography>
                    {!viewOnly && <SmartButton text="Clear" onClick={handleDigSignClear} variant="contained" color="error" icon={Cancel} />}
                  </Box>
                </Grid>
              )}
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
                  placeholder="Enter any additional information about this user"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPermissionsTab = (title: string, type: "M" | "R" | "D", isMainModules: boolean, isSubModules: boolean) =>
    !isAddMode && permissionView ? (
      <Card variant="outlined">
        <CardContent>
          <PermissionManager mode="user" details={watchedData as UserListDto} title={title} type={type} useMainModules={isMainModules} useSubModules={isSubModules} />
        </CardContent>
      </Card>
    ) : (
      <Alert severity="info">User must be saved before managing {title.toLocaleLowerCase()}, or select a profile instead of individual permissions.</Alert>
    );
  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return renderDetailsTab();
      case "modulePermissions":
        return renderPermissionsTab("Module Permissions", "M", true, true);
      case "reportPermissions":
        return renderPermissionsTab("Report Permissions", "R", true, false);
      case "departmentPermissions":
        return renderPermissionsTab("Department Permissions", "D", false, false);
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
        <Box component="form" noValidate sx={{ p: 1, minHeight: "700px" }}>
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

      {watchedData.profileID && watchedData.profileID > 0 && (
        <>
          <ProfilePermissionsListModal profileId={Number(watchedData.profileID)} open={isProfileModalOpen} onClose={handleCloseProfileModal} />
          <ProfilePermissionsModifyModal profileId={Number(watchedData.profileID)} open={isProfileModifyModalOpen} onClose={handleCloseProfileModifyModal} />
        </>
      )}
    </>
  );
};

export default UserListForm;
