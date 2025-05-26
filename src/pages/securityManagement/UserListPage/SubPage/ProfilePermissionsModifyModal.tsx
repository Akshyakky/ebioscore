import React, { useEffect, useMemo, useState } from "react";
import { Button, Grid } from "@mui/material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import PermissionManager from "../../CommonPage/PermissionManager";
import { ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { profileMastService } from "@/services/SecurityManagementServices/securityManagementServices";

interface ProfilePermissionsModifyModalProps {
  profileId: number;
  profileName?: string;
  open: boolean;
  onClose: () => void;
}

const ProfilePermissionsModifyModal: React.FC<ProfilePermissionsModifyModalProps> = ({ profileId, open, onClose }) => {
  const [profileName, setProfileName] = useState<string>("");

  useEffect(() => {
    if (open && profileId > 0) {
      const fetchProfile = async () => {
        const result = await profileMastService.getById(profileId);
        setProfileName(result.data?.profileName ?? "");
      };
      fetchProfile();
    }
  }, [open, profileId]);

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={`${profileName} Permissions`}
      maxWidth="md"
      fullWidth={true}
      actions={
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      }
      dialogContentSx={{ maxHeight: "70vh" }}
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 9, lg: 9, xl: 6 }}>
          <PermissionManager
            mode="profile"
            details={{ profileID: profileId, profileName: profileName } as ProfileMastDto}
            title="Module Permissions"
            type="M"
            useMainModules={true}
            useSubModules={true}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 9, lg: 9, xl: 6 }}>
          <PermissionManager
            mode="profile"
            details={{ profileID: profileId, profileName: profileName } as ProfileMastDto}
            title="Report Permissions"
            type="R"
            useMainModules={true}
            useSubModules={false}
          />
        </Grid>
      </Grid>
    </GenericDialog>
  );
};

export default ProfilePermissionsModifyModal;
