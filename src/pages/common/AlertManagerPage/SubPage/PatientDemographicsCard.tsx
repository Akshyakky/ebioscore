// src/pages/common/AlertManagerPage/SubPage/PatientDemographicsCard.tsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Skeleton, Grid } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { notifyError } from "@/utils/Common/toastManager";
import { useLoading } from "@/context/LoadingContext";

interface PatientDemographicsCardProps {
  pChartID: number;
  onEditClick: () => void;
}

const PatientDemographicsCard: React.FC<PatientDemographicsCardProps> = ({ pChartID, onEditClick }) => {
  const [demographics, setDemographics] = useState<any>(null);
  const { isLoading, setLoading } = useLoading();

  useEffect(() => {
    const fetchDemographics = async () => {
      if (!pChartID) return;

      try {
        setLoading(true);
        const result = await RegistrationService.PatientDemoGraph(pChartID);

        if (result.success && result.data) {
          setDemographics(result.data);
        } else {
          notifyError(result.errorMessage || "Failed to fetch patient demographics");
        }
      } catch (error) {
        console.error("Error fetching patient demographics:", error);
        notifyError("An error occurred while fetching patient demographics");
      } finally {
        setLoading(false);
      }
    };

    fetchDemographics();
  }, [pChartID]);

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Patient Demographics</Typography>
          <Skeleton variant="rectangular" width={100} height={36} />
        </Box>
        <Grid container spacing={2}>
          {[...Array(8)].map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={30} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  if (!demographics) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1" sx={{ textAlign: "center", py: 2 }}>
          No demographics information available for this patient.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Patient Demographics</Typography>
        <Button variant="contained" startIcon={<EditIcon />} onClick={onEditClick} size="small">
          Edit
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Patient Name
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.patientName || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            UHID
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.pChartCode || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Gender
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.gender || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Date of Birth
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.dateOfBirthOrAge || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Blood Group
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.pBldGrp || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Mobile Number
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.mobileNumber || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Patient Type
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.patientType || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Payment Source
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.patientPaymentSource || "N/A"}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PatientDemographicsCard;
