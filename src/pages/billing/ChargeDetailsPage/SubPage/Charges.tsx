import React from "react";
import { Grid } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";

interface ChargeBasicDetailsProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (e: any) => void;
  handleSwitchChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFacultyIds: string[];
  handleFacultyChange: (e: any) => void;
  dropdownValues: any;
  serviceGroups: any[];
  isSubmitted: boolean;
}

const ChargeBasicDetails: React.FC<ChargeBasicDetailsProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleSwitchChange,
  selectedFacultyIds,
  handleFacultyChange,
  dropdownValues,
  serviceGroups,
  isSubmitted,
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <FormField
            type="text"
            label="Code"
            value={formData.chargeInfo.chargeCode}
            onChange={handleInputChange}
            name="chargeCode"
            ControlID="chargeCode"
            placeholder="SOC Code"
            isMandatory
            isSubmitted={isSubmitted}
          />
          <FormField
            type="select"
            label="Service Type"
            value={formData.chargeInfo.chargeType}
            onChange={handleSelectChange}
            name="chargeType"
            ControlID="chargeType"
            options={dropdownValues.service || []}
            isMandatory
            isSubmitted={isSubmitted}
          />
          <FormField
            type="text"
            label="Name"
            value={formData.chargeInfo.chargeDesc}
            onChange={handleInputChange}
            name="chargeDesc"
            ControlID="chargeDesc"
            isMandatory
            isSubmitted={isSubmitted}
          />
          <FormField
            type="multiselect"
            label="Faculty"
            name="faculties"
            ControlID="faculties"
            value={selectedFacultyIds}
            options={dropdownValues.speciality || []}
            onChange={handleFacultyChange}
            isSubmitted={isSubmitted}
          />
          <FormField
            type="select"
            label="Service Group"
            value={formData.chargeInfo.sGrpID.toString()}
            onChange={handleSelectChange}
            name="sGrpID"
            ControlID="sGrpID"
            options={serviceGroups}
            isSubmitted={isSubmitted}
          />
          <FormField
            type="text"
            label="Short Name"
            value={formData.chargeInfo.cShortName}
            onChange={handleInputChange}
            name="cShortName"
            ControlID="cShortName"
            isSubmitted={isSubmitted}
          />
          <FormField
            type="number"
            label="Cost"
            value={formData.chargeInfo.chargeCost || ""}
            onChange={handleInputChange}
            name="chargeCost"
            ControlID="chargeCost"
            isSubmitted={isSubmitted}
          />
          <FormField
            type="text"
            label="Resource Code"
            value={formData.chargeInfo.cNhsCode || ""}
            onChange={handleInputChange}
            name="cNhsCode"
            ControlID="cNhsCode"
            isSubmitted={isSubmitted}
          />
          <FormField
            type="text"
            label="Resource Name"
            value={formData.chargeInfo.cNhsEnglishName || ""}
            onChange={handleInputChange}
            name="cNhsEnglishName"
            ControlID="cNhsEnglishName"
            isSubmitted={isSubmitted}
          />
        </Grid>
        <Grid container spacing={2}>
          <FormField
            type="switch"
            label="Is Package"
            value={formData.chargeInfo.regServiceYN || ""}
            checked={formData.chargeInfo.regServiceYN === "Y"}
            onChange={handleSwitchChange("regServiceYN")}
            name="regServiceYN"
            ControlID="regServiceYN"
          />
          <FormField
            type="switch"
            label="Apply Doctor % Share"
            value={formData.chargeInfo.doctorShareYN || ""}
            checked={formData.chargeInfo.doctorShareYN === "Y"}
            onChange={handleSwitchChange("doctorShareYN")}
            name="doctorShareYN"
            ControlID="doctorShareYN"
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
export default ChargeBasicDetails;
