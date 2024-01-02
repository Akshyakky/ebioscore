import { Row, Col } from "react-bootstrap";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import TextBox from "../../../../components/TextBox/TextBox ";
import React, { useState, useEffect } from "react";
import { RegsitrationFormData } from "../../../../interfaces/PatientAdministration/registrationFormData";
import { BillingService } from "../../../../services/BillingService/BillingService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

interface MembershipSchemeProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
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
      valuePath: (string | number)[],
      textPath: (string | number)[],
      options: DropdownOption[]
    ) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      const selectedOption = options.find(
        (option) => option.value === selectedValue
      );

      setFormData((prevFormData) => {
        // Recursive function to update the state
        function updateState(
          obj: any,
          path: (string | number)[],
          newValue: any
        ): any {
          const [first, ...rest] = path;

          if (rest.length === 0) {
            return { ...obj, [first]: newValue };
          } else {
            return { ...obj, [first]: updateState(obj[first], rest, newValue) };
          }
        }

        const newData = updateState(prevFormData, valuePath, selectedValue);
        return updateState(
          newData,
          textPath,
          selectedOption ? selectedOption.label : ""
        );
      });
    };

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
          <TextBox
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
