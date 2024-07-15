import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, SelectChangeEvent } from "@mui/material";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import moduleService from "../../../../services/CommonServices/ModuleService";
import {
  notifyError,
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
import CustomCheckbox from "../../../../components/Checkbox/Checkbox";
import { ProfileService } from "../../../../services/SecurityManagementServices/ProfileListServices";
import { OperationPermissionDetailsDto } from "../../../../interfaces/SecurityManagement/OperationPermissionDetailsDto";

interface OperationPermissionProps {
  profileID: number;
  profileName: string;
  saveModulePermission: (permissions: OperationPermissionDetailsDto) => Promise<void>;
  saveReportPermission: (permissions: OperationPermissionDetailsDto) => Promise<void>;
}

interface ModuleOperation {
  profDetID?: number;
  operationID: number;
  operationName: string;
  allow: boolean;
  auAccessID?: number;
}

interface ReportPermission {
  profDetID?: number;
  reportID: number;
  reportName: string;
  allow: boolean;
}

const OperationPermissionDetails: React.FC<OperationPermissionProps> = ({
  profileID,
  profileName,
  saveModulePermission,
  saveReportPermission,
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

  const [selectedReportMainModule, setSelectedReportMainModule] = useState<string>("");
  const [permissions, setPermissions] = useState<ModuleOperation[]>([]);
  const [reportPermissions, setReportPermissions] = useState<ReportPermission[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectAllReportChecked, setSelectAllReportChecked] = useState(false);
  
  const [isSubmitted] = useState(false);

  const getInitialProfileDetailsDropdownsState = (): ProfileDetailsDropdowns => ({
    mainModuleID: "0",
    mainModuleName: "",
    subModuleID: "0",
    subModuleName: "",
    repMainModuleID: "0",
    repMainModuleName: "",
  });

  const [profileDetailsDropdowns, setProfileDetailsDropdowns] = useState<ProfileDetailsDropdowns>(
    getInitialProfileDetailsDropdownsState()
  );

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
          notifyError("Error fetching main modules");
        }
      }
    };
    fetchMainModules();
  }, [token]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (profileDetailsDropdowns.mainModuleID && profileDetailsDropdowns.subModuleID && token) {
        try {
          const reportPermissionsData: OperationResult<ReportPermissionDto[]> =
            await ProfileService.getProfileModuleOperations(
              token,
              parseInt(profileDetailsDropdowns.subModuleID),
              parseInt(profileDetailsDropdowns.mainModuleID),
              profileID
            );
          if (reportPermissionsData.success && reportPermissionsData.data) {
            setPermissions(
              reportPermissionsData.data.map((permission) => ({
                profDetID: permission.profDetID,
                operationID: permission.operationID,
                operationName: permission.operationName,
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
            notifyError("Error fetching report permissions");
          }
        } catch (error) {
          notifyError("Error fetching report permissions");
        }
      }
    };
    fetchPermissions();
  }, [
    profileDetailsDropdowns.subModuleID,
    profileDetailsDropdowns.mainModuleID,
    token,
    profileID,
  ]);

  useEffect(() => {
    const fetchReportPermissions = async () => {
      if (selectedReportMainModule && token) {
        try {
          const reportPermissionsData: OperationResult<ReportPermission[]> =
            await ProfileService.getProfileReportOperations(
              token,
              parseInt(selectedReportMainModule),
              compID!,
              profileID
            );
          if (reportPermissionsData.success && reportPermissionsData.data) {
            setReportPermissions(
              reportPermissionsData.data.map((permission) => ({
                profDetID: permission.profDetID,
                reportID: permission.reportID,
                reportName: permission.reportName,
                allow: permission.allow,
              }))
            );
          } else {
            notifyError("Error fetching report permissions");
          }
        } catch (error) {
          notifyError("Error fetching report permissions");
        }
      }
    };
    fetchReportPermissions();
  }, [selectedReportMainModule, token, compID, profileID]);

  useEffect(() => {
    const fetchSubModules = async () => {
      if (profileDetailsDropdowns.mainModuleID && token) {
        try {
          const subModulesData = await moduleService.getActiveSubModules(
            adminYN === "Y" ? 0 : userID ?? 0,
            token
          );
          const filteredSubModules = subModulesData.filter(
            (subModule) => subModule.auGrpID.toString() === profileDetailsDropdowns.mainModuleID
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
          }));
          setPermissions([]);
        } catch (error) {
          notifyError("Error fetching submodules");
        }
      }
    };
    fetchSubModules();
  }, [profileDetailsDropdowns.mainModuleID, token, adminYN, userID]);

  const handleReportMainModuleChange = (event: SelectChangeEvent<string>) => {
    setSelectedReportMainModule(event.target.value);
  };




  const handlePermissionChange = async (operationID: number, allow: boolean) => {
    const updatedPermissions = permissions.map((permission) =>
      permission.operationID === operationID ? { ...permission, allow } : permission
    );
    setPermissions(updatedPermissions);
  
    if (profileID) {
      try {
        debugger 
        const existingPermission = updatedPermissions.find(
          (permission) => permission.operationID === operationID
        );
        if (!existingPermission) {
          throw new Error("Permission not found");
        }
  
        const profileDetail: OperationPermissionDetailsDto = {
          ...existingPermission,
          profDetID: existingPermission.profDetID || 0,
          profileID: profileID,
          profileName: profileName,
          aOPRID: operationID,
          compID: compID!,
          rActiveYN: allow ? "Y" : "N",
          rNotes: "",
          reportYN: "N",
          repID: 0,
          auAccessID: existingPermission.auAccessID || 0, // Use auAccessID for update
          appID: 0,
          appUName: "",
          allowYN: allow ? "Y" : "N",
          rCreatedID: 0,
          rCreatedBy: "",
          rCreatedOn: "",
          rModifiedID: 0,
          rModifiedBy: "",
          rModifiedOn: "",
          compCode: "",
          compName: ""
        };
  

        
        await saveModulePermission(profileDetail); // Assuming saveModulePermission updates existing records
      } catch (error) {
        console.error("Error updating permissions:", error);
        notifyError("Error updating permissions");
      }
    }
  };
  
const handleReportPermissionChange = async (reportID: number, allow: boolean) => {
  const updatedReportPermissions = reportPermissions.map((permission) =>
    permission.reportID === reportID ? { ...permission, allow } : permission
  );
  setReportPermissions(updatedReportPermissions);

  if (profileID) {
    try {
      const existingReportPermission = updatedReportPermissions.find(
        (permission) => permission.reportID === reportID
      );

      if (!existingReportPermission) {
        throw new Error("Report Permission not found");
      }

      const profileDetail: OperationPermissionDetailsDto = {
        profDetID: existingReportPermission.profDetID || 0,
        profileID: profileID,
        profileName: profileName,
        aOPRID: reportID,
        compID: compID!,
        rActiveYN: allow ? "Y" : "N",
        rNotes: "",
        reportYN: "Y",
        repID: reportID,
        auAccessID: 0,
        appID: 0,
        appUName: "",
        allowYN: allow ? "Y" : "N",
        rCreatedID: 0,
        rCreatedBy: "",
        rCreatedOn: "",
        rModifiedID: 0,
        rModifiedBy: "",
        rModifiedOn: "",
        compCode: "",
        compName: ""
      };

      await saveReportPermission(profileDetail); // Make sure saveReportPermission updates existing record
    } catch (error) {
      console.error("Error updating report permissions:", error);
      notifyError("Error updating report permissions");
    }
  }
};





  const handleSelectAllReportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked: boolean = event.target.checked;
    const updatedReportPermissions = reportPermissions.map((permission) => ({
      ...permission,
      allow: checked,
    }));
    setReportPermissions(updatedReportPermissions);

    try {
      for (const permission of updatedReportPermissions) {
        const profileDetail: OperationPermissionDetailsDto = {
          profDetID: permission.profDetID!,
          profileID: profileID,
          profileName: profileName,
          aOPRID: permission.reportID,
          compID: compID!,
          rActiveYN: checked ? "Y" : "N",
          rNotes: "",
          reportYN: "Y",
          repID: permission.reportID,
          auAccessID: 0,
          appID: 0,
          appUName: "",
          allowYN: checked ? "Y" : "N",
          rCreatedID: 0,
          rCreatedBy: "",
          rCreatedOn: "",
          rModifiedID: 0,
          rModifiedBy: "",
          rModifiedOn: "",
          compCode: "",
          compName: "",
        };

        await saveReportPermission(profileDetail);
      }
    } catch (error) {
      console.error("Error saving all report permissions:", error);
      notifyError("Error saving all report permissions");
    }

    setSelectAllReportChecked(checked);
  };

  const handleSelectAllChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked: boolean = event.target.checked;
    const updatedPermissions = permissions.map((permission) => ({
      ...permission,
      allow: checked,
    }));
    setPermissions(updatedPermissions);

    try {
      for (const permission of updatedPermissions) {
        const profileDetail: OperationPermissionDetailsDto = {
          profDetID: permission.profDetID!,
          profileID: profileID,
          profileName: profileName,
          aOPRID: permission.operationID,
          compID: compID!,
          rActiveYN: checked ? "Y" : "N",
          rNotes: "",
          reportYN: "N",
          repID: 0,
          auAccessID: 0,
          appID: 0,
          appUName: "",
          allowYN: checked ? "Y" : "N",
          rCreatedID: 0,
          rCreatedBy: "",
          rCreatedOn: "",
          rModifiedID: 0,
          rModifiedBy: "",
          rModifiedOn: "",
          compCode: "",
          compName: "",
        };

        await saveModulePermission(profileDetail);
      }
    } catch (error) {
      console.error("Error saving all permissions:", error);
      notifyError("Error saving all permissions");
    }

    setSelectAllChecked(checked);
  };

  const handleClear = () => {
    setPermissions([]);
    setSelectedReportMainModule("");
    setReportPermissions([]);
    setDropdownValues((prevValues) => ({
      ...prevValues,
      subModulesOptions: [],
      reportPermissionsOptions: [],
    }));
    setProfileDetailsDropdowns(getInitialProfileDetailsDropdownsState());
  };

  const handleReportPermissionClear = () => {
    setReportPermissions([]);
    setSelectAllReportChecked(false);
    setDropdownValues((prevValues) => ({
      ...prevValues,
      reportMainModulesOptions: [],
    }));
    setProfileDetailsDropdowns(getInitialProfileDetailsDropdownsState());
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
              maxHeight: "57vh",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" id="insurance-details-header">
              MODULE PERMISSION
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
                          isMandatory={false}
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
              maxHeight: "57vh",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" id="insurance-details-header">
              REPORT PERMISSION
            </Typography>
            <DropdownSelect
              name="ReportMainModules"
              label="Report Main Modules"
              value={selectedReportMainModule || ""}
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
                      name="selectAllReports"
                      checked={selectAllReportChecked}
                      onChange={handleSelectAllReportChange}
                      isMandatory={false}
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
                      <CustomCheckbox
                        label=""
                        name={`reportpermission_${permission.reportID}`}
                        checked={permission.allow}
                        onChange={(event) =>
                          handleReportPermissionChange(
                            permission.reportID,
                            event.target.checked,

                          )
                        }
                        isMandatory={false}
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

export default OperationPermissionDetails;
