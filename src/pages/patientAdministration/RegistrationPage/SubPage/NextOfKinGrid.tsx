import React from "react";
import { PatNokDetailsDto } from "../../../../interfaces/PatientAdministration/PatNokDetailsDto";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";

interface NextOfKinGridProps {
  kinData: PatNokDetailsDto[];
  onEdit: (kin: PatNokDetailsDto) => void;
  onDelete: (id: number) => void;
}

const NextOfKinGrid: React.FC<NextOfKinGridProps> = ({
  kinData,
  onEdit,
  onDelete,
}) => {
  const gridKinColumns = [
    {
      key: "edit",
      header: "Edit",
      visible: true,
      render: (row: PatNokDetailsDto) => (
        <CustomButton
          size="small"
          onClick={() => onEdit(row)}
          icon={EditIcon}
          color="primary"
        />
      ),
    },
    { key: "pNokRegStatus", header: "NOK Type", visible: true },
    {
      key: "pNokFName",
      header: "Name",
      visible: true,
      render: (row: PatNokDetailsDto) => `${row.pNokFName} ${row.pNokLName}`,
    },
    { key: "pNokRelName", header: "Relationship", visible: true },
    {
      key: "pNokDob",
      header: "DOB",
      visible: true,
      render: (row: PatNokDetailsDto) =>
        format(new Date(row.pNokDob), "dd/MM/yyyy"),
    },
    { key: "pNokPostcode", header: "Post Code", visible: true },
    {
      key: "Address",
      header: "Address",
      visible: true,
      render: (row: PatNokDetailsDto) =>
        `${row.pNokStreet} Area : ${row.pNokArea} City :  ${row.pNokCity} Country : ${row.pNokActualCountry} Nationality : ${row.pNokCountryVal}`,
    },
    { key: "pAddPhone1", header: "Mobile", visible: true },
    {
      key: "pNokPssnID",
      header: "Passport Id/No",
      visible: true,
    },
    {
      key: "delete",
      header: "Delete",
      visible: true,
      render: (row: PatNokDetailsDto) => (
        <CustomButton
          size="small"
          onClick={() => onDelete(row.pNokID)}
          icon={DeleteIcon}
          color="error"
        />
      ),
    },
  ];

  return <CustomGrid columns={gridKinColumns} data={kinData} />;
};

export default NextOfKinGrid;
