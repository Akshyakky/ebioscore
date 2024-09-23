import { Grid, Paper, Typography } from "@mui/material";
import React, { useState } from "react";
import FormField from "../../../../components/FormField/FormField";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { ProfileMastDto } from "../../../../interfaces/SecurityManagement/ProfileListData";
import { useLoading } from "../../../../context/LoadingContext";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";
import { profileMastService } from "../../../../services/GenericEntityService/GenericEntityService";

const ProfileDetails = () => {
  const { setLoading } = useLoading();
  const { compID, compCode, compName, userID, userName } =
    store.getState().userDetails;
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [profileId, setProfileId] = useState<number>(0);
  const [profileCode, setProfileCode] = useState<string>("");
  const [profileName, setProfileName] = useState<string>("");
  const [rNotes, setRNotes] = useState<string>("");
  const [rActiveYN, setRActiveYN] = useState<string>("Y");
  const handleActiveToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRActiveYN(event.target.checked ? "Y" : "N");
  };
  const handleSave = async () => {
    setIsSubmitted(true);
    if (!profileCode || !profileName) {
      return;
    }
    setLoading(true);
    const ProfileMastDto: ProfileMastDto = {
      profileID: profileId,
      profileCode: profileCode,
      profileName: profileName,
      rActiveYN: rActiveYN,
      rNotes: rNotes,
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      transferYN: "N",
    };
    console.log(ProfileMastDto);
    try {
      await profileMastService.save(ProfileMastDto);
      showAlert("Success", "Profile saved successfully!", "success", {
        onConfirm: handleClear,
      });
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleClear = () => {
    setProfileCode("");
    setProfileName("");
    setRNotes("");
    setRActiveYN("Y");
    setIsSubmitted(false);
  };
  return (
    <>
      <Paper variant="elevation" sx={{ padding: 2 }}>
        <Typography variant="h6">Profile List</Typography>
        <section>
          <Grid container spacing={2}>
            <FormField
              type="text"
              label="Profile Code"
              value={profileCode}
              onChange={(event) => setProfileCode(event.target.value)}
              isSubmitted={isSubmitted}
              name="profileCode"
              ControlID="ProfileCode"
              isMandatory
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="text"
              label="Profile Name"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              isSubmitted={isSubmitted}
              name="profileName"
              ControlID="ProfileName"
              isMandatory
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="textarea"
              label="Notes"
              value={rNotes}
              onChange={(event) => setRNotes(event.target.value)}
              isSubmitted={isSubmitted}
              name="rNotes"
              ControlID="rNotes"
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="switch"
              label={rActiveYN === "Y" ? "Active" : "Hidden"}
              value={rActiveYN}
              checked={rActiveYN === "Y"}
              onChange={handleActiveToggle}
              name="rActiveYN"
              ControlID="rActiveYN"
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormSaveClearButton
              clearText="Clear"
              saveText={"Save"}
              onClear={handleClear}
              onSave={handleSave}
              clearIcon={DeleteIcon}
              saveIcon={SaveIcon}
            />
          </Grid>
        </section>
      </Paper>
    </>
  );
};

export default ProfileDetails;
