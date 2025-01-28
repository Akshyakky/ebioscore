import React, { useMemo, useCallback } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import useDayjs from "@/hooks/Common/useDateTime";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
import CustomButton from "@/components/Button/CustomButton";
import CustomGrid from "@/components/CustomGrid/CustomGrid";

interface NextOfKinGridProps {
  kinData: PatNokDetailsDto[];
  onEdit: (kin: PatNokDetailsDto) => void;
  onDelete: (kin: PatNokDetailsDto) => void;
}

const NextOfKinGrid: React.FC<NextOfKinGridProps> = ({ kinData, onEdit, onDelete }) => {
  const { formatDate } = useDayjs();

  const handleEdit = useCallback(
    async (row: PatNokDetailsDto) => {
      try {
        if (row.pNokPChartID) {
          const response = await PatientService.getPatientDetails(row.pNokPChartID);
          if (response.success && response.data) {
            row.pNokPChartCode = response.data.patRegisters.pChartCode || "";
          }
        }
      } catch (error) {
        console.error("Error fetching patient details for edit:", error);
      } finally {
        onEdit(row);
      }
    },
    [onEdit]
  );

  const gridKinColumns = useMemo(
    () => [
      {
        key: "edit",
        header: "Edit",
        visible: true,
        render: (row: PatNokDetailsDto) => <CustomButton size="small" onClick={() => handleEdit(row)} icon={EditIcon} color="primary" />,
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
        render: (row: PatNokDetailsDto) => `${row.pNokStreet} Area: ${row.pNokArea} City: ${row.pNokCity} Country: ${row.pNokActualCountry} Nationality: ${row.pNokCountryVal}`,
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
        render: (row: PatNokDetailsDto) => <CustomButton size="small" onClick={() => onDelete(row)} icon={DeleteIcon} color="error" />,
      },
    ],
    [handleEdit, onDelete]
  );

  return <CustomGrid columns={gridKinColumns} data={kinData} />;
};

export default React.memo(NextOfKinGrid);
