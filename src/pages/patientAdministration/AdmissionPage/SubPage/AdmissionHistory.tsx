import React from "react";
import { Box } from "@mui/material";
import CustomGrid, { Column } from "../../../../components/CustomGrid/CustomGrid";
import { AdmissionHistoryDto } from "../../../../interfaces/PatientAdministration/AdmissionHistoryDto";
import { format } from "date-fns";

interface AdmissionHistoryProps {
  admissionHistory: AdmissionHistoryDto[];
}

export const admissionHistoryColumns: Column<AdmissionHistoryDto>[] = [
  {
    key: "serialNumber",
    header: "Sl No.",
    visible: true,
    width: 80,
  },
  {
    key: "admitDate",
    header: "Admit Date",
    visible: true,
    formatter: (value: Date) => format(new Date(value), "dd/MM/yyyy"),
  },
  {
    key: "admitCode",
    header: "Case Number",
    visible: true,
  },
  {
    key: "attendingPhysicianName",
    header: "Attending Physician",
    visible: true,
  },
  {
    key: "bedCategory",
    header: "Bed Category",
    visible: true,
  },
  {
    key: "wardName",
    header: "Ward Name",
    visible: true,
  },
  {
    key: "bedName",
    header: "Bed No.",
    visible: true,
  },
  {
    key: "dischargeDate",
    header: "Discharge Date",
    visible: true,
    formatter: (value: Date | null) => (value ? format(new Date(value), "dd/MM/yyyy") : "-"),
  },
  {
    key: "status",
    header: "Status",
    visible: true,
    formatter: (value: string) => {
      const statusMap = {
        "Currently Admitted": "success",
        Discharged: "info",
        Transferred: "warning",
        Expired: "error",
      };

      const color = statusMap[value as keyof typeof statusMap] || "default";

      return (
        <Box
          sx={{
            backgroundColor: `${color}.main`,
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            display: "inline-block",
            fontSize: "0.875rem",
          }}
        >
          {value}
        </Box>
      );
    },
  },
];

const AdmissionHistory: React.FC<AdmissionHistoryProps> = ({ admissionHistory }) => {
  if (!admissionHistory?.length) {
    return null;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <CustomGrid columns={admissionHistoryColumns} data={admissionHistory} maxHeight="300px" />
    </Box>
  );
};

export default AdmissionHistory;
