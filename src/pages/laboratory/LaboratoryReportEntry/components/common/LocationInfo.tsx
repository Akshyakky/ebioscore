import { LabRegisterData } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { Box, Typography } from "@mui/material";
import React from "react";

interface LocationInfoProps {
  register: LabRegisterData;
}

export const LocationInfo: React.FC<LocationInfoProps> = ({ register }) => {
  const { wardName, roomName, bedName } = register;

  if (!wardName && !roomName && !bedName) return <>-</>;

  return (
    <Box>
      {wardName && (
        <Typography variant="caption" display="block">
          Ward: {wardName}
        </Typography>
      )}
      {roomName && (
        <Typography variant="caption" display="block">
          Room: {roomName}
        </Typography>
      )}
      {bedName && (
        <Typography variant="caption" display="block">
          Bed: {bedName}
        </Typography>
      )}
    </Box>
  );
};
