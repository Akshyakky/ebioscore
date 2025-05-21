import { Grid, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

import { useLoading } from "@/hooks/Common/useLoading";
import { ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { showAlert } from "@/utils/Common/showAlert";
import FormField from "@/components/FormField/FormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { createEntityService } from "@/utils/Common/serviceFactory";

interface ProfileListDetailsProps {
  editData?: ProfileMastDto;
  profileMastService: ReturnType<typeof createEntityService<ProfileMastDto>>;
  isClear: (isClear: boolean) => void;
}
const ProfileDetails: React.FC<ProfileListDetailsProps> = ({ editData, profileMastService, isClear }) => {
  const { setLoading } = useLoading();
  const [{ compID, compCode, compName }, setCompData] = useState({ compID: 1, compCode: "KVG", compName: "KVG Medical College" });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [profileId, setProfileId] = useState<number>(0);
  const [profileCode, setProfileCode] = useState<string>("");
  const [profileName, setProfileName] = useState<string>("");
  const [rNotes, setRNotes] = useState<string>("");
  const [rActiveYN, setRActiveYN] = useState<string>("Y");

  useEffect(() => {
    if (editData) {
      setProfileId(editData.profileID || 0);
      setProfileCode(editData.profileCode || "");
      setProfileName(editData.profileName || "");
      setRActiveYN(editData.rActiveYN || "N");
      setRNotes(editData.rNotes || "");
    } else {
      handleClear();
    }
  }, [editData]);

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
    setProfileId(0);
    setProfileCode("");
    setProfileName("");
    setRNotes("");
    setRActiveYN("Y");
    setIsSubmitted(false);
    isClear(true);
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
            <FormSaveClearButton clearText="Clear" saveText={"Save"} onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
          </Grid>
        </section>
      </Paper>
    </>
  );
};

export default ProfileDetails;
