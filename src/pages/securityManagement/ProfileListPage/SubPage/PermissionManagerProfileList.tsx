import React, { useEffect, useState } from "react";
import { Grid, SelectChangeEvent, Typography } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { ProfileDetailDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { profileListService } from "@/services/SecurityManagementServices/ProfileListServices";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { notifyError, notifySuccess } from "@/utils/Common/toastManager";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";

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
  handleAllPermissionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  isSelectAll: boolean;
}

const PermissionsList: React.FC<PermissionsListProps> = ({
  permissions,
  selectedPermissions,
  handlePermissionChange,
  handleAllPermissionChange,
  isSelectAll,
  disabled = false,
}) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        {permissions && permissions.length > 0 && (
          <FormField
            type="switch"
            label="Select all"
            name={`selectAll`}
            ControlID={`permission-selectAll`}
            value={""}
            checked={isSelectAll}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleAllPermissionChange(event);
            }}
            disabled={disabled}
            gridProps={{ xs: 12 }}
          />
        )}
      </Grid>
      {permissions.map((permission: ProfileDetailDto) => (
        <Grid size={{ xs: 12 }} key={permission.accessID}>
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

interface PermissionManagerProfileListProps {
  profileId: number;
  profileName: string;
  title: string;
  type: "M" | "R";
  useMainModules?: boolean;
  useSubModules?: boolean;
}

const PermissionManagerProfileList: React.FC<PermissionManagerProfileListProps> = ({ profileId, profileName, title, type, useMainModules = true, useSubModules = false }) => {
  const [permissions, setPermissions] = useState<ProfileDetailDto[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [mainModules, setMainModules] = useState<DropdownOption[]>([]);
  const [subModules, setSubModules] = useState<DropdownOption[]>([]);
  const [mainId, setMainId] = useState<number>(0);
  const [subId, setSubId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { compID, compCode, compName } = useAppSelector((state: RootState) => state.auth);
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
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
  useEffect(() => {
    setIsSelectAll(permissions.length > 0 && permissions.every((p) => p.rActiveYN === "Y"));
  }, [permissions]);

  async function fetchPermissions(mainID: number, subID: number) {
    if (!mainID && type === "R") return;
    if (!subID && type === "M") return;

    setIsLoading(true);
    try {
      const result: any = await profileListService.getProfileDetailsByType(mainID, subID, compID, profileId, type);
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
        compID: compID || 0,
        compCode: compCode || "",
        compName: compName || "",
        rNotes: "",
        transferYN: "Y",
      }));

      setSelectedItems(updatedItems);
      setPermissions(updatedPermissions);
      const clickedPermission = updatedPermissions.filter((permission) => permission.accessID === id);
      const response = await profileListService.saveProfileDetailsByType(clickedPermission, type);
      if (response.success) {
        notifySuccess("Permission applied!");
      } else {
        notifyError("Permission not applied!");
      }
      fetchPermissions(mainId, subId);
    } catch (error) {
      notifyError("Permission not applied!");
      console.error("Error saving permission:", error);
      if (type === "M") {
        fetchPermissions(mainId, subId);
      }
    }
  };
  const handleAllPermissionChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Select All checked:", event.target.checked);
    const selectAllChecked = event.target.checked;
    setIsSelectAll(selectAllChecked);
    const updatedPermissions: ProfileDetailDto[] = permissions.map((permission: ProfileDetailDto) => ({
      ...permission,
      profileID: profileId,
      profileName: profileName,
      rActiveYN: selectAllChecked ? "Y" : "N",
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      rNotes: "",
      transferYN: "Y",
    }));

    setPermissions(updatedPermissions);
    const response = await profileListService.saveProfileDetailsByType(updatedPermissions, type);
    if (response.success) {
      notifySuccess("Permission applied!");
    } else {
      notifyError("Permission not applied!");
    }
    fetchPermissions(mainId, subId);
  };
  const handleMainModuleChange = (event: SelectChangeEvent<string>) => {
    const value = parseInt(event.target.value);
    setMainId(value);
    if (!value) {
      setPermissions([]);
      setSelectedItems([]);
      return;
    }
    if (type === "R") {
      fetchPermissions(value, 0);
    }
  };

  const handleSubModuleChange = (event: SelectChangeEvent<string>) => {
    const value = parseInt(event.target.value);
    setSubId(value);
    if (!value) {
      setPermissions([]);
      setSelectedItems([]);
      return;
    }
    if (type === "M") {
      fetchPermissions(mainId, value);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h3">{title}</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={2}>
          {useMainModules && (
            <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
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
      <Grid size={{ xs: 12 }}>
        <PermissionsList
          permissions={permissions}
          selectedPermissions={selectedItems}
          handlePermissionChange={handlePermissionChange}
          handleAllPermissionChange={handleAllPermissionChange}
          isSelectAll={isSelectAll}
          disabled={isLoading}
        />
      </Grid>
    </Grid>
  );
};

export default PermissionManagerProfileList;
