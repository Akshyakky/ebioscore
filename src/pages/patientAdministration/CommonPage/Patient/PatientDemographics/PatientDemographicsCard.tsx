// src/pages/patientAdministration/commonPage/patient/PatientDemographics/PatientDemographicsCard.tsx
import { PatientDemographicDetails } from "@/interfaces/PatientAdministration/registrationFormData";
import { Edit as EditIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { Box, Grid, IconButton, Paper, Skeleton } from "@mui/material";
import React from "react";

interface PatientDemographicsCardProps {
  demographicsData: PatientDemographicDetails | null;
  isLoading: boolean;
  showEditButton: boolean;
  showRefreshButton: boolean;
  onEditClick: () => void;
  onRefreshClick?: () => void;
  variant: "compact" | "detailed";
  emptyStateMessage: string;
  className?: string;
}

export const PatientDemographicsCard: React.FC<PatientDemographicsCardProps> = ({
  demographicsData,
  isLoading,
  showEditButton,
  showRefreshButton,
  onEditClick,
  onRefreshClick,
  variant,
  emptyStateMessage,
  className,
}) => {
  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }} className={className || ""}>
        <Grid container spacing={2}>
          {[...Array(variant === "detailed" ? 8 : 4)].map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={30} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  if (!demographicsData) {
    return (
      <Paper sx={{ p: 2, textAlign: "center", py: 2 }} className={className || ""}>
        {emptyStateMessage}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }} className={className || ""}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {variant === "detailed" ? (
          // Detailed view in a table-like structure
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", flex: 1 }}>
            {/* Headers row */}
            <Box sx={{ display: "flex", mb: 1 }}>
              {/* <Box sx={{ flex: 1, pr: 2, fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>Patient Name</Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>UHID</Box> */}
              <Box sx={{ flex: 1, pr: 2, fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>Gender</Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>Date of Birth</Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>Blood Group</Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>Mobile Number</Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>Patient Type</Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>Payment Source</Box>
            </Box>

            {/* Values row */}
            <Box sx={{ display: "flex" }}>
              {/* <Box sx={{ flex: 1, pr: 2, fontWeight: "medium", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{demographicsData.patientName || "N/A"}</Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: "medium", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{demographicsData.pChartCode || "N/A"}</Box> */}
              <Box sx={{ flex: 1, pr: 2, fontWeight: "medium", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{demographicsData.gender || "N/A"}</Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: "medium", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {demographicsData.dateOfBirthOrAge || "N/A"}
              </Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: "medium", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{demographicsData.pBldGrp || "N/A"}</Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: "medium", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{demographicsData.mobileNumber || "N/A"}</Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: "medium", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{demographicsData.patientType || "N/A"}</Box>
              <Box sx={{ flex: 1, pr: 2, fontWeight: "medium", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {demographicsData.patientPaymentSource || "N/A"}
              </Box>
            </Box>
          </Box>
        ) : (
          // Compact view with 4 fields
          <Grid container spacing={2} sx={{ flex: 1 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>Patient Name</Box>
              <Box sx={{ fontWeight: "medium" }}>{demographicsData.patientName || "N/A"}</Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>UHID</Box>
              <Box sx={{ fontWeight: "medium" }}>{demographicsData.pChartCode || "N/A"}</Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>Gender</Box>
              <Box sx={{ fontWeight: "medium" }}>{demographicsData.gender || "N/A"}</Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ fontWeight: 500, color: "text.secondary", fontSize: "0.875rem" }}>Date of Birth</Box>
              <Box sx={{ fontWeight: "medium" }}>{demographicsData.dateOfBirthOrAge || "N/A"}</Box>
            </Grid>
          </Grid>
        )}

        {/* Action buttons */}
        <Box sx={{ display: "flex", gap: 1, ml: 2, flexShrink: 0 }}>
          {showEditButton && (
            <IconButton
              size="small"
              color="primary"
              onClick={onEditClick}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}

          {showRefreshButton && (
            <IconButton
              size="small"
              color="primary"
              onClick={onRefreshClick}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
