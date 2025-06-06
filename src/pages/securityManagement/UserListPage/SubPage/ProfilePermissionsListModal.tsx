import React, { useState, useEffect } from "react";
import { Button, Typography, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { profileService } from "@/services/SecurityManagementServices/ProfileListServices";
import { useLoading } from "@/hooks/Common/useLoading";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { ProfileDetailedViewDto } from "@/interfaces/SecurityManagement/ProfileListData";

// Define interfaces based on your API response structure
interface ProfilePermission {
  profDetID: number;
  profileID: number;
  profileName: string;
  aOprID: number;
  aOprName: string;
  aSubID: number;
  aSubName: string;
  aUGrpID: number;
  aUGrpName: string;
}

// Interface for group structure
interface GroupedPermission {
  groupId: number;
  groupName: string;
  subModules: {
    subId: number;
    subName: string;
    operations: {
      opId: number;
      opName: string;
    }[];
  }[];
}

interface ProfilePermissionsModalProps {
  profileId: number;
  profileName?: string;
  open: boolean;
  onClose: () => void;
}

const ProfilePermissionsListModal: React.FC<ProfilePermissionsModalProps> = ({ profileId, open, onClose }) => {
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermission[]>([]);
  const { setLoading } = useLoading();
  const [profileName, setProfileName] = useState<string>("");
  useEffect(() => {
    if (open && profileId > 0) {
      fetchProfilePermissions();
    }
  }, [open, profileId]);

  const fetchProfilePermissions = async () => {
    if (profileId <= 0) return;

    setLoading(true);
    try {
      const response: OperationResult<ProfileDetailedViewDto[]> = await profileService.getAllActiveProfileDetailsByType(profileId, "M");

      if (response.success && response.data) {
        const permissions: ProfilePermission[] = response.data;
        const grouped = groupPermissionsByHierarchy(permissions);
        setGroupedPermissions(grouped);
        setProfileName(permissions[0].profileName);
      } else {
        // console.error("Failed to fetch profile permissions:", response.message);
      }
    } catch (error) {
      console.error("Error fetching profile permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group the permissions by the hierarchy: Group -> SubModule -> Operations
  const groupPermissionsByHierarchy = (permissions: ProfilePermission[]): GroupedPermission[] => {
    const groupedData: { [key: number]: GroupedPermission } = {};

    // First pass: create groups and submodules
    permissions.forEach((permission) => {
      // Create group if it doesn't exist
      if (!groupedData[permission.aUGrpID]) {
        groupedData[permission.aUGrpID] = {
          groupId: permission.aUGrpID,
          groupName: permission.aUGrpName,
          subModules: [],
        };
      }

      // Find if submodule already exists in the group
      let subModule = groupedData[permission.aUGrpID].subModules.find((sub) => sub.subId === permission.aSubID);

      // Create submodule if it doesn't exist
      if (!subModule) {
        subModule = {
          subId: permission.aSubID,
          subName: permission.aSubName,
          operations: [],
        };
        groupedData[permission.aUGrpID].subModules.push(subModule);
      }

      // Add operation to submodule if it doesn't already exist
      const operationExists = subModule.operations.some((op) => op.opId === permission.aOprID);
      if (!operationExists) {
        subModule.operations.push({
          opId: permission.aOprID,
          opName: permission.aOprName,
        });
      }
    });

    // Convert to array and sort by group ID
    return Object.values(groupedData).sort((a, b) => a.groupId - b.groupId);
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={`${profileName} Permissions`}
      maxWidth="xs"
      fullWidth={true}
      actions={
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      }
      dialogContentSx={{ maxHeight: "70vh" }}
    >
      {groupedPermissions.length === 0 ? (
        <Typography variant="body1" sx={{ py: 2, textAlign: "center" }}>
          No permissions found for this profile.
        </Typography>
      ) : (
        <Box sx={{ minHeight: "600px" }}>
          <List sx={{ width: "100%", bgcolor: "background.paper", p: 0 }}>
            {groupedPermissions.map((group) => (
              <Accordion key={`group-${group.groupId}`} defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: (theme) => theme.palette.primary.contrastText,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {group.groupName}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List disablePadding>
                    {group.subModules.map((subModule) => (
                      <Accordion
                        key={`submodule-${subModule.subId}`}
                        disableGutters
                        elevation={0}
                        sx={{
                          "&:before": { display: "none" },
                          border: "1px solid rgba(0, 0, 0, 0.12)",
                          mb: 1,
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            backgroundColor: (theme) => theme.palette.primary.contrastText,
                          }}
                        >
                          <Typography variant="body1" fontWeight="medium">
                            {subModule.subName}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                          <List dense disablePadding>
                            {subModule.operations.map((operation) => (
                              <ListItem key={`operation-${operation.opId}`} divider>
                                <ListItemText primary={operation.opName} />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </List>
        </Box>
      )}
    </GenericDialog>
  );
};

export default ProfilePermissionsListModal;
