import React from "react";
import FormField from "../../../../components/FormField/FormField";
import { Grid } from "@mui/material";
import { ChargeDetailsDto } from "@/interfaces/Billing/BChargeDetails";

interface ChargeBasicDetailsProps {
  formData: ChargeDetailsDto;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (e: any) => void;
  handleSwitchChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCodeSelect: (selectedSuggestion: any) => void;
  fetchChargeCodeSuggestions: (searchTerm: string) => Promise<any[]>;
  selectedFacultyIds: string[];
  handleFacultyChange: (e: any) => void;
  dropdownValues: any;
  serviceGroups: any[];
  isSubmitted: boolean;
  handleDateChange: (date: Date | null, type: "scheduleDate" | "") => void;
  updateChargeCode: (value: string) => void;
}
const ChargeBasicDetails: React.FC<ChargeBasicDetailsProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleSwitchChange,
  handleCodeSelect,
  fetchChargeCodeSuggestions,
  selectedFacultyIds,
  handleFacultyChange,
  dropdownValues,
  isSubmitted,
  handleDateChange,
  updateChargeCode,
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <FormField
            ControlID="chargeCode"
            label="Code"
            name="chargeCode"
            type="autocomplete"
            placeholder="Search or select a charge code"
            value={formData.chargeInfo.chargeCode || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = e.target;
              updateChargeCode(value);
            }}
            fetchSuggestions={fetchChargeCodeSuggestions}
            onSelectSuggestion={handleCodeSelect}
            isMandatory={true}
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
            isMandatory={true}
            isSubmitted={isSubmitted}
          />
          <FormField
            type="text"
            label="Name"
            value={formData.chargeInfo.chargeDesc}
            onChange={handleInputChange}
            name="chargeDesc"
            ControlID="chargeDesc"
            isMandatory={true}
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
            value={formData.chargeInfo.sGrpID}
            onChange={handleSelectChange}
            name="sGrpID"
            ControlID="sGrpID"
            options={dropdownValues.service || []}
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
            value={formData.chargeInfo.cNhsCode}
            onChange={handleInputChange}
            name="cNhsCode"
            ControlID="cNhsCode"
            isSubmitted={isSubmitted}
          />
          <FormField
            type="text"
            label="Resource Name"
            value={formData.chargeInfo.cNhsEnglishName}
            onChange={handleInputChange}
            name="cNhsEnglishName"
            ControlID="cNhsEnglishName"
            isSubmitted={isSubmitted}
          />
          <FormField
            type="datepicker"
            label="Schedule Date"
            value={formData.chargeInfo.scheduleDate}
            onChange={(date: Date | null) => handleDateChange(date, "scheduleDate")}
            name="scheduleDate"
            ControlID="scheduleDate"
            isSubmitted={isSubmitted}
          />
        </Grid>

        <Grid container spacing={2}>
          <FormField
            type="switch"
            label="Is Package"
            value={formData.chargeInfo.chargeBreakYN || ""}
            checked={formData.chargeInfo.chargeBreakYN === "Y"}
            onChange={handleSwitchChange("chargeBreakYN")}
            name="chargeBreakYN"
            ControlID="chargeBreakYN"
          />

          <FormField
            type="switch"
            label="Apply Doctor % Share"
            value={formData.chargeInfo.doctorShareYN || ""}
            checked={formData.chargeInfo.doctorShareYN === "Y"} // Checked if "Y"
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
