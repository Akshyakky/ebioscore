import React, { useEffect, useState } from "react";
import {
  Grid,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  Paper,
  Typography,
} from "@mui/material";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import moduleService from "../../../../services/CommonServices/ModuleService";
import ProfileService from "../../../../services/SecurityManagementServices/ProfileListServices";
import {
  notifyError,
  notifySuccess,
} from "../../../../utils/Common/toastManager";
import {
  OperationResult,
  ProfileDetailDto,
  ProfileDetailsDropdowns,
  ReportPermissionDto,
} from "../../../../interfaces/SecurityManagement/ProfileListData";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import useDropdownChange from "../../../../hooks/useDropdownChange";

interface SideBarProps {
  profileID: number;
  profileName: string;
}

interface ModuleOperation {
  profDetID?: number;
  operationID: number;
  operationName: string;
  allow: boolean;
}

interface ReportPermission {
  profDetID?: number;
  reportID: number;
  reportName: string;
  allow: boolean;
}

const AccessPermissionDetails: React.FC<SideBarProps> = ({
  profileID,
  profileName,
}) => {
  const { token, compID, userID, adminYN } = useSelector(
    (state: RootState) => state.userDetails
  );
  const [dropdownValues, setDropdownValues] = useState({
    mainModulesOptions: [] as DropdownOption[],
    subModulesOptions: [] as DropdownOption[],
    reportMainModulesOptions: [] as DropdownOption[],
    reportPermissionsOptions: [] as DropdownOption[],
  });

  const [selectedReportMainModule, setSelectedReportMainModule] =
    useState<string>("");
  const [permissions, setPermissions] = useState<ModuleOperation[]>([]);
  const [reportPermissions, setReportPermissions] = useState<
    ReportPermission[]
  >([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectAllReportChecked, setSelectAllReportChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getInitialProfileDetailsDropdownsState =
    (): ProfileDetailsDropdowns => ({
      mainModuleID: "0",
      mainModuleName: "",
      subModuleID: "0",
      subModuleName: "",
      repMainModuleID: "",
      repMainModuleName: "",
    });
  const [profileDetailsDropdowns, setProfileDetailsDropdowns] =
    useState<ProfileDetailsDropdowns>(getInitialProfileDetailsDropdownsState());

  const { handleDropdownChange } = useDropdownChange<ProfileDetailsDropdowns>(
    setProfileDetailsDropdowns
  );

  useEffect(() => {
    const fetchMainModules = async () => {
      if (token) {
        try {
          const modulesData = await moduleService.getActiveModules(
            adminYN === "Y" ? 0 : userID ?? 0,
            token
          );
          console.log("Fetched Main Modules: ", modulesData);
          setDropdownValues((prevValues) => ({
            ...prevValues,
            mainModulesOptions: modulesData.map((module) => ({
              label: module.title,
              value: module.auGrpID.toString(),
            })),
            reportMainModulesOptions: modulesData.map((module) => ({
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
    if (
      profileDetailsDropdowns.mainModuleID &&
      profileDetailsDropdowns.subModuleID
    ) {
      const fetchPermissions = async () => {
        try {
          const reportPermissionsData: OperationResult<ReportPermissionDto[]> =
            await ProfileService.getReportPermissions(
              token ?? "",
              parseInt(profileDetailsDropdowns.subModuleID),
              parseInt(profileDetailsDropdowns.mainModuleID),
              profileID
            );

          if (reportPermissionsData.success && reportPermissionsData.data) {
            console.log(
              "Fetched Report Permissions: ",
              reportPermissionsData.data
            );
            setPermissions(
              (reportPermissionsData.data ?? []).map((permission) => ({
                profDetID: permission.profDetID,
                operationID: permission.operationID,
                operationName: permission.operationName,
                allow: permission.allow,
              }))
            );
            setDropdownValues((prevValues) => ({
              ...prevValues,
              reportPermissionsOptions: (reportPermissionsData.data ?? []).map(
                (permission) => ({
                  label: permission.operationName,
                  value: permission.operationID.toString(),
                })
              ),
            }));
          } else {
            console.error(
              "Error fetching report permissions:",
              reportPermissionsData.errorMessage
            );
            notifyError("Error fetching report permissions");
          }
        } catch (error) {
          console.error("Error fetching report permissions:", error);
          notifyError("Error fetching report permissions");
        }
      };

      fetchPermissions();
    }
  }, [profileDetailsDropdowns.subModuleID]);

  useEffect(() => {
    if (selectedReportMainModule) {
      const fetchReportPermissions = async () => {
        try {
          const reportPermissionsData: OperationResult<ReportPermission[]> =
            await ProfileService.getProfileReportOperations(
              token ?? "",
              parseInt(selectedReportMainModule),
              compID!,
              profileID
            );

          if (reportPermissionsData.success && reportPermissionsData.data) {
            console.log(
              "Fetched Report Permissions: ",
              reportPermissionsData.data
            );
            setReportPermissions(
              (reportPermissionsData.data ?? []).map((permission) => ({
                profDetID: permission.profDetID,
                reportID: permission.reportID,
                reportName: permission.reportName,
                allow: permission.allow,
              }))
            );
          } else {
            console.error(
              "Error fetching report permissions:",
              reportPermissionsData.errorMessage
            );
            notifyError("Error fetching report permissions");
          }
        } catch (error) {
          console.error("Error fetching report permissions:", error);
          notifyError("Error fetching report permissions");
        }
      };

      fetchReportPermissions();
    }
  }, [selectedReportMainModule, compID, token, profileID]);

  useEffect(() => {
    const allSelected = permissions.every((permission) => permission.allow);
    setSelectAllChecked(allSelected);
  }, [permissions]);

  useEffect(() => {
    const allSelected = reportPermissions.every(
      (permission) => permission.allow
    );
    setSelectAllReportChecked(allSelected);
  }, [reportPermissions]);

  const fetchSubModules = async () => {
    if (profileDetailsDropdowns.mainModuleID) {
      try {
        const subModulesData = await moduleService.getActiveSubModules(
          adminYN === "Y" ? 0 : userID ?? 0,
          token ?? ""
        );
        const filteredSubModules = subModulesData.filter(
          (subModule) =>
            subModule.auGrpID.toString() ===
            profileDetailsDropdowns.mainModuleID
        );
        console.log(
          "Fetched Sub Modules for Main Module ",
          profileDetailsDropdowns.mainModuleID,
          ": ",
          filteredSubModules
        );
        setDropdownValues((prevValues) => ({
          ...prevValues,
          subModulesOptions: filteredSubModules.map((subModule) => ({
            label: subModule.title,
            value: subModule.subID.toString(),
          })),
        }));
        setProfileDetailsDropdowns((prevValues) => ({
          ...prevValues,
          subModuleID: "",
          subModuleName: "",
        })); // Reset selected submodule when main module changes
        setPermissions([]); // Reset permissions when main module changes
        setReportPermissions([]); // Reset report permissions when main module changes
      } catch (error) {
        console.error("Error fetching submodules:", error);
        notifyError("Error fetching submodules");
      }
    }
  };

  useEffect(() => {
    fetchSubModules();
  }, [profileDetailsDropdowns.mainModuleID]);

  const handleReportMainModuleChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    console.log("Report Main Module Selected: ", selectedValue); // Log selected value
    setSelectedReportMainModule(selectedValue);
  };

  const handlePermissionChange = async (
    permissionID: number,
    allow: boolean
  ) => {
    let existingPermission = permissions.find(
      (permission) => permission.operationID === permissionID
    );

    if (existingPermission) {
      existingPermission.allow = allow;
    }

    setPermissions([...permissions]);

    if (token && profileID) {
      const profileDetail: ProfileDetailDto = {
        profDetID: existingPermission?.profDetID || 0,
        profileID: profileID,
        profileName: profileName,
        aOPRID: permissionID,
        compID: 1,
        rActiveYN: allow ? "Y" : "N",
        rNotes: "",
        reportYN: "N",
      };

      console.log("Saving permission with data:", profileDetail);

      try {
        const result: OperationResult<ProfileDetailDto> =
          await ProfileService.saveOrUpdateProfileDetail(token, profileDetail);

        console.log("API call result:", result);

        if (result.success) {
          console.log(
            `Permission ${permissionID} saved successfully, Allow: ${allow}`
          );
          if (existingPermission) {
            existingPermission.profDetID = result.data?.profDetID;
          }
          if (allow) {
            notifySuccess(`Module Permission Applied`);
          } else {
            notifyError(`Module Permission Removed`);
          }
        } else {
          console.error(
            `Error saving permission ${permissionID}: ${result.errorMessage}`
          );
          notifyError(`Error saving permission ${permissionID}`);
        }
      } catch (error) {
        console.error("Error saving permissions:", error);
        notifyError("Error saving permissions");
      }
    }
  };

  const handleReportPermissionChange = async (
    reportID: number,
    allow: boolean
  ) => {
    let existingReportPermission = reportPermissions.find(
      (permission) => permission.reportID === reportID
    );

    if (existingReportPermission) {
      existingReportPermission.allow = allow;
    }

    setReportPermissions([...reportPermissions]);

    if (token && profileID) {
      const profileDetail: ProfileDetailDto = {
        profDetID: existingReportPermission?.profDetID || 0,
        profileID: profileID,
        profileName: profileName,
        aOPRID: reportID,
        compID: 1,
        rActiveYN: allow ? "Y" : "N",
        rNotes: "",
        reportYN: "Y",
      };

      console.log("Saving report permission with data:", profileDetail);

      try {
        const result: OperationResult<ProfileDetailDto> =
          await ProfileService.saveOrUpdateProfileDetail(token, profileDetail);

        console.log("API call result:", result);

        if (result.success) {
          console.log(
            `Report Permission ${reportID} saved successfully, Allow: ${allow}`
          );
          if (existingReportPermission) {
            existingReportPermission.profDetID = result.data?.profDetID;
          }
          notifySuccess(
            allow ? `Module Permission Applied` : `Module Permission Removed`
          );
        } else {
          console.error(
            `Error saving report permission ${reportID}: ${result.errorMessage}`
          );
          notifyError(`Error saving report permission ${reportID}`);
        }
      } catch (error) {
        console.error("Error saving report permissions:", error);
        notifyError("Error saving report permissions");
      }
    }
  };

  const handleSelectAllChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const allow = event.target.checked;
    const updatedPermissions = permissions.map((permission) => ({
      ...permission,
      allow,
    }));

    setPermissions(updatedPermissions);
    setSelectAllChecked(allow);

    if (token && profileID) {
      try {
        const profileDetails: ProfileDetailDto[] = updatedPermissions.map(
          (permission) => ({
            profDetID: permission.profDetID || 0,
            profileID: profileID,
            profileName: profileName,
            aOPRID: permission.operationID,
            compID: compID!,
            rActiveYN: allow ? "Y" : "N",
            rNotes: "",
            reportYN: "N",
          })
        );

        for (const detail of profileDetails) {
          console.log("Saving permission with data:", detail);

          const result: OperationResult<ProfileDetailDto> =
            await ProfileService.saveOrUpdateProfileDetail(token, detail);
          if (result.success) {
            console.log(
              `Permission ${detail.aOPRID} saved successfully, Allow: ${allow}`
            );
            const updatedPermission = permissions.find(
              (permission) => permission.operationID === detail.aOPRID
            );
            if (updatedPermission) {
              updatedPermission.profDetID = result.data?.profDetID;
            }
          } else {
            console.error(
              `Error saving permission ${detail.aOPRID}: ${result.errorMessage}`
            );
          }
        }
      } catch (error) {
        console.error("Error saving permissions:", error);
      }
    }
  };

  const handleSelectAllReportChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const allow = event.target.checked;
    const updatedReportPermissions = reportPermissions.map((permission) => ({
      ...permission,
      allow,
    }));

    setReportPermissions(updatedReportPermissions);
    setSelectAllReportChecked(allow);

    if (token && profileID) {
      try {
        const profileDetails: ProfileDetailDto[] = updatedReportPermissions.map(
          (permission) => ({
            profDetID: permission.profDetID || 0,
            profileID: profileID,
            profileName: profileName,
            aOPRID: permission.reportID,
            compID: 1,
            rActiveYN: allow ? "Y" : "N",
            rNotes: "",
            reportYN: "Y",
          })
        );

        for (const detail of profileDetails) {
          console.log("Saving report permission with data:", detail);

          const result: OperationResult<ProfileDetailDto> =
            await ProfileService.saveOrUpdateProfileDetail(token, detail);
          if (result.success) {
            console.log(
              `Report Permission ${detail.aOPRID} saved successfully, Allow: ${allow}`
            );
            const updatedReportPermission = reportPermissions.find(
              (permission) => permission.reportID === detail.aOPRID
            );
            if (updatedReportPermission) {
              updatedReportPermission.profDetID = result.data?.profDetID;
            }
          } else {
            console.error(
              `Error saving report permission ${detail.aOPRID}: ${result.errorMessage}`
            );
          }
        }
      } catch (error) {
        console.error("Error saving report permissions:", error);
      }
    }
  };

  const handleClear = () => {
    setPermissions([]);
    setSelectedReportMainModule(""); // Reset report main module when clearing
    setReportPermissions([]);
    setDropdownValues((prevValues) => ({
      ...prevValues,
      subModulesOptions: [],
      reportPermissionsOptions: [],
    }));
  };

  const handleReportPermissionClear = () => {
    setReportPermissions([]);
    setSelectAllReportChecked(false);
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
              Module Permissions
            </Typography>
            <DropdownSelect
              name="MainModule"
              label="Main Modules"
              value={profileDetailsDropdowns.mainModuleID || ""}
              options={dropdownValues.mainModulesOptions}
              onChange={handleDropdownChange(
                ["mainModuleID"],
                ["mainModuleName"],
                dropdownValues.mainModulesOptions
              )}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              clearable
              onClear={handleClear}
            />

            <DropdownSelect
              name="SubModule"
              label="Sub Module"
              value={profileDetailsDropdowns.subModuleID || ""}
              options={dropdownValues.subModulesOptions}
              onChange={handleDropdownChange(
                ["subModuleID"],
                ["subModuleName"],
                dropdownValues.subModulesOptions
              )}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              clearable
              onClear={handleClear}
            />

            {profileDetailsDropdowns.mainModuleID &&
              profileDetailsDropdowns.subModuleID && (
                <>
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    sx={{ marginTop: 2 }}
                  >
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
                    <Grid
                      container
                      spacing={2}
                      alignItems="center"
                      key={permission.operationID}
                      sx={{ marginTop: 1 }}
                    >
                      <Grid item xs={6}>
                        {permission.operationName}
                      </Grid>
                      <Grid item xs={6}>
                        <Checkbox
                          checked={permission.allow}
                          onChange={(event) =>
                            handlePermissionChange(
                              permission.operationID,
                              event.target.checked
                            )
                          }
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
              name="ReportMainModules"
              label="Report Main Modules"
              value={selectedReportMainModule}
              options={dropdownValues.reportMainModulesOptions}
              onChange={handleReportMainModuleChange}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              clearable
              onClear={handleReportPermissionClear}
            />

            {selectedReportMainModule && (
              <>
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                  sx={{ marginTop: 2 }}
                >
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">
                      <strong>Report</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectAllReportChecked}
                          onChange={handleSelectAllReportChange}
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

                {reportPermissions.map((permission) => (
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    key={permission.reportID}
                    sx={{ marginTop: 1 }}
                  >
                    <Grid item xs={6}>
                      {permission.reportName}
                    </Grid>
                    <Grid item xs={6}>
                      <Checkbox
                        checked={permission.allow}
                        onChange={(event) =>
                          handleReportPermissionChange(
                            permission.reportID,
                            event.target.checked
                          )
                        }
                        color="primary"
                      />
                    </Grid>
                  </Grid>
                ))}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </section>
  );
};

export default AccessPermissionDetails;
