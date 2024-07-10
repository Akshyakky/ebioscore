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
  saveModulePermission: (permissions: OperationPermissionDetailsDto) => void;
  saveReportPermission: (permissions: OperationPermissionDetailsDto) => void;
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

  const [selectedReportMainModule, setSelectedReportMainModule] =
    useState<string>("");
  const [permissions, setPermissions] = useState<ModuleOperation[]>([]);
  const [reportPermissions, setReportPermissions] = useState<
    ReportPermission[]
  >([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectAllReportChecked, setSelectAllReportChecked] = useState(false);
  const [isSubmitted] = useState(false);

  const getInitialProfileDetailsDropdownsState =
    (): ProfileDetailsDropdowns => ({
      mainModuleID: "0",
      mainModuleName: "",
      subModuleID: "0",
      subModuleName: "",
      repMainModuleID: "0",
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
      if (
        profileDetailsDropdowns.mainModuleID &&
        profileDetailsDropdowns.subModuleID &&
        token
      ) {
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
              reportPermissionsOptions: (reportPermissionsData.data ?? []).map(
                (permission) => ({
                  label: permission.operationName,
                  value: permission.operationID.toString(),
                })
              ),
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
            (subModule) =>
              subModule.auGrpID.toString() ===
              profileDetailsDropdowns.mainModuleID
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
          setReportPermissions([]);
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

  const handlePermissionChange = async (
    
    permissionID: number,
    allow: boolean
  ) => {
    let existingPermission = permissions.find(
      (permission) => permission.operationID === permissionID
    );
    // debugger
    if (existingPermission) {
      existingPermission.allow = allow;
    }
  
    setPermissions([...permissions]);
 
    if (profileID) {
      const rActiveYN = allow ==true? "Y" : "N";
      const allowYN=allow==true?"Y":"N"
       // Set rActiveYN based on allow value
  
      const profileDetail: OperationPermissionDetailsDto = {
        profDetID: existingPermission?.profDetID || 0,
        profileID: profileID,
        profileName: profileName,
        aOPRID: permissionID,
        compID: compID!,
        rActiveYN: rActiveYN, // Pass correct rActiveYN value here
        rNotes: "",
        reportYN: "N",
        repID: permissionID, 
        auAccessID: 0,
        appID: 0,
        appUName: "",
        allowYN: allowYN,
        rCreatedID: 0,
        rCreatedBy: "",
        rCreatedOn: "",
        rModifiedID: 0,
        rModifiedBy: "",
        rModifiedOn: "",
        compCode: "",
        compName: "",
      };
  
      saveModulePermission(profileDetail);
    }
  };
  






  //  const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { checked } = event.target;
  //   setPermissions(
  //     permissions.map((permission) => ({
  //       ...permission,
  //       allow: checked,
  //     }))
  //   );
  //   setSelectAllChecked(checked);

  //   permissions.forEach((permission) => {
  //     handlePermissionChange(permission.operationID, checked);
  //   });
  // };




  

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

    if (profileID) {
      const profileDetail: OperationPermissionDetailsDto = {
        profDetID: existingReportPermission?.profDetID || 0,
        profileID: profileID,
        profileName: profileName,
        aOPRID: reportID,
        compID: compID!,
        rActiveYN: allow==true ? "Y" : "N",
        rNotes: "",
        reportYN: "N",
        repID: reportID,
        auAccessID: 0,
        appID: 0,
        appUName: "",
        allowYN:allow==true ? "Y" : "N",
        rCreatedID: 0,
        rCreatedBy: "",
        rCreatedOn: "",
        rModifiedID: 0,
        rModifiedBy: "",
        rModifiedOn: "",
        compCode: "",
        compName: "",
      };
      saveReportPermission(profileDetail);
    }
  };





  // For Report Permission Details
  const handleSelectAllReportChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const allow = event.target.checked;
  
    // Update reportPermissions state to reflect the new 'allow' value for all permissions
    const updatedReportPermissions = reportPermissions.map((permission) => ({
      ...permission,
      allow,
    }));
  
    setReportPermissions(updatedReportPermissions);
    setSelectAllReportChecked(allow); // Update local state with updated permissions
  
    if (profileID) {
      try {
        // Create an array of profile details to save/update
        const profileDetails: OperationPermissionDetailsDto[] = updatedReportPermissions.map(
          (permission) => ({
            profDetID: permission.profDetID || 0,
            profileID: profileID,
            profileName: profileName,
            aOPRID: permission.reportID,
            compID: compID!,
            rActiveYN: allow==true ? "Y" : "N", // Set rActiveYN based on 'allow' value
            rNotes: "",
            reportYN: "N",
            repID: permission.reportID,
            auAccessID: 0,
            appID: 0,
            appUName: "",
            allowYN: allow ? "Y" : "N", // Set allowYN based on 'allow' value
            rCreatedID: 0,
            rCreatedBy: "",
            rCreatedOn: "",
            rModifiedID: 0,
            rModifiedBy: "",
            rModifiedOn: "",
            compCode: "",
            compName: "",
          })
        );
  
        // Save each profile detail
        for (const detail of profileDetails) {
          await saveReportPermission(detail);
        }
      } catch (error) {
        console.error("Error saving report permissions:", error);
      }
    }
  };
  




  // For Module Permission Details 

  const handleSelectAllChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const allow = event.target.checked;
  
    // Update permissions state to reflect the new 'allow' value for all permissions
    const updatedPermissions = permissions.map(permission => ({
      ...permission,
      allow: allow,
    }));
  
    setPermissions(updatedPermissions);
    setSelectAllChecked(allow);
  
    if (profileID) {
      try {
        // Create an array of profile details to save/update
        const profileDetails: OperationPermissionDetailsDto[] = updatedPermissions.map(permission => ({
          profDetID: permission.profDetID || 0,
          profileID: profileID,
          profileName: profileName,
          aOPRID: permission.operationID,
          compID: compID!,
          rActiveYN: allow ==true? "Y" : "N", // Set rActiveYN based on 'allow' value
          rNotes: "",
          reportYN: "N",
          repID: permission.operationID,
          auAccessID: 0,
          appID: 0,
          appUName: "",
          allowYN: allow ? "Y" : "N", // Set allowYN based on 'allow' value
          rCreatedID: 0,
          rCreatedBy: "",
          rCreatedOn: "",
          rModifiedID: 0,
          rModifiedBy: "",
          rModifiedOn: "",
          compCode: "",
          compName: "",
        }));
  
        // Use retry logic to attempt saving/updating multiple times
        let retryCount = 3;
        let success = false;
        while (retryCount > 0 && !success) {
          try {
            for (const detail of profileDetails) {
              await saveModulePermission(detail);
            }
            success = true; // Mark success if all operations complete without error
          } catch (error) {
            console.error(`Error saving permissions: ${error}`);
            retryCount--;
            // Optionally add delay before retrying
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          }
        }
  
        if (!success) {
          console.error(`Failed to save permissions after retries.`);
          // Handle failure case, possibly notify the user or take corrective action
        }
      } catch (error) {
        console.error("Error saving permissions:", error);
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
      reportPermissionsOptions: [],
    }));
    setProfileDetailsDropdowns(getInitialProfileDetailsDropdownsState());
  };

  const handleReportPermissionClear = () => {
    setReportPermissions([]);
    setSelectAllReportChecked(false);
    setSelectAllChecked(false)
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
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
              Report Permissions
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
                        name={`allow_report_${permission.reportID}`}
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
