import React from "react";
import { Grid } from "@mui/material";
import CustomSwitch from "@/components/Checkbox/ColorSwitch";

interface SwitchItem {
  label: string;
  name: string;
}

interface ContactListSwitchesProps {
  switchStates: { [key: string]: boolean };
  handleSwitchChange: (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  contactList: any;
}

const ContactListSwitches: React.FC<ContactListSwitchesProps> = ({ switchStates, handleSwitchChange, contactList }) => {
  const switches: SwitchItem[] = [
    { label: "is Employee", name: "isEmployee" },
    { label: "is Referral", name: "isReferral" },
    ...(contactList.contactMastDto.consValue === "PHY"
      ? [
          { label: "is Appointment", name: "isAppointment" },
          { label: "is Super Speciality", name: "isSuperSpeciality" },
        ]
      : []),
    ...(switchStates.isEmployee
      ? [
          { label: "is User Required", name: "isUserRequired" },
          { label: "is Authorised User", name: "isAuthorisedUser" },
        ]
      : []),
  ];

  return (
    <Grid container spacing={2} alignItems="flex-start">
      {switches.map((switchItem) => (
        <Grid item xs={12} sm={3} md={2} key={switchItem.name}>
          <CustomSwitch
            label={switchItem.label}
            size="medium"
            color="secondary"
            checked={switchStates[switchItem.name as keyof typeof switchStates]}
            onChange={handleSwitchChange(switchItem.name)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ContactListSwitches;
