import React, { useState, useEffect, ChangeEvent, useContext } from "react";
import { Box, Container, Grid, IconButton, Paper, Typography, InputAdornment, TextField, } from "@mui/material";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
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
import {
  notifyError,
  notifySuccess,
} from "../../../../utils/Common/toastManager";
import FloatingLabelFileUpload from "../../../../components/FileUpload/FileUpload";
import { UserListData } from "../../../../interfaces/SecurityManagement/UserListData";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import DeleteIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save"
import { ProfileService } from "../../../../services/SecurityManagementServices/ProfileListServices";
import { TextFields, Visibility, VisibilityOff } from "@mui/icons-material";

interface Company {
  compIDCompCode: string;
  compName: string;
}



interface UserDetailsProps {
  user: UserListData | null;
  onSave: (user: UserListData) => void;
  onClear: () => void;
  isEditMode: boolean;
  refreshUsers: () => void;
  updateUserStatus: (userID: number, status: boolean) => void;
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
  repID: 0
};

const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  onSave,
  onClear,
  refreshUsers,
  updateUserStatus,
}) => {
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [userList, setUserList] = useState<UserListData>(defaultUserListData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [, setImageUrl] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dropdownValues, setDropdownValues] = useState({
    categoryOptions: [] as DropdownOption[],
    usersOptions: [] as DropdownOption[],
    companyOptions: [] as DropdownOption[],
    profileOptions: [] as DropdownOption[],
  });

  useEffect(() => {
    if (user) {
      setUserList(user);
    } else {
      setUserList(defaultUserListData);
    }
  }, [user]);


  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(userList.digSignPath);
        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image:', error);
        // Handle error or set a default image URL
        setImageUrl('/path/to/default-image.jpg');
      }
    };

    fetchImage();
  }, [userList.digSignPath]);





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

  // appUAccess

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await UserListService.getActiveWorkingUsers(token!);
        if (result.success && result.data) {
          const usersOptions = result.data.map((user) => ({
            label: user.conName,
            value: user.conID.toString(),
          }));
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
        if (companyData && companyData.length > 0) {
          const companyOptions = companyData.map((company) => ({
            label: company.compName,
            value: company.compIDCompCode,
          }));
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
          await ProfileService.getAllProfileDetails(token!);
        if (profileData && profileData.length > 0) {
          const profileOptions = profileData.map((profile) => ({
            label: profile.profileName,
            value: profile.profileID.toString(),
          }));
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


  const isPasswordValid = (value: string): boolean => {
    // Regular expressions for password validation
    const hasCapital = /[A-Z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasNumber = /\d/.test(value);

    return hasCapital && hasSpecialChar && hasNumber;
  };



  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPassword(newValue);

    // Example of displaying validation message based on conditions
    if (!isPasswordValid(newValue)) {
      console.log('Password does not meet complexity requirements');
      // Handle displaying error message or UI feedback here
    }
  };


  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
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

    // Validate password confirmation
    if (password !== confirmPassword) {
      // setPasswordError("Passwords do not match");
      return;
    } else {
      // setPasswordError("");
    }

    try {
      if (userList.conName) {
        const userData: UserListData = {
          ...userList,
          rCreatedOn: new Date(userList.rCreatedOn).toISOString(),
          rModifiedOn: new Date(userList.rModifiedOn).toISOString(),
          appGeneralCode: userList.appGeneralCode,
          rActiveYN: userList.rActiveYN,
          adminUserYN: userList.adminUserYN,
          appUserName: userList.conName,
          appUcatCode: userList.appUcatCode,
          appUcatType: userList.appUcatType,
          compCode: userList.compCode,
          appCode: userList.appCode,
          appUAccess: password,
          profileID: userList.profileID,
        };

        const result = await UserListService.saveUser(token!, userData);

        if (result.success) {
          notifySuccess("User saved successfully");
          onSave(userData);
          refreshUsers();

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
        console.error("No response received from server.");
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
    setIsSubmitted(false);
    notifySuccess("Form cleared successfully");
    onClear();
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <section>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              name="SelectUser"
              label="Select User"
              value={userList.conID?.toString() || ""}
              options={dropdownValues.usersOptions}
              onChange={(e: any) =>
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
              value={userList.appCode || ""}
              onChange={(e) =>
                setUserList({ ...userList, appCode: e.target.value })
              }
              isSubmitted={isSubmitted}
              isMandatory
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}
          >
            <TextField
            fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}

              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                   <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />


          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              name="Company"
              label="Company"
              value={userList.compCode || ""}
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
              // isMandatory
              size="small"
              isSubmitted={isSubmitted}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
                value={userList.digSignPath || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUserList({ ...userList, digSignPath: e.target.value })
                }
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
      <Box sx={{ marginTop: 2 }}>
        <FormSaveClearButton
          clearText="Clear"
          saveText="Save"
          onClear={handleClear}
          onSave={handleSave}
          clearIcon={DeleteIcon}
          saveIcon={SaveIcon}
        />
      </Box>
    </Paper>
  );
};

export default UserDetails;
