import React, { useState } from "react";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import { Box, Container, Grid, Paper } from "@mui/material";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import { UserListData } from "../../../../interfaces/securityManagement/UserListData";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import FileUpload from "../../../../components/FileUpload/FileUpload";

const UserListPage: React.FC = () => {
  const [userList, setUserList] = useState<UserListData>();
  const [isSubmitted, setIsSubmitted] = useState(false);
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
                  <CustomSwitch
                    label="Is Super User"
                    size="medium"
                    color="secondary"
                    checked={false}
                    onChange={}
                  />
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
                <FileUpload
                  label="Digital Signature"
                  name="DigitalSignature"
                  onChange={}
                />
              </Grid>
            </Grid>
          </section>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default UserListPage;
