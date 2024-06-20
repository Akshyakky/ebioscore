import React, { useState } from "react";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import { Box, Container, Grid, Paper } from "@mui/material";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import FloatingLabelFileUpload from "../../../../components/FileUpload/FileUpload";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import { UserListData } from "../../../../interfaces/SecurityManagement/UserListData";
const defaultUserListData: UserListData = {
  appID: 0,
  appUserName: "",
  appGeneralCode: "",
  rActiveYN: "",
  rCreatedOn: new Date(),
  rCreatedID: 0,
  rCreatedBy: "",
  rModifiedOn: new Date(),
  rModifiedID: 0,
  rModifiedBy: "",
  rNotes: "",
  conID: 0,
  appUcatCode: "",
  appUcatType: "",
  adminUserYN: "",
  compCode: "",
  compID: 0,
  compName: "",
  conCompId: 0,
  digSignPath: "",
  transferYN: "",
  appCode: "",
  appUAccess: "",
  profileID: 0,
};
const UserListPage: React.FC = () => {
  const [userList, setUserList] = useState<UserListData>(defaultUserListData);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dropdownValues, setDropdownValues] = useState({
    categoryOptions: [] as DropdownOption[],
    usersOptions: [] as DropdownOption[],
  });
  const { handleDropdownChange } = useDropdownChange<UserListData>(setUserList);
  const handleAdvancedSearch = async () => {
    // setIsSearchOpen(true);
    // await performSearch("");
  };
  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setErrorMessage(""); // Clear any previous error messages
    }
  };
  const handleSave = async () => {};
  const handleClear = () => {};
  return (
    <MainLayout>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} />
        </Box>
        <Paper variant="elevation" sx={{ padding: 2 }}>
          <section>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="category"
                  label="Category"
                  value=""
                  options={dropdownValues.categoryOptions}
                  onChange={handleDropdownChange(
                    [""],
                    [""],
                    dropdownValues.categoryOptions
                  )}
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="SelectUser"
                  label="Select User"
                  value=""
                  options={dropdownValues.categoryOptions}
                  onChange={handleDropdownChange(
                    [""],
                    [""],
                    dropdownValues.usersOptions
                  )}
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Grid item xs={12} sm={6} md={3}>
                  {/* <CustomSwitch */}
                  {/* label="Is Super User"
                    size="medium"
                    color="secondary"
                    checked={false}
                    onChange={}
                  /> */}
                </Grid>
              </Grid>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} sm={6} md={3}>
                  <FloatingLabelTextBox
                    title="Login Name"
                    ControlID="LoginName"
                    placeholder="Login Name"
                    type="text"
                    name="LoginName"
                    size="small"
                    value=""
                    isSubmitted={isSubmitted}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Password"
                  ControlID="Password"
                  placeholder="Password"
                  type="Password"
                  size="small"
                  value=""
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Confirm Password"
                  ControlID="ConfirmPassword"
                  placeholder="Confirm Password"
                  type="Password"
                  size="small"
                  value=""
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}></Grid>
            </Grid>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelFileUpload
                  ControlID="fileUpload1"
                  title="Upload File"
                  onChange={handleFileChange}
                  isMandatory={true}
                  isSubmitted={isSubmitted}
                  errorMessage={errorMessage}
                  accept=".jpg,.png,.pdf" // Accept only jpg, png, and pdf files
                  multiple={false}
                />
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
    </MainLayout>
  );
};

export default UserListPage;
