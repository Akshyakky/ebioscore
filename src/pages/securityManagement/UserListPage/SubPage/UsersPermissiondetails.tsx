import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, SelectChangeEvent } from "@mui/material";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import {
  notifyError,
  notifySuccess,
} from "../../../../utils/Common/toastManager";
import {
  OperationResult,
  UserPermissionDto,
  UserPermissionDropdowns,
  UserListData,
} from "../../../../interfaces/SecurityManagement/UserListData";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import CustomCheckbox from "../../../../components/Checkbox/Checkbox";
import moduleService from "../../../../services/CommonServices/ModuleService";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import { UserListService } from "../../../../services/SecurityManagementServices/UserListService";

interface UserPermissionProps {
  userID: number;
  userName: string;
}

interface ModulePermission {
  auAccessID?: number;
  operationID: number;
  operationName: string;
  allow: boolean;
}

interface ReportPermission {
  apAccessID?: number;
  reportID: number;
  reportName: string;
  allow: boolean;
}

const UserPermissionDetails: React.FC<UserPermissionProps> = ({
  userID,
  userName,
}) => {
  const {
    token,
    compID,
    userID: loggedInUserID,
    adminYN,
  } = useSelector((state: RootState) => state.userDetails);
  const [dropdownValues, setDropdownValues] = useState({
    mainModulesOptions: [] as DropdownOption[],
    subModulesOptions: [] as DropdownOption[],
    reportMainModulesOptions: [] as DropdownOption[],
  });

  const [selectedReportMainModule, setSelectedReportMainModule] =
    useState<string>("");
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [reportPermissions, setReportPermissions] = useState<
    ReportPermission[]
  >([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectAllReportChecked, setSelectAllReportChecked] = useState(false);

  const [isSubmitted] = useState(false);

  const getInitialUserPermissionDropdownsState =
    (): UserPermissionDropdowns => ({
      mainModuleID: "0",
      mainModuleName: "",
      subModuleID: "0",
      subModuleName: "",
      repMainModuleID: "0",
      repMainModuleName: "",
    });
  const [userPermissionDropdowns, setUserPermissionDropdowns] =
    useState<UserPermissionDropdowns>(getInitialUserPermissionDropdownsState());

  const { handleDropdownChange } = useDropdownChange<UserPermissionDropdowns>(
    setUserPermissionDropdowns
  );

  useEffect(() => {
    const fetchMainModules = async () => {
      if (token) {
        try {
          const modulesData = await moduleService.getActiveModules(
            adminYN === "Y" ? 0 : loggedInUserID ?? 0,
            token
          );
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
  }, [token]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (
        userPermissionDropdowns.mainModuleID &&
        userPermissionDropdowns.subModuleID &&
        token
      ) {
        try {
          const permissionsData: OperationResult<UserListData[]> =
            await UserListService.getAllUsers(token);

          if (permissionsData.success && permissionsData.data) {
            setPermissions(
              permissionsData.data.map((permission) => ({
                operationID: permission.appID,
                operationName: permission.appUserName,
                allow: permission.transferYN === "Y",
              }))
            );
          } else {
            console.error(
              "Error fetching module permissions:",
              permissionsData.errorMessage
            );
            notifyError("Error fetching module permissions");
          }
        } catch (error) {
          console.error("Error fetching module permissions:", error);
          notifyError("Error fetching module permissions");
        }
      }
    };

    fetchPermissions();
  }, [
    userPermissionDropdowns.mainModuleID,
    userPermissionDropdowns.subModuleID,
    token,
  ]);

  useEffect(() => {
    setSelectAllChecked(permissions.every((permission) => permission.allow));
  }, [permissions]);

  useEffect(() => {
    setSelectAllReportChecked(
      reportPermissions.every((permission) => permission.allow)
    );
  }, [reportPermissions]);

  useEffect(() => {
    const fetchSubModules = async () => {
      if (userPermissionDropdowns.mainModuleID && token) {
        try {
          const subModulesData = await moduleService.getActiveSubModules(
            adminYN === "Y" ? 0 : loggedInUserID ?? 0,
            token
          );
          const filteredSubModules = subModulesData.filter(
            (subModule) =>
              subModule.auGrpID.toString() ===
              userPermissionDropdowns.mainModuleID
          );
          setDropdownValues((prevValues) => ({
            ...prevValues,
            subModulesOptions: filteredSubModules.map((subModule) => ({
              label: subModule.title,
              value: subModule.subID.toString(),
            })),
          }));
          setUserPermissionDropdowns((prevValues) => ({
            ...prevValues,
            subModuleID: "",
            subModuleName: "",
          }));
          setPermissions([]);
          setReportPermissions([]);
        } catch (error) {
          console.error("Error fetching submodules:", error);
          notifyError("Error fetching submodules");
        }
      }
    };

    fetchSubModules();
  }, [userPermissionDropdowns.mainModuleID, token, loggedInUserID, adminYN]);

  const handleReportMainModuleChange = (event: SelectChangeEvent<string>) => {
    setSelectedReportMainModule(event.target.value);
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

    if (userID) {
      const userPermission: UserPermissionDto = {
        auAccessID: existingPermission?.auAccessID || 0,
        appID: userID,
        appUName: userName,
        aOPRID: permissionID,
        allowYN: allow ? "Y" : "N",
        rActiveYN: allow ? "Y" : "N",
        rCreatedID: loggedInUserID!,
        rCreatedBy: userName,
        rCreatedOn: new Date().toISOString(),
        rModifiedID: loggedInUserID!,
        rModifiedBy: userName,
        rModifiedOn: new Date().toISOString(),
        rNotes: "",
        compID: compID!,
        compCode: "",
        compName: "",
        profileID: 0,
        repID: 0,
      };

      try {
        const result: OperationResult<UserPermissionDto> =
          await UserListService.saveOrUpdateUserPermission(
            token!,
            userPermission
          );

        if (result.success) {
          if (existingPermission) {
            existingPermission.auAccessID = result.data?.auAccessID;
          }
          if (allow) {
            notifySuccess(`Permission Applied`);
          } else {
            notifyError(`Permission Removed`);
          }
        } else {
          notifyError(`Error saving permission ${permissionID}`);
        }
      } catch (error) {
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

    if (userID) {
      const userReportPermission: UserPermissionDto = {
        auAccessID: existingReportPermission?.apAccessID || 0,
        appID: userID,
        appUName: userName,
        aOPRID: reportID,
        allowYN: allow ? "Y" : "N",
        rActiveYN: allow ? "Y" : "N",
        rCreatedID: loggedInUserID!,
        rCreatedBy: userName,
        rCreatedOn: new Date().toISOString(),
        rModifiedID: loggedInUserID!,
        rModifiedBy: userName,
        rModifiedOn: new Date().toISOString(),
        rNotes: "",
        compID: compID!,
        compCode: "",
        compName: "",
        profileID: 0,
        repID: 0,
      };

      try {
        const result: OperationResult<UserPermissionDto> =
          await UserListService.saveOrUpdateUserReportPermission(
            token!,
            userReportPermission
          );

        if (result.success) {
          if (existingReportPermission) {
            existingReportPermission.apAccessID = result.data?.auAccessID;
          }
          notifySuccess(
            allow ? `Report Permission Applied` : `Report Permission Removed`
          );
        } else {
          notifyError(`Error saving report permission ${reportID}`);
        }
      } catch (error) {
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

    if (userID) {
      try {
        const userPermissions: UserPermissionDto[] = updatedPermissions.map(
          (permission) => ({
            auAccessID: permission.auAccessID || 0,
            appID: userID,
            appUName: userName,
            aOPRID: permission.operationID,
            allowYN: allow ? "Y" : "N",
            rActiveYN: allow ? "Y" : "N",
            rCreatedID: loggedInUserID!,
            rCreatedBy: userName,
            rCreatedOn: new Date().toISOString(),
            rModifiedID: loggedInUserID!,
            rModifiedBy: userName,
            rModifiedOn: new Date().toISOString(),
            rNotes: "",
            compID: compID!,
            compCode: "",
            compName: "",
            profileID: 0,
            repID: 0,
          })
        );

        for (const permission of userPermissions) {
          const result: OperationResult<UserPermissionDto> =
            await UserListService.saveOrUpdateUserPermission(
              token!,
              permission
            );
          if (result.success) {
            const updatedPermission = permissions.find(
              (perm) => perm.operationID === permission.aOPRID
            );
            if (updatedPermission) {
              updatedPermission.auAccessID = result.data?.auAccessID;
            }
          } else {
            console.error(
              `Error saving permission ${permission.aOPRID}: ${result.errorMessage}`
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

    if (userID) {
      try {
        const userReportPermissions: UserPermissionDto[] =
          updatedReportPermissions.map((permission) => ({
            auAccessID: permission.apAccessID || 0,
            appID: userID,
            appUName: userName,
            aOPRID: permission.reportID,
            allowYN: allow ? "Y" : "N",
            rActiveYN: allow ? "Y" : "N",
            rCreatedID: loggedInUserID!,
            rCreatedBy: userName,
            rCreatedOn: new Date().toISOString(),
            rModifiedID: loggedInUserID!,
            rModifiedBy: userName,
            rModifiedOn: new Date().toISOString(),
            rNotes: "",
            compID: compID!,
            compCode: "",
            compName: "",
            profileID: 0,
            repID: 0,
          }));

        for (const permission of userReportPermissions) {
          const result: OperationResult<UserPermissionDto> =
            await UserListService.saveOrUpdateUserReportPermission(
              token!,
              permission
            );
          if (result.success) {
            const updatedReportPermission = reportPermissions.find(
              (perm) => perm.reportID === permission.aOPRID
            );
            if (updatedReportPermission) {
              updatedReportPermission.apAccessID = result.data?.auAccessID;
            }
          } else {
            console.error(
              `Error saving report permission ${permission.aOPRID}: ${result.errorMessage}`
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
    setSelectedReportMainModule("");
    setReportPermissions([]);
    setDropdownValues((prevValues) => ({
      ...prevValues,
      subModulesOptions: [],
    }));
    setUserPermissionDropdowns(getInitialUserPermissionDropdownsState());
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
              value={userPermissionDropdowns.mainModuleID || ""}
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
              value={userPermissionDropdowns.subModuleID || ""}
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

            {userPermissionDropdowns.mainModuleID &&
              userPermissionDropdowns.subModuleID && (
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
                      <CustomCheckbox
                        label="Allow [Select All]"
                        name="selectAll"
                        checked={selectAllChecked}
                        onChange={handleSelectAllChange}
                        isMandatory={false}
                      />
                    </Grid>
                  </Grid>
                  {permissions.map((permission) => (
                    <Grid
                      key={permission.operationID} // Add key prop here
                      container
                      spacing={2}
                      alignItems="center"
                      sx={{ marginTop: 1 }}
                    >
                      <Grid item xs={6}>
                        <Typography>{permission.operationName}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <CustomCheckbox
                          label=""
                          name={`permission_${permission.operationID}`}
                          checked={permission.allow}
                          onChange={(event) =>
                            handlePermissionChange(
                              permission.operationID,
                              event.target.checked
                            )
                          }
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
                    <CustomCheckbox
                      label="Allow [Select All]"
                      name="selectAll"
                      checked={selectAllReportChecked}
                      onChange={handleSelectAllReportChange}
                      isMandatory={false}
                    />
                  </Grid>
                </Grid>

                {reportPermissions.map((reportPermission) => (
                  <Grid
                    key={reportPermission.reportID} // Add key prop here
                    container
                    spacing={2}
                    alignItems="center"
                    sx={{ marginTop: 1 }}
                  >
                    <Grid item xs={6}>
                      <Typography>{reportPermission.reportName}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <CustomCheckbox
                        label=""
                        name={`report_permission_${reportPermission.reportID}`}
                        checked={reportPermission.allow}
                        onChange={(event) =>
                          handleReportPermissionChange(
                            reportPermission.reportID,
                            event.target.checked
                          )
                        }
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

export default UserPermissionDetails;
