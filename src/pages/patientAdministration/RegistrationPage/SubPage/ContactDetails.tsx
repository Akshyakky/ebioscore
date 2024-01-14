import { Row, Col } from "react-bootstrap";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import { RegsitrationFormData } from "../../../../interfaces/PatientAdministration/registrationFormData";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { AppModifyListService } from "../../../../services/CommonService/AppModifyListService";
import { useLoading } from "../../../../context/LoadingContext";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";

interface ContactDetailsProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
  isSubmitted: boolean;
}

// Assuming token is a string, endpoint is a string, and fieldCode is a string
const useDropdownFetcher = (
  token: string,
  endpoint: string,
  fieldCode: string
) => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [error, setError] = useState<any>(null); // Use 'any' or a more specific type for error
  const { setLoading } = useLoading();
  useEffect(() => {
    let cancel = false;
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const data = await AppModifyListService.fetchAppModifyList(
          token,
          endpoint,
          fieldCode
        );
        if (!cancel) {
          setOptions(
            data.map((item) => ({ value: item.value, label: item.label }))
          );
        }
      } catch (err) {
        if (!cancel) {
          console.error(`Error fetching ${fieldCode} values:`, err);
          setError(err);
        }
      } finally {
        if (!cancel) {
          setLoading(false);
        }
      }
    };

    fetchOptions();

    return () => {
      cancel = true;
    };
  }, [token, fieldCode]);

  return { options, error };
};

const ContactDetails: React.FC<ContactDetailsProps> = ({
  formData,
  setFormData,
  isSubmitted,
}) => {
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;

  const { handleDropdownChange } =
    useDropdownChange<RegsitrationFormData>(setFormData);
  const { handleRadioButtonChange } =
    useRadioButtonChange<RegsitrationFormData>(setFormData);

  const endPointAppModifyList = "GetActiveAppModifyFieldsAsync";
  const { options: areaValues } = useDropdownFetcher(
    token,
    endPointAppModifyList,
    "AREA"
  );
  const { options: cityValues } = useDropdownFetcher(
    token,
    endPointAppModifyList,
    "CITY"
  );
  const { options: countryValues } = useDropdownFetcher(
    token,
    endPointAppModifyList,
    "ACTUALCOUNTRY"
  );
  const { options: companyValues } = useDropdownFetcher(
    token,
    endPointAppModifyList,
    "COMPANY"
  );

  const smsOptions = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ];

  const emailOptions = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ];
  return (
    <section aria-labelledby="contact-details-header">
      <Row>
        <Col>
          <h1 id="contact-details-header" className="section-header">
            <Button
              variant="dark border"
              size="sm"
              style={{ marginRight: "8px" }}
            >
              <FontAwesomeIcon icon={faStar} />
            </Button>
            CONTACT DETAILS
          </h1>
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <FloatingLabelTextBox
            ControlID="Address"
            title="Address"
            type="text"
            size="sm"
            placeholder="Address"
            value={formData.PatAddress.PAddStreet}
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                PatAddress: {
                  ...prevFormData.PatAddress,
                  PAddStreet: e.target.value,
                },
              }))
            }
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="Area"
            name="Area"
            value={formData.PatAddress.PatAreaVal}
            options={areaValues}
            onChange={handleDropdownChange(
              ["PatAddress", "PatAreaVal"],
              ["PatAddress", "PatArea"],
              areaValues
            )}
            size="sm"
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="City"
            name="City"
            value={String(formData.PatAddress.PAddCityVal)}
            options={cityValues}
            onChange={handleDropdownChange(
              ["PatAddress", "PAddCityVal"],
              ["PatAddress", "PAddCity"],
              cityValues
            )}
            size="sm"
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="Country"
            name="Country"
            value={formData.PatAddress.PAddActualCountryVal}
            options={countryValues}
            onChange={handleDropdownChange(
              ["PatAddress", "PAddActualCountryVal"],
              ["PatAddress", "PAddActualCountry"],
              countryValues
            )}
            size="sm"
          />
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <FloatingLabelTextBox
            ControlID="PostCode"
            title="Post Code"
            type="text"
            size="sm"
            placeholder="Post Code"
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                PatAddress: {
                  ...prevFormData.PatAddress,
                  PAddPostcode: e.target.value,
                },
              }))
            }
            value={formData.PatAddress.PAddPostcode}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <FloatingLabelTextBox
            ControlID="Email"
            title="Email"
            type="email"
            size="sm"
            placeholder="Email"
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                PatAddress: {
                  ...prevFormData.PatAddress,
                  PAddEmail: e.target.value,
                },
              }))
            }
            value={formData.PatAddress.PAddEmail}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="Company"
            name="Company"
            value={formData.PatCompNameVal}
            options={companyValues}
            onChange={handleDropdownChange(
              ["PatCompNameVal"],
              ["PatCompName"],
              companyValues
            )}
            size="sm"
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <Row>
            <Col xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
              <RadioGroup
                name="receiveSMS"
                label="Receive SMS"
                options={smsOptions}
                selectedValue={formData.PatAddress.PAddSMSVal}
                onChange={handleRadioButtonChange(
                  ["PatAddress", "PAddSMSVal"],
                  ["PatAddress", "PAddSMS"],
                  smsOptions
                )}
                inline={true}
              />
            </Col>
            <Col xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
              <RadioGroup
                name="receiveEmail"
                label="Receive Email"
                options={emailOptions}
                selectedValue={formData.PatAddress.PAddMailVal}
                onChange={handleRadioButtonChange(
                  ["PatAddress", "PAddMailVal"],
                  ["PatAddress", "PAddMail"],
                  emailOptions
                )}
                inline={true}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </section>
  );
};

export default ContactDetails;
