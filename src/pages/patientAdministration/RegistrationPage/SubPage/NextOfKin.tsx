import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { NextOfKinKinFormState } from "../../../../interfaces/PatientAdministration/NextOfKinData";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { useLoading } from "../../../../context/LoadingContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { ConstantValues } from "../../../../services/CommonService/ConstantValuesService";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { AppModifyListService } from "../../../../services/CommonService/AppModifyListService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

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

  const nextOfKinInitialFormState: NextOfKinKinFormState = {
    ID: 0,
    PNokID: 0,
    PChartID: 0,
    PNokPChartID: 0,
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
    <Modal
      className="custom-large-modal"
      scrollable={true}
      show={show}
      onHide={handleClose}
      backdrop={"static"}
    >
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>Add Next of Kin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
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
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
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
              size="sm"
              isMandatory={true}
              isSubmitted={isSubmitted}
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <FloatingLabelTextBox
              ControlID="FirstName"
              title="First Name"
              type="text"
              size="sm"
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
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <FloatingLabelTextBox
              ControlID="Last Name"
              title="Last Name"
              type="text"
              size="sm"
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
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
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
              size="sm"
              isMandatory={true}
              isSubmitted={isSubmitted}
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <FloatingLabelTextBox
              ControlID="BirthDate"
              title="Birth Date"
              type="date"
              size="sm"
              placeholder="Birth Date"
              onChange={(e) =>
                setNextOfKinData({ ...nextOfkinData, PNokDob: e.target.value })
              }
              value={nextOfkinData.PNokDob}
            />
          </Col>
          <FloatingLabelTextBox
            ControlID="MobileNo"
            title="Mobile No"
            type="text"
            size="sm"
            placeholder="Mobile No"
            value={nextOfkinData.PAddPhone1}
            onChange={(e) =>
              setNextOfKinData({ ...nextOfkinData, PAddPhone1: e.target.value })
            }
            maxLength={20}
            isMandatory={true}
            isSubmitted={isSubmitted}
          />
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <FloatingLabelTextBox
              ControlID="Address"
              title="Address"
              type="text"
              size="sm"
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
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
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
              size="sm"
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
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
              size="sm"
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
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
              size="sm"
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <FloatingLabelTextBox
              ControlID="PostCode"
              title="Post Code"
              type="text"
              size="sm"
              placeholder="Post Code"
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PNokPostcode: e.target.value,
                })
              }
              value={nextOfkinData.PNokPostcode}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
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
              size="sm"
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <FloatingLabelTextBox
              ControlID="PassportNo"
              title="Passport No"
              type="text"
              size="sm"
              placeholder="Passport No"
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PNokPssnID: e.target.value,
                })
              }
              value={nextOfkinData.PNokPssnID}
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <FloatingLabelTextBox
              ControlID="WorkPhoneNo"
              title="Work Phone No"
              type="text"
              size="sm"
              placeholder="Work Phone No"
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PAddPhone2: e.target.value,
                })
              }
              value={nextOfkinData.PAddPhone2}
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <FloatingLabelTextBox
              ControlID="LandLineNo"
              title="Land Line No"
              type="text"
              size="sm"
              placeholder="Land Line No"
              onChange={(e) =>
                setNextOfKinData({
                  ...nextOfkinData,
                  PAddPhone3: e.target.value,
                })
              }
              value={nextOfkinData.PAddPhone3}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={handleCloseWithClear}>
          <FontAwesomeIcon icon={faTimes} /> Close
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          <FontAwesomeIcon icon={faSave} /> Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NextOfKinPopup;
