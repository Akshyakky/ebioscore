import React, { useState } from "react";
import { Button, Grid } from "@mui/material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/context/LoadingContext";
import PermissionManager from "../../ProfileListPage/SubPage/PermissionManager";

interface ProfilePermissionsModifyModalProps {
  profileId: number;
  profileName?: string;
  open: boolean;
  onClose: () => void;
}

const ProfilePermissionsModifyModal: React.FC<ProfilePermissionsModifyModalProps> = ({ profileId, open, onClose }) => {
  const { setLoading } = useLoading();
  const [profileName, setProfileName] = useState<string>("");

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
        <Grid item xs={12} md={6} lg={6} xl={6}>
          <PermissionManager profileId={profileId} profileName={"Test"} title="Module Permissions" type="M" useMainModules={true} useSubModules={true} />
        </Grid>
        <Grid item xs={12} md={6} lg={6} xl={6}>
          <PermissionManager profileId={profileId} profileName={"Test"} title="Report Permissions" type="R" useMainModules={true} useSubModules={false} />
        </Grid>
      </Grid>
    </GenericDialog>
  );
};

export default ProfilePermissionsModifyModal;
