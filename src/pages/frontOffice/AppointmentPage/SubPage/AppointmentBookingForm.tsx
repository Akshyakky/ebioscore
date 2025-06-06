import CustomButton from "@/components/Button/CustomButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/FormField/FormField";
import useDayjs from "@/hooks/Common/useDateTime";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import PatientDemographics from "@/pages/patientAdministration/CommonPage/Demograph/PatientDemographics";
import { AppModifyListService } from "@/services/NotGenericPaternServices/AppModifyListService";
import { ConstantValues } from "@/services/NotGenericPaternServices/ConstantValuesService";
import { AppointmentService } from "@/services/NotGenericPaternServices/AppointmentService";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import { Box, Grid } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "@/hooks/Common/useLoading";

interface AppointmentBookingFormProps {
  onChange: (name: keyof AppointBookingDto, value: any) => void;
  formData: AppointBookingDto;
  reasonOptions: DropdownOption[];
  resourceOptions: DropdownOption[];
  hpID?: number;
  rlID?: number;
  rLotYN?: string;
}

interface ConsultantRole {
  siNo: number;
  consultantName: string;
  role: string;
}

const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({ onChange, formData, reasonOptions, resourceOptions, rLotYN, hpID, rlID }) => {
  const { date: serverDate, formatTime, formatDateYMD, formatISO } = useDayjs(useServerDate());
  const registrationOptions = [
    { value: "Y", label: "Registered" },
    { value: "N", label: "Non Registered" },
  ];
  const [cityOptions, setCityOptions] = useState<DropdownOption[]>([]);
  const [titleOptions, setTitleOptions] = useState<DropdownOption[]>([]);
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const { setLoading } = useLoading();
  const [consultants, setConsultants] = useState<ConsultantRole[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [selectedRole, setSelectedRole] = useState<DropdownOption | null>(null);
  const dropdownValues = useDropdownValues(["consultantRole"]);
  const [consultantSuggestions, setConsultantSuggestions] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    const loadDropdownValues = async () => {
      try {
        const [titleValues, cityValues] = await Promise.all([
          ConstantValues.fetchConstantValues("GetConstantValues", "PTIT"),
          AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "CITY"),
        ]);

        setTitleOptions(
          titleValues.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );

        setCityOptions(
          cityValues.map((item) => ({
            value: String(item.value),
            label: item.label,
          }))
        );
      } catch (error) {
        console.error("Error loading dropdown values:", error);
      }
    };

    loadDropdownValues();
  }, []);

  const handleDurationBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target instanceof HTMLInputElement) {
      const inputValue = e.target.value.trim();
      if (inputValue === "") {
        onChange("abDuration", 15);
        return;
      }
      const numericValue = parseInt(inputValue, 10);
      if (isNaN(numericValue)) {
        onChange("abDuration", 15);
        return;
      }
      let roundedValue = Math.round(numericValue / 15) * 15;
      roundedValue = Math.max(15, Math.min(roundedValue, 480));
      onChange("abDuration", roundedValue);
    }
  };

  const handleAddConsultant = useCallback(() => {
    if (selectedConsultant && selectedRole) {
      setConsultants((prev) => [
        ...prev,
        {
          siNo: prev.length + 1,
          consultantName: selectedConsultant,
          role: selectedRole.label,
          roleId: selectedRole.value,
        },
      ]);
      setSelectedConsultant("");
      setSelectedRole(null);
    }
  }, [selectedConsultant, selectedRole]);

  const handleRemoveConsultant = useCallback((siNo: number) => {
    setConsultants((prev) => prev.filter((c) => c.siNo !== siNo));
  }, []);

  const columns: Column<ConsultantRole>[] = [
    { key: "siNo", header: "SI No.", visible: true, sortable: true },
    { key: "consultantName", header: "Consultant Name", visible: true, sortable: true },
    { key: "role", header: "Role", visible: true, sortable: true },
    {
      key: "delete",
      header: "Delete",
      visible: true,
      render: (item) => (
        <CustomButton
          variant="outlined"
          size="small"
          icon={DeleteIcon}
          onClick={() => handleRemoveConsultant(item.siNo)}
          color="error"
          ariaLabel={`Delete consultant ${item.consultantName}`}
        />
      ),
    },
  ];

  const isNonRegistered = formData.patRegisterYN === "N";

  const handlePatientSelect = useCallback(
    async (pChartID: number | null) => {
      if (pChartID === null) {
        console.error("Invalid pChartID: null");
        return; // Exit the function if pChartID is null
      }
      setLoading(true);
      try {
        const patientDetails = await PatientService.getPatientDetails(pChartID);
        if (patientDetails.success && patientDetails.data) {
          const patientData: PatientRegistrationDto = patientDetails.data;
          onChange("pChartID", patientData.patRegisters.pChartID);
          onChange("pChartCode", patientData.patRegisters.pChartCode);
          onChange("abFName", patientData.patRegisters.pFName || "");
          onChange("abLName", patientData.patRegisters.pLName || "");
          onChange("atName", patientData.patRegisters.pTitle || "");
          onChange("dob", patientData.patRegisters.pDob || "");
          onChange("indentityValue", patientData.patRegisters.indentityValue || "");
          onChange("intIdPsprt", patientData.patRegisters.intIdPsprt || "");
          onChange("appPhone1", patientData.patAddress.pAddPhone1 || "");
          onChange("email", patientData.patAddress.pAddEmail || "");
          onChange("city", patientData.patAddress.pAddCity || "");
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
        // You might want to show an error message to the user here
      } finally {
        setLoading(false);
      }
    },
    [onChange, setLoading]
  );

  const handleFetchConsultantSuggestions = useCallback(async (input: string) => {
    try {
      const result = await AppointmentService.fetchAppointmentConsultants();
      if (result && result.success) {
        let items = result.data || [];
        items = items.filter((item) => item.rActiveYN === "Y");
        const suggestions = items.map((item) => ({
          label: item.conFName,
          value: item.conID,
        }));
        setConsultantSuggestions(suggestions);
        return suggestions.map((s) => s.label).filter((label) => label.toLowerCase().includes(input.toLowerCase()));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch consultant suggestions", error);
      return [];
    }
  }, []);

  const handleDateChange = (name: keyof AppointBookingDto) => (date: Date | null) => {
    onChange(name, date);
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "8px", width: "100%" }}>
      <FormField
        type="radio"
        label="Registration Status"
        name="patRegisterYN"
        ControlID="patRegisterYN"
        value={formData.patRegisterYN}
        options={registrationOptions}
        onChange={(e, value) => onChange("patRegisterYN", value)}
        isMandatory={true}
        gridProps={{ xs: 12 }}
        inline={true}
      />

      {isNonRegistered && (
        <>
          <FormField
            type="select"
            label="Title"
            name="atName"
            ControlID="atName"
            value={formData.atName}
            options={titleOptions}
            onChange={(e) => onChange("atName", e.target.value)}
            isMandatory={true}
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="text"
            label="First Name"
            ControlID="abFName"
            value={formData.abFName}
            name="abFName"
            onChange={(e) => onChange("abFName", e.target.value)}
            isMandatory={true}
            gridProps={{ xs: 6 }}
          />
          <FormField
            type="text"
            label="Last Name"
            ControlID="abLName"
            value={formData.abLName}
            name="abLName"
            onChange={(e) => onChange("abLName", e.target.value)}
            isMandatory={true}
            gridProps={{ xs: 6 }}
          />
          <FormField
            type="text"
            label="Aadhaar No."
            ControlID="pssnId"
            value={formData.pssnId}
            name="pssnId"
            onChange={(e) => onChange("pssnId", e.target.value)}
            gridProps={{ xs: 6 }}
          />
          <FormField
            type="text"
            label="Int. ID/Passport ID"
            ControlID="intIdPsprt"
            value={formData.intIdPsprt}
            name="intIdPsprt"
            onChange={(e) => onChange("intIdPsprt", e.target.value)}
            gridProps={{ xs: 6 }}
          />
          <FormField
            type="datepicker"
            label="DOB"
            ControlID="dob"
            value={formData.dob}
            name="dob"
            onChange={handleDateChange("dob")}
            minDate={new Date(1900, 0, 1)}
            maxDate={new Date()}
            gridProps={{ xs: 6 }}
          />
          <FormField
            type="text"
            label="Contact No."
            ControlID="appPhone1"
            value={formData.appPhone1}
            name="appPhone1"
            onChange={(e) => onChange("appPhone1", e.target.value)}
            isMandatory={true}
            gridProps={{ xs: 6 }}
          />
          <FormField type="email" label="Email" ControlID="email" value={formData.email} name="email" onChange={(e) => onChange("email", e.target.value)} gridProps={{ xs: 6 }} />
          <FormField
            type="select"
            label="City"
            name="city"
            ControlID="city"
            value={formData.city}
            options={cityOptions}
            onChange={(e) => onChange("city", e.target.value)}
            gridProps={{ xs: 6 }}
          />
        </>
      )}

      {!isNonRegistered && (
        <FormField
          type="autocomplete"
          label="UHID No."
          ControlID="pChartCode"
          value={formData.pChartCode}
          name="pChartCode"
          placeholder="UHID, Name, DOB, Phone No"
          isMandatory={true}
          onChange={(e) => onChange("pChartCode", e.target.value)}
          fetchSuggestions={fetchPatientSuggestions}
          onSelectSuggestion={(suggestion) => {
            const pChartCode = suggestion.split("|")[0].trim();
            onChange("pChartCode", pChartCode);

            const numbersArray = extractNumbers(pChartCode);
            const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
            onChange("pChartID", pChartID);
            handlePatientSelect(pChartID);
          }}
          gridProps={{ xs: 12 }}
        />
      )}
      {formData.pChartID !== 0 && <PatientDemographics pChartID={formData.pChartID} />}
      {rLotYN === "N" && (
        <FormField
          type="select"
          label="Consultant"
          name="hplID"
          ControlID="hplID"
          value={formData.hplID.toString()}
          options={reasonOptions}
          onChange={(e) => {
            const selectedOption = reasonOptions.find((option) => option.value === e.target.value);
            onChange("hplID", parseInt(selectedOption?.value || "0", 10));
            onChange("providerName", selectedOption?.label || "");
          }}
          isMandatory={true}
          gridProps={{ xs: 12 }}
        />
      )}

      {rLotYN !== "Y" && hpID !== undefined && hpID > 0 && (
        <FormField
          type="select"
          label="Resource"
          name="rlID"
          ControlID="rlID"
          value={formData.rlID.toString()}
          options={resourceOptions}
          onChange={(e) => {
            const selectedOption = resourceOptions.find((option) => option.value === e.target.value);
            onChange("rlID", parseInt(selectedOption?.value || "0", 10));
            onChange("rlName", selectedOption?.label || "");
          }}
          isMandatory={true}
          gridProps={{ xs: 12 }}
        />
      )}

      <FormField
        type="select"
        label="Reason"
        name="arlID"
        ControlID="arlID"
        value={formData.arlID?.toString()}
        options={reasonOptions}
        onChange={(e) => {
          const selectedOption = reasonOptions.find((option) => option.value === e.target.value);
          onChange("arlID", parseInt(selectedOption?.value || "0", 10));
          onChange("arlName", selectedOption?.label || "");
        }}
        isMandatory={true}
        gridProps={{ xs: 12 }}
      />

      <FormField
        type="text"
        label="Instruction"
        ControlID="arlInstructions"
        value={formData.arlInstructions}
        name="arlInstructions"
        onChange={(e) => onChange("arlInstructions", e.target.value)}
        gridProps={{ xs: 12 }}
      />

      <Grid container spacing={2}>
        <FormField
          type="datepicker"
          label="Appointment Date"
          ControlID="abDate"
          value={formData.abDate}
          name="abDate"
          onChange={handleDateChange("abDate")}
          isMandatory={true}
          disabled={true}
          gridProps={{ xs: 6 }}
        />

        <FormField
          type="text"
          label="Appointment Time"
          ControlID="abTime"
          value={formatTime(formData.abTime)}
          name="abTime"
          onChange={(e) => onChange("abTime", e.target.value)}
          isMandatory={true}
          disabled={true}
          gridProps={{ xs: 6 }}
        />
      </Grid>

      <FormField
        type="number"
        label="Appointment Duration (minutes)"
        ControlID="abDuration"
        value={formData.abDuration}
        name="abDuration"
        onChange={(e) => onChange("abDuration", parseInt(e.target.value, 10))}
        onBlur={handleDurationBlur}
        isMandatory={true}
        min={15}
        max={480}
        step={15}
        gridProps={{ xs: 12 }}
      />

      <FormField
        type="textarea"
        label="Remarks"
        ControlID="rNotes"
        value={formData.rNotes || ""}
        name="rNotes"
        onChange={(e) => onChange("rNotes", e.target.value)}
        gridProps={{ xs: 12 }}
        maxLength={250}
      />
      {rLotYN === "Y" && (
        <>
          <Grid container spacing={2}>
            <FormField
              type="autocomplete"
              label="Search Consultant"
              ControlID="searchConsultant"
              value={selectedConsultant}
              name="searchConsultant"
              onChange={(e) => setSelectedConsultant(e.target.value)}
              fetchSuggestions={handleFetchConsultantSuggestions}
              onSelectSuggestion={(suggestion) => setSelectedConsultant(suggestion)}
              gridProps={{ xs: 6 }}
            />

            <FormField
              type="select"
              label="Role"
              name="consultantRole"
              ControlID="consultantRole"
              value={selectedRole?.value || ""}
              options={dropdownValues.consultantRole || []}
              onChange={(e) => {
                const selected = dropdownValues.consultantRole?.find((role) => role.value === e.target.value);
                setSelectedRole(selected || null);
              }}
              gridProps={{ xs: 6 }}
            />
          </Grid>

          <Box sx={{ mt: 2, mb: 2 }}>
            <CustomButton
              variant="contained"
              size="medium"
              icon={AddIcon}
              text="Add Consultant"
              onClick={handleAddConsultant}
              disabled={!selectedConsultant || !selectedRole}
              color="primary"
              ariaLabel="Add consultant to the list"
            />
          </Box>

          <CustomGrid columns={columns} data={consultants} maxHeight="300px" />
        </>
      )}
    </Box>
  );
};

export default AppointmentBookingForm;
