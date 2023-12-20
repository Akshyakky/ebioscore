import { Row, Col } from "react-bootstrap";
import TextBox from "../../../components/TextBox/TextBox ";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../components/RadioGroup/RadioGroup";
import { RegsitrationFormData } from "../../../types/registrationFormData";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/reducers";
import { AppModifyList } from "../../../services/CommonService/AppModifyListService";
import { useLoading } from "../../../context/LoadingContext";

interface DropdownOption {
  value: string;
  label: string;
}
interface ContactDetailsProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
  handleDropdownChange: (
    name: keyof RegsitrationFormData,
    options: { value: string; label: string }[]
  ) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
        const data = await AppModifyList.fetchAppModifyList(
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
  }, [token, endpoint, fieldCode]);

  return { options, error };
};

const ContactDetails: React.FC<ContactDetailsProps> = ({
  formData,
  setFormData,
}) => {
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
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
    "COUNTRY"
  );
  const { options: companyValues } = useDropdownFetcher(
    token,
    endPointAppModifyList,
    "COMPANY"
  );

  const handleDropdownChange =
    (
      name: keyof RegsitrationFormData,
      options: { value: string; label: string }[]
    ) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      // Find the option that matches the event target value
      const selectedOption = options.find(
        (option) => option.value === e.target.value
      );

      if (selectedOption) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: {
            value: selectedOption.value,
            label: selectedOption.label,
          },
        }));
      }
    };
  const handleRadioButtonChange =
    (name: keyof RegsitrationFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: e.target.value,
      }));
    };
  const smsOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const emailOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];
  return (
    <section aria-labelledby="contact-details-header">
      <Row>
        <Col>
          <h1 id="contact-details-header" className="section-header">
            Contact Details
          </h1>
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <TextBox
            ControlID="Address"
            title="Address"
            type="text"
            size="sm"
            placeholder="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="Area"
            name="Area"
            value={formData.area.value}
            options={areaValues}
            onChange={handleDropdownChange("area", areaValues)}
            size="sm"
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="City"
            name="City"
            value={formData.city.value}
            options={cityValues}
            onChange={handleDropdownChange("city", cityValues)}
            size="sm"
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="Country"
            name="Country"
            value={formData.country.value}
            options={countryValues}
            onChange={handleDropdownChange("country", countryValues)}
            size="sm"
          />
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <TextBox
            ControlID="PostCode"
            title="Post Code"
            type="text"
            size="sm"
            placeholder="Post Code"
            onChange={(e) =>
              setFormData({ ...formData, postCode: e.target.value })
            }
            value={formData.postCode}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <TextBox
            ControlID="Email"
            title="Email"
            type="email"
            size="sm"
            placeholder="Email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            value={formData.email}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="Company"
            name="Company"
            value={formData.company.value}
            options={companyValues}
            onChange={handleDropdownChange("company", companyValues)}
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
                selectedValue={formData.smsYN}
                onChange={handleRadioButtonChange("smsYN")}
                inline={true}
              />
            </Col>
            <Col xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
              <RadioGroup
                name="receiveEmail"
                label="Receive Email"
                options={emailOptions}
                selectedValue={formData.emailYN}
                onChange={handleRadioButtonChange("emailYN")}
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
