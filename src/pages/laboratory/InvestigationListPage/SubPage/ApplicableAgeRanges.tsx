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

  const [selectedRow, setSelectedRow] = useState<number | null>(() => {
    const activeRange = ageRanges.find((range) => (range.compOID === componentId || range.cappID === componentId) && range.rActiveYN === "Y");
    return activeRange?.carID || null;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [filteredAgeRanges, setFilteredAgeRanges] = useState<LCompAgeRangeDto[]>([]);

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    if (!isEditing) {
      resetNewAgeRange(); // Reset only when not editing
    }

    setIsEditing(false);
    setOpenModal(false); // Move this to the end to ensure all updates happen first
  };

  const handleInputChange = (rowId: number, field: string, value: any) => {
    debugger;
    if (selectedRow !== rowId) {
      showAlert("warning", "Please select the row first to edit", "warning");
      return;
    }

    setFilteredAgeRanges((prev) =>
      prev.map((range) =>
        range.carID === rowId
          ? {
              ...range,
              [field]: value,
              carAgeValue:
                field === "carStart" || field === "carEnd"
                  ? `${field === "carStart" ? value : range.carStart}-${field === "carEnd" ? value : range.carEnd} ${range.carAgeType}`
                  : range.carAgeValue,
              rModifiedOn: serverDate || new Date(),
              rModifiedID: userID || 0,
              rModifiedBy: userName || "",
            }
          : range
      )
    );

    setNewAgeRange((prev) => ({
      ...prev,
      [field]: value,
      carAgeValue:
        field === "carStart" || field === "carEnd"
          ? `${field === "carStart" ? value : prev.carStart}-${field === "carEnd" ? value : prev.carEnd} ${prev.carAgeType}`
          : prev.carAgeValue,
    }));
  };

  const handleRowSelect = (carID: number) => {
    setSelectedRow(selectedRow === carID ? null : carID);
    const selectedRange = ageRanges.find((range) => range.carID === carID);
    if (selectedRange) {
      setNewAgeRange(selectedRange);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    debugger;
    if (!newAgeRange.carName || newAgeRange.carStart >= newAgeRange.carEnd) {
      showAlert("error", "Please enter a valid age range", "error");
      return;
    }

    const updatedRange = {
      ...newAgeRange,
      cappID: componentId,
      compOID: selectedComponent?.compoID,
      compID: compID || 1,
      carAgeValue: `${newAgeRange.carStart}-${newAgeRange.carEnd} ${newAgeRange.carAgeType}`,
      carSexValue: newAgeRange.carSex,
      rActiveYN: "Y",
      rModifiedOn: serverDate || new Date(),
      rModifiedID: userID || 0,
      rModifiedBy: userName || "",
    };

    // 🔹 Update local state to reflect changes instantly
    setFilteredAgeRanges((prev) =>
      prev.some((range) => range.carID === updatedRange.carID) ? prev.map((range) => (range.carID === updatedRange.carID ? updatedRange : range)) : [...prev, updatedRange]
    );

    // 🔹 Notify parent component to update global state
    onUpdateAgeRange(updatedRange);

    setNewAgeRange(updatedRange);
    setTimeout(() => handleCloseModal(), 50);
  };

  const handleEdit = (row: LCompAgeRangeDto, event: React.MouseEvent) => {
    debugger;
    event.stopPropagation();

    const updatedRow = filteredAgeRanges.find((range) => range.carID === row.carID) || row;

    setNewAgeRange({
      ...updatedRow,
      rModifiedOn: serverDate || new Date(),
      rModifiedID: userID || 0,
      rModifiedBy: userName || "",
    });

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

    setFilteredAgeRanges((prev) => prev); // Ensure the table updates
  };

  useEffect(() => {
    const activeRange = ageRanges.find((range) => (range.compOID === componentId || range.cappID === componentId) && range.rActiveYN === "Y");
    if (activeRange) {
      setSelectedRow(activeRange.carID);
    }
  }, [ageRanges, componentId]);

  useEffect(() => {
    if (selectedRow) {
      const currentRange = ageRanges.find((range) => range.carID === selectedRow);
      if (currentRange) {
        setNewAgeRange(currentRange);
      }
    }
  }, [ageRanges, selectedRow]);

  useEffect(() => {
    setFilteredAgeRanges(ageRanges.filter((range) => range.cappID === componentId || range.compOID === selectedComponent?.compoID));
  }, [ageRanges, componentId, selectedComponent]);

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
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Select</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Applicable For - Age Range</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lower</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Upper</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Normal Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAgeRanges.map((row) => (
              <TableRow
                key={row.carID}
                sx={{
                  "&:hover": { backgroundColor: "#f0f0f0" },
                  transition: "background-color 0.2s",
                  backgroundColor: selectedRow === row.carID ? "#e3f2fd" : "inherit",
                  cursor: "pointer",
                }}
                onClick={() => handleRowSelect(row.carID)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <FormField
                    value={row.carID}
                    type="switch"
                    label=""
                    name={`select-${row.carID}`}
                    ControlID={`select-${row.carID}`}
                    checked={selectedRow === row.carID}
                    onChange={() => handleRowSelect(row.carID)}
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button size="small" startIcon={<EditIcon />} onClick={(e) => handleEdit(row, e)} sx={{ minWidth: "auto" }}>
                    Edit
                  </Button>
                </TableCell>
                <TableCell>{`${row.carSex} ${row.carStart}-${row.carEnd} ${row.carAgeType}`}</TableCell>
                <TableCell>
                  <FormField
                    type="number"
                    label=""
                    name="carStart"
                    ControlID={`carStart-${row.carID}`}
                    value={row.carStart}
                    onChange={(e) => handleInputChange(row.carID, "carStart", Number(e.target.value))}
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    type="number"
                    label=""
                    name="carEnd"
                    ControlID={`carEnd-${row.carID}`}
                    value={row.carEnd}
                    onChange={(e) => handleInputChange(row.carID, "carEnd", Number(e.target.value))}
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    type="text"
                    label=""
                    name={`normalValue-${row.carID}`}
                    ControlID={`normalValue-${row.carID}`}
                    value={row.carName || ""}
                    onChange={(e) => handleInputChange(row.carID, "carName", e.target.value)}
                    size="small"
                    fullWidth
                  />
                </TableCell>
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
