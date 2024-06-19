import React, { useState } from 'react';
import { Container, Grid, Paper, Typography } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

interface ProfileDetailsProps {
  onSave: () => void;
  onClear: () => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ onSave, onClear }) => {
  const [profileCode, setProfileCode] = useState("");
  const [profileName, setProfileName] = useState("");

  const handleSave = async () => {
    console.log("Profile Code:", profileCode);
    console.log("Profile Name:", profileName);
    alert("Data Saved");
    onSave();
  };

  const handleClear = () => {
    setProfileCode("");
    setProfileName("");
    alert("Data Cleared");
    onClear();
  };

  return (
    <>
      <section>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Profile Code"
              ControlID="ProfileCode"
              placeholder="Profile Code"
              type="text"
              name="ProfileCode"
              size="small"
              value={profileCode}
              onChange={(e) => setProfileCode(e.target.value)}
              isMandatory={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Profile Name"
              ControlID="ProfileName"
              placeholder="Profile Name"
              type="text"
              name="ProfileName"
              size="small"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              isMandatory={true}
            />
          </Grid>
        </Grid>
      </section>

      <FormSaveClearButton
        clearText="Clear"
        saveText="Save"
        onClear={handleClear}
        onSave={handleSave}
        clearIcon={DeleteIcon}
        saveIcon={SaveIcon}
      />
    </>
  );
};

export default ProfileDetails;
