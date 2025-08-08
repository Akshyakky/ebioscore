import { LabRegisterData } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { LocalHospital as HospitalIcon } from "@mui/icons-material";
import { Box, Chip, Typography } from "@mui/material";
import React from "react";

interface PatientInfoProps {
  register: LabRegisterData;
}

export const PatientInfo: React.FC<PatientInfoProps> = ({ register }) => {
  return (
    <Box>
      <Typography variant="body2" fontWeight="bold">
        {register.patientFullName}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        UHID: {register.patientUHID}
      </Typography>
      <Box sx={{ mt: 0.5 }}>
        <Chip size="small" icon={<HospitalIcon />} label={register.patientStatus} color={register.patientStatus === "OP" ? "primary" : "secondary"} variant="outlined" />
        {register.patientRefCode && (
          <Typography variant="caption" sx={{ ml: 1 }}>
            Ref: {register.patientRefCode}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
