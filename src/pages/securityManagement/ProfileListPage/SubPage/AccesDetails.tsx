import React, { useState } from "react";
import { Grid } from "@mui/material";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import { ProfileListData } from "../../../../interfaces/SecurityManagement/ProfileListData";

const AccesDetails: React.FC = () => {
  const [userList, setUserList] = useState<ProfileListData>();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [dropdownValues, setDropdownValues] = useState({
    categoryOptions: [] as DropdownOption[],
    usersOptions: [] as DropdownOption[],
  });

  const { handleDropdownChange } =
    useDropdownChange<ProfileListData>(setUserList);

  return (
    <>
      <section>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              name="MainModules"
              label="Main Modules"
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

            <DropdownSelect
              name="SubModule"
              label="Sub Module"
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

            <DropdownSelect
              name="ReportPermissions"
              label="Report Permissions"
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
        </Grid>
      </section>
    </>
  );
};

export default AccesDetails;
