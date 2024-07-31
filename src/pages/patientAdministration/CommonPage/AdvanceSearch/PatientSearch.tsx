import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Typography,
} from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { PatientSearchContext } from "../../../../context/PatientSearchContext";
import { debounce } from "../../../../utils/Common/debounceUtils";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";

interface PatientSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditPatient: (patientId: string) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({
  show,
  handleClose,
  onEditPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { performSearch, searchResults } = useContext(PatientSearchContext);

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

  const handleEditAndClose = (patientId: string) => {
    onEditPatient(patientId);
    handleClose();
  };

  const columns = [
    {
      key: "patRegisters.pChartID",
      header: "Edit",
      visible: true,
      render: (row: PatientRegistrationDto) => (
        <CustomButton
          text="Edit"
          onClick={() =>
            handleEditAndClose(row.patRegisters?.pChartID.toString())
          }
          icon={EditIcon}
        />
      ),
    },
    {
      key: "patRegisters.pChartCode",
      header: "UHID",
      visible: true,
      render: (row: PatientRegistrationDto) =>
        row.patRegisters?.pChartCode || "",
    },
    {
      key: "patRegisters.pTitle",
      header: "Patient Name",
      visible: true,
      render: (row: PatientRegistrationDto) =>
        `${row.patRegisters?.pTitle || ""} ${row.patRegisters?.pFName || ""} ${
          row.patRegisters?.pLName || ""
        }`,
    },
    {
      key: "patRegisters.pRegDate",
      header: "Registration Date",
      visible: true,
      render: (row: PatientRegistrationDto) =>
        row.patRegisters?.pRegDate.split("T")[0] || "",
    },
    {
      key: "patRegisters.pGender",
      header: "Gender",
      visible: true,
      render: (row: PatientRegistrationDto) => row.patRegisters?.pGender || "",
    },
    {
      key: "patAddress.pAddPhone1",
      header: "Mobile No",
      visible: true,
      render: (row: PatientRegistrationDto) => row.patAddress?.pAddPhone1 || "",
    },
    {
      key: "patRegisters.pDob",
      header: "DOB",
      visible: true,
      render: (row: PatientRegistrationDto) =>
        row.patRegisters?.pDob.split("T")[0] || "",
    },
    {
      key: "patRegisters.pssnID",
      header: "Identity No",
      visible: true,
      render: (row: PatientRegistrationDto) => row.patRegisters?.pssnID || "",
    },
    {
      key: "patRegisters.pTypeName",
      header: "Payment Source",
      visible: true,
      render: (row: PatientRegistrationDto) =>
        row.patRegisters?.pTypeName || "",
    },
  ];

  return (
    <Dialog
      open={show}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          handleClose();
        }
      }}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">Patient Search</Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          minHeight: "600px",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
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
        <CustomGrid
          columns={columns}
          data={searchResults}
          minHeight="500px"
          maxHeight="500px"
        />
      </DialogContent>
      <DialogActions>
        <CustomButton
          variant="contained"
          text="Close"
          icon={CloseIcon}
          size="medium"
          onClick={handleClose}
          color="secondary"
        />
      </DialogActions>
    </Dialog>
  );
};

export default PatientSearch;
