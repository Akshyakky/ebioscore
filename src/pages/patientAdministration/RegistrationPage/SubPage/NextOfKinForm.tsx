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
import { PatNokDetailsDto } from "../../../../interfaces/PatientAdministration/PatNokDetailsDto";
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
import { format } from "date-fns";

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
  const token = userInfo.token!;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { fetchPatientSuggestions } = usePatientAutocomplete(token);

  const nextOfKinInitialFormState: PatNokDetailsDto = {
    ID: 0,
    pNokID: 0,
    pChartID: 0,
    pNokPChartID: 0,
    pNokRegStatusVal: "Y",
    pNokRegStatus: "Registered",
    pNokPssnID: "",
    pNokDob: format(new Date(), "yyyy-MM-dd"),
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
    rCreatedID: userInfo.userID !== null ? userInfo.userID : 0,
    rCreatedBy: userInfo.userName !== null ? userInfo.userName : "",
    rCreatedOn: new Date(),
    rModifiedID: userInfo.userID !== null ? userInfo.userID : 0,
    rModifiedBy: userInfo.userName !== null ? userInfo.userName : "",
    rModifiedOn: new Date(),
  };

  const [nextOfkinData, setNextOfKinData] = useState<PatNokDetailsDto>(
    nextOfKinInitialFormState
  );
  const { pNokRegStatusVal } = nextOfkinData;
  const [titleValues, setTitleValues] = useState<DropdownOption[]>([]);
  const { setLoading } = useLoading();

  const { handleDropdownChange } =
    useDropdownChange<PatNokDetailsDto>(setNextOfKinData);
  const { handleRadioButtonChange } =
    useRadioButtonChange<PatNokDetailsDto>(setNextOfKinData);
  const [relationValues, setRelationValues] = useState<DropdownOption[]>([]);
  const [areaValues, setAreaValues] = useState<DropdownOption[]>([]);
  const [cityValues, setCityValues] = useState<DropdownOption[]>([]);
  const [countryValues, setCountryValues] = useState<DropdownOption[]>([]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (
      nextOfkinData.pNokTitle.trim() &&
      nextOfkinData.pNokFName.trim() &&
      nextOfkinData.pNokLName &&
      nextOfkinData.pNokLName.trim() &&
      nextOfkinData.pAddPhone1 &&
      nextOfkinData.pAddPhone1.trim() &&
      nextOfkinData.pNokRelName.trim()
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
      setNextOfKinData({
        ...editData,
        pNokDob: format(new Date(editData.pNokDob), "yyyy-MM-dd"),
      });
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
              selectedValue={nextOfkinData.pNokRegStatusVal}
              onChange={handleRadioButtonChange(
                ["pNokRegStatusVal"],
                ["pNokRegStatus"],
                regOptions
              )}
              inline={true}
            />
          </Grid>
          {pNokRegStatusVal === "Y" && (
            <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
              <AutocompleteTextBox
                ControlID="UHID"
                title="UHID"
                type="text"
                size="small"
                placeholder="Search through UHID, Name, DOB, Phone No...."
                value={nextOfkinData.pNokPChartCode}
                onChange={(e) =>
                  setNextOfKinData({
                    ...nextOfkinData,
                    pNokPChartCode: e.target.value,
                  })
                }
                //onBlur={handleUHIDBlur}
                fetchSuggestions={fetchPatientSuggestions}
                inputValue={nextOfkinData.pNokPChartCode}
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
              value={String(nextOfkinData.pNokTitleVal)}
              options={titleValues}
              onChange={handleDropdownChange(
                ["pNokTitleVal"],
                ["pNokTitle"],
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
                  pNokFName: e.target.value,
                })
              }
              value={nextOfkinData.pNokFName}
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
                  pNokLName: e.target.value,
                })
              }
              value={nextOfkinData.pNokLName}
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
              value={nextOfkinData.pNokRelNameVal}
              options={relationValues}
              onChange={handleDropdownChange(
                ["pNokRelNameVal"],
                ["pNokRelName"],
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
                setNextOfKinData({
                  ...nextOfkinData,
                  pNokDob: e.target.value,
                })
              }
              value={nextOfkinData.pNokDob}
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <FloatingLabelTextBox
              ControlID="MobileNo"
              title="Mobile No"
              type="text"
              size="small"
              placeholder="Mobile No"
              value={nextOfkinData.pAddPhone1}
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  pAddPhone1: e.target.value,
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
                  pNokStreet: e.target.value,
                })
              }
              value={nextOfkinData.pNokStreet}
              isMandatory={true}
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <DropdownSelect
              label="Area"
              name="Area"
              value={nextOfkinData.pNokAreaVal}
              options={areaValues}
              onChange={handleDropdownChange(
                ["pNokAreaVal"],
                ["pNokArea"],
                areaValues
              )}
              size="small"
            />
          </Grid>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <DropdownSelect
              label="City"
              name="City"
              value={nextOfkinData.pNokCityVal}
              options={cityValues}
              onChange={handleDropdownChange(
                ["pNokCityVal"],
                ["pNokCity"],
                cityValues
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
              value={nextOfkinData.pNokActualCountryVal}
              options={countryValues}
              onChange={handleDropdownChange(
                ["pNokActualCountryVal"],
                ["pNokActualCountry"],
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
                  pNokPostcode: e.target.value,
                })
              }
              value={nextOfkinData.pNokPostcode}
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
                  pAddPhone3: e.target.value,
                })
              }
              value={nextOfkinData.pAddPhone3}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={4} lg={4} sm={12} xs={12} xl={4}>
            <DropdownSelect
              label="Nationality"
              name="Nationality"
              value={nextOfkinData.pNokCountryVal}
              options={countryValues}
              onChange={handleDropdownChange(
                ["pNokCountryVal"],
                ["pNokCountry"],
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
                  pNokPssnID: e.target.value,
                })
              }
              value={nextOfkinData.pNokPssnID}
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
                  pAddPhone2: e.target.value,
                })
              }
              value={nextOfkinData.pAddPhone2}
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

export default NextOfKinForm;
