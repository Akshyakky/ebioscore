import { useCallback, useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Typography,
  styled,
} from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { PatientSearchContext } from "../../../../context/PatientSearchContext";
import { debounce } from "../../../../utils/Common/debounceUtils";
import { PatientSearchResult } from "../../../../interfaces/PatientAdministration/registrationFormData";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
interface PatientSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditPatient: (patientId: string) => void;
}
const PatientSearch = ({
  show,
  handleClose,
  onEditPatient,
}: PatientSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { performSearch, searchResults } = useContext(PatientSearchContext);
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      performSearch(searchQuery);
    }, 500),
    []
  );
  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);
  const handleEditAndClose = (patientId: string) => {
    onEditPatient(patientId);
    handleClose();
  };
  const columns = [
    {
      key: "PatientEdit",
      header: "Edit",
      visible: true,
      render: (row: PatientSearchResult) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row.pChartID.toString())}
          icon={EditIcon}
        />
      ),
    },
    { key: "pChartCode", header: "UHID", visible: true },
    {
      key: "patientName",
      header: "Patient Name",
      visible: true,
      render: (row: PatientSearchResult) =>
        `${row.pTitle} ${row.pfName} ${row.plName}`,
    },
    {
      key: "RegDate",
      header: "Registration Date",
      visible: true,
      render: (row: PatientSearchResult) => `${row.pRegDate.split("T")[0]} `,
    },
    { key: "pGender", header: "Gender", visible: true },
    {
      key: "MobileNo ",
      header: "Mobile No",
      visible: true,
      render: (row: any) => `${row.pAddPhone1}`,
    },
    {
      key: "Dob",
      header: "DOB",
      visible: true,
      render: (row: PatientSearchResult) => `${row.pDob.split("T")[0]} `,
    },
    { key: "pssnID", header: "Identity No", visible: true },
    { key: "pTypeName", header: "Payment Source", visible: true },
  ];
  // const StyledDialog = styled(Dialog)(({ theme }) => ({
  //   "& .MuiDialogTitle-root": {
  //     backgroundColor: theme.palette.primary.main,
  //     color: theme.palette.primary.contrastText,
  //   },
  //   "& .MuiDialogContent-root": {
  //     paddingTop: theme.spacing(1),
  //     paddingBottom: theme.spacing(1),
  //   },
  //   "& .MuiDialogActions-root": {
  //     padding: theme.spacing(1),
  //     justifyContent: "flex-end",
  //   },
  // }));
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
          minHeight: "600px", // Adjust the value as needed
          maxHeight: "600px", // Adjust the value as needed
          overflowY: "auto", // Add scroll if content is larger than maxHeight
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
