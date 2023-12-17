import { Row, Col } from "react-bootstrap";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import TextBox from "../../../components/TextBox/TextBox ";
import React from "react";
import { RegsitrationFormData } from "../../../types/registrationFormData";

interface MembershipSchemeProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
  handleDropdownChange: (
    name: keyof RegsitrationFormData,
    options: { value: string; label: string }[]
  ) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const MembershipScheme: React.FC<MembershipSchemeProps> = ({
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

  const membershipSchemes = [
    { value: "1", label: "Membership Scheme 1" },
    { value: "2", label: "Membership Scheme 2" },
    { value: "3", label: "Membership Scheme 3" },
  ];
  return (
    <section aria-labelledby="membership-scheme-header">
      <Row>
        <Col>
          <h1 id="membership-scheme-header" className="section-header">
            Membership Scheme
          </h1>
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            name="MembershipScheme"
            label="Membership Scheme"
            value={formData.membershipScheme.value}
            options={membershipSchemes}
            onChange={handleDropdownChange(
              "membershipScheme",
              membershipSchemes
            )}
            size="sm"
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <TextBox
            ControlID="MembeshipExpDate"
            title="Membership Expiry Date"
            type="date"
            size="sm"
            placeholder="Membership Expiry Date"
            onChange={(e) =>
              setFormData({
                ...formData,
                membershipExpiryDate: e.target.value,
              })
            }
            value={formData.membershipExpiryDate}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}></Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}></Col>
      </Row>
    </section>
  );
};
export default MembershipScheme;
