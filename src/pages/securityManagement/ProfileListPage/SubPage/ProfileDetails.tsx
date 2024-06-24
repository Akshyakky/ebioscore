import React, { useEffect, useState } from "react";
import { Grid, Paper, FormControlLabel } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import {
  ProfileMastDto,
  ProfileListSearchResult,
} from "../../../../interfaces/SecurityManagement/ProfileListData";
import { OperationResult } from "../../../../interfaces/Common/OperationResult";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import TextArea from "../../../../components/TextArea/TextArea";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { ProfileService } from "../../../../services/SecurityManagementServices/ProfileListServices";

interface ProfileDetailsProps {
  profile: ProfileListSearchResult | null;
  onSave: () => void;
  onClear: () => void;
  isEditMode: boolean;
  refreshProfiles: () => void;
  updateProfileStatus: (profileID: number, status: string) => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  onSave,
  onClear,
  isEditMode,
  refreshProfiles,
  updateProfileStatus,
}) => {
  const { token, compID } = useSelector(
    (state: RootState) => state.userDetails
  );

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [profileMastDto, setProfileMastDto] = useState<ProfileMastDto>({
    profileID: profile?.profileID || 0,
    profileCode: profile?.profileCode || "",
    profileName: profile?.profileName || "",
    rActiveYN: profile ? (profile.status === "Hidden" ? "N" : "Y") : "Y", // Default to "Active" for new profiles
    compID: compID!,
    rNotes: profile?.rNotes || "",
  });

  useEffect(() => {
    if (profile) {
      setProfileMastDto({
        profileID: profile.profileID,
        profileCode: profile.profileCode,
        profileName: profile.profileName,
        rActiveYN: profile.status === "Hidden" ? "N" : "Y", // Ensure correct mapping
        compID: compID!,
        rNotes: profile.rNotes,
      });
    }
  }, [profile, compID]);

  const handleSave = async () => {
    setIsSubmitted(true);
    const profileService = new ProfileService();
    try {
      if (
        profileMastDto.profileCode !== "" &&
        profileMastDto.profileName !== ""
      ) {
        console.log("Saving profile with data:", profileMastDto);

        const result: OperationResult<ProfileMastDto> =
          await profileService.saveOrUpdateProfile(token!, profileMastDto);

        if (result.success) {
          console.log("Profile saved successfully", result.data);
          onSave();
          refreshProfiles(); // Refresh profiles after saving
          updateProfileStatus(
            profileMastDto.profileID,
            profileMastDto.rActiveYN === "N" ? "Hidden" : "Active"
          ); 
        } else {
          console.error("Error saving profile", result.errorMessage);
          alert(`Error: ${result.errorMessage}`);
        }
      } else {
        alert("Profile Code and Profile Name are required fields.");
      }
    } catch (error: any) {
      console.error("Error saving profile", error);
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        alert(`Error: ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        // Request was made but no response was received
        console.error("Request data:", error.request);
        alert("Error: No response received from server.");
      } else {
        // Something else happened
        console.error("Error message:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleClear = () => {
    setProfileMastDto({
      profileID: 0,
      profileCode: "",
      profileName: "",
      rActiveYN: "Y",
      compID: compID!,
      rNotes: "",
    });
    onClear();
    setIsSubmitted(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileMastDto((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileMastDto((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checkedValue = event.target.checked ? "N" : "Y";
    setProfileMastDto((prevState) => ({
      ...prevState,
      rActiveYN: checkedValue,
    }));
    updateProfileStatus(
      profileMastDto.profileID,
      checkedValue === "N" ? "Hidden" : "Active"
    ); // Update status in ProfileListSearch
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <section>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Profile Code"
              ControlID="ProfileCode"
              placeholder="Profile Code"
              type="text"
              name="profileCode"
              size="small"
              value={profileMastDto.profileCode}
              onChange={handleInputChange}
              isMandatory={true}
              isSubmitted={isSubmitted}
              inputPattern={/^[a-zA-Z0-9 ]*$/} // Allow both characters and numbers and spaces
              maxLength={10}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Profile Name"
              ControlID="ProfileName"
              placeholder="Profile Name"
              type="text"
              name="profileName"
              size="small"
              value={profileMastDto.profileName}
              onChange={handleInputChange}
              isMandatory={true}
              isSubmitted={isSubmitted}
              inputPattern={/^[a-zA-Z0-9 ]*$/} // Allow spaces as well
              maxLength={60}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextArea
              label="Notes"
              name="rNotes"
              value={profileMastDto.rNotes || ""}
              onChange={handleTextAreaChange}
              placeholder="Notes"
              rows={2}
            />
          </Grid>
        </Grid>
        {isEditMode && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <CustomSwitch
                    size="medium"
                    color="secondary"
                    checked={profileMastDto.rActiveYN === "N"}
                    onChange={handleSwitchChange}
                  />
                }
                label={profileMastDto.rActiveYN === "N" ? "Hidden" : "Active"}
              />
            </Grid>
          </Grid>
        )}
      </section>

      <FormSaveClearButton
        clearText="Clear"
        saveText="Save"
        onClear={handleClear}
        onSave={handleSave}
        clearIcon={DeleteIcon}
        saveIcon={SaveIcon}
      />
    </Paper>
  );
};

export default ProfileDetails;
