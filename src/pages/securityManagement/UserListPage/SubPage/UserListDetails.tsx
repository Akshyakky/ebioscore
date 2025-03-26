import FormField from "@/components/FormField/FormField";
import { UserListDto } from "@/interfaces/SecurityManagement/UserListData";
import { Box, Button, Grid, ImageList, ImageListItem, Paper, SelectChangeEvent, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";
import { useLoading } from "@/context/LoadingContext";
import { useAppSelector } from "@/store/hooks";
import { CompanyService } from "@/services/CommonServices/CompanyService";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { ConstantValues } from "@/services/CommonServices/ConstantValuesService";
import { userListServices } from "@/services/SecurityManagementServices/UserListServices";
import { ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import ProfilePermissionsListModal from "./ProfilePermissionsListModal";
import ProfilePermissionsModifyModal from "./ProfilePermissionsModifyModal";
import PermissionManagerUserList from "./PermissionManagerUserList";
interface UserListProps {
  selectedUser?: UserListDto;
}

const UserListDetails: React.FC<UserListProps> = ({ selectedUser }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const profileMastService = useMemo(() => createEntityService<ProfileMastDto>("ProfileMast", "securityManagementURL"), []);
  const userList = useMemo(() => createEntityService<UserListDto>("AppUser", "securityManagementURL"), []);
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isProfileModifyModalOpen, setIsProfileModifyModalOpen] = useState<boolean>(false);
  const [permissionView, setPermissionView] = useState<boolean>(false);

  const initialForm: UserListDto = {
    appID: 0,
    appUserName: "",
    appGeneralCode: "",
    conID: 0,
    appUcatCode: "",
    appUcatType: "",
    adminUserYN: "N",
    conCompId: 0,
    digSignPath: "",
    appCode: "",
    appUAccess: "",
    profileID: 0,
    rActiveYN: "Y",
    rCreatedOn: "",
    rCreatedID: 0,
    rCreatedBy: "",
    rModifiedOn: "",
    rModifiedID: 0,
    rModifiedBy: "",
    rNotes: "",
    compCode: compCode || "",
    compID: compID || 0,
    compName: compName || "",
    transferYN: "N",
    confirmPassword: "",
  };
  const [userForm, setUserForm] = useState<UserListDto>(initialForm);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const { setLoading } = useLoading();
  const [digSignImageName, setDigSignImageName] = useState<string>("");
  const [companyDropdown, setCompanyDropdown] = useState<DropdownOption[]>([]);
  const [userCategoryDropdown, setUserCategoryDropdown] = useState<DropdownOption[]>([]);
  const [userListDropdown, setUserListDropdown] = useState<DropdownOption[]>([]);
  const [profileDropdown, setProfileDropdown] = useState<DropdownOption[]>([]);
  const [newPassword, setNewPassword] = useState<boolean>(true);
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyData = await CompanyService.getCompanies();
        const companies: DropdownOption[] = companyData.map((company: DropdownOption) => ({
          value: company.compIDCompCode.split(",")[0],
          label: company.compName,
        }));
        setCompanyDropdown(companies);
      } catch (error) {
        console.error("Fetching companies failed: ", error);
      }
    };
    const fetchUserCategory = async () => {
      const userCategory = await ConstantValues.fetchConstantValues("GetConstantValues", "AUCT");
      const userCategoryDropdownOptions: DropdownOption[] = userCategory.map((cat) => ({
        value: `${cat.value}|${cat.label}`,
        label: cat.label,
      }));
      setUserCategoryDropdown(userCategoryDropdownOptions);
    };
    const fetchProfiles = async () => {
      const response = await profileMastService.getAll();
      const profiles: ProfileMastDto[] = response.data;
      const activeProfiles: ProfileMastDto[] = profiles.filter((profile: ProfileMastDto) => profile.rActiveYN === "Y");
      console.log("activeProfiles", activeProfiles);
      const profilesDropdownOptions: any[] = activeProfiles.map((profile: ProfileMastDto) => ({
        value: profile.profileID,
        label: profile.profileName,
      }));
      setProfileDropdown(profilesDropdownOptions);
    };
    fetchCompanies();
    fetchUserCategory();
    fetchProfiles();
  }, []);

  useEffect(() => {
    console.log(userForm);
    setPermissionView(userForm.appID > 0 && userForm.adminUserYN === "N" && !userForm.profileID);
  }, [userForm]);

  useEffect(() => {
    if (!newPassword && Boolean(userForm.appID)) {
      setUserForm((prev) => ({ ...prev, appUAccess: "", confirmPassword: "" }));
    }
  }, [newPassword]);

  useEffect(() => {
    const fetchUsersWithoutCredentials = async () => {
      if (Boolean(userForm.appID)) {
        const userNameDropdownData: DropdownOption[] = [
          {
            value: `${userForm.conID.toString()}|${userForm.appUserName}`,
            label: userForm.appUserName,
          },
        ];
        setUserListDropdown(userNameDropdownData);
        return;
      }
      if (!userForm.appUcatCode) {
        setUserListDropdown([]);
        return;
      }

      const response: any = await userListServices.getUsersWithoutCredentials(userForm.appUcatCode);
      const usersWithoutCredentials: DropdownOption[] = response.data.map((user: UserListDto) => ({
        value: `${user.conID.toString()}|${user.appUserName}`,
        label: user.appUserName,
      }));
      setUserListDropdown(usersWithoutCredentials);
    };
    fetchUsersWithoutCredentials();
  }, [userForm.appUcatCode]);

  useEffect(() => {
    if (selectedUser) {
      setNewPassword(false);
      setUserForm(selectedUser);
    }
  }, [selectedUser]);

  const handleChangeUserForm = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleDigitalSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 51200) {
        showAlert(`Image size exceeds 50kb limit (current file size: ${(file.size / 1024).toFixed(1)}kb)`, "Please select an image smaller than 50kb.", "warning");
        return;
      }
      setDigSignImageName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUserForm((prev) => ({
          ...prev,
          digSignPath: base64String,
        }));
      };
    }
  };
  const handleChangeUserCategory = (e: SelectChangeEvent) => {
    const { value } = e.target;
    setUserForm((prev) => ({ ...prev, appUcatCode: value.split("|")[0], appUcatType: value.split("|")[1] }));
  };
  const handleChangeUserName = (e: SelectChangeEvent) => {
    const { value } = e.target;
    setUserForm((prev) => ({
      ...prev,
      conID: parseInt(value.split("|")[0]),
      appUserName: value.split("|")[1],
    }));
  };
  const handleClear = () => {
    setUserForm(initialForm);
    setDigSignImageName("");
    setIsSubmitted(false);
    setNewPassword(true);
  };
  const handleSaveUser = async () => {
    setIsSubmitted(true);
    setLoading(true);
    if (!userForm.appUcatCode) {
      return;
    }
    if (newPassword && userForm.appUAccess !== userForm.confirmPassword) {
      return;
    }
    try {
      const response = await userList.save({
        ...userForm,
        profileID: userForm.profileID || 0,
        compID: compID || 0,
        compCode: compCode || "",
        compName: compName || "",
      });
      if (response.success) {
        showAlert("Success", "User saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert("Error", "User not saved", "error", {
          onConfirm: handleClear,
        });
      }
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleNewPasswordSwitch = () => {
    setNewPassword((prev) => !prev);
  };
  const handleDigSignClear = () => {
    setUserForm((prev) => ({ ...prev, digSignPath: "" }));
    setDigSignImageName("");
  };
  const handleViewProfilePermissions = async () => {
    if (!userForm.profileID) {
      showAlert("Warning", "Please select a profile first", "warning");
      return;
    }
    setIsProfileModalOpen(true);
  };
  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };
  const handleModifyProfilePermissions = () => {
    if (!userForm.profileID) {
      showAlert("Warning", "Please select a profile first", "warning");
      return;
    }
    setIsProfileModifyModalOpen(true);
  };
  const handleCloseProfileModifyModal = () => {
    setIsProfileModifyModalOpen(false);
  };
  return (
    <>
      <Paper variant="elevation" sx={{ padding: 2 }}>
        <Typography variant="h5">User List</Typography>
        <section>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6}>
              <Grid item xs={12}>
                <FormField
                  type="select"
                  label="Select Category"
                  name="appUcatCode"
                  ControlID="appUcatCode"
                  value={`${userForm.appUcatCode}|${userForm.appUcatType}`}
                  options={userCategoryDropdown}
                  onChange={handleChangeUserCategory}
                  disabled={Boolean(userForm.appID)}
                  defaultText={`Select Category`}
                  isMandatory={true}
                  size="small"
                  gridProps={{ xs: 12, sm: 12, md: 8 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormField
                  type="select"
                  label="Select User"
                  name="conID"
                  ControlID="conID"
                  value={`${userForm.conID}|${userForm.appUserName}`}
                  options={userListDropdown}
                  onChange={handleChangeUserName}
                  disabled={Boolean(userForm.appID)}
                  defaultText={`Select User`}
                  isMandatory={true}
                  size="small"
                  gridProps={{ xs: 12, sm: 12, md: 8 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormField
                  type="text"
                  label="Username"
                  value={userForm.appCode}
                  onChange={handleChangeUserForm}
                  isSubmitted={isSubmitted}
                  name="appCode"
                  ControlID="appCode"
                  isMandatory
                  gridProps={{ xs: 12, sm: 12, md: 8 }}
                />
              </Grid>
              {Boolean(userForm.appID) && (
                <Grid item xs={12}>
                  <FormField
                    type="switch"
                    label="New Password"
                    name="newPassword"
                    ControlID="newPassword"
                    value={newPassword}
                    checked={newPassword}
                    onChange={handleNewPasswordSwitch}
                    gridProps={{ xs: 12 }}
                  />
                </Grid>
              )}
              {newPassword && (
                <>
                  <Grid item xs={12}>
                    <FormField
                      type="password"
                      label="Password"
                      value={userForm.appUAccess}
                      onChange={handleChangeUserForm}
                      isSubmitted={isSubmitted}
                      name="appUAccess"
                      ControlID="appUAccess"
                      gridProps={{ xs: 12, sm: 12, md: 8 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormField
                      type="password"
                      label="Confirm Password"
                      value={userForm.confirmPassword}
                      onChange={handleChangeUserForm}
                      isSubmitted={isSubmitted}
                      name="confirmPassword"
                      ControlID="confirmPassword"
                      gridProps={{ xs: 12, sm: 12, md: 8 }}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <FormField
                  type="select"
                  label="Select Company"
                  name="conCompId"
                  ControlID="conCompId"
                  value={userForm.conCompId}
                  options={companyDropdown}
                  onChange={handleChangeUserForm}
                  disabled={false}
                  defaultText={`Select Company`}
                  isMandatory={true}
                  size="small"
                  gridProps={{ xs: 12, sm: 12, md: 8 }}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Grid item xs={12}>
                <FormField
                  type="switch"
                  label="Super User"
                  name="adminUserYN"
                  ControlID="adminUserYN"
                  value={userForm.adminUserYN}
                  checked={userForm.adminUserYN == "Y"}
                  onChange={(e, checked) => setUserForm((prev) => ({ ...prev, adminUserYN: checked ? "Y" : "N" }))}
                  gridProps={{ xs: 12 }}
                />
              </Grid>
              <Grid item xs={12} marginTop={2}>
                {!userForm.digSignPath ? (
                  <FormField
                    type="file"
                    label="Digital Signature"
                    value={digSignImageName}
                    onChange={handleDigitalSignatureChange}
                    isSubmitted={isSubmitted}
                    name="digSignPath"
                    accept=".jpg,.jpeg,.png"
                    ControlID="digSignPath"
                    multiple={false}
                    placeholder="Choose an image"
                    gridProps={{ xs: 12, sm: 12, md: 8 }}
                  />
                ) : (
                  <ImageList sx={{ width: 500 }} cols={3} rowHeight={164}>
                    <ImageListItem>
                      <img srcSet={`${userForm.digSignPath}`} src={`${userForm.digSignPath}?w=164&h=164&fit=crop&auto=format`} alt={digSignImageName} loading="lazy" />
                    </ImageListItem>
                    <Button variant="contained" color="error" onClick={handleDigSignClear}>
                      Clear
                    </Button>
                  </ImageList>
                )}
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormField
                  type="select"
                  label="Select Profile"
                  name="profileID"
                  ControlID="profileID"
                  value={`${userForm.profileID}`}
                  options={profileDropdown}
                  onChange={handleChangeUserForm}
                  disabled={false}
                  defaultText={`Select Profile`}
                  isMandatory={true}
                  size="small"
                  gridProps={{ xs: 12, sm: 12, md: 8 }}
                />
              </Grid>
              {userForm.profileID > 0 && (
                <Grid item xs={12} sm={12} md={6}>
                  <Button onClick={handleViewProfilePermissions}>View Profile Permissions</Button>
                  <Button color="secondary" onClick={handleModifyProfilePermissions}>
                    Modify Profile Permissions
                  </Button>
                </Grid>
              )}
            </Grid>
            <Grid item xs={6} sx={{ textAlign: isMobile ? "center" : "left" }}>
              <Button variant="contained" color="error" onClick={handleClear}>
                Clear
              </Button>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: isMobile ? "center" : "right" }}>
              <Button variant="contained" color="success" onClick={handleSaveUser}>
                Save
              </Button>
            </Grid>
          </Grid>
        </section>
      </Paper>
      {permissionView && (
        <Paper variant="outlined" sx={{ padding: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4} xl={3}>
              <PermissionManagerUserList userDetails={userForm} title="Module Permissions" type="M" useMainModules={true} useSubModules={true} />
            </Grid>
            <Grid item xs={12} md={6} lg={4} xl={3}>
              <PermissionManagerUserList userDetails={userForm} title="Report Permissions" type="R" useMainModules={true} useSubModules={false} />
            </Grid>
          </Grid>
        </Paper>
      )}
      <ProfilePermissionsListModal profileId={userForm.profileID} open={isProfileModalOpen} onClose={handleCloseProfileModal} />
      <ProfilePermissionsModifyModal profileId={userForm.profileID} open={isProfileModifyModalOpen} onClose={handleCloseProfileModifyModal} />
    </>
  );
};

export default UserListDetails;
