import { LabRegisterData } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { Chip, Stack } from "@mui/material";
import React from "react";

interface InvestigationCountChipsProps {
  register: LabRegisterData;
  size?: "small" | "medium";
}

export const InvestigationCountChips: React.FC<InvestigationCountChipsProps> = ({ register, size = "small" }) => {
  const counts = [
    { label: "Total", value: register.investigationCount, color: "default", variant: "filled" },
    { label: "Pending", value: register.invSamplePendingCount, color: "error", variant: "outlined" },
    { label: "Collected", value: register.invSampleCollectedCount, color: "warning", variant: "outlined" },
    { label: "Completed", value: register.invResultCompletedCount, color: "info", variant: "outlined" },
    { label: "Approved", value: register.invResultApprovedCount, color: "success", variant: "outlined" },
  ];

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {counts.map(({ label, value, color, variant }) => {
        if (!value && label !== "Total") return null;
        return <Chip key={label} size={size} label={`${label}: ${value || 0}`} color={color as any} variant={variant as any} sx={{ fontSize: "0.7rem", mb: 0.5 }} />;
      })}
    </Stack>
  );
};
