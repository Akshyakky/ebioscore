import React, { useState, useEffect } from "react";
import { Grid, Typography, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { BillingService } from "../../../../services/BillingServices/BillingService";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";
import { format } from "date-fns";

interface MembershipSchemeProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
}

const MembershipScheme: React.FC<MembershipSchemeProps> = ({
  formData,
  setFormData,
}) => {
  const [membershipSchemes, setMembershipScheme] = useState<DropdownOption[]>(
    []
  );
  const { handleDropdownChange } =
    useDropdownChange<PatientRegistrationDto>(setFormData);
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
  }, [token, compID]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      patRegisters: {
        ...prevFormData.patRegisters,
        patMemSchemeExpiryDate: newDate,
      },
    }));
  };

  return (
    <section aria-labelledby="membership-scheme-header">
      <Box>
        <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
          Membership Scheme
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <DropdownSelect
            name="MembershipScheme"
            label="Membership Scheme"
            value={
              formData.patRegisters.patMemID === 0
                ? ""
                : String(formData.patRegisters.patMemID)
            }
            options={membershipSchemes}
            onChange={handleDropdownChange(
              ["patRegisters", "patMemID"],
              ["patRegisters", "patMemName"],
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
            onChange={handleDateChange}
            value={format(
              new Date(formData.patRegisters.patMemSchemeExpiryDate),
              "yyyy-MM-dd"
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}></Grid>
        <Grid item xs={12} sm={6} md={3}></Grid>
      </Grid>
    </section>
  );
};

export default MembershipScheme;
