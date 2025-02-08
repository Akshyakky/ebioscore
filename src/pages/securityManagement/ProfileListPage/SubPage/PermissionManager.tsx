import React, { useEffect, useState } from "react";
import { Grid, SelectChangeEvent, Typography } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { ProfileDetailDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { profileListService } from "@/services/SecurityManagementServices/ProfileListServices";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

interface DropdownListProps {
  options: DropdownOption[];
  handleChange: (event: SelectChangeEvent<string>) => void;
  label: string;
  value: number;
  disabled?: boolean;
  name: string;
}

const DropdownList: React.FC<DropdownListProps> = ({ options, handleChange, label, value, disabled = false, name }) => {
  const dropdownOptions = options.map((item) => ({
    value: item.value.toString(),
    label: item.label,
  }));

  return (
    <FormField
      type="select"
      label={label}
      name={name}
      ControlID={name}
      value={value}
      options={dropdownOptions}
      onChange={handleChange}
      disabled={disabled}
      defaultText={`Select ${label}`}
      isMandatory={true}
      size="small"
      gridProps={{ xs: 12, sm: 12, md: 12 }}
    />
  );
};

interface PermissionsListProps {
  permissions: ProfileDetailDto[];
  selectedPermissions: number[];
  handlePermissionChange: (id: number) => void;
  disabled?: boolean;
}

const PermissionsList: React.FC<PermissionsListProps> = ({ permissions, selectedPermissions, handlePermissionChange, disabled = false }) => {
  return (
    <Grid container spacing={2}>
      {permissions.map((permission: ProfileDetailDto) => (
        <Grid item xs={12} key={permission.accessID}>
          <FormField
            type="switch"
            label={permission.accessName}
            name={`permission-${permission.accessID}`}
            ControlID={`permission-${permission.accessID}`}
            value={permission.accessID.toString()}
            checked={selectedPermissions.includes(permission.accessID)}
            onChange={() => handlePermissionChange(permission.accessID)}
            disabled={disabled}
            gridProps={{ xs: 12 }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

interface PermissionManagerProps {
  profileId: number;
  profileName: string;
  title: string;
  type: "M" | "R";
  useMainModules?: boolean;
  useSubModules?: boolean;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ profileId, profileName, title, type, useMainModules = true, useSubModules = false }) => {
  const [permissions, setPermissions] = useState<ProfileDetailDto[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [mainModules, setMainModules] = useState<DropdownOption[]>([]);
  const [subModules, setSubModules] = useState<DropdownOption[]>([]);
  const [mainId, setMainId] = useState<number>(0);
  const [subId, setSubId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dropdownValues = useDropdownValues(["mainModules", "subModules"]);

  useEffect(() => {
    setMainModules(dropdownValues.mainModules || []);
  }, [dropdownValues.mainModules]);

  useEffect(() => {
    if (useSubModules && mainId) {
      const allSubModules = dropdownValues.subModules || [];
      const filteredSubModules = allSubModules.filter((subModule) => subModule.aUGrpID === mainId);
      setSubModules(filteredSubModules);
      setSubId(0);
      setPermissions([]);
      setSelectedItems([]);
    }
  }, [mainId, dropdownValues.subModules, useSubModules]);

  async function fetchPermissions(mainID: number, subID: number, compID: number) {
    if (!mainID && type === "R") return;
    if (!subID && type === "M") return;

    setIsLoading(true);
    try {
      const result: any = await profileListService.getProfileDetailsByType(mainID, subID, compID, 1, type);
      setPermissions(result.data);
      const selectedPermissions = result.data.filter((permission: ProfileDetailDto) => permission.rActiveYN === "Y").map((permission: ProfileDetailDto) => permission.accessID);
      setSelectedItems(selectedPermissions);
    } catch (error) {
      console.error(`Error fetching ${type === "M" ? "module" : "report"} permissions:`, error);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePermissionChange = async (id: number) => {
    try {
      const updatedItems = selectedItems.includes(id) ? selectedItems.filter((item) => item !== id) : [...selectedItems, id];

      const updatedPermissions: ProfileDetailDto[] = permissions.map((permission: ProfileDetailDto) => ({
        ...permission,
        profileID: profileId,
        profileName: profileName,
        rActiveYN: updatedItems.includes(permission.accessID) ? "Y" : "N",
      }));

      setSelectedItems(updatedItems);
      setPermissions(updatedPermissions);
      await profileListService.saveProfileDetailsByType(updatedPermissions, type);
    } catch (error) {
      console.error("Error saving permission:", error);
      if (type === "M") {
        fetchPermissions(mainId, subId, 1);
      }
    }
  };

  const handleMainModuleChange = (event: SelectChangeEvent<string>) => {
    const value = parseInt(event.target.value);
    setMainId(value);
    if (type === "R") {
      fetchPermissions(value, 0, 1);
    }
  };

  const handleSubModuleChange = (event: SelectChangeEvent<string>) => {
    const value = parseInt(event.target.value);
    setSubId(value);
    if (type === "M") {
      fetchPermissions(mainId, value, 1);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h3">{title}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {useMainModules && (
            <Grid item xs={12}>
              <DropdownList
                options={mainModules}
                handleChange={handleMainModuleChange}
                value={mainId}
                label={type === "M" ? "Main Modules" : "Report Groups"}
                disabled={isLoading}
                name={type === "M" ? "main-modules" : "report-groups"}
              />
            </Grid>
          )}
          {useSubModules && (
            <Grid item xs={12}>
              <DropdownList
                options={subModules}
                handleChange={handleSubModuleChange}
                value={subId}
                label="Sub Modules"
                disabled={isLoading || mainModules.length === 0}
                name="sub-modules"
              />
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <PermissionsList permissions={permissions} selectedPermissions={selectedItems} handlePermissionChange={handlePermissionChange} disabled={isLoading} />
      </Grid>
    </Grid>
  );
};

export default PermissionManager;
