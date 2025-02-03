// PatientSearch.tsx
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Grid, Box, debounce } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { PatientSearchContext } from "@/context/PatientSearchContext";
import useDayjs from "@/hooks/Common/useDateTime";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import CustomButton from "@/components/Button/CustomButton";
import FloatingLabelTextBox from "@/components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import GenericDialog from "@/components/GenericDialog/GenericDialog";

interface PatientSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditPatient: (patientId: string, pChartCode: string) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ show, handleClose, onEditPatient }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { performSearch, searchResults } = useContext(PatientSearchContext);
  const dayjs = useDayjs();

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery) {
        performSearch(searchQuery);
      }
    }, 500),
    [performSearch]
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);

  const handleEditAndClose = (patientId: string, pChartCode: string) => {
    onEditPatient(patientId, pChartCode);
    handleClose();
  };

  const columns: Column<PatientRegistrationDto>[] = [
    {
      key: "edit",
      header: "Edit",
      visible: true,
      render: (row) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row.patRegisters?.pChartID.toString() || "", row.patRegisters?.pChartCode || "")}
          icon={EditIcon}
          size="small"
        />
      ),
    },
    {
      key: "patRegisters.pChartCode",
      header: "UHID",
      visible: true,
      render: (row) => row.patRegisters?.pChartCode || "",
    },
    {
      key: "patientName",
      header: "Patient Name",
      visible: true,
      render: (row) => `${row.patRegisters?.pTitle || ""} ${row.patRegisters?.pFName || ""} ${row.patRegisters?.pLName || ""}`,
    },
    {
      key: "patRegisters.pRegDate",
      header: "Registration Date",
      visible: true,
      render: (row) => dayjs.formatDate(row.patRegisters?.pRegDate) || "",
    },
    {
      key: "patRegisters.pGender",
      header: "Gender",
      visible: true,
      render: (row) => row.patRegisters?.pGender || "",
    },
    {
      key: "patAddress.pAddPhone1",
      header: "Mobile No",
      visible: true,
      render: (row) => row.patAddress?.pAddPhone1 || "",
    },
    {
      key: "patRegisters.pDob",
      header: "DOB",
      visible: true,
      render: (row) => dayjs.formatDate(row.patRegisters?.pDob) || "",
    },
    {
      key: "patRegisters.indentityValue",
      header: "Identity No",
      visible: true,
      render: (row) => row.patRegisters?.indentityValue || "",
    },
    {
      key: "patRegisters.pTypeName",
      header: "Payment Source",
      visible: true,
      render: (row) => row.patRegisters?.pTypeName || "",
    },
  ];

  const dialogContent = (
    <>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <FloatingLabelTextBox
              ControlID="SearchTerm"
              title="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter UHID, name, or mobile number"
              size="small"
              autoComplete="off"
            />
          </Grid>
        </Grid>
      </Box>
      <CustomGrid columns={columns} data={searchResults} minHeight="400px" maxHeight="400px" pagination={true} />
    </>
  );

  const dialogActions = <CustomButton variant="contained" text="Close" icon={CloseIcon} size="medium" onClick={handleClose} color="secondary" />;

  return (
    <GenericDialog
      open={show}
      onClose={handleClose}
      title="Patient Search"
      maxWidth="xl"
      fullWidth
      disableBackdropClick
      dialogContentSx={{
        minHeight: "400px",
        maxHeight: "400px",
      }}
      actions={[dialogActions]}
    >
      {dialogContent}
    </GenericDialog>
  );
};

export default PatientSearch;
