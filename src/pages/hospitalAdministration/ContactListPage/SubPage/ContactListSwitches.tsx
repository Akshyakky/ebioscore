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
    { label: "Employee", name: "isEmployee" },
    { label: "Referral", name: "isReferral" },
    ...(contactList.contactMastDto.consValue === "PHY"
      ? [
          { label: "Appointment", name: "isAppointment" },
          { label: "Super Speciality", name: "isSuperSpeciality" },
        ]
      : []),
    ...(switchStates.isEmployee
      ? [
          { label: "User Required", name: "isUserRequired" },
          { label: "Authorised User", name: "isAuthorisedUser" },
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
