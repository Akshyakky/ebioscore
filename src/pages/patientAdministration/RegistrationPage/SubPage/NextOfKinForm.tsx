import React, { useState, useEffect, useCallback, useMemo } from "react";

import {
  Dialog,
  Grid,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { PatNokDetailsDto } from "../../../../interfaces/PatientAdministration/PatNokDetailsDto";
import FormField from "../../../../components/FormField/FormField";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import CustomButton from "../../../../components/Button/CustomButton";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { useLoading } from "../../../../context/LoadingContext";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import { PatientService } from "../../../../services/PatientAdministrationServices/RegistrationService/PatientService";
import { showAlert } from "../../../../utils/Common/showAlert";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";

interface NextOfKinFormProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (kinDetails: PatNokDetailsDto) => void;
  editData?: PatNokDetailsDto | null;
}

const NextOfKinForm: React.FC<NextOfKinFormProps> = ({
  show,
  handleClose,
  handleSave,
  editData,
}) => {
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const serverDate = useServerDate();

  const dropdownValues = useDropdownValues([
    "title",
    "relation",
    "area",
    "city",
    "country",
    "nationality",
  ]);

  const nextOfKinInitialFormState: PatNokDetailsDto = useMemo(
    () => ({
      ID: 0,
      pNokID: 0,
      pChartID: 0,
      pNokPChartID: 0,
      pNokPChartCode: "",
      pNokRegStatusVal: "Y",
      pNokRegStatus: "Registered",
      pNokPssnID: "",
      pNokDob: serverDate,
      pNokRelNameVal: "",
      pNokRelName: "",
      pNokTitleVal: "",
      pNokTitle: "",
      pNokFName: "",
      pNokMName: "",
      pNokLName: "",
      pNokActualCountryVal: "",
      pNokActualCountry: "",
      pNokAreaVal: "",
      pNokArea: "",
      pNokCityVal: "",
      pNokCity: "",
      pNokCountryVal: "",
      pNokCountry: "",
      pNokDoorNo: "",
      pAddPhone1: "",
      pAddPhone2: "",
      pAddPhone3: "",
      pNokPostcode: "",
      pNokState: "",
      pNokStreet: "",
      rActiveYN: "Y",
      compID: userInfo.compID ?? 0,
      compCode: userInfo.compCode ?? "",
      compName: userInfo.compName ?? "",
      rNotes: "",
      transferYN: "N",
    }),
    [userInfo, serverDate]
  );
  const [nextOfkinData, setNextOfKinData] = useState<PatNokDetailsDto>(
    nextOfKinInitialFormState
  );
  const { handleDropdownChange } =
    useDropdownChange<PatNokDetailsDto>(setNextOfKinData);
  const { handleRadioButtonChange } =
    useRadioButtonChange<PatNokDetailsDto>(setNextOfKinData);
  const { setLoading } = useLoading();

  useEffect(() => {
    if (editData) {
      setNextOfKinData({
        ...editData,
        pNokDob: editData.pNokDob,
      });
    }
  }, [editData]);

  const resetNextOfKinFormData = useCallback(() => {
    setNextOfKinData(nextOfKinInitialFormState);
  }, [nextOfKinInitialFormState]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitted(true);
    if (
      nextOfkinData.pNokFName.trim() &&
      nextOfkinData.pNokLName.trim() &&
      nextOfkinData.pAddPhone1.trim()
    ) {
      setLoading(true);
      try {
        await handleSave(nextOfkinData);
        showAlert("Success", "The Kin Details Saved successfully", "success");
        resetNextOfKinFormData();
        handleClose();
      } catch (error) {
        showAlert(
          "Error",
          "Failed to save Kin details. Please try again.",
          "error"
        );
      } finally {
        setLoading(false);
        setIsSubmitted(false);
      }
    } else {
      showAlert("Warning", "Please fill in all required fields", "warning");
      setIsSubmitted(false);
    }
  }, [
    nextOfkinData,
    handleSave,
    handleClose,
    resetNextOfKinFormData,
    setLoading,
  ]);

  const handleCloseWithClear = useCallback(() => {
    setIsSubmitted(false);
    resetNextOfKinFormData();
    handleClose();
  }, [resetNextOfKinFormData, handleClose]);

  const regOptions = useMemo(
    () => [
      { value: "Y", label: "Registered" },
      { value: "N", label: "Non Registered" },
    ],
    []
  );

  const handleTextChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setNextOfKinData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    []
  );

  const handlePatientSelect = useCallback(
    async (selectedSuggestion: string) => {
      setLoading(true);
      try {
        const pChartID = extractNumbers(selectedSuggestion)[0] || null;
        if (pChartID) {
          setNextOfKinData((prev) => ({
            ...prev,
            pNokPChartCode: selectedSuggestion.split("|")[0].trim(),
            pNokPChartID: pChartID,
          }));
          const response = await PatientService.getPatientDetails(pChartID);
          if (response.success && response.data) {
            const patientDetails = response.data;
            setNextOfKinData((prev) => ({
              ...prev,
              pNokFName: patientDetails.patRegisters.pFName ?? "",
              pNokMName: patientDetails.patRegisters.pMName ?? "",
              pNokLName: patientDetails.patRegisters.pLName ?? "",
              pNokTitleVal: patientDetails.patRegisters.pTitle ?? "",
              pNokDob: patientDetails.patRegisters.pDob
                ? new Date(patientDetails.patRegisters.pDob)
                : serverDate,
              pNokRelNameVal: patientDetails.patRegisters.pTypeName ?? "",
              pNokStreet: patientDetails.patAddress.pAddStreet ?? "",
              pNokAreaVal: patientDetails.patAddress.patAreaVal ?? "",
              pNokCityVal: patientDetails.patAddress.pAddCityVal ?? "",
              pNokActualCountryVal:
                patientDetails.patAddress.pAddActualCountryVal ?? "",
              pNokPostcode: patientDetails.patAddress.pAddPostcode ?? "",
              pAddPhone2: patientDetails.patAddress.pAddPhone2 ?? "",
              pAddPhone3: patientDetails.patAddress.pAddPhone3 ?? "",
              pNokCountryVal:
                patientDetails.patAddress.pAddActualCountryVal ?? "",
              pNokPssnID: patientDetails.patRegisters.intIdPsprt ?? "",
            }));
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [setLoading, serverDate, setNextOfKinData]
  );

  const handleDateChange = useCallback((date: Date | null) => {
    setNextOfKinData((prev) => ({
      ...prev,
      pNokDob: date ? date : serverDate,
    }));
  }, []);

  const dialogContent = (
    <Grid container spacing={2}>

      <FormField
        type="radio"
        label="NOK Type"
        name="RegOrNonReg"
        ControlID="RegOrNonReg"
        value={nextOfkinData.pNokRegStatusVal}
        options={regOptions}
        onChange={handleRadioButtonChange(
          ["pNokRegStatusVal"],
          ["pNokRegStatus"],
          regOptions
        )}
        inline={true}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />
      {nextOfkinData.pNokRegStatusVal === "Y" && (
        <FormField
          type="autocomplete"
          label="UHID"
          name="pNokPChartCode"
          ControlID="UHID"
          value={nextOfkinData.pNokPChartCode}
          onChange={(e) =>
            setNextOfKinData({
              ...nextOfkinData,
              pNokPChartCode: e.target.value,
            })
          }
          fetchSuggestions={fetchPatientSuggestions}
          onSelectSuggestion={handlePatientSelect}
          isSubmitted={isSubmitted}
          isMandatory={true}
          placeholder="Search through UHID, Name, DOB, Phone No...."
          gridProps={{ xs: 12, sm: 6, md: 4 }}
        />
      )}

      <FormField
        type="select"
        label="Title"
        name="pNokTitleVal"
        ControlID="Title"
        value={String(nextOfkinData.pNokTitleVal)}
        options={dropdownValues.title}
        onChange={handleDropdownChange(
          ["pNokTitleVal"],
          ["pNokTitle"],
          dropdownValues.title
        )}
        isMandatory={true}
        isSubmitted={isSubmitted}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />

      <FormField
        type="text"
        label="First Name"
        name="pNokFName"
        ControlID="FirstName"
        value={nextOfkinData.pNokFName}
        onChange={handleTextChange("pNokFName")}
        isMandatory={true}
        isSubmitted={isSubmitted}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />

      <FormField
        type="text"
        label="Last Name"
        name="pNokLName"
        ControlID="LastName"
        value={nextOfkinData.pNokLName}
        onChange={handleTextChange("pNokLName")}
        isMandatory={true}
        isSubmitted={isSubmitted}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />

      <FormField
        type="select"
        label="Relationship"
        name="pNokRelNameVal"
        ControlID="Relationship"
        value={nextOfkinData.pNokRelNameVal}
        options={dropdownValues.relation}
        onChange={handleDropdownChange(
          ["pNokRelNameVal"],
          ["pNokRelName"],
          dropdownValues.relation
        )}
        isMandatory={true}
        isSubmitted={isSubmitted}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />

      <FormField
        type="datepicker"
        label="Birth Date"
        name="pNokDob"
        ControlID="BirthDate"
        value={nextOfkinData.pNokDob}
        onChange={handleDateChange}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />

      <FormField
        type="text"
        label="Mobile No"
        name="pAddPhone1"
        ControlID="MobileNo"
        value={nextOfkinData.pAddPhone1}
        onChange={handleTextChange("pAddPhone1")}
        maxLength={20}
        isMandatory={true}
        isSubmitted={isSubmitted}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />

      <FormField
        type="text"
        label="Address"
        name="pNokStreet"
        ControlID="Address"
        value={nextOfkinData.pNokStreet}
        onChange={handleTextChange("pNokStreet")}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />
      <FormField
        type="select"
        label="Area"
        name="pNokAreaVal"
        ControlID="Area"
        value={nextOfkinData.pNokAreaVal}
        options={dropdownValues.area}
        onChange={handleDropdownChange(
          ["pNokAreaVal"],
          ["pNokArea"],
          dropdownValues.area
        )}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />
      <FormField
        type="select"
        label="City"
        name="pNokCityVal"
        ControlID="City"
        value={nextOfkinData.pNokCityVal}
        options={dropdownValues.city}
        onChange={handleDropdownChange(
          ["pNokCityVal"],
          ["pNokCity"],
          dropdownValues.city
        )}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />
      <FormField
        type="select"
        label="Country"
        name="pNokActualCountryVal"
        ControlID="Country"
        value={nextOfkinData.pNokActualCountryVal}
        options={dropdownValues.country}
        onChange={handleDropdownChange(
          ["pNokActualCountryVal"],
          ["pNokActualCountry"],
          dropdownValues.country
        )}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />
      <FormField
        type="text"
        label="Post Code"
        name="pNokPostcode"
        ControlID="PostCode"
        value={nextOfkinData.pNokPostcode}
        onChange={handleTextChange("pNokPostcode")}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />
      <FormField
        type="text"
        label="Land Line No"
        name="pAddPhone3"
        ControlID="LandLineNo"
        value={nextOfkinData.pAddPhone3}
        onChange={handleTextChange("pAddPhone3")}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />
      <FormField
        type="select"
        label="Nationality"
        name="pNokCountryVal"
        ControlID="Nationality"
        value={nextOfkinData.pNokCountryVal}
        options={dropdownValues.country}
        onChange={handleDropdownChange(
          ["pNokCountryVal"],
          ["pNokCountry"],
          dropdownValues.country
        )}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />
      <FormField
        type="text"
        label="Passport No"
        name="pNokPssnID"
        ControlID="PassportNo"
        value={nextOfkinData.pNokPssnID}
        onChange={handleTextChange("pNokPssnID")}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />
      <FormField
        type="text"
        label="Work Phone No"
        name="pAddPhone2"
        ControlID="WorkPhoneNo"
        value={nextOfkinData.pAddPhone2}
        onChange={handleTextChange("pAddPhone2")}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
      />
    </Grid>
  );


  const dialogActions = (
    <>
      <CustomButton
        variant="contained"
        size="medium"
        onClick={handleCloseWithClear}
        text="Close"
        color="secondary"
        icon={CloseIcon}
        ariaLabel="Close"
      />
      <CustomButton
        icon={SaveIcon}
        variant="contained"
        size="medium"
        text="Save"
        color="success"
        onClick={handleSubmit}
        ariaLabel="Save Nok"
      />
    </>
  );

  return (
    <GenericDialog
      open={show}
      onClose={handleCloseWithClear}
      title="Add Next Of Kin"
      maxWidth="lg"
      fullWidth
      dialogContentSx={{ p: 2 }}
      actions={dialogActions}
      disableBackdropClick={true}
    >
      {dialogContent}
    </GenericDialog>
  );
};

export default React.memo(NextOfKinForm);