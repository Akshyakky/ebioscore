import React, { useState, ChangeEvent, useEffect } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Kin } from "../../../../interfaces/PatientAdministration/NextOfKinData";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { useLoading } from "../../../../context/LoadingContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { ConstantValues } from "../../../../services/CommonService/ConstantValuesService";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import TextBox from "../../../../components/TextBox/TextBox ";
import { AppModifyListService } from "../../../../services/CommonService/AppModifyListService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

interface NextOfKinPopupProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (kinDetails: Kin) => void;
  editData?: Kin | null;
}

const NextOfKinPopup: React.FC<NextOfKinPopupProps> = ({
  show,
  handleClose,
  handleSave,
  editData,
}) => {
  const [kinData, setKinData] = useState<Kin>({
    PNokID: 0,
    PNokRelName: "",
    PNokRelNameValue: "",
    PNokRegYN: "Y",
    PNokTitleValue: "",
    PNokTitle: "",
    PNokFName: "",
    PNokLName: "",
    PNokDob: "",
    NokAddress: "",
    PNokAreaValue: "",
    PNokArea: "",
    PNokCityValue: "",
    PNokCity: "",
    PNokActualCountryValue: "",
    PNokActualCountry: "",
    PAddPhone1: "",
    NokPostCode: "",
    PNokCountryValue: "",
    PNokCountry: "",
    PNokPssnID: "",
    PAddPhone2: "",
    PAddPhone3: "",
  });
  const [titleValues, setTitleValues] = useState<DropdownOption[]>([]);
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const { handleDropdownChange } = useDropdownChange<Kin>(setKinData);
  const { handleRadioButtonChange } = useRadioButtonChange<Kin>(setKinData);
  const [relationValues, setRelationValues] = useState<DropdownOption[]>([]);
  const [areaValues, setAreaValues] = useState<DropdownOption[]>([]);
  const [cityValues, setCityValues] = useState<DropdownOption[]>([]);
  const [countryValues, setCountryValues] = useState<DropdownOption[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKinData({ ...kinData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    handleSave(kinData);
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
      setKinData(editData);
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
              selectedValue={kinData.PNokRegYN}
              onChange={handleRadioButtonChange("PNokRegYN")}
              inline={true}
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              label="Title"
              name="Title"
              value={String(kinData.PNokTitleValue)}
              options={titleValues}
              onChange={handleDropdownChange(
                ["PNokTitleValue"],
                ["PNokTitle"],
                titleValues
              )}
              size="sm"
              isMandatory={true}
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="FirstName"
              title="First Name"
              type="text"
              size="sm"
              placeholder="First Name"
              onChange={(e) =>
                setKinData({ ...kinData, PNokFName: e.target.value })
              }
              value={kinData.PNokFName}
              isMandatory={true}
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="Last Name"
              title="Last Name"
              type="text"
              size="sm"
              placeholder="Last Name"
              onChange={(e) =>
                setKinData({ ...kinData, PNokLName: e.target.value })
              }
              value={kinData.PNokLName}
              isMandatory={true}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              label="Relationship"
              name="Relationship"
              value={kinData.PNokRelNameValue}
              options={relationValues}
              onChange={handleDropdownChange(
                ["PNokRelNameValue"],
                ["PNokRelName"],
                relationValues
              )}
              size="sm"
              isMandatory={true}
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="BirthDate"
              title="Birth Date"
              type="date"
              size="sm"
              placeholder="Birth Date"
              onChange={(e) =>
                setKinData({ ...kinData, PNokDob: e.target.value })
              }
              value={kinData.PNokDob}
              isMandatory={true}
            />
          </Col>
          <TextBox
            ControlID="MobileNo"
            title="Mobile No"
            type="text"
            size="sm"
            placeholder="Mobile No"
            value={kinData.PAddPhone1}
            onChange={(e) =>
              setKinData({ ...kinData, PAddPhone1: e.target.value })
            }
            maxLength={20}
          />
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="Address"
              title="Address"
              type="text"
              size="sm"
              placeholder="Address"
              onChange={(e) =>
                setKinData({ ...kinData, NokAddress: e.target.value })
              }
              value={kinData.NokAddress}
              isMandatory={true}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              label="Area"
              name="Area"
              value={kinData.PNokAreaValue}
              options={areaValues}
              onChange={handleDropdownChange(
                ["PNokAreaValue"],
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
              value={kinData.PNokCityValue}
              options={cityValues}
              onChange={handleDropdownChange(
                ["PNokCityValue"],
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
              value={kinData.PNokActualCountryValue}
              options={countryValues}
              onChange={handleDropdownChange(
                ["PNokActualCountryValue"],
                ["PNokActualCountry"],
                countryValues
              )}
              size="sm"
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="PostCode"
              title="Post Code"
              type="text"
              size="sm"
              placeholder="Post Code"
              onChange={(e) =>
                setKinData({ ...kinData, NokPostCode: e.target.value })
              }
              value={kinData.NokPostCode}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              label="Nationality"
              name="Nationality"
              value={kinData.PNokCountryValue}
              options={countryValues}
              onChange={handleDropdownChange(
                ["PNokCountryValue"],
                ["PNokCountry"],
                countryValues
              )}
              size="sm"
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="PassportNo"
              title="Passport No"
              type="text"
              size="sm"
              placeholder="Passport No"
              onChange={(e) =>
                setKinData({ ...kinData, PNokPssnID: e.target.value })
              }
              value={kinData.PNokPssnID}
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="WorkPhoneNo"
              title="Work Phone No"
              type="text"
              size="sm"
              placeholder="Work Phone No"
              onChange={(e) =>
                setKinData({ ...kinData, PAddPhone2: e.target.value })
              }
              value={kinData.PAddPhone2}
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="LandLineNo"
              title="Land Line No"
              type="text"
              size="sm"
              placeholder="Land Line No"
              onChange={(e) =>
                setKinData({ ...kinData, PAddPhone3: e.target.value })
              }
              value={kinData.PAddPhone3}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={handleClose}>
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
