import { Row, Col } from "react-bootstrap";
import TextBox from "../../../components/TextBox/TextBox ";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../components/RadioGroup/RadioGroup";
import { RegsitrationFormData } from "../../../types/registrationFormData";

interface ContactDetailsProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
  handleDropdownChange: (
    name: keyof RegsitrationFormData,
    options: { value: string; label: string }[]
  ) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
const ContactDetails: React.FC<ContactDetailsProps> = ({
  formData,
  setFormData,
}) => {
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
  const areaValues = [
    { value: "1", label: "Jokatte" },
    { value: "2", label: "Baikampady" },
    { value: "3", label: "Surathkal" },
  ];
  const cityValues = [
    { value: "1", label: "Mangalore" },
    { value: "2", label: "Bangalore" },
    { value: "3", label: "Mysore" },
  ];
  const countryValues = [
    { value: "1", label: "India" },
    { value: "2", label: "America" },
    { value: "3", label: "Australia" },
  ];
  const companyValues = [
    { value: "1", label: "Company 1" },
    { value: "2", label: "Company 2" },
    { value: "3", label: "Company 3" },
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
