//src/patientAdministration/DischargePage/SubPage/WardBedTransferDetails.tsx
import { useState, useCallback, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { Box, Grid, SelectChangeEvent } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { MeetingRoom as BedViewIcon } from "@mui/icons-material";
import SaveIcon from "@mui/icons-material/Save";

import { WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { BedTransferRequestDto } from "@/interfaces/PatientAdministration/BedTransferRequestDto";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { useLoading } from "@/hooks/Common/useLoading";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { roomListService, wrBedService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import { showAlert } from "@/utils/Common/showAlert";
import { wardBedTransferService } from "@/services/PatientAdministrationServices/WardBedTransferService/WardBedTransferService";
import CustomAccordion from "@/components/Accordion/CustomAccordion";
import FormField from "@/components/FormField/FormField";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import PatientDemographics from "../../CommonPage/Demograph/PatientDemographics";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ManageBedDetails from "../../ManageBed/SubPage/ManageBedDetails";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";

interface WardBedTransferDetailsProps {
  selectedAdmission?: AdmissionDto;
  onAdmissionSelect?: (admission: AdmissionDto) => void;
  onClear?: () => void;
}

const WardBedTransferDetails = forwardRef<{ focusUhidInput: () => void }, WardBedTransferDetailsProps>(({ selectedAdmission, onAdmissionSelect, onClear }, ref) => {
  const [{ compID, compCode, compName }, setCompData] = useState({ compID: 1, compCode: "KVG", compName: "KVG Medical College" });
  const [formState, setFormState] = useState<BedTransferRequestDto>({
    admitID: 0,
    pChartID: 0,
    pChartCode: "",
    bedID: 0,
    bedName: "",
    rlID: 0,
    rName: "",
    rGrpID: 0,
    rGrpName: "",
    treatPhyID: 0,
    treatPhyName: "",
    treatingSpecialtyID: 0,
    treatingPhySpecialty: "",
    compID: compID || 0,
    compCode: compCode || "",
    compName: compName || "",
    reasonForTransfer: "",
    transferDate: new Date().toISOString(),
    rNotes: "",
  });

  const [isBedSelectionOpen, setIsBedSelectionOpen] = useState(false);
  const [roomOptions, setRoomOptions] = useState<DropdownOption[]>([]);
  const [bedOptions, setBedOptions] = useState<DropdownOption[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { setLoading } = useLoading();
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const uhidInputRef = useRef<HTMLInputElement>(null);

  const dropdownValues = useDropdownValues(["roomGroup", "attendingPhy", "speciality"]);

  useImperativeHandle(ref, () => ({
    focusUhidInput: () => {
      setTimeout(() => {
        uhidInputRef.current?.focus();
      }, 0);
    },
  }));

  const fetchRooms = useCallback(async (wardId: number) => {
    try {
      const response = await roomListService.getAll();
      const filteredRooms = (response.data ?? []).filter((room: any) => room.rgrpID === wardId);
      const roomOptions = filteredRooms.map((room: any) => ({
        value: room.rlID.toString(),
        label: room.rName,
      }));
      setRoomOptions(roomOptions);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRoomOptions([]);
    }
  }, []);

  const fetchBeds = useCallback(async (roomId: number) => {
    try {
      const response = await wrBedService.getAll();
      const filteredBeds = (response.data ?? []).filter((bed: any) => bed.rlID === roomId && !bed.isOccupied);
      const bedOptions = filteredBeds.map((bed: any) => ({
        value: bed.bedID.toString(),
        label: bed.bedName,
      }));
      setBedOptions(bedOptions);
    } catch (error) {
      console.error("Error fetching beds:", error);
      setBedOptions([]);
    }
  }, []);

  const handleWardChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const wardId = Number(e.target.value);
      const selectedWard = dropdownValues.roomGroup?.find((option) => Number(option.value) === wardId);

      if (selectedWard) {
        setFormState((prev) => ({
          ...prev,
          rGrpID: wardId,
          rGrpName: selectedWard.label,
          rlID: 0,
          rName: "",
          bedID: 0,
          bedName: "",
        }));

        setRoomOptions([]);
        setBedOptions([]);
        fetchRooms(wardId);
      }
    },
    [dropdownValues.roomGroup, fetchRooms]
  );

  const handleRoomChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const roomId = Number(e.target.value);
      const selectedRoom = roomOptions?.find((option) => Number(option.value) === roomId);

      if (selectedRoom) {
        setFormState((prev) => ({
          ...prev,
          rlID: roomId,
          rName: selectedRoom.label,
          bedID: 0,
          bedName: "",
        }));

        setBedOptions([]);
        fetchBeds(roomId);
      }
    },
    [roomOptions, fetchBeds]
  );

  const handleBedChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const bedId = Number(e.target.value);
      const selectedBed = bedOptions?.find((option) => option.value === bedId.toString());

      if (selectedBed) {
        setFormState((prev) => ({
          ...prev,
          bedID: bedId,
          bedName: selectedBed.label,
        }));
      }
    },
    [bedOptions]
  );

  const handlePhysicianChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const physicianValue = event.target.value;
      const selectedPhysician = dropdownValues.attendingPhy?.find((phy) => phy.value === physicianValue);

      if (selectedPhysician) {
        const [physicianName, specialty] = selectedPhysician.label.split("|").map((s) => s.trim());
        const specialtyOption = dropdownValues.speciality?.find((opt) => opt.label.trim() === specialty);

        setFormState((prev) => ({
          ...prev,
          treatPhyID: Number(physicianValue),
          treatPhyName: physicianName,
          treatingPhySpecialty: specialty || "",
          treatingSpecialtyID: specialtyOption ? Number(specialtyOption.value) : 0,
        }));
      }
    },
    [dropdownValues.attendingPhy, dropdownValues.speciality]
  );

  const handlePatientSelect = useCallback(
    async (pChartID: number) => {
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
    [setLoading, onAdmissionSelect]
  );

  const handleClear = useCallback(() => {
    setFormState({
      admitID: 0,
      pChartID: 0,
      pChartCode: "",
      bedID: 0,
      bedName: "",
      rlID: 0,
      rName: "",
      rGrpID: 0,
      rGrpName: "",
      treatPhyID: 0,
      treatPhyName: "",
      treatingSpecialtyID: 0,
      treatingPhySpecialty: "",
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      reasonForTransfer: "",
      transferDate: new Date().toISOString(),
      rNotes: "",
    });
    setIsSubmitted(false);
    setRoomOptions([]);
    setBedOptions([]);
    onClear?.();
  }, [compID, compCode, compName, onClear]);

  const validateTransfer = useCallback(async () => {
    if (!selectedAdmission?.wrBedDetailsDto?.bedID || !formState.bedID || !formState.admitID) {
      return false;
    }

    try {
      return await wardBedTransferService.validateTransfer(selectedAdmission.wrBedDetailsDto.bedID, formState.bedID, formState.admitID);
    } catch (error) {
      console.error("Error validating transfer:", error);
      return false;
    }
  }, [selectedAdmission, formState.bedID, formState.admitID]);

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);

    if (!formState.pChartID || !formState.bedID || !formState.reasonForTransfer) {
      showAlert("Error", "Please fill all mandatory fields", "error");
      return;
    }

    setLoading(true);
    try {
      const isValid = await validateTransfer();
      if (!isValid) {
        showAlert("Error", "Invalid transfer request. Please check bed availability.", "error");
        return;
      }

      const result = await wardBedTransferService.processTransfer(formState);
      if (result.success) {
        showAlert("Success", "Transfer processed successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to process transfer", "error");
      }
    } catch (error) {
      console.error("Error processing transfer:", error);
      showAlert("Error", "Failed to process transfer", "error");
    } finally {
      setLoading(false);
    }
  }, [formState, handleClear, setLoading, validateTransfer]);

  useEffect(() => {
    if (selectedAdmission?.ipAdmissionDto) {
      const admission = selectedAdmission.ipAdmissionDto;
      setFormState((prev) => ({
        ...prev,
        pChartID: admission.pChartID || 0,
        admitID: admission.admitID || 0,
        pChartCode: admission.pChartCode || "",
      }));
    } else {
      handleClear();
    }
  }, [selectedAdmission, handleClear]);

  const handleBedSelectFromView = useCallback(
    (selectedBed: WrBedDto) => {
      // First, fetch and update the room options for the selected bed's ward
      if (selectedBed.roomList?.roomGroup?.rGrpID) {
        fetchRooms(selectedBed.roomList.roomGroup.rGrpID);
      }

      // Then, fetch and update the bed options for the selected bed's room
      if (selectedBed.rlID) {
        fetchBeds(selectedBed.rlID);
      }

      // Update form state with the selected bed details
      setFormState((prev) => ({
        ...prev,
        bedID: selectedBed.bedID,
        bedName: selectedBed.bedName,
        rlID: selectedBed.rlID,
        rName: selectedBed.roomList?.rName || "",
        rGrpID: selectedBed.roomList?.roomGroup?.rGrpID || 0,
        rGrpName: selectedBed.roomList?.roomGroup?.rGrpName || "",
      }));
    },
    [fetchRooms, fetchBeds]
  );

  const handleOpenBedSelection = useCallback(() => {
    setIsBedSelectionOpen(true);
  }, []);

  const handleCloseBedSelection = useCallback(() => {
    setIsBedSelectionOpen(false);
  }, []);

  const handleBedSelectFromDialog = useCallback(
    (selectedBed: WrBedDto) => {
      handleBedSelectFromView(selectedBed);
      setIsBedSelectionOpen(false);
    },
    [handleBedSelectFromView]
  );

  return (
    <>
      <CustomAccordion title="Patient Information" defaultExpanded>
        <Grid container spacing={2}>
          <FormField
            ref={uhidInputRef}
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
              const pChartID = extractNumbers(pChartCode)[0] || null;
              if (pChartID) handlePatientSelect(pChartID);
            }}
            gridProps={{ xs: 12, md: 3 }}
          />

          <Grid size={{ xs: 12, md: 9 }}>
            <PatientDemographics pChartID={formState.pChartID} />
          </Grid>
        </Grid>
      </CustomAccordion>

      {selectedAdmission && (
        <CustomAccordion title="Current Location" defaultExpanded>
          <Grid container spacing={2}>
            <FormField
              type="text"
              label="Current Ward"
              value={selectedAdmission.wrBedDetailsDto?.rGrpName || ""}
              name="currentWard"
              ControlID="currentWard"
              disabled
              onChange={() => {}}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
            />
            <FormField
              type="text"
              label="Current Bed"
              value={selectedAdmission.wrBedDetailsDto?.bedName || ""}
              name="currentBed"
              ControlID="currentBed"
              disabled
              onChange={() => {}}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
            />
          </Grid>
        </CustomAccordion>
      )}

      <CustomAccordion title="Bed Selection" defaultExpanded>
        <Grid container spacing={2}>
          <FormField
            type="select"
            label="New Ward"
            value={formState.rGrpID.toString()}
            onChange={handleWardChange}
            name="rGrpID"
            ControlID="rGrpID"
            options={dropdownValues.roomGroup || []}
            isMandatory
            size="small"
            gridProps={{ xs: 12, sm: 6, md: 4 }}
          />

          <FormField
            type="select"
            label="New Room"
            value={formState.rlID.toString()}
            onChange={handleRoomChange}
            name="rlID"
            ControlID="rlID"
            options={roomOptions}
            isMandatory
            size="small"
            disabled={!formState.rGrpID}
            gridProps={{ xs: 12, sm: 6, md: 4 }}
          />

          <FormField
            type="select"
            label="New Bed"
            value={formState.bedID.toString()}
            onChange={handleBedChange}
            name="bedID"
            ControlID="bedID"
            options={bedOptions}
            isMandatory
            size="small"
            disabled={!formState.rlID}
            gridProps={{ xs: 12, sm: 6, md: 4 }}
          />

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
              <CustomButton variant="outlined" text="Select Bed from Ward View" onClick={handleOpenBedSelection} icon={BedViewIcon} color="primary" sx={{ borderRadius: 1 }} />
            </Box>
          </Grid>
        </Grid>
      </CustomAccordion>

      <GenericDialog open={isBedSelectionOpen} onClose={handleCloseBedSelection} title="Select a Bed" maxWidth="xl" fullWidth showCloseButton>
        <ManageBedDetails onBedSelect={handleBedSelectFromDialog} isSelectionMode={true} />
      </GenericDialog>

      <CustomAccordion title="Transfer Details" defaultExpanded>
        <Grid container spacing={2}>
          <FormField
            type="datepicker"
            label="Transfer Date"
            value={new Date(formState.transferDate)}
            onChange={(date) =>
              date &&
              setFormState((prev) => ({
                ...prev,
                transferDate: date.toISOString(),
              }))
            }
            name="transferDate"
            ControlID="transferDate"
            isMandatory
            size="small"
            gridProps={{ xs: 12, sm: 6, md: 3 }}
          />

          <FormField
            type="text"
            label="Transfer Reason"
            value={formState.reasonForTransfer}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                reasonForTransfer: e.target.value,
              }))
            }
            name="reasonForTransfer"
            ControlID="reasonForTransfer"
            isMandatory
            size="small"
            gridProps={{ xs: 12, sm: 6, md: 3 }}
          />

          <FormField
            type="select"
            label="Treating Physician"
            value={formState.treatPhyID.toString()}
            onChange={handlePhysicianChange}
            name="treatPhyID"
            ControlID="treatPhyID"
            options={dropdownValues.attendingPhy || []}
            size="small"
            gridProps={{ xs: 12, sm: 6, md: 3 }}
          />

          <FormField
            type="text"
            label="Treating Specialty"
            value={formState.treatingPhySpecialty}
            onChange={() => {}}
            name="treatingPhySpecialty"
            ControlID="treatingPhySpecialty"
            disabled
            size="small"
            gridProps={{ xs: 12, sm: 6, md: 3 }}
          />

          <FormField
            type="textarea"
            label="Additional Notes"
            value={formState.rNotes}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                rNotes: e.target.value,
              }))
            }
            name="rNotes"
            ControlID="rNotes"
            size="small"
            rows={4}
            maxLength={4000}
            gridProps={{ xs: 12 }}
          />
        </Grid>
      </CustomAccordion>

      <Box sx={{ mt: 2 }}>
        <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
      </Box>
    </>
  );
});

WardBedTransferDetails.displayName = "WardBedTransferDetails";

export default WardBedTransferDetails;
