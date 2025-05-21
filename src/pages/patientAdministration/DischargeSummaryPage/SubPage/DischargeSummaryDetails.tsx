import React, { useState, useCallback } from "react";
import { Grid, SelectChangeEvent } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import { showAlert } from "../../../../utils/Common/showAlert";
import FormSectionWrapper from "../../../../components/FormField/FormSectionWrapper";

import { IpDischargeDetailsDto } from "@/interfaces/PatientAdministration/IpDischargeDetailDto";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import PatientDemographics from "../../CommonPage/Demograph/PatientDemographics";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useForm, Controller } from "react-hook-form";
import { dischargeSummaryService } from "@/services/PatientAdministrationServices/patientAdministrationService";
import { useLoading } from "@/hooks/Common/useLoading";
interface DischargeSummaryDetailsProps {
  onClear?: () => void;
  selectedAdmission?: AdmissionDto;
  onAdmissionSelect?: (admission: AdmissionDto) => void;
}
const initialState = (): IpDischargeDetailsDto => ({
  dischgDetID: 0,
  dischgID: 0,
  dchNotes: "",
  admitDate: new Date(),
  AdviceOnDischarge: "",
  birthHistory: "",
  cheifCompliant: "",
  conditionOnDischarge: "",
  consultantID: 0,
  specialityID: 0,
  speciality: "",
  consultants: "",
  consultant: "",
  courseInHospital: "",
  deliveryDet: "",
  development: "",
  dischgDate: new Date(),
  familyHistory: "",
  finalDiagnosis: "",
  followUp: "",
  history: "",
  immunisation: "",
  intraoperativeFinding: "",
  investigations: "",
  localExam: "",
  menstrualExam: "",
  neonatalDet: "",
  obstericHistory: "",
  otFindings: "",
  pastHistory: "",
  personalHistory: "",
  physicalExam: "",
  postOperTreatment: "",
  procedureDone: "",
  reportDate: new Date(),
  reviewDate: new Date(),
  riskFactor: "",
  systemicExam: "",
  treatmentGiven: "",
  vaccination: "",
});

const DischargeSummaryDetails: React.FC<DischargeSummaryDetailsProps> = ({ onClear, selectedAdmission, onAdmissionSelect }) => {
  const [formState, setFormState] = useState<IpDischargeDetailsDto>(() => initialState());
  const { register, control, setValue } = useForm<IpDischargeDetailsDto>({
    defaultValues: initialState(),
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { setLoading } = useLoading();
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const [isEditing, setIsEditing] = useState(false);
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);
  const handleInputChangeRegister = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValue(name, value); // Update the form state using react-hook-form's setValue
    },
    [setValue]
  );
  const handleInputControllerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValue(name, value); // Update the form state using react-hook-form's setValue
    },
    [setValue]
  );
  const handleDateChange = useCallback((date: Date | null, type: "dischgDate" | "dischgTime") => {
    if (date) {
      setFormState((prev) => ({ ...prev, [type]: date }));
    }
  }, []);

  const handleClear = useCallback(() => {
    setFormState(initialState());
    setIsSubmitted(false);
    setIsEditing(false);
    onClear?.();
  }, [onClear]);

  const handlePatientSelect = useCallback(
    async (pChartID: number | null) => {
      if (!pChartID) return;

      setLoading(true);
      try {
        const result = await extendedAdmissionService.getPatientAdmissionStatus(pChartID);
        if (!result.success) {
          showAlert("Error", result.errorMessage || "Failed to fetch patient status", "error");
          return;
        }

        const { data } = result;

        if (data?.isAdmitted && data.admissionData) {
          onAdmissionSelect?.(data.admissionData);
          const admissionDto = data.admissionData.ipAdmissionDto;

          if (admissionDto) {
            setFormState((prev) => ({
              ...prev,
              pChartID: admissionDto.pChartID,
              admitID: admissionDto.admitID,
              pChartCode: admissionDto.pChartCode || "",
              pTitle: admissionDto.pTitle || "",
              pfName: admissionDto.pfName || "",
              plName: admissionDto.plName || "",
            }));
          }
        } else {
          showAlert("Warning", "Selected patient is not currently admitted", "warning");
          handleClear();
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
        showAlert("Error", "Failed to fetch patient details", "error");
        handleClear();
      } finally {
        setLoading(false);
      }
    },
    [onAdmissionSelect, handleClear]
  );
  const dropdownValues = useDropdownValues(["attendingPhy", "speciality"]);

  const handlePhysicianChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const physicianValue = event.target.value;
      const selectedPhysician = dropdownValues.attendingPhy?.find((phy) => phy.value === physicianValue);

      if (selectedPhysician) {
        const [physicianName, specialty] = selectedPhysician.label.split("|").map((s) => s.trim());
        const specialtyOption = dropdownValues.speciality?.find((opt) => opt.label.trim() === specialty);

        setFormState((prev) => ({
          ...prev,
          dischgPhyID: Number(physicianValue),
          dischgPhyName: physicianName,
          faculty: specialtyOption?.label || prev.faculty,
          facultyID: specialtyOption ? Number(specialtyOption.value) : prev.facultyID,
        }));
      }
    },
    [dropdownValues.attendingPhy, dropdownValues.speciality]
  );
  const handleSave = useCallback(async () => {
    setIsSubmitted(true);
    setLoading(true);
    await dischargeSummaryService.save({ ...formState });
    showAlert("Success", "Medication Form saved successfully!", "success", {
      onConfirm: handleClear,
    });
    setLoading(false);
  }, [formState, dischargeSummaryService, setLoading, handleClear]);

  return (
    <>
      <FormSectionWrapper title="Patient Information" spacing={1}>
        {/* Patient Search with Autocomplete */}
        <FormField
          type="autocomplete"
          label="UHID No."
          value={formState.pChartCode}
          onChange={(e) => setFormState((prev) => ({ ...prev, pChartCode: e.target.value }))}
          name="pChartCode"
          ControlID="pChartCode"
          placeholder="Search by UHID, Name, Mobile"
          isMandatory={true}
          fetchSuggestions={fetchPatientSuggestions}
          onSelectSuggestion={(suggestion) => {
            const pChartCode = suggestion.split("|")[0].trim();
            const numbersArray = extractNumbers(pChartCode);
            const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
            handlePatientSelect(pChartID);
          }}
          gridProps={{ xs: 12, md: 3, lg: 3 }}
        />
        <Grid size={{ xs: 12, sm: 6, md: 9, lg: 9, xl: 9 }}>
          <PatientDemographics pChartID={formState.pChartID} />
        </Grid>
        {selectedAdmission && (
          <Grid container spacing={1} ml={0}>
            <FormField
              type="text"
              label="Case Number"
              value={selectedAdmission.ipAdmissionDto?.admitCode || ""}
              ControlID="currentAdmitCode"
              name="currentAdmitCode"
              disabled
              onChange={() => {}}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="text"
              label="Ward"
              value={selectedAdmission.wrBedDetailsDto?.rGrpName || ""}
              ControlID="currentWard"
              name="currentWard"
              disabled
              onChange={() => {}}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="text"
              label="Bed"
              value={selectedAdmission.wrBedDetailsDto?.bedName || ""}
              ControlID="currentBed"
              name="currentBed"
              disabled
              onChange={() => {}}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
          </Grid>
        )}
        <FormField
          type="datepicker"
          label="Discharge Date"
          value={formState.dischgDate}
          onChange={(date) => handleDateChange(date, "dischgDate")}
          name="dischgDate"
          ControlID="dischgDate"
          isMandatory
          size="small"
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />
        <FormField
          type="timepicker"
          label="Discharge Time"
          value={formState.dischgTime}
          onChange={(time) => handleDateChange(time, "dischgTime")}
          name="dischgTime"
          ControlID="dischgTime"
          isMandatory
          size="small"
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />
        <FormField
          type="datepicker"
          label="Report Date"
          value={formState.reportDate}
          onChange={(date) => handleDateChange(date, "dischgDate")}
          name="reportDate"
          ControlID="reportDate"
          isMandatory
          size="small"
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />
        <FormField
          type="datepicker"
          label="Review Date"
          value={formState.reviewDate}
          onChange={(date) => handleDateChange(date, "dischgDate")}
          name="reportDate"
          ControlID="reportDate"
          isMandatory
          size="small"
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />
        <FormField
          type="select"
          label="Discharge Physician"
          value={formState.dischgPhyID?.toString() || ""}
          onChange={handlePhysicianChange}
          name="dischgPhyID"
          ControlID="dischgPhyID"
          options={dropdownValues.attendingPhy || []}
          isMandatory
          size="small"
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />
        <FormField
          type="select"
          label="Specialty"
          value={formState.faculty}
          onChange={(e: SelectChangeEvent<string>) =>
            setFormState((prev) => ({
              ...prev,
              faculty: e.target.value,
            }))
          }
          name="faculty"
          ControlID="faculty"
          options={dropdownValues.speciality || []}
          isMandatory
          disabled={Boolean(formState.dischgPhyID)}
          size="small"
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />
        <Controller
          name="menstrualExam"
          control={control}
          render={({ field }) => (
            <FormField
              type="textarea"
              label="Menstrual Exam"
              value={field.value}
              onChange={(e) => {
                handleInputControllerChange(e); // Call your custom handleInputChange
                field.onChange(e); // Ensure react-hook-form is aware of the change
              }}
              name="menstrualExam"
              ControlID="menstrualExam"
              rows={4}
              size="small"
              gridProps={{ xs: 12 }}
            />
          )}
        />
        <Controller
          name="adviceOnDischarge"
          control={control}
          render={({ field }) => (
            <FormField
              type="textarea"
              label="Advice On Discharge"
              value={field.value}
              onChange={(e) => {
                handleInputControllerChange(e); // Call your custom handleInputChange
                field.onChange(e); // Ensure react-hook-form is aware of the change
              }}
              name="adviceOnDischarge"
              ControlID="adviceOnDischarge"
              rows={4}
              size="small"
              gridProps={{ xs: 12 }}
            />
          )}
        />
        <FormField
          type="textarea"
          label="Birth History"
          {...register("birthHistory")} // Register the field with react-hook-form
          onChange={(e) => {
            handleInputChangeRegister(e); // Call your custom handleInputChange
          }}
          name="birthHistory"
          ControlID="birthHistory"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
          value={formState.birthHistory}
        />

        <FormField
          type="textarea"
          label="Cheif Compliant"
          value={formState.cheifCompliant}
          onChange={handleInputChange}
          name="cheifCompliant"
          ControlID="cheifCompliant"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Condition On Discharge"
          value={formState.conditionOnDischarge}
          onChange={handleInputChange}
          name="conditionOnDischarge"
          ControlID="conditionOnDischarge"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Condition On Discharge"
          value={formState.conditionOnDischarge}
          onChange={handleInputChange}
          name="conditionOnDischarge"
          ControlID="conditionOnDischarge"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Consultants"
          value={formState.consultants}
          onChange={handleInputChange}
          name="consultants"
          ControlID="consultants"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Course In Hospital"
          value={formState.courseInHospital}
          onChange={handleInputChange}
          name="courseInHospital"
          ControlID="courseInHospital"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Delivery Details"
          value={formState.deliveryDet}
          onChange={handleInputChange}
          name="deliveryDet"
          ControlID="deliveryDet"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Development"
          value={formState.development}
          onChange={handleInputChange}
          name="development"
          ControlID="development"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="familyHistory"
          value={formState.familyHistory}
          onChange={handleInputChange}
          name="familyHistory"
          ControlID="familyHistory"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Final Diagnosis"
          value={formState.finalDiagnosis}
          onChange={handleInputChange}
          name="finalDiagnosis"
          ControlID="finalDiagnosis"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Follow Up"
          value={formState.followUp}
          onChange={handleInputChange}
          name="followUp"
          ControlID="followUp"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="History"
          value={formState.history}
          onChange={handleInputChange}
          name="history"
          ControlID="history"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Immunisation"
          value={formState.immunisation}
          onChange={handleInputChange}
          name="immunisation"
          ControlID="immunisation"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="IntraOperative Finding"
          value={formState.intraoperativeFinding}
          onChange={handleInputChange}
          name="ntraoperativeFinding"
          ControlID="intraoperativeFinding"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Investigations"
          value={formState.investigations}
          onChange={handleInputChange}
          name="investigations"
          ControlID="investigations"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Local Exam"
          value={formState.localExam}
          onChange={handleInputChange}
          name="localExam"
          ControlID="localExam"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Local Exam"
          value={formState.localExam}
          onChange={handleInputChange}
          name="localExam"
          ControlID="localExam"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Menstrual Exam"
          value={formState.menstrualExam}
          onChange={handleInputChange}
          name="menstrualExam"
          ControlID="menstrualExam"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Neonatal Details"
          value={formState.neonatalDet}
          onChange={handleInputChange}
          name="neonatalDet"
          ControlID="neonatalDet"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Obsteric History"
          value={formState.obstericHistory}
          onChange={handleInputChange}
          name="obstericHistory"
          ControlID="obstericHistory"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="OT Findings"
          value={formState.otFindings}
          onChange={handleInputChange}
          name="otFindings"
          ControlID="otFindings"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Past History"
          value={formState.pastHistory}
          onChange={handleInputChange}
          name="pastHistory"
          ControlID="pastHistory"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Personal History"
          value={formState.personalHistory}
          onChange={handleInputChange}
          name="personalHistory"
          ControlID="personalHistory"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Physical Exam"
          value={formState.physicalExam}
          onChange={handleInputChange}
          name="physicalExam"
          ControlID="physicalExam"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Post Operative Treatment "
          value={formState.postOperTreatment}
          onChange={handleInputChange}
          name="postOperTreatment"
          ControlID="postOperTreatment"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Procedure Done"
          value={formState.procedureDone}
          onChange={handleInputChange}
          name="procedureDone"
          ControlID="procedureDone"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Risk Factor"
          value={formState.riskFactor}
          onChange={handleInputChange}
          name="riskFactor"
          ControlID="riskFactor"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Systemic Exam"
          value={formState.systemicExam}
          onChange={handleInputChange}
          name="systemicExam"
          ControlID="systemicExam"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Treatment Given"
          value={formState.treatmentGiven}
          onChange={handleInputChange}
          name="treatmentGiven"
          ControlID="treatmentGiven"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormField
          type="textarea"
          label="Vaccination"
          value={formState.vaccination}
          onChange={handleInputChange}
          name="vaccination"
          ControlID="vaccination"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
        <FormSaveClearButton clearText="Clear" saveText={isEditing ? "Update" : "Save"} onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
      </FormSectionWrapper>
    </>
  );
};
export default DischargeSummaryDetails;
