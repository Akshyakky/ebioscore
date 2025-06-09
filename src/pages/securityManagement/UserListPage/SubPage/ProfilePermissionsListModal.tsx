import React, { useState } from "react";
import { Button, Box, Tabs, Tab } from "@mui/material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ProfilePermissionsList from "../../ProfileListPage/SubPage/ProfilePermissionsList";

interface ProfilePermissionsModalProps {
  profileId: number;
  profileName?: string;
  open: boolean;
  onClose: () => void;
}

const ProfilePermissionsListModal: React.FC<ProfilePermissionsModalProps> = ({ profileId, profileName = "", open, onClose }) => {
  const [activeTab, setActiveTab] = useState<"modulePermissions" | "reportPermissions" | "departmentPermissions">("modulePermissions");

  const handleTabChange = (event: React.SyntheticEvent, newValue: "modulePermissions" | "reportPermissions" | "departmentPermissions") => {
    setActiveTab(newValue);
  };

  const renderTabButtons = () => (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mb: 2 }}>
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="permissions navigation" variant="standard" sx={{ minHeight: 40 }}>
        <Tab
          label="Module Permissions"
          value="modulePermissions"
          sx={{
            minHeight: 40,
            textTransform: "none",
            fontSize: "0.875rem",
          }}
        />
        <Tab
          label="Report Permissions"
          value="reportPermissions"
          sx={{
            minHeight: 40,
            textTransform: "none",
            fontSize: "0.875rem",
          }}
        />
        <Tab
          label="Department Permissions"
          value="departmentPermissions"
          sx={{
            minHeight: 40,
            textTransform: "none",
            fontSize: "0.875rem",
          }}
        />
      </Tabs>
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "modulePermissions":
        return <ProfilePermissionsList title="Module Permissions" type="M" profileId={profileId} />;
      case "reportPermissions":
        return <ProfilePermissionsList title="Report Permissions" type="R" profileId={profileId} />;
      case "departmentPermissions":
        return <ProfilePermissionsList title="Department Permissions" type="D" profileId={profileId} />;
      default:
        return <ProfilePermissionsList title="Module Permissions" type="M" profileId={profileId} />;
    }
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={`${profileName} Permissions`}
      maxWidth="lg"
      fullWidth={true}
      actions={
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      }
      dialogContentSx={{ maxHeight: "70vh" }}
    >
      <Box sx={{ p: 1 }}>
        {renderTabButtons()}
        {renderTabContent()}
      </Box>
    </GenericDialog>
  );
};

export default ProfilePermissionsListModal;
