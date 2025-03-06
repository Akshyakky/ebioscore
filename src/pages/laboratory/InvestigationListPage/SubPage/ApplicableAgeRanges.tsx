import React, { useState, useEffect } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import FormField from "@/components/FormField/FormField";
import { LCompAgeRangeDto } from "@/interfaces/Laboratory/LInvMastDto";
import { useAppSelector } from "@/store/hooks";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { showAlert } from "@/utils/Common/showAlert";
import { LComponentDto } from "@/interfaces/Laboratory/LInvMastDto";

interface ApplicableAgeRangeTableProps {
  ageRanges: LCompAgeRangeDto[];
  componentId: number | undefined;
  onAddAgeRange: (newAgeRange: LCompAgeRangeDto) => void;
  onUpdateAgeRange: (updatedAgeRange: LCompAgeRangeDto) => void;
  selectedComponent?: LComponentDto;
}

const ApplicableAgeRangeTable: React.FC<ApplicableAgeRangeTableProps> = ({ ageRanges, componentId, onAddAgeRange, onUpdateAgeRange, selectedComponent }) => {
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

  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    if (!isEditing) {
      resetNewAgeRange(); // Reset only when not editing
    }

    setIsEditing(false);
    setOpenModal(false); // Move this to the end to ensure all updates happen first
  };

  const handleInputChange = (field: string, value: any) => {
    setNewAgeRange({
      ...newAgeRange,
      [field]: value,
      carAgeValue:
        field === "carStart" || field === "carEnd"
          ? `${field === "carStart" ? value : newAgeRange.carStart}-${field === "carEnd" ? value : newAgeRange.carEnd} ${newAgeRange.carAgeType}`
          : newAgeRange.carAgeValue,
    });
  };

  const handleSave = () => {
    if (!newAgeRange.carName || newAgeRange.carStart >= newAgeRange.carEnd) {
      showAlert("error", "Please enter a valid age range", "error");
      return;
    }

    const updatedRange = {
      ...newAgeRange,
      cappID: componentId,
      compOID: selectedComponent?.compoID,
      carAgeValue: `${newAgeRange.carStart}-${newAgeRange.carEnd} ${newAgeRange.carAgeType}`,
      carSexValue: newAgeRange.carSex,
      rActiveYN: "Y",
      rModifiedOn: serverDate || new Date(),
      rModifiedID: userID || 0,
      rModifiedBy: userName || "",
    };

    if (newAgeRange.carID === 0) {
      onAddAgeRange(updatedRange); // Add new range
    } else {
      onUpdateAgeRange(updatedRange); // Update existing range
    }

    setNewAgeRange(updatedRange);
    handleCloseModal();
  };

  const handleEdit = (row: LCompAgeRangeDto) => {
    setNewAgeRange(row);
    setIsEditing(true);
    setOpenModal(true);
  };

  const resetNewAgeRange = () => {
    setNewAgeRange({
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
  };

  useEffect(() => {
    const activeRange = ageRanges.find((range) => range.compOID === componentId && range.rActiveYN === "Y");
    if (activeRange) {
      setSelectedRow(activeRange.carID);
    }
  }, [ageRanges, componentId]);

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
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Applicable For - Age Range</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lower</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Upper</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Normal Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ageRanges.map((row) => (
              <TableRow key={row.carID}>
                <TableCell>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(row)} sx={{ minWidth: "auto" }}>
                    Edit
                  </Button>
                </TableCell>
                <TableCell>{`${row.carSex} ${row.carStart}-${row.carEnd} ${row.carAgeType}`}</TableCell>
                <TableCell>{row.carStart}</TableCell>
                <TableCell>{row.carEnd}</TableCell>
                <TableCell>{row.carName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: "#2C3E50", color: "white" }}>{newAgeRange.carID > 0 ? "Edit Age Range" : "Add Age Range"}</DialogTitle>
        <DialogContent>
          <FormField
            type="text"
            label="Applicable For"
            name="carName"
            ControlID="carName"
            value={newAgeRange.carName}
            onChange={(e) => setNewAgeRange({ ...newAgeRange, carName: e.target.value })}
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
            onChange={(e) => setNewAgeRange({ ...newAgeRange, carSex: e.target.value })}
          />
          <FormField
            type="number"
            label="Age From"
            name="carStart"
            ControlID="carStart"
            value={newAgeRange.carStart}
            onChange={(e) => setNewAgeRange({ ...newAgeRange, carStart: Number(e.target.value) })}
          />
          <FormField
            type="number"
            label="Age To"
            name="carEnd"
            ControlID="carEnd"
            value={newAgeRange.carEnd}
            onChange={(e) => setNewAgeRange({ ...newAgeRange, carEnd: Number(e.target.value) })}
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
            onChange={(e) => setNewAgeRange({ ...newAgeRange, carAgeType: e.target.value })}
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
          <Button variant="contained" color="success" onClick={handleSave}>
            {newAgeRange.carID > 0 ? "Update" : "Save"}
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
