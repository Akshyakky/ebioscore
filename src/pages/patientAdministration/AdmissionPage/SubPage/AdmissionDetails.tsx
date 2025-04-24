//src/pages/patientAdministration/AdmissionPage/SubPage/AdmissionDetails.tsx
import React, { useState, useCallback } from "react";
import { Grid, SelectChangeEvent } from "@mui/material";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { roomListService, wrBedService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import FormSectionWrapper from "@/components/FormField/FormSectionWrapper";
import FormField from "@/components/FormField/FormField";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import PatientDemographics from "../../CommonPage/Demograph/PatientDemographics";

interface AdmissionDetailsProps {
  formData: AdmissionDto;
  onChange: (field: keyof AdmissionDto, value: any) => void;
  onDropdownChange: (valuePath: (string | number)[], textPath: (string | number)[], options: DropdownOption[]) => (e: SelectChangeEvent<string>, child?: React.ReactNode) => void;
  fetchPatientSuggestions: (input: string) => Promise<string[]>;
  handlePatientSelect: (pChartID: number | null) => void;
}

const AdmissionDetails: React.FC<AdmissionDetailsProps> = ({ formData, onChange, onDropdownChange, fetchPatientSuggestions, handlePatientSelect }) => {
  const dropdownValues = useDropdownValues(["admissionType", "primaryIntroducingSource", "department", "unit", "attendingPhy", "roomGroup", "caseType", "pic"]);

  const [roomOptions, setRoomOptions] = useState<DropdownOption[]>([]);
  const [bedOptions, setBedOptions] = useState<DropdownOption[]>([]);

  const fetchRooms = useCallback(async (wardId: number) => {
    try {
      const response = await roomListService.getAll();
      const filteredRooms = response.data.filter((room: any) => room.rgrpID === wardId);
      const roomOptions = filteredRooms.map((room: any) => ({
        value: room.rlID.toString(),
        label: room.rName,
      }));
      setRoomOptions(roomOptions);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }, []);

  const fetchBeds = useCallback(async (roomId: number) => {
    try {
      const response = await wrBedService.getAll();
      const filteredBeds = response.data.filter((bed: any) => bed.rlID === roomId);
      const bedOptions = filteredBeds.map((bed: any) => ({
        value: bed.bedID.toString(),
        label: bed.bedName,
      }));
      setBedOptions(bedOptions);
    } catch (error) {
      console.error("Error fetching beds:", error);
    }
  }, []);

  // useEffect(() => {
  //     if (formData.WrBedDetailsDto.rGrpID) {
  //         fetchRooms(formData.WrBedDetailsDto.rGrpID);
  //     }
  // }, [formData.WrBedDetailsDto.rGrpID, fetchRooms]);

  // useEffect(() => {
  //     if (formData.IPAdmissionDetailsDto.rlID) {
  //         fetchBeds(formData.IPAdmissionDetailsDto.rlID);
  //     }
  // }, [formData.IPAdmissionDetailsDto.rlID, fetchBeds]);

  const handleBedDropdownChange = (e: SelectChangeEvent<string>) => {
    const bedId = Number(e.target.value);
    const selectedBed = bedOptions.find((option) => option.value === bedId.toString());

    if (selectedBed) {
      onChange("wrBedDetailsDto", {
        ...formData.wrBedDetailsDto,
        bedID: bedId,
        bedName: selectedBed.label,
      });

      onChange("ipAdmissionDetailsDto", {
        ...formData.ipAdmissionDetailsDto,
        bedID: bedId,
        bedName: selectedBed.label,
      });
    }
  };

  const handleRoomChange = (e: SelectChangeEvent<string>) => {
    const roomId = Number(e.target.value);
    const selectedRoom = roomOptions.find((option) => Number(option.value) === roomId);

    if (selectedRoom) {
      onChange("ipAdmissionDetailsDto", {
        ...formData.ipAdmissionDetailsDto,
        rlID: roomId,
        rName: selectedRoom.label,
        bedID: 0,
        bedName: "",
      });

      onChange("wrBedDetailsDto", {
        ...formData.wrBedDetailsDto,
        rlID: roomId,
        rName: selectedRoom.label,
        bedID: 0,
        bedName: "",
      });

      setBedOptions([]);
      fetchBeds(roomId);
    }
  };

  const handleWardChange = (e: SelectChangeEvent<string>) => {
    const wardId = Number(e.target.value);
    const selectedWard = dropdownValues.roomGroup?.find((option) => Number(option.value) === wardId);

    if (selectedWard) {
      onChange("wrBedDetailsDto", {
        ...formData.wrBedDetailsDto,
        rGrpID: wardId,
        rGrpName: selectedWard.label,
        rlID: 0,
        rName: "",
        bedID: 0,
        bedName: "",
      });

      onChange("ipAdmissionDetailsDto", {
        ...formData.ipAdmissionDetailsDto,
        rlID: 0,
        rName: "",
        bedID: 0,
        bedName: "",
      });

      setRoomOptions([]);
      setBedOptions([]);
      fetchRooms(wardId);
    }
  };

  return (
    <FormSectionWrapper title="Admission Details" spacing={1}>
      <FormField
        type="autocomplete"
        label="UHID No."
        ControlID="pChartCode"
        value={formData.ipAdmissionDto.pChartCode || ""}
        name="pChartCode"
        placeholder="UHID, Name, DOB, Phone No"
        isMandatory={true}
        onChange={(e) => onChange("ipAdmissionDto", { ...formData.ipAdmissionDto, pChartCode: e.target.value })}
        fetchSuggestions={fetchPatientSuggestions}
        onSelectSuggestion={(suggestion) => {
          const pChartCode = suggestion.split("|")[0].trim();
          const numbersArray = extractNumbers(pChartCode);
          const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
          onChange("ipAdmissionDto", { ...formData.ipAdmissionDto, pChartCode, pChartID });
          handlePatientSelect(pChartID);
        }}
        gridProps={{ xs: 12, md: 3, lg: 3 }}
      />
      <Grid item xs={12} sm={6} md={9} lg={9} xl={9}>
        <PatientDemographics pChartID={formData.ipAdmissionDto.pChartID || 0} />
      </Grid>

      <FormField
        type="select"
        label="Admission Type"
        name="admissionType"
        value={formData.ipAdmissionDetailsDto.admissionType || ""}
        onChange={(e) => onChange("ipAdmissionDetailsDto", { ...formData.ipAdmissionDetailsDto, admissionType: e.target.value })}
        options={dropdownValues.admissionType || []}
        ControlID="admissionType"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />

      <FormField
        type="select"
        label="Case Type"
        name="caseType"
        value={formData.ipAdmissionDto.caseTypeCode || ""}
        onChange={onDropdownChange(["ipAdmissionDto", "caseTypeCode"], ["ipAdmissionDto", "caseTypeName"], dropdownValues.caseType || [])}
        options={dropdownValues.caseType || []}
        ControlID="caseType"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />

      <FormField
        type="text"
        label="Case Number"
        name="admitCode"
        value={formData.ipAdmissionDto.admitCode || ""}
        onChange={(e) => onChange("ipAdmissionDto", { ...formData.ipAdmissionDto, admitCode: e.target.value })}
        ControlID="admitCode"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
        disabled={true}
      />

      <FormField
        type="datetimepicker"
        label="Admission Date-Time"
        name="admitDate"
        value={formData.ipAdmissionDto.admitDate || null}
        onChange={(date) => onChange("ipAdmissionDto", { ...formData.ipAdmissionDto, admitDate: date })}
        ControlID="admitDate"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />

      <FormField
        type="text"
        label="Visit Number"
        name="visitGesy"
        value={formData.ipAdmissionDto.visitGesy || ""}
        onChange={(e) => onChange("ipAdmissionDto", { ...formData.ipAdmissionDto, visitGesy: e.target.value })}
        ControlID="visitGesy"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />

      <FormField
        type="select"
        label="Primary Introducing Source"
        name="PrimaryIntroducingSource"
        value={formData.ipAdmissionDto.primaryReferralSourceId || ""}
        onChange={onDropdownChange(["ipAdmissionDto", "primaryReferralSourceId"], ["ipAdmissionDto", "primaryReferralSourceName"], dropdownValues.primaryIntroducingSource || [])}
        options={dropdownValues.primaryIntroducingSource || []}
        ControlID="primaryIntroducingSource"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />

      <FormField
        type="select"
        label="Department"
        name="Department"
        value={formData.ipAdmissionDto.deptID || ""}
        onChange={onDropdownChange(["ipAdmissionDto", "deptID"], ["ipAdmissionDto", "deptName"], dropdownValues.department || [])}
        options={dropdownValues.department || []}
        ControlID="department"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />

      <FormField
        type="select"
        label="Unit"
        name="Unit"
        value={formData.ipAdmissionDto.dulId || ""}
        onChange={(e) => onChange("ipAdmissionDto", { ...formData.ipAdmissionDto, dulId: Number(e.target.value) })}
        options={dropdownValues.unit || []}
        ControlID="unit"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />

      <FormField
        type="select"
        label="Attending Physician"
        name="Attending Physician"
        value={`${formData.ipAdmissionDto.attendingPhysicianId || ""}-${formData.ipAdmissionDto.specialityID || ""}`}
        onChange={(e) => {
          const [physicianId, specialityId] = e.target.value.split("-").map(Number);
          onChange("ipAdmissionDto", {
            ...formData.ipAdmissionDto,
            attendingPhysicianId: physicianId,
            specialityID: specialityId,
            attendingPhysicianName: dropdownValues.attendingPhy?.find((option) => option.value === e.target.value)?.label || "",
          });
        }}
        options={dropdownValues.attendingPhy || []}
        ControlID="attendingPhysician"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />

      <FormField
        type="select"
        label="PIC"
        name="PIC"
        value={formData.ipAdmissionDto.pTypeID || ""}
        onChange={(e) => onChange("ipAdmissionDto", { ...formData.ipAdmissionDto, pTypeID: Number(e.target.value) })}
        options={dropdownValues.pic || []}
        ControlID="pic"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />

      <FormField
        type="select"
        label="Patient Attendant"
        name="patNokID"
        value={formData.ipAdmissionDto.patNokID || 0}
        onChange={(e) => onChange("ipAdmissionDto", { ...formData.ipAdmissionDto, patNokID: Number(e.target.value) })}
        options={dropdownValues.attendingPhy || []}
        ControlID="patNokID"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />

      <FormField
        type="textarea"
        label="Reason for Admission"
        name="rNotes"
        value={formData.ipAdmissionDetailsDto.plannedProc || ""}
        onChange={(e) => onChange("ipAdmissionDetailsDto", { ...formData.ipAdmissionDetailsDto, plannedProc: e.target.value })}
        ControlID="rNotes"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
        maxLength={4000}
      />

      <FormField
        type="select"
        label="Ward Name"
        name="rGrpID"
        value={formData.wrBedDetailsDto.rGrpID?.toString() || ""}
        onChange={handleWardChange}
        options={dropdownValues.roomGroup || []}
        ControlID="rGrpID"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />

      <FormField
        type="select"
        label="Room Name"
        name="rlID"
        value={formData.ipAdmissionDetailsDto.rlID?.toString() || ""}
        onChange={handleRoomChange}
        options={roomOptions}
        ControlID="rlID"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
        disabled={!formData.wrBedDetailsDto.rGrpID}
      />

      <FormField
        type="select"
        label="Bed Name"
        name="bedID"
        value={formData.wrBedDetailsDto.bedID?.toString() || ""}
        onChange={handleBedDropdownChange}
        options={bedOptions}
        ControlID="bedID"
        gridProps={{ xs: 12, sm: 6, md: 3 }}
        disabled={!formData.ipAdmissionDetailsDto.rlID}
      />
    </FormSectionWrapper>
  );
};

export default AdmissionDetails;
