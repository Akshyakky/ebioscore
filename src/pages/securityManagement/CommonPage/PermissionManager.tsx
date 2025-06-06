import React, { useEffect, useState } from "react";
import { Grid, SelectChangeEvent, Typography } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { notifyError, notifySuccess } from "@/utils/Common/toastManager";

import { userListServices } from "@/services/SecurityManagementServices/UserListServices";
import { ProfileDetailDto, ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { UserListDto, UserListPermissionDto } from "@/interfaces/SecurityManagement/UserListData";
import { Add, Book, Cancel, Delete, Edit, FileUpload, Lock, Print, Save } from "@mui/icons-material";
import { useAlert } from "@/providers/AlertProvider";
import { CustomUISwitch } from "@/components/Switch/CustomUISwitch";
import { profileDetailService } from "@/services/SecurityManagementServices/securityManagementServices";
import { profileService } from "@/services/SecurityManagementServices/ProfileListServices";

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
  permissions: (ProfileDetailDto | UserListPermissionDto)[];
  selectedPermissions: number[];
  handlePermissionChange: (id: number) => void;
  handleAllPermissionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  isSelectAll: boolean;
}

const getIconForPermission = (accessName: string) => {
  const iconMap = [
    { keywords: ["edit", "update", "modify"], icon: Edit },
    { keywords: ["save", "create", "add"], icon: Save },
    { keywords: ["print", "printing"], icon: Print },
    { keywords: ["delete", "remove", "trash"], icon: Delete },
    { keywords: ["view", "read", "display"], icon: Book },
    { keywords: ["new", "create"], icon: Add },
    { keywords: ["cancel", "remove"], icon: Cancel },
    { keywords: ["upload", "import"], icon: FileUpload },
  ];

  const matchedIcon = iconMap.find((item) => item.keywords.some((keyword) => accessName.toLowerCase().includes(keyword)));

  return matchedIcon ? matchedIcon.icon : Lock;
};

const PermissionsList: React.FC<PermissionsListProps> = ({
  permissions,
  selectedPermissions,
  handlePermissionChange,
  handleAllPermissionChange,
  disabled = false,
  isSelectAll,
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
      {permissions.map((permission: ProfileDetailDto | UserListPermissionDto) => {
        const PermissionIcon = getIconForPermission(permission.accessName);

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
  const { showAlert } = useAlert();

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
    setIsSelectAll(
      permissions.length > 0 && permissions.every((p) => (mode === "profile" ? (p as ProfileDetailDto).rActiveYN === "Y" : (p as UserListPermissionDto).allowAccess === "Y"))
    );
  }, [permissions, mode]);

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
        if (type === "M") {
          const userModulePermissions = clickedPermission.map((permission) => ({
            auAccessID: permission.accessDetailID,
            aOprID: permission.accessID,
            appID: (details as UserListDto).appID,
            appUName: (details as UserListDto).appUserName,
            allowYN: permission.allowAccess,
            profileID: 0,
            rNotes: "",
            transferYN: "Y",
            rActiveYN: "Y",
          }));
          response = await userListServices.saveUserListPermissionsByType(userModulePermissions, type);
        } else if (type === "R") {
          const userReportPermissions = updatedPermissions.map((permission) => ({
            apAccessID: permission.accessDetailID,
            repID: permission.accessID,
            appID: (details as UserListDto).appID,
            allowYN: permission.allowAccess,
            profileID: 0,
            rNotes: "",
            transferYN: "Y",
            rActiveYN: "Y",
          }));
          response = await userListServices.saveUserListPermissionsByType(userReportPermissions, type);
        } else if (type === "D") {
          const userDepartmentPermissions = updatedPermissions.map((permission) => ({
            deptUserID: permission.accessDetailID,
            deptID: permission.accessID,
            appID: (details as UserListDto).appID,
            allowYN: permission.allowAccess,
            profileID: 0,
            rNotes: "",
            transferYN: "Y",
            rActiveYN: "Y",
          }));
          response = await userListServices.saveUserListPermissionsByType(userDepartmentPermissions, type);
        }
      }

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
    const selectAllChecked = event.target.checked;
    const userConfirmed = await showAlert("Confirm Action", `Are you sure you want to ${selectAllChecked ? "select" : "deselect"} all permissions?`, "warning", true);
    if (!userConfirmed) return;
    setIsSelectAll(selectAllChecked);
    let response;
    if (mode === "profile") {
      const updatedPermissions = (permissions as ProfileDetailDto[]).map((permission) => ({
        ...permission,
        profileID: (details as ProfileMastDto).profileID,
        profileName: (details as ProfileMastDto).profileName,
        profileType: type,
        rActiveYN: selectAllChecked ? "Y" : "N",
        rNotes: "",
        transferYN: "Y",
      }));
      response = await profileDetailService.bulkSave(updatedPermissions);
    } else {
      if (type === "M") {
        const updatedModulePermissions = (permissions as UserListPermissionDto[]).map((permission) => ({
          auAccessID: permission.accessDetailID,
          aOprID: permission.accessID,
          appID: (details as UserListDto).appID,
          appUName: (details as UserListDto).appUserName,
          allowYN: selectAllChecked ? "Y" : "N",
          profileID: 0,
          rNotes: "",
          transferYN: "Y",
          rActiveYN: "Y",
        }));
        response = await userListServices.saveUserListPermissionsByType(updatedModulePermissions, type);
      } else {
        const updatedReportPermissions = (permissions as UserListPermissionDto[]).map((permission) => ({
          apAccessID: permission.accessDetailID,
          repID: permission.accessID,
          appID: (details as UserListDto).appID,
          allowYN: selectAllChecked ? "Y" : "N",
          profileID: 0,
          rNotes: "",
          transferYN: "Y",
          rActiveYN: "Y",
        }));
        response = await userListServices.saveUserListPermissionsByType(updatedReportPermissions, type);
      }
    }
    if (response.success) {
      notifySuccess("Permission applied!");
    } else {
      setIsSelectAll(!selectAllChecked);
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
    setIsSelectAll(false);
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
    setPermissions([]);
    setSelectedItems([]);

    if (type === "D") {
      fetchPermissions(0, 0);
    }
  }, [type]);

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

export default PermissionManager;
