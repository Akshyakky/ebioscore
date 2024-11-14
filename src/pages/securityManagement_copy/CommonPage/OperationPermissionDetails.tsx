import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, SelectChangeEvent } from "@mui/material";
import { DropdownOption } from "../../../interfaces/Common/DropdownOption";
import moduleService from "../../../services/CommonServices/ModuleService";
import { notifyError } from "../../../utils/Common/toastManager";
import { ProfileDetailsDropdowns, ReportPermission } from "../../../interfaces/SecurityManagement/ProfileListData";
import useDropdownChange from "../../../hooks/useDropdownChange";
import { ProfileService } from "../../../services/SecurityManagementServices/ProfileListServices";
import { OperationPermissionDetailsDto } from "../../../interfaces/SecurityManagement/OperationPermissionDetailsDto";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import FormField from "../../../components/FormField/FormField";
import PermissionSection from "./PermissionSection";
import { useAppSelector } from "@/store/hooks";

interface OperationPermissionProps {
  profileID: number;
  profileName: string;
  saveModulePermission: (permissions: OperationPermissionDetailsDto) => Promise<void>;
  saveReportPermission: (permissions: OperationPermissionDetailsDto) => Promise<void>;
  permissions: ModuleOperation[];
  setPermissions: React.Dispatch<React.SetStateAction<ModuleOperation[]>>;
}

export interface ModuleOperation {
  profDetID?: number;
  operationID: number;
  operationName: string;
  allow: boolean;
  auAccessID?: number;
  reportYN: boolean;
}

const OperationPermissionDetails: React.FC<OperationPermissionProps> = ({ profileID, profileName, saveModulePermission, saveReportPermission, permissions, setPermissions }) => {
  const { token, compID, userID, adminYN } = useAppSelector((state) => state.auth);

  const [dropdownValues, setDropdownValues] = useState({
    mainModulesOptions: [] as DropdownOption[],
    subModulesOptions: [] as DropdownOption[],
    reportMainModulesOptions: [] as DropdownOption[],
    reportPermissionsOptions: [] as DropdownOption[],
  });

  const [selectedReportMainModule, setSelectedReportMainModule] = useState<string>("");
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

  const [profileDetailsDropdowns, setProfileDetailsDropdowns] = useState<ProfileDetailsDropdowns>(getInitialProfileDetailsDropdownsState());

  const { handleDropdownChange } = useDropdownChange<ProfileDetailsDropdowns>(setProfileDetailsDropdowns);

  useEffect(() => {
    const fetchMainModules = async () => {
      if (token) {
        try {
          const modulesData = await moduleService.getActiveModules(adminYN === "Y" ? 0 : (userID ?? 0));
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
          const modulePermissionsData: OperationResult<ModuleOperation[]> = await ProfileService.getProfileModuleOperations(
            parseInt(profileDetailsDropdowns.subModuleID),
            parseInt(profileDetailsDropdowns.mainModuleID),
            profileID
          );
          if (modulePermissionsData.success && modulePermissionsData.data) {
            setPermissions((prevPermissions) => [
              ...prevPermissions.filter((permission) => permission.reportYN),
              ...(modulePermissionsData.data ?? []).map((permission: ModuleOperation) => ({
                ...permission,
                reportYN: false,
              })),
            ]);
          } else {
            notifyError("Error fetching module permissions");
          }
        } catch (error) {
          notifyError("Error fetching module permissions");
        }
      }
    };
    fetchPermissions();
  }, [profileDetailsDropdowns.subModuleID, profileDetailsDropdowns.mainModuleID, token, profileID]);

  const fetchReportPermissions = async () => {
    if (selectedReportMainModule && token) {
      try {
        const reportPermissionsData: OperationResult<ReportPermission[]> = await ProfileService.getProfileReportOperations(parseInt(selectedReportMainModule), compID!, profileID);
        if (reportPermissionsData.success && reportPermissionsData.data) {
          setPermissions((prevPermissions) => [
            ...prevPermissions.filter((permission) => !permission.reportYN),
            ...(reportPermissionsData.data ?? []).map((permission: ReportPermission) => ({
              profDetID: permission.profDetID,
              operationID: permission.reportID,
              operationName: permission.reportName,
              allow: permission.allow,
              auAccessID: permission.apAccessID,
              reportYN: true,
            })),
          ]);
        } else {
          notifyError("Error fetching report permissions");
        }
      } catch (error) {
        notifyError("Error fetching report permissions");
      }
    }
  };
  useEffect(() => {
    fetchReportPermissions();
  }, [selectedReportMainModule, token, compID, profileID]);

  useEffect(() => {
    const fetchSubModules = async () => {
      if (profileDetailsDropdowns.mainModuleID && token) {
        try {
          const subModulesData = await moduleService.getActiveSubModules(adminYN === "Y" ? 0 : (userID ?? 0));
          const filteredSubModules = subModulesData.filter((subModule) => subModule.auGrpID.toString() === profileDetailsDropdowns.mainModuleID);
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
    const updatedPermissions = permissions.map((permission) => (permission.operationID === operationID ? { ...permission, allow } : permission));
    setPermissions(updatedPermissions);

    if (profileID) {
      try {
        const existingPermission = updatedPermissions.find((permission) => permission.operationID === operationID);
        if (!existingPermission) {
          throw new Error("Permission not found");
        }

        const profileDetail: OperationPermissionDetailsDto = {
          ...existingPermission,
          profDetID: existingPermission.profDetID,
          profileID: profileID,
          profileName: profileName,
          aOPRID: operationID,
          compID: compID!,
          rActiveYN: allow ? "Y" : "N",
          rNotes: "",
          reportYN: existingPermission.reportYN ? "Y" : "N",
          repID: existingPermission.reportYN ? operationID : 0,
          auAccessID: existingPermission.auAccessID ?? 0,
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
          compName: "",
        };

        if (existingPermission.reportYN) {
          await saveReportPermission(profileDetail);
        } else {
          await saveModulePermission(profileDetail);
        }
      } catch (error) {
        notifyError("Error updating permissions");
      }
    }
  };

  const handleReportPermissionChange = async (reportID: number, allow: boolean) => {
    const updatedReportPermissions = permissions.map((permission) => (permission.operationID === reportID ? { ...permission, allow } : permission));
    setPermissions(updatedReportPermissions);

    if (profileID) {
      try {
        const existingReportPermission = updatedReportPermissions.find((permission) => permission.operationID === reportID);
        if (!existingReportPermission) {
          throw new Error("Report permission not found");
        }

        const reportDetail: OperationPermissionDetailsDto = {
          ...existingReportPermission,
          profDetID: existingReportPermission.profDetID,
          profileID: profileID,
          profileName: profileName,
          aOPRID: existingReportPermission.operationID,
          compID: compID!,
          rActiveYN: allow ? "Y" : "N",
          rNotes: "",
          reportYN: "Y",
          repID: reportID,
          auAccessID: existingReportPermission.auAccessID ?? 0,
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
          compName: "",
        };

        await saveReportPermission(reportDetail);
      } catch (error) {
        console.error("Error updating report permissions:", error);
        notifyError("Error updating report permissions");
      }
    }
  };

  const handleSelectAllChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked: boolean = event.target.checked;

    // Update permissions in state first to reflect the UI changes immediately
    const updatedPermissions = permissions.map((permission) => ({
      ...permission,
      allow: !permission.reportYN ? checked : permission.allow,
    }));
    setPermissions(updatedPermissions);
    setSelectAllChecked(checked);

    // Then, update the database
    try {
      for (const permission of updatedPermissions.filter((p) => !p.reportYN)) {
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
          auAccessID: permission.auAccessID ?? 0,
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
      console.error("Error saving all module permissions:", error);
      notifyError("Error saving all module permissions");
    }
  };

  const handleSelectAllReportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked: boolean = event.target.checked;

    const updatedReportPermissions = permissions.map((permission) => ({
      ...permission,
      allow: !permission.reportYN ? checked : permission.allow,
    }));

    setSelectAllReportChecked(checked);
    setPermissions(updatedReportPermissions);

    try {
      for (const permission of updatedReportPermissions.filter((p) => p.reportYN)) {
        const profileDetail: OperationPermissionDetailsDto = {
          profDetID: permission.profDetID!,
          profileID: profileID,
          profileName: profileName,
          aOPRID: permission.operationID,
          compID: compID!,
          rActiveYN: checked ? "Y" : "N",
          rNotes: "",
          reportYN: "Y",
          repID: permission.operationID,
          auAccessID: permission.auAccessID ?? 0,
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
  };

  const handleClear = () => {
    setPermissions([]);
    setSelectedReportMainModule("");
    setDropdownValues((prevValues) => ({
      ...prevValues,
      subModulesOptions: [],
      reportPermissionsOptions: [],
    }));
    setProfileDetailsDropdowns(getInitialProfileDetailsDropdownsState());
  };

  const handleReportPermissionClear = () => {
    setSelectedReportMainModule("");
    setPermissions((prevPermissions) => prevPermissions.filter((permission) => !permission.reportYN));
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
              maxHeight: "57vh",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" id="insurance-details-header">
              MODULE PERMISSION
            </Typography>
            <FormField
              type="select"
              label="Main Modules"
              value={profileDetailsDropdowns.mainModuleID || ""}
              onChange={handleDropdownChange(["mainModuleID"], ["mainModuleName"], dropdownValues.mainModulesOptions)}
              options={dropdownValues.mainModulesOptions}
              isSubmitted={isSubmitted}
              name="MainModule"
              ControlID="MainModule"
              isMandatory
            />
            <FormField
              type="select"
              name="SubModule"
              label="Sub Modules"
              value={profileDetailsDropdowns.subModuleID || ""}
              options={dropdownValues.subModulesOptions}
              onChange={handleDropdownChange(["subModuleID"], ["subModuleName"], dropdownValues.subModulesOptions)}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              clearable
              onClear={handleClear}
              ControlID="SubModule"
            />
            {profileDetailsDropdowns.mainModuleID && profileDetailsDropdowns.subModuleID && (
              <PermissionSection
                title="Operation"
                permissions={permissions.filter((permission) => !permission.reportYN)}
                selectAllChecked={selectAllChecked}
                handleSelectAllChange={handleSelectAllChange}
                handlePermissionChange={handlePermissionChange}
              />
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
            <FormField
              type="select"
              label="Report Main Modules"
              value={selectedReportMainModule || ""}
              onChange={handleReportMainModuleChange}
              options={dropdownValues.reportMainModulesOptions}
              isSubmitted={isSubmitted}
              name="ReportMainModules"
              ControlID="ReportMainModules"
              isMandatory
            />

            {selectedReportMainModule && (
              <PermissionSection
                title="Report"
                permissions={permissions.filter((permission) => permission.reportYN)}
                selectAllChecked={selectAllReportChecked}
                handleSelectAllChange={handleSelectAllReportChange}
                handlePermissionChange={handleReportPermissionChange}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </section>
  );
};

export default OperationPermissionDetails;
