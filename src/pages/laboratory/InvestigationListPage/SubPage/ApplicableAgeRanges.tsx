import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Grid, Typography, Box, Checkbox, IconButton, Tooltip } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FormField from "@/components/FormField/FormField";
import { LCompAgeRangeDto } from "@/interfaces/Laboratory/LInvMastDto";
import { useAppSelector } from "@/store/hooks";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { showAlert } from "@/utils/Common/showAlert";
import { LComponentDto } from "@/interfaces/Laboratory/LInvMastDto";
import GenericDialog from "@/components/GenericDialog/GenericDialog";

interface ApplicableAgeRangeTableProps {
  ageRanges: LCompAgeRangeDto[];
  componentId: number | undefined;
  onAddAgeRange: (newAgeRange: LCompAgeRangeDto) => void;
  onUpdateAgeRange: (updatedAgeRange: LCompAgeRangeDto) => void;
  onDeleteAgeRanges: (ageRangeIds: number[]) => void;
  selectedComponent?: LComponentDto;
}

const ApplicableAgeRangeTable: React.FC<ApplicableAgeRangeTableProps> = ({ ageRanges, componentId, onAddAgeRange, onUpdateAgeRange, onDeleteAgeRanges, selectedComponent }) => {
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);
  const serverDate = useServerDate();
  const [modifiedRows, setModifiedRows] = useState<Record<number, Partial<LCompAgeRangeDto>>>({});

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

  const [, setSelectedRow] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedAgeRanges, setUpdatedAgeRanges] = useState<LCompAgeRangeDto[]>(ageRanges);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    if (!isEditing) {
      resetNewAgeRange();
    }
    setIsEditing(false);
    setOpenModal(false);
  };

  useEffect(() => {
    setUpdatedAgeRanges(ageRanges);
    setSelectedRows([]);
  }, [ageRanges]);

  const handleChange = (index: number, field: "carStart" | "carEnd", value: number) => {
    setUpdatedAgeRanges((prev) => {
      const updatedRanges = [...prev];
      const updatedRange = {
        ...updatedRanges[index],
        [field]: value,
        modified: true, // Add a modified flag to track changes
      };
      updatedRanges[index] = updatedRange;

      return updatedRanges;
    });
  };

  const getModifiedValues = () => {
    return Object.values(modifiedRows);
  };

  const handleSave = () => {
    const updatedRange = {
      ...newAgeRange,
      carID: newAgeRange.carID || Math.floor(Math.random() * 10000), // Ensure unique ID for new entries
      cappID: componentId,
      compOID: selectedComponent?.compoID,
      carAgeValue: `${newAgeRange.carStart}-${newAgeRange.carEnd} ${newAgeRange.carAgeType}`,
      carSexValue: newAgeRange.carSex,
      rActiveYN: "Y",
      rModifiedOn: serverDate || new Date(),
      rModifiedID: userID || 0,
      rModifiedBy: userName || "",
    };

    // Ensure no duplicate entries are added
    const isDuplicate = updatedAgeRanges.some(
      (range) => range.carStart === updatedRange.carStart && range.carEnd === updatedRange.carEnd && range.carName === updatedRange.carName && range.carSex === updatedRange.carSex
    );

    if (isDuplicate) {
      showAlert("error", "Duplicate age range detected. Please enter unique values.", "error");
      return;
    }

    setUpdatedAgeRanges((prev) => [...prev, updatedRange]);

    // Add logic to correctly update the parent
    if (!updatedAgeRanges.some((range) => range.carID === updatedRange.carID)) {
      if (newAgeRange.carID === 0) {
        onAddAgeRange(updatedRange);
      } else {
        onUpdateAgeRange(updatedRange);
      }
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

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rowId) => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(updatedAgeRanges.map((row) => row.carID));
    } else {
      setSelectedRows([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      await showAlert("Error", "Please select at least one row to delete", "error");
      return;
    }

    const confirmed = await showAlert(
      "Confirm Deletion",
      `Are you sure you want to delete ${selectedRows.length === 1 ? "this" : "these"} ${selectedRows.length} selected record${selectedRows.length === 1 ? "" : "s"}?`,
      "warning",
      true
    );

    if (confirmed) {
      onDeleteAgeRanges(selectedRows);
      setSelectedRows([]);
      await showAlert("Success", `Successfully deleted ${selectedRows.length} record(s)`, "success");
    }
  };

  const handleDeleteSingle = async (id: number) => {
    const confirmed = await showAlert("Confirm Deletion", "Are you sure you want to delete this record?", "warning", true);

    if (confirmed) {
      onDeleteAgeRanges([id]);
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
      await showAlert("Success", "Record deleted successfully", "success");
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Applicable Age Range Table
        </Typography>
        <Box>
          <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteSelected} disabled={selectedRows.length === 0} sx={{ mr: 2 }}>
            Delete Selected
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenModal}>
            Add Age Range
          </Button>
        </Box>
      </Grid>

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell padding="checkbox" sx={{ color: "white" }}>
                <Checkbox
                  indeterminate={selectedRows.length > 0 && selectedRows.length < updatedAgeRanges.length}
                  checked={selectedRows.length > 0 && selectedRows.length === updatedAgeRanges.length}
                  onChange={handleSelectAll}
                  sx={{
                    color: "white",
                    "&.Mui-checked": {
                      color: "white",
                    },
                    "&.MuiCheckbox-indeterminate": {
                      color: "white",
                    },
                  }}
                />
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Applicable For - Age Range</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lower</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Upper</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Normal Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {updatedAgeRanges.map((row, index) => (
              <TableRow key={row.carID} selected={selectedRows.includes(row.carID)} sx={{ "&.Mui-selected": { backgroundColor: "#e3f2fd" } }}>
                <TableCell padding="checkbox">
                  <Checkbox checked={selectedRows.includes(row.carID)} onChange={() => handleSelectRow(row.carID)} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(row)} sx={{ minWidth: "auto" }}>
                      Edit
                    </Button>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteSingle(row.carID)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>{`${row.carSex} ${row.carStart}-${row.carEnd} ${row.carAgeType}`}</TableCell>

                {/* Editable Lower Value */}
                <TableCell>
                  <input
                    type="number"
                    value={row.carStart}
                    onChange={(e) => handleChange(index, "carStart", Number(e.target.value))}
                    style={{
                      width: "70px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="number"
                    value={row.carEnd}
                    onChange={(e) => handleChange(index, "carEnd", Number(e.target.value))}
                    style={{
                      width: "70px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
                </TableCell>

                <TableCell>{row.carName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <GenericDialog
        open={openModal}
        onClose={handleCloseModal}
        title={newAgeRange.carID > 0 ? "Edit Age Range" : "Add Age Range"}
        maxWidth="sm"
        fullWidth
        actions={
          <>
            <Button variant="contained" color="success" onClick={handleSave}>
              {newAgeRange.carID > 0 ? "Update" : "Save"}
            </Button>
            <Button variant="contained" color="error" onClick={handleCloseModal}>
              Close
            </Button>
          </>
        }
      >
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
      </GenericDialog>
    </Box>
  );
};

export default ApplicableAgeRangeTable;
