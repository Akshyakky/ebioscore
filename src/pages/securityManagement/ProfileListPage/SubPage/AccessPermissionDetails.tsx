import React, { useEffect, useState } from "react";
import { Grid, SelectChangeEvent, FormControlLabel, Checkbox, Paper, Typography } from "@mui/material";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import { usePageTitle } from "../../../../hooks/usePageTitle";
import moduleService from "../../../../services/CommonServices/ModuleService";
import ProfileService from "../../../../services/SecurityManagementServices/ProfileListServices";
import { notifyError } from "../../../../utils/Common/toastManager";
import { OperationResult, ProfileDetailDto, ReportPermissionDto } from "../../../../interfaces/SecurityManagement/ProfileListData";

interface SideBarProps {
  userID: number | null;
  token: string | null;
  profileID: number;
  profileName: string;
}

interface Permission {
  permissionID: number;
  permissionName: string;
  allow: boolean;
}

const AccessPermissionDetails: React.FC<SideBarProps> = ({ userID, token, profileID, profileName }) => {
  const [dropdownValues, setDropdownValues] = useState({
    mainModulesOptions: [] as DropdownOption[],
    subModulesOptions: [] as DropdownOption[],
    reportPermissionsOptions: [] as DropdownOption[],
  });

  const [selectedMainModule, setSelectedMainModule] = useState<string>("");
  const [selectedSubModule, setSelectedSubModule] = useState<string>("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedReportPermission, setSelectedReportPermission] = useState<string>("");
  const { pageTitle } = usePageTitle();

  useEffect(() => {
    const fetchMainModules = async () => {
      if (token) {
        try {
          const modulesData = await moduleService.getActiveModules(userID ?? 0, token);
          console.log("Fetched Main Modules: ", modulesData);
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

  useEffect(() => {
    if (selectedMainModule && selectedSubModule) {
      const fetchPermissions = async () => {
        try {
          const reportPermissionsData: OperationResult<ReportPermissionDto[]> = await ProfileService.getReportPermissions(
            token ?? "",
            parseInt(selectedSubModule),
            parseInt(selectedMainModule),
            profileID
          );

          if (reportPermissionsData.success && reportPermissionsData.data) {
            console.log("Fetched Report Permissions: ", reportPermissionsData.data);
            setPermissions(
              (reportPermissionsData.data ?? []).map((permission) => ({
                permissionID: permission.operationID,
                permissionName: permission.operationName,
                allow: permission.allow,
              }))
            );
            setDropdownValues((prevValues) => ({
              ...prevValues,
              reportPermissionsOptions: (reportPermissionsData.data ?? []).map((permission) => ({
                label: permission.operationName,
                value: permission.operationID.toString(),
              })),
            }));
          } else {
            console.error("Error fetching report permissions:", reportPermissionsData.errorMessage);
            notifyError("Error fetching report permissions");
          }
        } catch (error) {
          console.error("Error fetching report permissions:", error);
          notifyError("Error fetching report permissions");
        }
      };

      fetchPermissions();
    }
  }, [selectedMainModule, selectedSubModule, token, profileID]);

  const handleMainModuleChange = async (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    setSelectedMainModule(selectedValue);
    try {
      const subModulesData = await moduleService.getActiveSubModules(userID ?? 0, token ?? "");
      const filteredSubModules = subModulesData.filter((subModule) => subModule.auGrpID === parseInt(selectedValue));
      console.log("Fetched Sub Modules for Main Module ", selectedValue, ": ", filteredSubModules);
      setDropdownValues((prevValues) => ({
        ...prevValues,
        subModulesOptions: filteredSubModules.map((subModule) => ({
          label: subModule.title,
          value: subModule.auGrpID.toString(),
        })),
      }));
      setSelectedSubModule("");
      setPermissions([]);
    } catch (error) {
      console.error("Error fetching submodules:", error);
      notifyError("Error fetching submodules");
    }
  };

  const handleSubModuleChange = async (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    setSelectedSubModule(selectedValue);
  };

  const handlePermissionChange = async (permissionID: number, allow: boolean) => {
    const updatedPermissions = permissions.map((permission) =>
      permission.permissionID === permissionID ? { ...permission, allow } : permission
    );

    setPermissions(updatedPermissions);

    if (token && profileID) {
      const profileDetail: ProfileDetailDto = {
        profDetID: 0,
        profileID: profileID,
        profileName: profileName,
        aOPRID: permissionID,
        compID: 1,
        rActiveYN: "Y",
        rNotes: "",
        reportYN: "Y",
      };

      console.log("Saving permission with data:", profileDetail);

      try {
        const result: OperationResult<ProfileDetailDto> = await ProfileService.saveOrUpdateProfileDetail(token, profileDetail);

        console.log("API call result:", result);

        if (result.success) {
          console.log(`Permission ${permissionID} saved successfully, Allow: ${allow}`);
        } else {
          console.error(`Error saving permission ${permissionID}: ${result.errorMessage}`);
        }
      } catch (error) {
        console.error("Error saving permissions:", error);
      }
    }
  };

  const handleSelectAllChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const allow = event.target.checked;
    const updatedPermissions = permissions.map((permission) => ({
      ...permission,
      allow,
    }));

    setPermissions(updatedPermissions);
    setSelectAllChecked(allow);

    if (token && profileID) {
      try {
        const profileDetails: ProfileDetailDto[] = updatedPermissions.map((permission) => ({
          profDetID: 0,
          profileID: profileID,
          profileName: profileName,
          aOPRID: permission.permissionID,
          compID: 1,
          rActiveYN: "Y",
          rNotes: "",
          reportYN: "Y",
        }));

        for (const detail of profileDetails) {
          console.log("Saving permission with data:", detail);

          const result: OperationResult<ProfileDetailDto> = await ProfileService.saveOrUpdateProfileDetail(token, detail);
          if (result.success) {
            console.log(`Permission ${detail.aOPRID} saved successfully, Allow: ${allow}`);
          } else {
            console.error(`Error saving permission ${detail.aOPRID}: ${result.errorMessage}`);
          }
        }
      } catch (error) {
        console.error("Error saving permissions:", error);
      }
    }
  };

  const handleClear = () => {
    setSelectedMainModule("");
    setSelectedSubModule("");
    setPermissions([]);
    setSelectedReportPermission("");
    setDropdownValues((prevValues) => ({
      ...prevValues,
      subModulesOptions: [],
      reportPermissionsOptions: [],
    }));
  };

  const handleReportPermissionChange = (event: SelectChangeEvent<string>) => {
    setSelectedReportPermission(event.target.value);
  };

  const handleReportPermissionClear = () => {
    setSelectedReportPermission("");
  };

  return (
    <section>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              marginBottom: 2,
              marginTop: 2,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
              Access Details
            </Typography>
            <DropdownSelect
              name="MainModules"
              label="Main Modules"
              value={selectedMainModule}
              options={dropdownValues.mainModulesOptions}
              onChange={handleMainModuleChange}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              clearable
              onClear={handleClear}
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
              clearable
              onClear={handleClear}
            />

            {selectedMainModule && selectedSubModule && (
              <>
                <Grid container spacing={2} alignItems="center" sx={{ marginTop: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">
                      <strong>Operation</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectAllChecked}
                          onChange={handleSelectAllChange}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="subtitle1">
                          <strong>Allow [Select All]</strong>
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>

                {permissions.map((permission) => (
                  <Grid container spacing={2} alignItems="center" key={permission.permissionID} sx={{ marginTop: 1 }}>
                    <Grid item xs={6}>
                      {permission.permissionName}
                    </Grid>
                    <Grid item xs={6}>
                      <Checkbox
                        checked={permission.allow}
                        onChange={(event) => handlePermissionChange(permission.permissionID, event.target.checked)}
                        color="primary"
                      />
                    </Grid>
                  </Grid>
                ))}
              </>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              marginBottom: 2,
              marginTop: 2,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
              Report Permissions
            </Typography>
            <DropdownSelect
              name="ReportPermissions"
              label="Report Permissions"
              value={selectedReportPermission}
              options={dropdownValues.reportPermissionsOptions ?? []}
              onChange={handleReportPermissionChange}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              clearable
              onClear={handleReportPermissionClear}
            />
          </Paper>
        </Grid>
      </Grid>
    </section>
  );
};

export default AccessPermissionDetails;
