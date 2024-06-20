import React, { useEffect, useState } from "react";
import { Grid, useTheme, SelectChangeEvent } from "@mui/material";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import { usePageTitle } from "../../../../hooks/usePageTitle";
import moduleService from "../../../../services/CommonServices/ModuleService";
import { notifyError } from "../../../../utils/Common/toastManager";

interface SideBarProps {
  userID: number | null;
  token: string | null;
}

const AccessDetails: React.FC<SideBarProps> = ({ userID, token }) => {
  const [dropdownValues, setDropdownValues] = useState({
    mainModulesOptions: [] as DropdownOption[],
    subModulesOptions: [] as DropdownOption[],
    reportPermissionsOptions: [] as DropdownOption[],
  });

  const [selectedMainModule, setSelectedMainModule] = useState<string>("");
  const [selectedSubModule, setSelectedSubModule] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { pageTitle } = usePageTitle();
  const theme = useTheme();

  useEffect(() => {
    const fetchMainModules = async () => {
      if (token) {
        try {
          const modulesData = await moduleService.getActiveModules(userID ?? 0, token);
          setDropdownValues((prevValues) => ({
            ...prevValues,
            mainModulesOptions: modulesData.map((module) => ({
              label: module.title,
              value: module.auGrpID.toString(),
            })),
          }));
        } catch (error) {
          console.error("Error fetching main modules:", error);
          notifyError("Error fetching main modules");
        }
      }
    };

    fetchMainModules();
  }, [userID, token]);

  const handleMainModuleChange = async (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    setSelectedMainModule(selectedValue);
    try {
      const subModulesData = await moduleService.getActiveSubModules(parseInt(selectedValue), token ?? "");
      setDropdownValues((prevValues) => ({
        ...prevValues,
        subModulesOptions: subModulesData.map((subModule) => ({
          label: subModule.title,
          value: subModule.auGrpID.toString(),
        })),
      }));
      // Reset selected sub module when the main module changes
      setSelectedSubModule("");
    } catch (error) {
      console.error("Error fetching submodules:", error);
      notifyError("Error fetching submodules");
    }
  };

  const handleSubModuleChange = (event: SelectChangeEvent<string>) => {
    setSelectedSubModule(event.target.value);
  };

  return (
    <>
      <section>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              name="MainModules"
              label="Main Modules"
              value={selectedMainModule}
              options={dropdownValues.mainModulesOptions}
              onChange={handleMainModuleChange}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
            />

            <DropdownSelect
              name="SubModule"
              label="Sub Module"
              value={selectedSubModule}
              options={dropdownValues.subModulesOptions}
              onChange={handleSubModuleChange}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
            />

            <DropdownSelect
              name="ReportPermissions"
              label="Report Permissions"
              value=""
              options={dropdownValues.reportPermissionsOptions}
              onChange={() => {}}
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

export default AccessDetails;
