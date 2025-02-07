import React, { useEffect, useState } from "react";
import FormField from "@/components/FormField/FormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { ProfileDetailDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { profileListService } from "@/services/SecurityManagementServices/ProfileListServices";
import { SelectChangeEvent, Typography } from "@mui/material";
import { Grid } from "@mui/material";

interface ModuleListDropDownProps {
  modulesList: DropdownOption[];
  handleModuleChange: (event: SelectChangeEvent<string>) => void;
  label: string;
  moduleId: number;
  disabled?: boolean;
}

const ModuleListDropDown: React.FC<ModuleListDropDownProps> = ({ modulesList, handleModuleChange, label, moduleId, disabled = false }) => {
  const dropdownOptions = modulesList.map((module) => ({
    value: module.value.toString(),
    label: module.label,
  }));

  return (
    <FormField
      type="select"
      label={label}
      name={`module-${label.toLowerCase()}`}
      ControlID={`module-${label.toLowerCase()}`}
      value={moduleId}
      options={dropdownOptions}
      onChange={handleModuleChange}
      disabled={disabled}
      defaultText={`Select ${label}`}
      isMandatory={true}
      size="small"
      gridProps={{ xs: 12, sm: 12, md: 12 }}
    />
  );
};

interface ModulePermissionsListProps {
  modulePermissions: ProfileDetailDto[];
  selectedPermissions: number[];
  handleModulePermissionChange: (id: number) => void;
  disabled?: boolean;
}

const ModulePermissionsList: React.FC<ModulePermissionsListProps> = ({ modulePermissions, selectedPermissions, handleModulePermissionChange, disabled = false }) => {
  return (
    <Grid container spacing={2}>
      {modulePermissions.map((modulePermission: ProfileDetailDto) => (
        <Grid item xs={12}>
          <FormField
            key={modulePermission.accessID}
            type="switch"
            label={modulePermission.accessName}
            name={`permission-${modulePermission.accessID}`}
            ControlID={`permission-${modulePermission.accessID}`}
            value={modulePermission.accessID.toString()}
            checked={selectedPermissions.includes(modulePermission.accessID)}
            onChange={() => handleModulePermissionChange(modulePermission.accessID)}
            disabled={disabled}
            gridProps={{ xs: 12 }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

const ModulePermissions: React.FC<{ profileId: number; profileName: string }> = ({ profileId, profileName }) => {
  const [modulePermissions, setModulePermissions] = useState<ProfileDetailDto[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [mainModules, setMainModules] = useState<DropdownOption[]>([]);
  const [subModules, setSubModules] = useState<DropdownOption[]>([]);
  const [aSubId, setASubId] = useState<number>(0);
  const [aUGrpId, setAUGrpId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dropdownValues = useDropdownValues(["mainModules", "subModules"]);

  useEffect(() => {
    setMainModules(dropdownValues.mainModules || []);
  }, [dropdownValues.mainModules]);

  useEffect(() => {
    if (aUGrpId) {
      const allSubModules = dropdownValues.subModules || [];
      const filteredSubModules = allSubModules.filter((subModule) => subModule.aUGrpID === aUGrpId);
      setSubModules(filteredSubModules);
      setASubId(0);
      setModulePermissions([]);
      setSelectedItems([]);
    }
  }, [aUGrpId, dropdownValues.subModules]);

  async function fetchProfileModuleOperations(subID: number, compID: number, profileID: number, profileType: string) {
    if (!subID) return;
    setIsLoading(true);
    try {
      const result: any = await profileListService.getProfileDetailsByType(aUGrpId, subID, compID, profileID, profileType);

      setModulePermissions(result.data);
      const selectedModulePermissions = result.data
        .filter((modulePermission: ProfileDetailDto) => modulePermission.rActiveYN === "Y")
        .map((modulePermission: ProfileDetailDto) => modulePermission.accessID);

      setSelectedItems(selectedModulePermissions);
    } catch (error) {
      console.error("Error fetching profile module operations:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCheckboxChange = async (id: number) => {
    try {
      const updatedItems = selectedItems.includes(id) ? selectedItems.filter((item) => item !== id) : [...selectedItems, id];

      const updatedModulePermissions: ProfileDetailDto[] = modulePermissions.map((modulePermission: ProfileDetailDto) => ({
        ...modulePermission,
        profileID: profileId,
        profileName: profileName,
        rActiveYN: updatedItems.includes(modulePermission.accessID) ? "Y" : "N",
      }));

      setSelectedItems(updatedItems);
      setModulePermissions(updatedModulePermissions);
      await profileListService.saveProfileDetailsByType(updatedModulePermissions, "M");
    } catch (error) {
      console.error("Error saving permission:", error);
      fetchProfileModuleOperations(aSubId, 1, profileId, "M");
    }
  };

  const handleMainModuleChange = (event: SelectChangeEvent<string>) => {
    const { value } = event.target;
    setAUGrpId(parseInt(value));
  };

  const handleSubModuleChange = (event: SelectChangeEvent<string>) => {
    const { value } = event.target;
    setASubId(parseInt(value));
    fetchProfileModuleOperations(parseInt(value), 1, profileId, "M");
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h3">Module Permissions</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ModuleListDropDown modulesList={mainModules} handleModuleChange={handleMainModuleChange} moduleId={aUGrpId} label="Main Modules" disabled={isLoading} />
          </Grid>
          <Grid item xs={12}>
            <ModuleListDropDown
              modulesList={subModules}
              handleModuleChange={handleSubModuleChange}
              label="Sub Modules"
              moduleId={aSubId}
              disabled={isLoading || mainModules.length === 0}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <ModulePermissionsList modulePermissions={modulePermissions} selectedPermissions={selectedItems} handleModulePermissionChange={handleCheckboxChange} disabled={isLoading} />
      </Grid>
    </Grid>
  );
};

export default ModulePermissions;
