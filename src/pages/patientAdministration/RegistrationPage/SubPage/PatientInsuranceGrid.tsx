  import React from "react";
  import { InsuranceFormState } from "../../../../interfaces/PatientAdministration/InsuranceDetails";
  import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
  import CustomButton from "../../../../components/Button/CustomButton";
  import EditIcon from "@mui/icons-material/Edit";
  import DeleteIcon from "@mui/icons-material/Delete";

  interface InsuranceGridProps {
    insuranceData: InsuranceFormState[];
    onEdit: (insurance: InsuranceFormState) => void;
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
        render: (row: InsuranceFormState) => (
          <CustomButton
            size="small"
            onClick={() => onEdit(row)}
            icon={EditIcon}
            color="primary"
          />
        ),
      },
      { key: "InsurName", header: "Insurance Name", visible: true },
      { key: "PolicyNumber", header: "Policy Number", visible: true },
      { key: "CoveredFor", header: "Covered For", visible: true },
      { key: "PolicyHolder", header: "Policy Holder", visible: true },
      { key: "GroupNumber", header: "Group Number", visible: true },
      { key: "PolicyStartDt", header: "Start Date", visible: true },
      { key: "PolicyEndDt", header: "End Date", visible: true },
      { key: "Guarantor", header: "Guarantor", visible: true },
      { key: "Relation", header: "Relation", visible: true },
      {
        key: "PInsurdelete",
        header: "Delete",
        visible: true,
        render: (row: InsuranceFormState) => (
          <CustomButton
            size="small"
            onClick={() => onDelete(row.OPIPInsID)}
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
