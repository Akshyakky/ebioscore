import React from "react";
import { OPIPInsurancesDto } from "../../../../interfaces/PatientAdministration/InsuranceDetails";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";

interface InsuranceGridProps {
  insuranceData: OPIPInsurancesDto[];
  onEdit: (insurance: OPIPInsurancesDto) => void;
  onDelete: (id: number) => void;
}

const PatientInsuranceGrid: React.FC<InsuranceGridProps> = ({
  insuranceData,
  onEdit,
  onDelete,
}) => {
  const gridPatientInsuranceColumns = [
    {
      key: "PInsuredit",
      header: "Edit",
      visible: true,
      render: (row: OPIPInsurancesDto) => (
        <CustomButton
          size="small"
          onClick={() => onEdit(row)}
          icon={EditIcon}
          color="primary"
        />
      ),
    },
    { key: "insurName", header: "Insurance Name", visible: true },
    { key: "policyNumber", header: "Policy Number", visible: true },
    { key: "coveredFor", header: "Covered For", visible: true },
    { key: "policyHolder", header: "Policy Holder", visible: true },
    { key: "groupNumber", header: "Group Number", visible: true },
    {
      key: "policyStartDt",
      header: "Start Date",
      visible: true,
      render: (row: OPIPInsurancesDto) =>
        format(new Date(row.policyStartDt), "dd/MM/yyyy"),
    },
    {
      key: "policyEndDt",
      header: "End Date",
      visible: true,
      render: (row: OPIPInsurancesDto) =>
        format(new Date(row.policyEndDt), "dd/MM/yyyy"),
    },
    { key: "guarantor", header: "Guarantor", visible: true },
    { key: "relation", header: "Relation", visible: true },
    {
      key: "PInsurdelete",
      header: "Delete",
      visible: true,
      render: (row: OPIPInsurancesDto) => (
        <CustomButton
          size="small"
          onClick={() => onDelete(row.oPIPInsID)}
          icon={DeleteIcon}
          color="error"
        />
      ),
    },
  ];

  return (
    <CustomGrid columns={gridPatientInsuranceColumns} data={insuranceData} />
  );
};

export default PatientInsuranceGrid;
