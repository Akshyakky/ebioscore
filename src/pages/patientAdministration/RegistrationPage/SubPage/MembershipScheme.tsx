import { Row, Col } from "react-bootstrap";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import React, { useState, useEffect } from "react";
import { RegsitrationFormData } from "../../../../interfaces/PatientAdministration/registrationFormData";
import { BillingService } from "../../../../services/BillingService/BillingService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";

interface MembershipSchemeProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
}

const MembershipScheme: React.FC<MembershipSchemeProps> = ({
  formData,
  setFormData,
}) => {
  const [membershipSchemes, setMembershipScheme] = useState<DropdownOption[]>(
    []
  );
  const { handleDropdownChange } =
    useDropdownChange<RegsitrationFormData>(setFormData);
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

  return (
    <section aria-labelledby="membership-scheme-header">
      <Row>
        <Col>
          <h1 id="membership-scheme-header" className="section-header">
            <Button
              variant="dark border"
              size="sm"
              style={{ marginRight: "8px" }}
            >
              <FontAwesomeIcon icon={faStar} />
            </Button>
            MEMBERSHIP SCHEME
          </h1>
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            name="MembershipScheme"
            label="Membership Scheme"
            value={String(formData.PatMemID)}
            options={membershipSchemes}
            onChange={handleDropdownChange(
              ["PatMemID"],
              ["PatMemName"],
              membershipSchemes
            )}
            size="sm"
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <FloatingLabelTextBox
            ControlID="MembeshipExpDate"
            title="Membership Expiry Date"
            type="date"
            size="sm"
            placeholder="Membership Expiry Date"
            onChange={(e) =>
              setFormData({
                ...formData,
                PatMemSchemeExpiryDate: e.target.value,
              })
            }
            value={formData.PatMemSchemeExpiryDate}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}></Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}></Col>
      </Row>
    </section>
  );
};
export default MembershipScheme;
