import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, Grid, DialogTitle, DialogContent, DialogActions } from "@mui/material";
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
import useDayjs from "../../../../hooks/Common/useDateTime";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { useLoading } from "../../../../context/LoadingContext";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";

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

  const { titleValues, relationValues, areaValues, cityValues, countryValues } = useDropdownValues();

  const nextOfKinInitialFormState: PatNokDetailsDto = useMemo(() => ({
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
    transferYN: 'N'
  }), [userInfo, serverDate]);
  const [nextOfkinData, setNextOfKinData] = useState<PatNokDetailsDto>(nextOfKinInitialFormState);
  const { handleDropdownChange } = useDropdownChange<PatNokDetailsDto>(setNextOfKinData);
  const { handleRadioButtonChange } = useRadioButtonChange<PatNokDetailsDto>(setNextOfKinData);
  const { setLoading } = useLoading();

  useEffect(() => {
    if (editData) {
      setNextOfKinData({
        ...editData,
        pNokDob: editData.pNokDob,
      });
    }
  }, [editData]);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    if (
      nextOfkinData.pNokTitle.trim() &&
      nextOfkinData.pNokFName.trim() &&
      nextOfkinData.pNokLName.trim() &&
      nextOfkinData.pAddPhone1.trim() &&
      nextOfkinData.pNokRelName.trim()
    ) {
      handleSave(nextOfkinData);
      resetNextOfKinFormData();
      setIsSubmitted(false);
    }
  }, [nextOfkinData, handleSave]);

  const resetNextOfKinFormData = useCallback(() => {
    setNextOfKinData(nextOfKinInitialFormState);
  }, [nextOfKinInitialFormState]);

  const handleCloseWithClear = useCallback(() => {
    setIsSubmitted(false);
    resetNextOfKinFormData();
    handleClose();
  }, [resetNextOfKinFormData, handleClose]);

  const regOptions = useMemo(() => [
    { value: "Y", label: "Registered" },
    { value: "N", label: "Non Registered" },
  ], []);

  const handleTextChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setNextOfKinData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  }, []);

  const handlePatientSelect = useCallback(async (selectedSuggestion: string) => {
    setLoading(true);
    try {
      const pChartID = extractNumbers(selectedSuggestion)[0] || null;
      if (pChartID) {
        setNextOfKinData(prev => ({
          ...prev,
          pNokPChartCode: selectedSuggestion.split("|")[0].trim(),
          pNokPChartID: pChartID,
        }));
      }
    } catch (error) {

    }
    finally {
      setLoading(false);
    }
  }, []);

  const handleDateChange = useCallback((date: Date | null) => {
    setNextOfKinData(prev => ({
      ...prev,
      pNokDob: date ? date : serverDate,
    }));
  }, []);

  return (
    <Dialog open={show} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Add Next Of Kin</DialogTitle>
      <DialogContent>
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
                setNextOfKinData({ ...nextOfkinData, pNokPChartCode: e.target.value })
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
            options={titleValues}
            onChange={handleDropdownChange(
              ["pNokTitleVal"],
              ["pNokTitle"],
              titleValues
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
            options={relationValues}
            onChange={handleDropdownChange(
              ["pNokRelNameVal"],
              ["pNokRelName"],
              relationValues
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
            options={areaValues}
            onChange={handleDropdownChange(
              ["pNokAreaVal"],
              ["pNokArea"],
              areaValues
            )}
            gridProps={{ xs: 12, sm: 6, md: 4 }}
          />
          <FormField
            type="select"
            label="City"
            name="pNokCityVal"
            ControlID="City"
            value={nextOfkinData.pNokCityVal}
            options={cityValues}
            onChange={handleDropdownChange(
              ["pNokCityVal"],
              ["pNokCity"],
              cityValues
            )}
            gridProps={{ xs: 12, sm: 6, md: 4 }}
          />
          <FormField
            type="select"
            label="Country"
            name="pNokActualCountryVal"
            ControlID="Country"
            value={nextOfkinData.pNokActualCountryVal}
            options={countryValues}
            onChange={handleDropdownChange(
              ["pNokActualCountryVal"],
              ["pNokActualCountry"],
              countryValues
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
            options={countryValues}
            onChange={handleDropdownChange(
              ["pNokCountryVal"],
              ["pNokCountry"],
              countryValues
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
      </DialogContent>
      <DialogActions>
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
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(NextOfKinForm);