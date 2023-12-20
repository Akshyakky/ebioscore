import { Row, Col } from "react-bootstrap";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import TextBox from "../../../components/TextBox/TextBox ";
import React, { useState, useEffect } from "react";
import { RegsitrationFormData } from "../../../types/registrationFormData";
import { BillingService } from "../../../services/BillingService/BillingService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/reducers";

interface MembershipSchemeProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
  handleDropdownChange: (
    name: keyof RegsitrationFormData,
    options: { value: string; label: string }[]
  ) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
interface DropdownOption {
  value: string;
  label: string;
}
const MembershipScheme: React.FC<MembershipSchemeProps> = ({
  formData,
  setFormData,
}) => {
  const [membershipSchemes, setMembershipScheme] = useState<DropdownOption[]>(
    []
  );
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const compID = userInfo.compID!;
  const endpointMembershipScheme = "GetActivePatMemberships";

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const membershipSchemes = await BillingService.fetchMembershipScheme(
          token,
          endpointMembershipScheme,
          compID
        );
        const membershipSchemeOptions = membershipSchemes.map((item) => ({
          value: item.value,
          label: item.label,
        }));
        setMembershipScheme(membershipSchemeOptions);
      } catch (error) {
        console.error("Failed to fetch membership scheme:", error);
      }
    };

    loadDropdownData();
  }, [token]);

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
