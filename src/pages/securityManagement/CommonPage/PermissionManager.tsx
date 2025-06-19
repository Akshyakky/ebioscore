import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { CustomUISwitch } from "@/components/Switch/CustomUISwitch";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { ProfileDetailDto, ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { SaveUserPermissionsRequest, UserListDto, UserListPermissionDto } from "@/interfaces/SecurityManagement/UserListData";
import { useAlert } from "@/providers/AlertProvider";
import { profileService } from "@/services/SecurityManagementServices/ProfileListServices";
import { profileDetailService } from "@/services/SecurityManagementServices/securityManagementServices";
import { userListServices } from "@/services/SecurityManagementServices/UserListServices";
import { Grid, Skeleton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface PermissionFormData {
  mainModuleId: number;
  subModuleId: number;
  selectAll: string;
}

interface DropdownListProps {
  options: DropdownOption[];
  handleChange: (item: any) => void;
  label: string;
  value: number;
  disabled?: boolean;
  name: string;
  control: any;
}

const DropdownList: React.FC<DropdownListProps> = ({ options, handleChange, label, value, disabled = false, name, control }) => {
  const dropdownOptions = options.map((item) => ({
    value: item.value.toString(),
    label: item.label,
  }));

  return (
    <FormField
      type="select"
      label={label}
      name={name}
      control={control}
      options={dropdownOptions}
      onChange={handleChange}
      disabled={disabled}
      defaultText={`Select ${label}`}
      required={true}
      size="small"
    />
  );
};

interface PermissionsListProps {
  permissions: (ProfileDetailDto | UserListPermissionDto)[];
  selectedPermissions: number[];
  handlePermissionChange: (id: number) => void;
  handleAllPermissionChange: (value: string) => void;
  disabled?: boolean;
  control: any;
}

const PermissionsList: React.FC<PermissionsListProps> = ({ permissions, selectedPermissions, handlePermissionChange, handleAllPermissionChange, disabled = false, control }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        {permissions && permissions.length > 0 && (
          <FormField
            type="switch"
            label="Select all"
            name="selectAll"
            control={control}
            onChange={(value: string) => {
              handleAllPermissionChange(value);
            }}
            disabled={disabled}
          />
        )}
      </Grid>
      {permissions.map((permission: ProfileDetailDto | UserListPermissionDto) => {
        return (
          <Grid
            size={{ xs: 12 }}
            key={permission.accessID}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CustomUISwitch
              checked={selectedPermissions.includes(permission.accessID)}
              onChange={() => handlePermissionChange(permission.accessID)}
              disabled={disabled}
              onSVGPath={"M12 17a2 2 0 100-4 2 2 0 000 4zm5-14a4 4 0 00-4 4v2H8a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2v-9a2 2 0 00-2-2h-3V7a2 2 0 114 0h2a4 4 0 00-4-4z"}
              offSVGPath={
                "M14.167 9.167V7.5a4.167 4.167 0 00-8.334 0v1.667H4.167A1.667 1.667 0 002.5 10.833v6.667A1.667 1.667 0 004.167 19.167h11.666a1.667 1.667 0 001.667-1.667v-6.667a1.667 1.667 0 00-1.667-1.666H14.167zM7.5 7.5a2.5 2.5 0 115 0v1.667h-5V7.5zM10 13.333a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z"
              }
            />

            <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 500, fontSize: 16 }}>
              {permission.accessName}
            </Typography>
          </Grid>
        );
      })}
    </Grid>
  );
};

interface PermissionManagerProps {
  mode: "profile" | "user";
  details: ProfileMastDto | UserListDto;
  title: string;
  type: "M" | "R" | "D";
  useMainModules?: boolean;
  useSubModules?: boolean;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ mode, details, title, type, useMainModules = true, useSubModules = false }) => {
  const [permissions, setPermissions] = useState<(ProfileDetailDto | UserListPermissionDto)[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [mainModules, setMainModules] = useState<DropdownOption[]>([]);
  const [subModules, setSubModules] = useState<DropdownOption[]>([]);
  const [mainId, setMainId] = useState<number>(0);
  const [subId, setSubId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
  const { showAlert, showErrorAlert, showSuccessAlert } = useAlert();

  const dropdownValues = useDropdownValues(["mainModules", "subModules"]);

  const { control, setValue, watch } = useForm<PermissionFormData>({
    defaultValues: {
      mainModuleId: 0,
      subModuleId: 0,
      selectAll: "N",
    },
    mode: "onChange",
  });

  useEffect(() => {
    setMainModules(dropdownValues.mainModules || []);
  }, [dropdownValues.mainModules]);

  useEffect(() => {
    if (useSubModules && mainId) {
      const allSubModules = dropdownValues.subModules || [];
      const filteredSubModules = allSubModules.filter((subModule) => subModule.aUGrpID === mainId);
      setSubModules(filteredSubModules);
      setSubId(0);
      setValue("subModuleId", 0);
      setPermissions([]);
      setSelectedItems([]);
    }
  }, [mainId, dropdownValues.subModules, useSubModules, setValue]);

  useEffect(() => {
    const newSelectAllValue =
      permissions.length > 0 && permissions.every((p) => (mode === "profile" ? (p as ProfileDetailDto).rActiveYN === "Y" : (p as UserListPermissionDto).allowAccess === "Y"));
    setIsSelectAll(newSelectAllValue);
    setValue("selectAll", newSelectAllValue ? "Y" : "N");
  }, [permissions, mode, setValue]);

  async function fetchPermissions(mainID: number, subID: number) {
    if (!mainID && type === "R") return;
    if (!subID && type === "M") return;

    setIsLoading(true);
    try {
      let result: any;
      if (mode === "profile") {
        result = await profileService.getProfileDetailsByType(mainID, subID, (details as ProfileMastDto).profileID, type);
      } else {
        result = await userListServices.getUserListPermissionsByType((details as UserListDto).appID, mainID, subID, type);
      }

      setPermissions(result.data);

      const selectedPermissions = result.data
        .filter((permission: any) => (mode === "profile" ? permission.rActiveYN === "Y" : permission.allowAccess === "Y"))
        .map((permission: any) => permission.accessID);

      setSelectedItems(selectedPermissions);
    } catch (error) {
      console.error(`Error fetching ${type === "M" ? "module" : "report"} permissions:`, error);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePermissionChange = async (id: number) => {
    setIsLoading(true);
    try {
      const updatedItems = selectedItems.includes(id) ? selectedItems.filter((item) => item !== id) : [...selectedItems, id];

      let updatedPermissions: any[];
      if (mode === "profile") {
        updatedPermissions = (permissions as ProfileDetailDto[]).map((permission) => ({
          ...permission,
          profileID: (details as ProfileMastDto).profileID,
          profileName: (details as ProfileMastDto).profileName,
          rActiveYN: updatedItems.includes(permission.accessID) ? "Y" : "N",
          rNotes: "",
          transferYN: "Y",
        }));
      } else {
        updatedPermissions = (permissions as UserListPermissionDto[]).map((permission) => ({
          ...permission,
          allowAccess: updatedItems.includes(permission.accessID) ? "Y" : "N",
          rNotes: "",
          transferYN: "Y",
        }));
      }

      setSelectedItems(updatedItems);
      setPermissions(updatedPermissions);

      let response;
      const clickedPermission = updatedPermissions.filter((permission) => permission.accessID === id);

      if (mode === "profile") {
        const [permissionToSave] = clickedPermission;
        response = await profileDetailService.save(permissionToSave);
      } else {
        const saveUserPermissionRequest: SaveUserPermissionsRequest = {
          permissions: clickedPermission.map((permission) => ({
            accessDetailID: permission.accessDetailID,
            accessID: permission.accessID,
            accessName: permission.accessName,
            allowAccess: permission.allowAccess,
          })),
          permissionType: type,
          appID: (details as UserListDto).appID,
          appUserName: (details as UserListDto).appUserName,
        };
        response = await userListServices.saveUserListPermissionsByType(saveUserPermissionRequest);
      }
      if (response.success) {
        showSuccessAlert("Success", clickedPermission[0].rActiveYN === "Y" ? "Permission applied!" : "Permission denied!");
      } else {
        showErrorAlert("Error", "Permission not applied!");
      }
      fetchPermissions(mainId, subId);
    } catch (error) {
      showErrorAlert("Error", "Permission not applied!");
      console.error("Error saving permission:", error);
      if (type === "M") {
        fetchPermissions(mainId, subId);
      }
    }
    setIsLoading(false);
  };

  const handleAllPermissionChange = async (value: string) => {
    const selectAllChecked = value === "Y";
    const userConfirmed = await showAlert("Confirm Action", `Are you sure you want to ${selectAllChecked ? "select" : "deselect"} all permissions?`, "warning", true);
    if (!userConfirmed) return;

    setIsSelectAll(selectAllChecked);
    setValue("selectAll", value);

    let response;
    if (mode === "profile") {
      const updatedPermissions = (permissions as ProfileDetailDto[]).map((permission) => ({
        ...permission,
        profileID: (details as ProfileMastDto).profileID,
        profileName: (details as ProfileMastDto).profileName,
        profileType: type,
        rActiveYN: value,
        rNotes: "",
        transferYN: "Y",
      }));
      response = await profileDetailService.bulkSave(updatedPermissions);
    } else {
      const updatedPermissions = (permissions as UserListPermissionDto[]).map((permission) => ({
        ...permission,
        allowAccess: value,
        rNotes: "",
        transferYN: "Y",
      }));
      const saveUserPermissionRequest: SaveUserPermissionsRequest = {
        permissions: updatedPermissions,
        permissionType: type,
        appID: (details as UserListDto).appID,
        appUserName: (details as UserListDto).appUserName,
      };
      response = await userListServices.saveUserListPermissionsByType(saveUserPermissionRequest);
    }
    if (response.success) {
      showSuccessAlert("Success", selectAllChecked ? "Permission applied!" : "Permission denied!");
    } else {
      setIsSelectAll(!selectAllChecked);
      setValue("selectAll", !selectAllChecked ? "Y" : "N");
      showSuccessAlert("Error", "Permission not applied!");
    }
    fetchPermissions(mainId, subId);
  };

  const handleMainModuleChange = (item: any) => {
    const value = parseInt(item.value);
    setMainId(value);
    setValue("mainModuleId", value);
    if (!value) {
      setPermissions([]);
      setSelectedItems([]);
      return;
    }
    if (type === "R") {
      fetchPermissions(value, 0);
    }
  };

  const handleSubModuleChange = (item: any) => {
    const value = parseInt(item.value);
    setSubId(value);
    setValue("subModuleId", value);
    setIsSelectAll(false);
    setValue("selectAll", "N");
    if (!value) {
      setPermissions([]);
      setSelectedItems([]);
      return;
    }
    if (type === "M") {
      fetchPermissions(mainId, value);
    }
  };

  useEffect(() => {
    setMainId(0);
    setSubId(0);
    setValue("mainModuleId", 0);
    setValue("subModuleId", 0);
    setPermissions([]);
    setSelectedItems([]);

    if (type === "D") {
      fetchPermissions(0, 0);
    }
  }, [type, setValue]);

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
                name="mainModuleId"
                control={control}
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
                name="subModuleId"
                control={control}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
        {isLoading ? (
          <Skeleton variant="rectangular" width={300} height={300} />
        ) : (
          <PermissionsList
            permissions={permissions}
            selectedPermissions={selectedItems}
            handlePermissionChange={handlePermissionChange}
            handleAllPermissionChange={handleAllPermissionChange}
            disabled={isLoading}
            control={control}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default PermissionManager;
