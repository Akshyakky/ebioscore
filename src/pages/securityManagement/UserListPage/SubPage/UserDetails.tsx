import React, { useState, useEffect, ChangeEvent, useContext } from "react";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import { CompanyService } from "../../../../services/CommonServices/CompanyService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { UserListService } from "../../../../services/SecurityManagementServices/UserListService";
import { SelectChangeEvent } from "@mui/material/Select";
import { ProfileListSearchResult } from "../../../../interfaces/SecurityManagement/ProfileListData";
import { ContactListService } from "../../../../services/HospitalAdministrationServices/ContactListService/ContactListService";
import ProfileListServices from "../../../../services/SecurityManagementServices/ProfileListServices";
import {
  notifyError,
  notifySuccess,
} from "../../../../utils/Common/toastManager";
import FloatingLabelFileUpload from "../../../../components/FileUpload/FileUpload";
import UserListSearch from "../../CommonPage/UserListSearch";
import {
  UserListData,
  UserListSearchResult,
} from "../../../../interfaces/SecurityManagement/UserListData";
import { UserListSearchContext } from "../../../../context/SecurityManagement/UserListSearchContext";

interface Company {
  compIDCompCode: string;
  compName: string;
}

interface UserDetailsProps {
  profile: UserListSearchResult | null;
  onSave: (profile: UserListSearchResult) => void;
  onClear: () => void;
  isEditMode: boolean;
  refreshProfiles: () => void;
  updateProfileStatus: (profileID: number, status: string) => void;
}

const defaultUserListData: UserListData = {
  conID: 0,
  conName: "",
  appID: 0,
  appUserName: "",
  appGeneralCode: "",
  rActiveYN: "Y",
  rCreatedOn: new Date().toISOString(),
  rCreatedID: 0,
  rCreatedBy: "",
  rModifiedOn: new Date().toISOString(),
  rModifiedID: 0,
  rModifiedBy: "",
  rNotes: "",
  appUcatCode: "",
  appUcatType: "",
  adminUserYN: "N",
  compCode: "",
  compID: 0,
  compName: "",
  conCompId: 0,
  digSignPath: "",
  transferYN: "N",
  appCode: "",
  appUAccess: "",
  profileID: 0,
};

const UserDetails: React.FC<UserDetailsProps> = ({
  profile,
  onSave,
  onClear,
  refreshProfiles,
  updateProfileStatus,
}) => {
  const { token } = useSelector((state: RootState) => state.userDetails);

  const [userList, setUserList] = useState<UserListData>(defaultUserListData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [dropdownValues, setDropdownValues] = useState({
    categoryOptions: [] as DropdownOption[],
    usersOptions: [] as DropdownOption[],
    companyOptions: [] as DropdownOption[],
    profileOptions: [] as DropdownOption[],
  });
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const { fetchAllUsers, updateUserStatus } = useContext(UserListSearchContext);

  const handleDropdownChange = async (
    fieldNames: (keyof UserListData)[],
    value: string,
    options: DropdownOption[]
  ) => {
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption) {
      const updatedState = { ...userList };

      if (fieldNames.includes("conID")) {
        try {
          const contactDetails = await ContactListService.fetchContactDetails(
            token!,
            parseInt(value)
          );
          updatedState.appUcatCode = contactDetails.contactMastDto.consValue;
          updatedState.appUcatType = contactDetails.contactMastDto.conCat;
        } catch (error) {
          console.error("Failed to fetch contact details:", error);
          setErrorMessage("Failed to fetch contact details.");
          return;
        }
      }

      fieldNames.forEach((field) => {
        if (field === "conID" || field === "compID" || field === "profileID") {
          updatedState[field] = parseInt(value) as unknown as never;
        } else {
          updatedState[field] = selectedOption.label as never;
        }
      });

      setUserList(updatedState);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await UserListService.getActiveWorkingUsers(token!);
        console.log("Fetched users:", result);
        if (result.success && result.data) {
          const usersOptions = result.data.map((user) => ({
            label: user.conName,
            value: user.conID.toString(),
          }));
          console.log("Users options:", usersOptions);
          setDropdownValues((prevState) => ({ ...prevState, usersOptions }));
        } else {
          console.error("Failed to fetch users:", result.errorMessage);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchCompanies = async () => {
      try {
        const companyData: Company[] = await CompanyService.getCompanies();
        console.log("Fetched companies:", companyData);
        if (companyData && companyData.length > 0) {
          const companyOptions = companyData.map((company) => ({
            label: company.compName,
            value: company.compIDCompCode,
          }));
          console.log("Company options:", companyOptions);
          setDropdownValues((prevState) => ({ ...prevState, companyOptions }));
        } else {
          console.error("Failed to fetch companies");
        }
      } catch (error) {
        console.error("Fetching companies failed:", error);
        setErrorMessage("Failed to load companies.");
      }
    };

    const fetchProfiles = async () => {
      try {
        const profileData: ProfileListSearchResult[] =
          await ProfileListServices.getAllProfileDetails(token!);
        console.log("Fetched profiles:", profileData);
        if (profileData && profileData.length > 0) {
          const profileOptions = profileData.map((profile) => ({
            label: profile.profileName,
            value: profile.profileID.toString(),
          }));
          console.log("Profile options:", profileOptions);
          setDropdownValues((prevState) => ({ ...prevState, profileOptions }));
        } else {
          console.error("Failed to fetch profiles");
        }
      } catch (error) {
        console.error("Fetching profiles failed:", error);
        setErrorMessage("Failed to load profiles.");
      }
    };

    if (token) {
      fetchUsers();
      fetchCompanies();
      fetchProfiles();
    }
  }, [token]);

  const handleAdvancedSearch = async () => {
    setIsSearchDialogOpen(true);
    await fetchAllUsers();
  };

  const handleCloseSearchDialog = () => {
    setIsSearchDialogOpen(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setUserList({ ...userList, digSignPath: URL.createObjectURL(files[0]) });
      setErrorMessage("");
    }
  };

  const handleSave = async () => {
    setIsSubmitted(true);
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    } else {
      setPasswordError("");
    }

    try {
      if (userList.conName && userList.appGeneralCode) {
        const userData: UserListData = {
          ...userList,
          rCreatedOn: new Date(userList.rCreatedOn).toISOString(),
          rModifiedOn: new Date(userList.rModifiedOn).toISOString(),
          appGeneralCode: password,
          rActiveYN: userList.rActiveYN,
          adminUserYN: userList.adminUserYN,
          appUserName: userList.conName,
          appUcatCode: userList.appUcatCode,
          appUcatType: userList.appUcatType,
          compCode: userList.compCode,
          appCode: userList.appGeneralCode,
          appUAccess: password,
          profileID: userList.profileID,
        };

        const result = await UserListService.saveUser(token!, userData);

        if (result.success) {
          notifySuccess("User saved successfully");
        } else {
          notifyError("Error saving user");
          console.error("Failed to save user:", result.errorMessage);
        }
      } else {
        notifyError("User Name and Login Name are required fields.");
      }
    } catch (error: any) {
      notifyError("Error saving user");
      if (error.response) {
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        notifyError("Error: No response received from server.");
      } else {
        console.error("Error message:", error.message);
      }
    }
  };

  const handleClear = () => {
    setUserList(defaultUserListData);
    setFile(null);
    setErrorMessage("");
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setIsSubmitted(false);
    notifySuccess("Form cleared successfully");
  };

  const handleEditProfile = (profile: UserListData) => {
    setUserList(profile);
    handleCloseSearchDialog();
  };

  return (
    <MainLayout>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup
            buttons={[
              {
                variant: "contained",
                size: "medium",
                icon: SearchIcon,
                text: "Advanced Search",
                onClick: handleAdvancedSearch,
              },
            ]}
          />
        </Box>
        <Paper variant="elevation" sx={{ padding: 2 }}>
          <section>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="SelectUser"
                  label="Select User"
                  value={userList.conName}
                  options={dropdownValues.usersOptions}
                  onChange={(e: SelectChangeEvent<string>) =>
                    handleDropdownChange(
                      ["conName", "conID", "appUserName"],
                      e.target.value,
                      dropdownValues.usersOptions
                    )
                  }
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Login Name"
                  ControlID="LoginName"
                  placeholder="Login Name"
                  type="text"
                  name="LoginName"
                  size="small"
                  value={userList.appGeneralCode}
                  onChange={(e) =>
                    setUserList({ ...userList, appGeneralCode: e.target.value })
                  }
                  isSubmitted={isSubmitted}
                  isMandatory
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Password"
                  ControlID="Password"
                  placeholder="Password"
                  type="password"
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isSubmitted={isSubmitted}
                  isMandatory
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Confirm Password"
                  ControlID="ConfirmPassword"
                  placeholder="Confirm Password"
                  type="password"
                  size="small"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  isSubmitted={isSubmitted}
                />
                {passwordError && (
                  <Typography style={{ color: "red" }}>
                    {passwordError}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="Company"
                  label="Company"
                  value={userList.compName}
                  options={dropdownValues.companyOptions}
                  onChange={(e: SelectChangeEvent<string>) =>
                    handleDropdownChange(
                      ["compName", "compCode", "compID"],
                      e.target.value,
                      dropdownValues.companyOptions
                    )
                  }
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="Profile"
                  label="Profile"
                  value={(userList.profileID || 0).toString()}
                  options={dropdownValues.profileOptions}
                  onChange={(e: SelectChangeEvent<string>) =>
                    handleDropdownChange(
                      ["profileID"],
                      e.target.value,
                      dropdownValues.profileOptions
                    )
                  }
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <CustomSwitch
                  label="Is Super User"
                  size="medium"
                  color="secondary"
                  checked={userList.adminUserYN === "Y"}
                  onChange={(e) =>
                    setUserList({
                      ...userList,
                      adminUserYN: e.target.checked ? "Y" : "N",
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Grid item xs={12} sm={6} md={6}>
                  <FloatingLabelFileUpload
                    ControlID="fileUpload1"
                    title="Digital Signature"
                    onChange={handleFileChange}
                    isMandatory={true}
                    isSubmitted={isSubmitted}
                    errorMessage={errorMessage}
                    accept=".jpg,.png,.pdf"
                    multiple={false}
                    name="digitalSignature"
                  />
                </Grid>
              </Grid>
            </Grid>
          </section>
        </Paper>
      </Container>
      <FormSaveClearButton
        clearText="Clear"
        saveText="Save"
        onClear={handleClear}
        onSave={handleSave}
        clearIcon={DeleteIcon}
        saveIcon={SaveIcon}
      />
      <UserListSearch
        show={isSearchDialogOpen}
        handleClose={handleCloseSearchDialog}
        onEditProfile={handleEditProfile}
      />
    </MainLayout>
  );
};

export default UserDetails;
