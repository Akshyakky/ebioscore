import React, { useState, useCallback } from "react";
import { Grid, SelectChangeEvent } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { IpDischargeDto } from "@/interfaces/PatientAdministration/IpDischargeDto";
import { useLoading } from "@/hooks/Common/useLoading";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import { useAlert } from "@/providers/AlertProvider";
import dischargeService from "@/services/PatientAdministrationServices/DischargeService/DischargeService";
import FormSectionWrapper from "@/components/FormField/FormSectionWrapper";
import FormField from "@/components/FormField/FormField";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import PatientDemographics from "../../CommonPage/Demograph/PatientDemographics";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";

interface DischargeDetailsProps {
  selectedAdmission?: AdmissionDto;
  onAdmissionSelect?: (admission: AdmissionDto) => void;
  onClear?: () => void;
}

const initialState = (): IpDischargeDto => ({
  dischgID: 0,
  pChartID: 0,
  admitID: 0,
  dischgDate: new Date(),
  dischgTime: new Date(),
  dischgStatus: "",
  dischgPhyID: 0,
  dischgPhyName: "",
  releaseBedYN: "Y",
  authorisedBy: "",
  deliveryType: "",
  dischargeCode: "",
  dischgSumYN: "N",
  facultyID: 0,
  faculty: "",
  dischgType: "DISCHARGED",
  pChartCode: "",
  pTitle: "",
  pfName: "",
  pmName: "",
  plName: "",
  defineStatus: "",
  defineSituation: "",
  situation: "",
  rActiveYN: "Y",
  transferYN: "N",
  rNotes: "",
});

const DischargeDetails: React.FC<DischargeDetailsProps> = ({ selectedAdmission, onAdmissionSelect, onClear }) => {
  const [formState, setFormState] = useState<IpDischargeDto>(() => initialState());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { setLoading } = useLoading();
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const { showAlert } = useAlert();

  const dropdownValues = useDropdownValues(["dischargeStatus", "dischargeSituation", "deliveryType", "attendingPhy", "speciality"]);

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

  const handleStatusChange = useCallback((event: SelectChangeEvent<string>) => {
    setFormState((prev) => ({
      ...prev,
      dischgStatus: event.target.value,
    }));
  }, []);

  const handleSituationChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const situation = event.target.value;
      const selectedSituation = dropdownValues.dischargeSituation?.find((opt) => opt.value === situation);

      setFormState((prev) => ({
        ...prev,
        situation,
        defineSituation: selectedSituation?.label || "",
      }));
    },
    [dropdownValues.dischargeSituation]
  );

  const handleDeliveryTypeChange = useCallback((event: SelectChangeEvent<string>) => {
    setFormState((prev) => ({
      ...prev,
      deliveryType: event.target.value,
    }));
  }, []);

  const handleClear = useCallback(() => {
    setFormState(initialState());
    setIsSubmitted(false);
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
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);
  const handleSave = useCallback(async () => {
    setIsSubmitted(true);
    if (!formState.pChartID || !formState.dischgStatus || !formState.dischgPhyID) {
      showAlert("Error", "Please fill all mandatory fields", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await dischargeService.processDischarge(formState);
      if (result.success) {
        showAlert("Success", "Patient discharged successfully!", "success", {
          onConfirm: onClear,
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to discharge patient", "error");
      }
    } catch (error) {
      showAlert("Error", "Failed to discharge patient", "error");
    } finally {
      setLoading(false);
    }
  }, [formState, onClear]);

  const handleDateChange = useCallback((date: Date | null, type: "dischgDate" | "dischgTime") => {
    if (date) {
      setFormState((prev) => ({ ...prev, [type]: date }));
    }
  }, []);

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

        {/* Patient Demographics */}
        <Grid size={{ xs: 12, sm: 6, md: 9, lg: 9, xl: 9 }}>
          <PatientDemographics pChartID={formState.pChartID} />
        </Grid>

        {/* Current Admission Summary */}
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

        <FormField
          type="select"
          label="Discharge Status"
          value={formState.dischgStatus}
          onChange={handleStatusChange}
          name="dischgStatus"
          ControlID="dischgStatus"
          options={dropdownValues.dischargeStatus || []}
          isMandatory
          size="small"
          gridProps={{ xs: 12, sm: 6, md: 3 }}
          clearable
        />

        <FormField
          type="select"
          label="Situation"
          value={formState.situation}
          onChange={handleSituationChange}
          name="situation"
          ControlID="situation"
          options={dropdownValues.dischargeSituation || []}
          size="small"
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />

        <FormField
          type="select"
          label="Delivery Type"
          value={formState.deliveryType}
          onChange={handleDeliveryTypeChange}
          name="deliveryType"
          ControlID="deliveryType"
          options={dropdownValues.deliveryType || []}
          size="small"
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />

        <FormField
          type="switch"
          label="Release Bed"
          checked={formState.releaseBedYN === "Y"}
          value={formState.releaseBedYN}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              releaseBedYN: e.target.checked ? "Y" : "N",
            }))
          }
          name="releaseBedYN"
          ControlID="releaseBedYN"
          size="medium"
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />

        <FormField
          type="textarea"
          label="Remarks"
          value={formState.rNotes}
          onChange={handleInputChange}
          name="rNotes"
          ControlID="rNotes"
          rows={4}
          size="small"
          gridProps={{ xs: 12 }}
        />
      </FormSectionWrapper>
      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </>
  );
};

export default DischargeDetails;
