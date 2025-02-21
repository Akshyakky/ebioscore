import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FormField from "@/components/FormField/FormField";
import { LCompAgeRangeDto } from "@/interfaces/Laboratory/LInvMastDto";
import { useAppSelector } from "@/store/hooks";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { showAlert } from "@/utils/Common/showAlert";

interface ApplicableAgeRangeTableProps {
  ageRanges: LCompAgeRangeDto[];
  componentId: number | undefined;
  onAddAgeRange: (newAgeRange: LCompAgeRangeDto) => void;
}

const ApplicableAgeRangeTable: React.FC<ApplicableAgeRangeTableProps> = ({ ageRanges, componentId, onAddAgeRange }) => {
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);
  const serverDate = useServerDate();

  const [openModal, setOpenModal] = useState(false);
  const [newAgeRange, setNewAgeRange] = useState<LCompAgeRangeDto>({
    carID: 0,
    cappID: componentId,
    carName: "",
    carSex: "Either",
    carStart: 0,
    carEnd: 0,
    carAgeType: "Years",
    carSexValue: "",
    carAgeValue: "",
    cappName: "",
    cappOrder: 0,
    rActiveYN: "Y",
    compID: compID || 1,
    compCode: compCode || "",
    compName: compName || "",
    transferYN: "N",
    rNotes: "",
    rCreatedID: userID || 0,
    rCreatedBy: userName || "",
    rModifiedID: userID || 0,
    rModifiedBy: userName || "",
    rCreatedOn: serverDate || new Date(),
    rModifiedOn: serverDate || new Date(),
  });

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (name: string, value: any) => {
    setNewAgeRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    if (!newAgeRange.carName || newAgeRange.carStart >= newAgeRange.carEnd) {
      showAlert("error", "Please enter a valid age range", "error");
      return;
    }

    onAddAgeRange({
      ...newAgeRange,
      cappID: componentId,
      carAgeValue: `${newAgeRange.carStart}-${newAgeRange.carEnd} ${newAgeRange.carAgeType}`,
      carSexValue: newAgeRange.carSex,
    });

    handleCloseModal();
    setNewAgeRange((prev) => ({
      ...prev,
      carName: "",
      carStart: 0,
      carEnd: 0,
      carSex: "Either",
      carAgeType: "Years",
    }));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Applicable Age Range Table
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenModal}>
          Add Age Range
        </Button>
      </Grid>

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2", color: "white" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Select</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Applicable For - Age Range</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lower</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Upper</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Normal Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ageRanges.map((row) => (
              <TableRow
                key={row.carID}
                sx={{
                  "&:hover": { backgroundColor: "#f0f0f0" },
                  transition: "background-color 0.2s",
                }}
              >
                <TableCell>
                  <FormField value={row.carID} type="switch" label="" name={`select-${row.carID}`} ControlID={`select-${row.carID}`} checked={false} onChange={() => {}} />
                </TableCell>
                <TableCell>{`${row.carSex} ${row.carStart}-${row.carEnd} ${row.carAgeType}`}</TableCell>
                <TableCell>
                  <FormField type="number" label="" name="carStart" ControlID={`carStart-${row.carID}`} value={row.carStart} disabled onChange={() => {}} />
                </TableCell>
                <TableCell>
                  <FormField type="number" label="" name="carEnd" ControlID={`carEnd-${row.carID}`} value={row.carEnd} disabled onChange={() => {}} />
                </TableCell>
                <TableCell>
                  <FormField type="text" label="" name={`normalValue-${row.carID}`} ControlID={`normalValue-${row.carID}`} value="" onChange={() => {}} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Age Range Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: "#2C3E50", color: "white" }}>Add Age Range</DialogTitle>
        <DialogContent>
          <FormField
            type="text"
            label="Applicable For"
            name="carName"
            ControlID="carName"
            value={newAgeRange.carName}
            onChange={(e) => handleInputChange("carName", e.target.value)}
          />
          <FormField
            type="select"
            label="Sex"
            name="carSex"
            ControlID="carSex"
            value={newAgeRange.carSex}
            options={[
              { value: "Either", label: "Either" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
            ]}
            onChange={(e) => handleInputChange("carSex", e.target.value)}
          />
          <FormField
            type="number"
            label="Age From"
            name="carStart"
            ControlID="carStart"
            value={newAgeRange.carStart}
            onChange={(e) => handleInputChange("carStart", Number(e.target.value))}
          />
          <FormField
            type="number"
            label="Age To"
            name="carEnd"
            ControlID="carEnd"
            value={newAgeRange.carEnd}
            onChange={(e) => handleInputChange("carEnd", Number(e.target.value))}
          />
          <FormField
            type="select"
            label="Period"
            name="carAgeType"
            ControlID="carAgeType"
            value={newAgeRange.carAgeType}
            options={[
              { value: "Days", label: "Days" },
              { value: "Months", label: "Months" },
              { value: "Years", label: "Years" },
            ]}
            onChange={(e) => handleInputChange("carAgeType", e.target.value)}
          />

          <FormField
            type="text"
            label="Description"
            name="description"
            ControlID="description"
            value={`${newAgeRange.carName} - ${newAgeRange.carSex} ${newAgeRange.carStart}-${newAgeRange.carEnd} ${newAgeRange.carAgeType}`}
            disabled
            onChange={() => {}}
          />
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="success" onClick={handleAdd}>
            Save
          </Button>
          <Button variant="contained" color="error" onClick={handleCloseModal}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicableAgeRangeTable;
