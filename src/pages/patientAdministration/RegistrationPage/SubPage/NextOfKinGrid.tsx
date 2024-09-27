import React, { useMemo, useCallback } from "react";
import { PatNokDetailsDto } from "../../../../interfaces/PatientAdministration/PatNokDetailsDto";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useDayjs from "../../../../hooks/Common/useDateTime";

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
  const { formatDate, parse, formatDateYMD } = useDayjs();
  const handleEdit = useCallback((row: PatNokDetailsDto) => {

    onEdit(row);
  }, [onEdit]);

  const handleDelete = useCallback((id: number) => {
    onDelete(id);
  }, [onDelete]);

  const gridKinColumns = useMemo(() => [
    {
      key: "edit",
      header: "Edit",
      visible: true,
      render: (row: PatNokDetailsDto) => (
        <CustomButton
          size="small"
          onClick={() => handleEdit(row)}
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
      render: (row: PatNokDetailsDto) => formatDate(row.pNokDob),
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
          onClick={() => handleDelete(row.pNokID)}
          icon={DeleteIcon}
          color="error"
        />
      ),
    },
  ], [handleEdit, handleDelete]);

  return <CustomGrid columns={gridKinColumns} data={kinData} />;
};

export default React.memo(NextOfKinGrid);