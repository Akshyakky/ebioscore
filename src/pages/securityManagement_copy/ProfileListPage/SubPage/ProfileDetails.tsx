import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
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
import {
  notifySuccess,
  notifyError,
} from "../../../../utils/Common/toastManager";
import { ProfileService } from "../../../../services/SecurityManagementServices/ProfileListServices";
import FormField from "../../../../components/FormField/FormField";

interface ProfileDetailsProps {
  profile: ProfileListSearchResult | null;
  onSave: (profile: ProfileListSearchResult) => void;
  onClear: () => void;
  isEditMode: boolean;
  refreshProfiles: () => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  onSave,
  onClear,
  refreshProfiles,
}) => {
  const { compID } = useSelector((state: RootState) => state.userDetails);
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
        const result: OperationResult<ProfileMastDto> =
          await ProfileService.saveOrUpdateProfile(profileMastDto);
        if (result.success && result.data) {
          const savedProfile: ProfileListSearchResult = {
            profileID: result.data.profileID,
            profileCode: result.data.profileCode,
            profileName: result.data.profileName,
            status: result.data.rActiveYN === "N" ? "Hidden" : "Active",
            rActiveYN: result.data.rActiveYN,
            rNotes: result.data.rNotes,
          };
          onSave(savedProfile);
          refreshProfiles();
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
          <FormField
            type="text"
            label="Profile Code"
            value={profileMastDto.profileCode}
            onChange={handleInputChange}
            name="profileCode"
            ControlID="ProfileCode"
            isMandatory
            size="small"
            isSubmitted={isSubmitted}
            // inputPattern={/^[a-zA-Z0-9 ]*$/}
            maxLength={10}
          />
          <FormField
            type="text"
            label="Profile Name"
            value={profileMastDto.profileName}
            onChange={handleInputChange}
            name="profileName"
            ControlID="ProfileName"
            isMandatory
            size="small"
            isSubmitted={isSubmitted}
            // inputPattern={/^[a-zA-Z0-9 ]*$/}
            maxLength={10}
          />
        </Grid>
        <Grid container spacing={2}>
          <FormField
            type="textarea"
            label="Notes"
            value={profileMastDto.rNotes}
            onChange={handleTextAreaChange}
            name="rNotes"
            ControlID="rNotes"
            maxLength={4000}
          />
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
