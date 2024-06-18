import React, { useState, useEffect } from "react";
import {
  Dialog,
  Grid,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { NextOfKinKinFormState } from "../../../../interfaces/PatientAdministration/NextOfKinData";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { useLoading } from "../../../../context/LoadingContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { ConstantValues } from "../../../../services/CommonServices/ConstantValuesService";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { AppModifyListService } from "../../../../services/CommonServices/AppModifyListService";
import AutocompleteTextBox from "../../../../components/TextBox/AutocompleteTextBox/AutocompleteTextBox";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import CustomButton from "../../../../components/Button/CustomButton";

interface NextOfKinPopupProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (kinDetails: NextOfKinKinFormState) => void;
  editData?: NextOfKinKinFormState | null;
}

const NextOfKinPopup: React.FC<NextOfKinPopupProps> = ({
  show,
  handleClose,
  handleSave,
  editData,
}) => {
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { fetchPatientSuggestions } = usePatientAutocomplete(token);

  const nextOfKinInitialFormState: NextOfKinKinFormState = {
    ID: 0,
    PNokID: 0,
    PChartID: 0,
    PNokPChartID: 0,
    PNokPChartCode: "",
    PNokRegStatusVal: "Y",
    PNokRegStatus: "Registered",
    PNokPssnID: "",
    PNokDob: new Date().toISOString().split("T")[0],
    PNokRelNameVal: "",
    PNokRelName: "",
    PNokTitleVal: "",
    PNokTitle: "",
    PNokFName: "",
    PNokMName: "",
    PNokLName: "",
    PNokActualCountryVal: "",
    PNokActualCountry: "",
    PNokAreaVal: "",
    PNokArea: "",
    PNokCityVal: "",
    PNokCity: "",
    PNokCountryVal: "",
    PNokCountry: "",
    PNokDoorNo: "",
    PAddPhone1: "",
    PAddPhone2: "",
    PAddPhone3: "",
    PNokPostcode: "",
    PNokState: "",
    PNokStreet: "",
    RActiveYN: "Y",
    RCreatedID: userInfo.userID !== null ? userInfo.userID : 0,
    RCreatedBy: userInfo.userName !== null ? userInfo.userName : "",
    RCreatedOn: new Date().toISOString().split("T")[0],
    RModifiedID: userInfo.userID !== null ? userInfo.userID : 0,
    RModifiedBy: userInfo.userName !== null ? userInfo.userName : "",
    RModifiedOn: new Date().toISOString().split("T")[0],
  };
  const [nextOfkinData, setNextOfKinData] = useState<NextOfKinKinFormState>(
    nextOfKinInitialFormState
  );
  const { PNokRegStatusVal } = nextOfkinData;
  const [titleValues, setTitleValues] = useState<DropdownOption[]>([]);
  const { setLoading } = useLoading();

  const { handleDropdownChange } =
    useDropdownChange<NextOfKinKinFormState>(setNextOfKinData);
  const { handleRadioButtonChange } =
    useRadioButtonChange<NextOfKinKinFormState>(setNextOfKinData);
  const [relationValues, setRelationValues] = useState<DropdownOption[]>([]);
  const [areaValues, setAreaValues] = useState<DropdownOption[]>([]);
  const [cityValues, setCityValues] = useState<DropdownOption[]>([]);
  const [countryValues, setCountryValues] = useState<DropdownOption[]>([]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (
      nextOfkinData.PNokTitle.trim() &&
      nextOfkinData.PNokFName.trim() &&
      nextOfkinData.PNokLName.trim() &&
      nextOfkinData.PAddPhone1.trim() &&
      nextOfkinData.PNokRelName.trim()
    ) {
      handleSave(nextOfkinData);
      resetNextOfKinFormData();
      setIsSubmitted(false);
    }
  };
  const resetNextOfKinFormData = () => {
    setNextOfKinData(nextOfKinInitialFormState);
  };
  const handleCloseWithClear = () => {
    setIsSubmitted(false);
    resetNextOfKinFormData();
    handleClose();
  };
  const regOptions = [
    { value: "Y", label: "Registered" },
    { value: "N", label: "Non Registered" },
  ];

  const endpointConstantValues = "GetConstantValues";
  const endPointAppModifyList = "GetActiveAppModifyFieldsAsync";
  useEffect(() => {
    const loadDropdownValues = async () => {
      try {
        setLoading(true);
        const responseTitle = await ConstantValues.fetchConstantValues(
          token,
          endpointConstantValues,
          "PTIT"
        );
        const transformedTitleData: DropdownOption[] = responseTitle.map(
          (item) => ({
            value: item.value,
            label: item.label,
          })
        );
        setTitleValues(transformedTitleData);
        const responseRelation = await AppModifyListService.fetchAppModifyList(
          token,
          endPointAppModifyList,
          "RELATION"
        );
        const transformedRelationData: DropdownOption[] = responseRelation.map(
          (item) => ({
            value: item.value,
            label: item.label,
          })
        );
        setRelationValues(transformedRelationData);
        const responseArea = await AppModifyListService.fetchAppModifyList(
          token,
          endPointAppModifyList,
          "AREA"
        );
        const transformedAreaData: DropdownOption[] = responseArea.map(
          (item) => ({
            value: item.value,
            label: item.label,
          })
        );
        setAreaValues(transformedAreaData);
        const responseCity = await AppModifyListService.fetchAppModifyList(
          token,
          endPointAppModifyList,
          "CITY"
        );
        const transformedCityData: DropdownOption[] = responseCity.map(
          (item) => ({
            value: item.value,
            label: item.label,
          })
        );
        setCityValues(transformedCityData);
        const responseCountry = await AppModifyListService.fetchAppModifyList(
          token,
          endPointAppModifyList,
          "ACTUALCOUNTRY"
        );
        const transformedCountryData: DropdownOption[] = responseCountry.map(
          (item) => ({
            value: item.value,
            label: item.label,
          })
        );
        setCountryValues(transformedCountryData);
      } catch (error) {
        console.error("Error fetching dropdown values:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownValues();
  }, [token]);

  useEffect(() => {
    if (editData) {
      setNextOfKinData(editData);
    }
  }, [editData]);
  return (
    <Dialog open={show} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Add Next Of Kin</DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <RadioGroup
              name="RegOrNonReg"
              label="NOK Type"
              options={regOptions}
              selectedValue={nextOfkinData.PNokRegStatusVal}
              onChange={handleRadioButtonChange(
                ["PNokRegStatusVal"],
                ["PNokRegStatus"],
                regOptions
              )}
              inline={true}
            />
          </Grid>
          {PNokRegStatusVal === "Y" && (
            <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
              <AutocompleteTextBox
                ControlID="UHID"
                title="UHID"
                type="text"
                size="small"
                placeholder="Search through UHID, Name, DOB, Phone No...."
                value={nextOfkinData.PNokPChartCode}
                onChange={(e) =>
                  setNextOfKinData({
                    ...nextOfkinData,
                    PNokPChartCode: e.target.value,
                  })
                }
                //onBlur={handleUHIDBlur}
                fetchSuggestions={fetchPatientSuggestions}
                inputValue={nextOfkinData.PNokPChartCode}
                isSubmitted={isSubmitted}
                isMandatory={true}
                //onSelectSuggestion={onPatientSelect}
              />
            </Grid>
          )}
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <DropdownSelect
              label="Title"
              name="Title"
              value={String(nextOfkinData.PNokTitleVal)}
              options={titleValues}
              onChange={handleDropdownChange(
                ["PNokTitleVal"],
                ["PNokTitle"],
                titleValues
              )}
              size="small"
              isMandatory={true}
              isSubmitted={isSubmitted}
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <FloatingLabelTextBox
              ControlID="FirstName"
              title="First Name"
              type="text"
              size="small"
              placeholder="First Name"
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PNokFName: e.target.value,
                })
              }
              value={nextOfkinData.PNokFName}
              isMandatory={true}
              isSubmitted={isSubmitted}
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <FloatingLabelTextBox
              ControlID="Last Name"
              title="Last Name"
              type="text"
              size="small"
              placeholder="Last Name"
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PNokLName: e.target.value,
                })
              }
              value={nextOfkinData.PNokLName}
              isMandatory={true}
              isSubmitted={isSubmitted}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <DropdownSelect
              label="Relationship"
              name="Relationship"
              value={nextOfkinData.PNokRelNameVal}
              options={relationValues}
              onChange={handleDropdownChange(
                ["PNokRelNameVal"],
                ["PNokRelName"],
                relationValues
              )}
              size="small"
              isMandatory={true}
              isSubmitted={isSubmitted}
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <FloatingLabelTextBox
              ControlID="BirthDate"
              title="Birth Date"
              type="date"
              size="small"
              placeholder="Birth Date"
              onChange={(e) =>
                setNextOfKinData({ ...nextOfkinData, PNokDob: e.target.value })
              }
              value={nextOfkinData.PNokDob}
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <FloatingLabelTextBox
              ControlID="MobileNo"
              title="Mobile No"
              type="text"
              size="small"
              placeholder="Mobile No"
              value={nextOfkinData.PAddPhone1}
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PAddPhone1: e.target.value,
                })
              }
              maxLength={20}
              isMandatory={true}
              isSubmitted={isSubmitted}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <FloatingLabelTextBox
              ControlID="Address"
              title="Address"
              type="text"
              size="small"
              placeholder="Address"
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PNokStreet: e.target.value,
                })
              }
              value={nextOfkinData.PNokStreet}
              isMandatory={true}
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <DropdownSelect
              label="Area"
              name="Area"
              value={nextOfkinData.PNokAreaVal}
              options={areaValues}
              onChange={handleDropdownChange(
                ["PNokAreaVal"],
                ["PNokArea"],
                areaValues
              )}
              size="small"
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <DropdownSelect
              label="City"
              name="City"
              value={nextOfkinData.PNokCityVal}
              options={cityValues}
              onChange={handleDropdownChange(
                ["PNokCityVal"],
                ["PNokCity"],
                areaValues
              )}
              size="small"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <DropdownSelect
              label="Country"
              name="Country"
              value={nextOfkinData.PNokActualCountryVal}
              options={countryValues}
              onChange={handleDropdownChange(
                ["PNokActualCountryVal"],
                ["PNokActualCountry"],
                countryValues
              )}
              size="small"
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <FloatingLabelTextBox
              ControlID="PostCode"
              title="Post Code"
              type="text"
              size="small"
              placeholder="Post Code"
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PNokPostcode: e.target.value,
                })
              }
              value={nextOfkinData.PNokPostcode}
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <FloatingLabelTextBox
              ControlID="LandLineNo"
              title="Land Line No"
              type="text"
              size="small"
              placeholder="Land Line No"
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PAddPhone3: e.target.value,
                })
              }
              value={nextOfkinData.PAddPhone3}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <DropdownSelect
              label="Nationality"
              name="Nationality"
              value={nextOfkinData.PNokCountryVal}
              options={countryValues}
              onChange={handleDropdownChange(
                ["PNokCountryVal"],
                ["PNokCountry"],
                countryValues
              )}
              size="small"
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <FloatingLabelTextBox
              ControlID="PassportNo"
              title="Passport No"
              type="text"
              size="small"
              placeholder="Passport No"
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PNokPssnID: e.target.value,
                })
              }
              value={nextOfkinData.PNokPssnID}
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <FloatingLabelTextBox
              ControlID="WorkPhoneNo"
              title="Work Phone No"
              type="text"
              size="small"
              placeholder="Work Phone No"
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PAddPhone2: e.target.value,
                })
              }
              value={nextOfkinData.PAddPhone2}
            />
          </Grid>
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
        />
        <CustomButton
          icon={SaveIcon}
          variant="contained"
          size="medium"
          text="Save"
          color="success"
          onClick={handleSubmit}
        />
      </DialogActions>
    </Dialog>
  );
};

export default NextOfKinPopup;
