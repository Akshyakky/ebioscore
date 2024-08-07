import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { ProfileMastDto, ProfileListSearchResult } from "../../../../interfaces/SecurityManagement/ProfileListData";
import { OperationResult } from "../../../../interfaces/Common/OperationResult";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import TextArea from "../../../../components/TextArea/TextArea";
import { notifySuccess, notifyError } from "../../../../utils/Common/toastManager";
import { ProfileService } from "../../../../services/SecurityManagementServices/ProfileListServices";

interface ProfileDetailsProps {
  profile: ProfileListSearchResult | null;
  onSave: (profile: ProfileListSearchResult) => void;
  onClear: () => void;
  isEditMode: boolean;
  refreshProfiles: () => void;
  updateProfileStatus: (profileID: number, status: string) => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  onSave,
  onClear,
  refreshProfiles,
  updateProfileStatus,
}) => {
  const { token, compID } = useSelector((state: RootState) => state.userDetails);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [profileMastDto, setProfileMastDto] = useState<ProfileMastDto>({
    profileID: profile?.profileID || 0,
    profileCode: profile?.profileCode || "",
    profileName: profile?.profileName || "",
    rActiveYN: profile ? (profile.status === "Hidden" ? "N" : "Y") : "Y",
    compID: compID!,
    rNotes: profile?.rNotes || "",
  });

  useEffect(() => {
    if (profile) {
      setProfileMastDto({
        profileID: profile.profileID,
        profileCode: profile.profileCode,
        profileName: profile.profileName,
        rActiveYN: profile.status === "Hidden" ? "N" : "Y",
        compID: compID!,
        rNotes: profile.rNotes,
      });
    }
  }, [profile, compID]);

  const handleSave = async () => {
    setIsSubmitted(true);
    if (profileMastDto.profileCode && profileMastDto.profileName) {
      try {
        const result: OperationResult<ProfileMastDto> = await ProfileService.saveOrUpdateProfile(token!, profileMastDto);
        if (result.success && result.data) {
          const savedProfile: ProfileListSearchResult = {
            profileID: result.data.profileID,
            profileCode: result.data.profileCode,
            profileName: result.data.profileName,
            status: result.data.rActiveYN === "N" ? "Hidden" : "Active",
            rNotes: result.data.rNotes,
          };
          onSave(savedProfile);
          refreshProfiles();
          updateProfileStatus(profileMastDto.profileID, profileMastDto.rActiveYN === "N" ? "Hidden" : "Active");
          notifySuccess("Profile saved successfully");
        } else {
          notifyError("Error saving profile");
        }
      } catch (error) {
        console.error("Error saving profile:", error);
        notifyError("Error saving profile");
      }
    } else {
      notifyError("Profile Code and Profile Name are required fields.");
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
    setProfileMastDto((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileMastDto((prevState) => ({ ...prevState, [name]: value }));
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="profile-details-header">
        PROFILE DETAILS
      </Typography>
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
              isMandatory
              isSubmitted={isSubmitted}
              inputPattern={/^[a-zA-Z0-9 ]*$/}
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
              isMandatory
              isSubmitted={isSubmitted}
              inputPattern={/^[a-zA-Z0-9 ]*$/}
              maxLength={60}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextArea
              label="Notes"
              name="rNotes"
              value={profileMastDto.rNotes}
              onChange={handleTextAreaChange}
              placeholder="Notes"
              rows={2}
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
    </Paper>
  );
};

export default ProfileDetails;
