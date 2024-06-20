import React, { useState } from "react";
import { Grid, Paper } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { ProfileService } from "../../../../services/SecurityManagementServices/ProfileListServices";
import { ProfileMastDto } from "../../../../interfaces/SecurityManagement/ProfileListData";
import { OperationResult } from "../../../../interfaces/Common/OperationResult";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import TextArea from "../../../../components/TextArea/TextArea";

interface ProfileDetailsProps {
  onSave: () => void;
  onClear: () => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ onSave, onClear }) => {
  const { token, compID } = useSelector(
    (state: RootState) => state.userDetails
  );

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [profileMastDto, setProfileMastDto] = useState<ProfileMastDto>({
    profileID: 0,
    profileCode: "",
    profileName: "",
    rActiveYN: "Y",
    compID: compID!,
    rNotes: "",
  });

  const handleSave = async () => {
    setIsSubmitted(true);
    const profileService = new ProfileService();
    try {
      if (
        profileMastDto.profileCode !== "" ||
        profileMastDto.profileName !== ""
      ) {
        const result: OperationResult<ProfileMastDto> =
          await profileService.saveOrUpdateProfile(token!, profileMastDto);
        if (result.success) {
          console.log("Profile saved successfully", result.data);
          onSave();
        } else {
          console.error("Error saving profile", result.errorMessage);
          alert(`Error: ${result.errorMessage}`);
        }
      }
    } catch (error: any) {
      console.error("Error saving profile", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleClear = () => {
    setProfileMastDto({
      ...profileMastDto,
      profileCode: "",
      profileName: "",
      rNotes:""
    });
    onClear();
    setIsSubmitted(false)
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
              inputPattern={/^[a-zA-Z0-9]*$/}
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
              inputPattern={/^[a-zA-Z0-9]*$/}
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
