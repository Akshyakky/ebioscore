import { GetLabRegistersListDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { Print as PrintIcon, Assignment as ReportIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import { IconButton, Stack, Tooltip } from "@mui/material";
import React from "react";

interface ActionButtonsProps {
  register: GetLabRegistersListDto;
  onEnterReport: (register: GetLabRegistersListDto) => void;
  onViewReport: (register: GetLabRegistersListDto) => void;
  onPrintReport: (register: GetLabRegistersListDto) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ register, onEnterReport, onViewReport, onPrintReport }) => {
  const buttonStyle = {
    bgcolor: "rgba(25, 118, 210, 0.08)",
    "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
  };

  return (
    <Stack direction="row" spacing={1}>
      <Tooltip title="Enter Report">
        <IconButton size="small" color="primary" onClick={() => onEnterReport(register)} sx={buttonStyle}>
          <ReportIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Report">
        <IconButton size="small" color="info" onClick={() => onViewReport(register)} sx={buttonStyle}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Print Report">
        <IconButton size="small" color="success" onClick={() => onPrintReport(register)} sx={{ ...buttonStyle, bgcolor: "rgba(76, 175, 80, 0.08)" }}>
          <PrintIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
