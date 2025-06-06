import { useLoading } from "@/hooks/Common/useLoading";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { ProfileDetailedViewDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { profileService } from "@/services/SecurityManagementServices/ProfileListServices";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

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

interface ProfilePermissionsListProps {
  title: string;
  type: "M" | "R" | "D";
  profileId: number;
}

const ProfilePermissionsList: React.FC<ProfilePermissionsListProps> = ({ title, type, profileId }) => {
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermission[]>([]);
  const { setLoading } = useLoading();

  useEffect(() => {
    if (profileId > 0) {
      fetchProfilePermissions();
    }
  }, [profileId, type, title]);

  const groupPermissionsByHierarchy = (permissions: ProfilePermission[]): GroupedPermission[] => {
    if (type === "D") {
      return [
        {
          groupId: 0,
          groupName: "",
          subModules: [
            {
              subId: 0,
              subName: "",
              operations: permissions.map((p) => ({
                opId: p.aOprID,
                opName: p.aOprName,
              })),
            },
          ],
        },
      ];
    }

    const groupedData: { [key: number]: GroupedPermission } = {};

    permissions.forEach((permission) => {
      const groupKey = type === "R" ? permission.aSubID : permission.aUGrpID;
      const groupName = type === "R" ? permission.aSubName : permission.aUGrpName;

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          groupId: groupKey,
          groupName,
          subModules: [],
        };
      }

      if (type === "R") {
        if (!groupedData[groupKey].subModules.length) {
          groupedData[groupKey].subModules.push({
            subId: permission.aSubID,
            subName: permission.aSubName,
            operations: [],
          });
        }
        const subModule = groupedData[groupKey].subModules[0];
        const operationExists = subModule.operations.some((op) => op.opId === permission.aOprID);
        if (!operationExists) {
          subModule.operations.push({
            opId: permission.aOprID,
            opName: permission.aOprName,
          });
        }
      } else {
        let subModule = groupedData[groupKey].subModules.find((sub) => sub.subId === permission.aSubID);
        if (!subModule) {
          subModule = {
            subId: permission.aSubID,
            subName: permission.aSubName,
            operations: [],
          };
          groupedData[groupKey].subModules.push(subModule);
        }
        const operationExists = subModule.operations.some((op) => op.opId === permission.aOprID);
        if (!operationExists) {
          subModule.operations.push({
            opId: permission.aOprID,
            opName: permission.aOprName,
          });
        }
      }
    });

    return Object.values(groupedData).sort((a, b) => a.groupId - b.groupId);
  };

  const fetchProfilePermissions = async () => {
    if (profileId <= 0) return;

    setLoading(true);
    try {
      const response: OperationResult<ProfileDetailedViewDto[]> = await profileService.getAllActiveProfileDetailsByType(profileId, type);

      if (response.success && response.data) {
        const permissions: ProfilePermission[] = response.data;
        const grouped = groupPermissionsByHierarchy(permissions);
        setGroupedPermissions(grouped);
      }
    } catch (error) {
      console.error("Error fetching profile permissions:", error);
    } finally {
      setLoading(false);
    }
  };
  if (type === "D" && groupedPermissions.length > 0) {
    if (groupedPermissions[0].subModules[0].operations.length === 0) {
      return (
        <Typography variant="body1" sx={{ py: 2, textAlign: "center" }}>
          No permissions found for this profile.
        </Typography>
      );
    }
  }
  return (
    <div>
      {groupedPermissions.length === 0 ? (
        <Typography variant="body1" sx={{ py: 2, textAlign: "center" }}>
          No permissions found for this profile.
        </Typography>
      ) : type === "D" ? (
        <Box sx={{ minHeight: "600px" }}>
          <List sx={{ width: "100%", bgcolor: "background.paper", p: 0 }}>
            {groupedPermissions[0].subModules[0].operations.map((operation) => (
              <ListItem key={`operation-${operation.opId}`} divider>
                <ListItemText primary={operation.opName} />
              </ListItem>
            ))}
          </List>
        </Box>
      ) : (
        <Box sx={{ minHeight: "600px" }}>
          <List sx={{ width: "100%", bgcolor: "background.paper", p: 0 }}>
            {groupedPermissions.map((group) => (
              <Accordion key={`group-${group.groupId}`} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {type === "R" ? group.groupName : group.groupName}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List dense disablePadding>
                    {type === "R"
                      ? group.subModules[0].operations.map((operation) => (
                          <ListItem key={`operation-${operation.opId}`} divider>
                            <ListItemText primary={operation.opName} />
                          </ListItem>
                        ))
                      : group.subModules.map((subModule) => (
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
                              expandIcon={<ExpandMore />}
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
    </div>
  );
};

export default ProfilePermissionsList;
