import FormField from "@/components/FormField/FormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { ProfileDetailDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { profileListService } from "@/services/SecurityManagementServices/ProfileListServices";
import { Grid, SelectChangeEvent, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

interface ReportListDropDownProps {
  mainModules: DropdownOption[];
  handleGroupChange: (event: SelectChangeEvent<string>) => void;
  label: string;
  groupId: number;
  disabled?: boolean;
}

const ReportListDropDown: React.FC<ReportListDropDownProps> = ({ mainModules, handleGroupChange, label, groupId, disabled = false }) => {
  const dropdownOptions = mainModules.map((report) => ({
    value: report.value.toString(),
    label: report.label,
  }));

  return (
    <FormField
      type="select"
      label={label}
      name={`report-group}`}
      ControlID={`report-group`}
      value={groupId}
      options={dropdownOptions}
      onChange={handleGroupChange}
      disabled={disabled}
      defaultText={`Select ${label}`}
      isMandatory={true}
      size="small"
      gridProps={{ xs: 12, sm: 12, md: 12 }}
    />
  );
};

interface ReportPermissionsListProps {
  reportLists: ProfileDetailDto[];
  selectedPermissions: number[];
  handleReportPermissionChange: (id: number) => void;
  disabled?: boolean;
}

const ReportPermissionsList: React.FC<ReportPermissionsListProps> = ({ reportLists, selectedPermissions, handleReportPermissionChange, disabled = false }) => {
  return (
    <Grid container spacing={2}>
      {reportLists.map((reportList: ProfileDetailDto) => (
        <Grid item xs={12}>
          <FormField
            key={reportList.accessID}
            type="switch"
            label={reportList.accessName}
            name={`permission-${reportList.accessID}`}
            ControlID={`permission-${reportList.accessID}`}
            value={reportList.accessID.toString()}
            checked={selectedPermissions.includes(reportList.accessID)}
            onChange={() => handleReportPermissionChange(reportList.accessID)}
            disabled={disabled}
            gridProps={{ xs: 12 }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

const ReportPermissions: React.FC<{ profileId: number; profileName: string }> = ({ profileId, profileName }) => {
  const [mainModules, setMainModules] = useState<DropdownOption[]>([]);
  const [reportList, setReportList] = useState<ProfileDetailDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [groupId, setGroupId] = useState<number>(0);
  const handleGroupChange = (event: SelectChangeEvent) => {
    const aUGrpId = parseInt(event.target.value);
    setGroupId(aUGrpId);
    console.log("aUGrpId", aUGrpId, 0, 1, profileId, "R");
    fetchProfileReports(aUGrpId, 0, 1, profileId, "R");
  };
  const dropdownValues = useDropdownValues(["mainModules"]);

  useEffect(() => {
    setMainModules(dropdownValues.mainModules || []);
  }, dropdownValues.mainModules);

  async function fetchProfileReports(aUGrpId: number, subID: number, compID: number, profileID: number, profileType: string) {
    if (!aUGrpId) return;
    setIsLoading(true);
    try {
      const result: any = await profileListService.getProfileDetailsByType(aUGrpId, subID, compID, profileID, profileType);
      console.log("result", result);
      setReportList(result.data);
      const selectedReportPermissions = result.data
        .filter((reportPermission: ProfileDetailDto) => reportPermission.rActiveYN === "Y")
        .map((reportPermission: ProfileDetailDto) => reportPermission.accessID);
      setSelectedItems(selectedReportPermissions);
    } catch (error) {
      console.error("Error fetching profile reports:", error);
    } finally {
      setIsLoading(false);
    }
  }
  const handleCheckboxChange = async (id: number) => {
    try {
      const updatedItems = selectedItems.includes(id) ? selectedItems.filter((item) => item !== id) : [...selectedItems, id];

      const updatedReportPermissions: ProfileDetailDto[] = reportList.map((report: ProfileDetailDto) => ({
        ...report,
        profileID: profileId,
        profileName: profileName,
        rActiveYN: updatedItems.includes(report.accessID) ? "Y" : "N",
      }));

      setSelectedItems(updatedItems);
      setReportList(updatedReportPermissions);
      await profileListService.saveProfileDetailsByType(updatedReportPermissions, "R");
    } catch (error) {
      console.error("Error saving permission:", error);
    }
  };
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h3">Report Permissions</Typography>
      </Grid>
      <Grid item xs={12}>
        <ReportListDropDown mainModules={mainModules} handleGroupChange={handleGroupChange} groupId={groupId} label="Reports Groups" disabled={isLoading} />
      </Grid>
      <Grid item xs={12}>
        <ReportPermissionsList reportLists={reportList} selectedPermissions={selectedItems} handleReportPermissionChange={handleCheckboxChange} disabled={isLoading} />
      </Grid>
    </Grid>
  );
};

export default ReportPermissions;
