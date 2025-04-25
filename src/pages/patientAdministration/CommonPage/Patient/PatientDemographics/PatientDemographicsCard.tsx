// src/pages/patientAdministration/commonPage/patient/PatientDemographics/PatientDemographicsCard.tsx
import React from "react";
import { Box, Typography, Paper, Button, Skeleton, Grid } from "@mui/material";
import { Edit as EditIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { PatientDemographicsData } from "@/interfaces/PatientAdministration/Patient/PatientDemographics.interface";

interface PatientDemographicsCardProps {
  demographicsData: PatientDemographicsData | null;
  isLoading: boolean;
  showEditButton: boolean;
  showRefreshButton: boolean;
  onEditClick?: () => void;
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
      <Paper sx={{ p: 2 }} className={className}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Patient Demographics</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {showEditButton && <Skeleton variant="rectangular" width={80} height={36} />}
            {showRefreshButton && <Skeleton variant="rectangular" width={100} height={36} />}
          </Box>
        </Box>
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
      <Paper sx={{ p: 2 }} className={className}>
        <Typography variant="body1" sx={{ textAlign: "center", py: 2 }}>
          {emptyStateMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }} className={className}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Patient Demographics</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {showEditButton && (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={onEditClick} size="small" color="primary">
              Edit
            </Button>
          )}

          {showRefreshButton && (
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefreshClick} size="small" color="primary">
              Refresh
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Patient Name
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographicsData.patientName || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            UHID
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographicsData.pChartCode || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Gender
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographicsData.gender || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Date of Birth
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographicsData.dateOfBirthOrAge || "N/A"}
          </Typography>
        </Grid>

        {variant === "detailed" && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Blood Group
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {demographicsData.pBldGrp || "N/A"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Mobile Number
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {demographicsData.mobileNumber || "N/A"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Patient Type
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {demographicsData.patientType || "N/A"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Payment Source
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {demographicsData.patientPaymentSource || "N/A"}
              </Typography>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
};
