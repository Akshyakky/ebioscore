import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import React, { useState, useEffect } from "react";
import { RegsitrationFormData } from "../../../../interfaces/patientAdministration/registrationFormData";
import { BillingService } from "../../../../services/BillingServices/BillingService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { DropdownOption } from "../../../../interfaces/common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import { Grid, Typography, Box } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

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
      <Box>
        <Typography variant="h6" id="membership-scheme-header">
          MEMBERSHIP SCHEME
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <DropdownSelect
            name="MembershipScheme"
            label="Membership Scheme"
            value={formData.PatMemID === 0 ? "" : String(formData.PatMemID)}
            options={membershipSchemes}
            onChange={handleDropdownChange(
              ["PatMemID"],
              ["PatMemName"],
              membershipSchemes
            )}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FloatingLabelTextBox
            ControlID="MembeshipExpDate"
            title="Membership Expiry Date"
            type="date"
            size="small"
            placeholder="Membership Expiry Date"
            onChange={(e) =>
              setFormData({
                ...formData,
                PatMemSchemeExpiryDate: e.target.value,
              })
            }
            value={formData.PatMemSchemeExpiryDate}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}></Grid>
        <Grid item xs={12} sm={6} md={3}></Grid>
      </Grid>
    </section>
  );
};
export default MembershipScheme;
