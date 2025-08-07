import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { GetLabRegistersListDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { Box, Typography } from "@mui/material";
import React, { useCallback } from "react";
import { ActionButtons } from "./common/ActionButtons";
import { InvestigationCountChips } from "./common/InvestigationCountChips";
import { LocationInfo } from "./common/LocationInfo";
import { PatientInfo } from "./common/PatientInfo";
import { StatusChip } from "./common/StatusChip";

interface LabRegistersGridProps {
  data: GetLabRegistersListDto[];
  loading: boolean;
  searchTerm: string;
  onRowClick: (register: GetLabRegistersListDto) => void;
  onEnterReport: (register: GetLabRegistersListDto) => void;
  onViewReport: (register: GetLabRegistersListDto) => void;
  onPrintReport: (register: GetLabRegistersListDto) => void;
  emptyMessage?: string;
}

export const LabRegistersGrid: React.FC<LabRegistersGridProps> = ({
  data,
  loading,
  searchTerm,
  onRowClick,
  onEnterReport,
  onViewReport,
  onPrintReport,
  emptyMessage = "No lab registers found",
}) => {
  const columns: Column<GetLabRegistersListDto>[] = [
    {
      key: "labRegNo",
      header: "Lab Reg No",
      visible: true,
      sortable: true,
      width: 120,
      formatter: (_value: any, item: GetLabRegistersListDto) => (
        <Typography variant="h6" color="primary">
          {item.labRegister.labRegNo}
        </Typography>
      ),
    },
    {
      key: "patient",
      header: "Patient Details",
      visible: true,
      sortable: true,
      width: 280,
      render: (item) => <PatientInfo register={item.labRegister} />,
    },
    {
      key: "registrationDate",
      header: "Registration Date",
      visible: true,
      sortable: true,
      width: 150,
      formatter: (_value: any, item: GetLabRegistersListDto) => {
        const date = new Date(item.labRegister.labRegisterDate);
        return (
          <Box>
            <Typography variant="body2">{date.toLocaleDateString()}</Typography>
            <Typography variant="caption" color="text.secondary">
              {date.toLocaleTimeString()}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "referralDoctor",
      header: "Referral Doctor",
      visible: true,
      sortable: true,
      width: 150,
      formatter: (_value: any, item: GetLabRegistersListDto) => item.labRegister.referralDoctor || "-",
    },
    {
      key: "location",
      header: "Location",
      visible: true,
      width: 180,
      render: (item) => <LocationInfo register={item.labRegister} />,
    },
    {
      key: "sampleStatus",
      header: "Report Status",
      visible: true,
      sortable: true,
      width: 180,
      render: (item) => <StatusChip status={item.labRegister.sampleStatus} />,
    },
    {
      key: "investigations",
      header: "Investigations",
      visible: true,
      width: 300,
      render: (item) => <InvestigationCountChips register={item.labRegister} />,
    },
    {
      key: "billedBy",
      header: "Billed By",
      visible: true,
      width: 100,
      formatter: (_value: any, item: GetLabRegistersListDto) => item.labRegister.billedBy || "-",
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 150,
      render: (item) => <ActionButtons register={item} onEnterReport={onEnterReport} onViewReport={onViewReport} onPrintReport={onPrintReport} />,
    },
  ];

  const customFilter = useCallback((item: GetLabRegistersListDto, searchValue: string) => {
    const reg = item.labRegister;
    const searchLower = searchValue.toLowerCase();

    return (
      reg.labRegNo.toString().includes(searchLower) ||
      reg.patientFullName?.toLowerCase().includes(searchLower) ||
      reg.patientUHID?.toLowerCase().includes(searchLower) ||
      reg.referralDoctor?.toLowerCase().includes(searchLower)
    );
  }, []);

  return (
    <CustomGrid
      columns={columns}
      data={data}
      maxHeight="calc(100vh - 380px)"
      emptyStateMessage={emptyMessage}
      loading={loading}
      customFilter={customFilter}
      searchTerm={searchTerm}
      density="medium"
      onRowClick={onRowClick}
    />
  );
};
