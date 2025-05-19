import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Button, IconButton, Tooltip, Checkbox } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import GenericDialog from "@/components/GenericDialog/GenericDialog";
import FormField from "@/components/FormField/FormField";
import { showAlert } from "@/utils/Common/showAlert";

import { useServerDate } from "@/hooks/Common/useServerDate";

import AdvancedGrid, { ColumnConfig } from "@/components/AdvancedGrid/AdvancedGrid";

import { LCompAgeRangeDto, LComponentDto } from "@/interfaces/Laboratory/LInvMastDto";
import CustomButton from "@/components/Button/CustomButton";

interface ApplicableAgeRangeTableProps {
  ageRanges: LCompAgeRangeDto[];
  componentId?: number;
  selectedComponent?: LComponentDto;
  onAddAgeRange: (newAgeRange: LCompAgeRangeDto) => void;
  onUpdateAgeRange: (updatedAgeRange: LCompAgeRangeDto) => void;
  onDeleteAgeRanges: (ageRangeIds: number[]) => void;
  indexID: number; // <-- ADD THIS
}

const ApplicableAgeRangeTable: React.FC<ApplicableAgeRangeTableProps> = ({
  ageRanges,
  componentId,
  selectedComponent,
  onAddAgeRange,
  onUpdateAgeRange,
  onDeleteAgeRanges,
  indexID,
}) => {
  const [{ compID, compCode, compName, userID, userName }, setCompData] = useState({ compID: 1, compCode: "KVG", compName: "KVG Medical College", userID: 0, userName: "Akshay" });
  const serverDate = useServerDate();

  // Local states
  const [updatedAgeRanges, setUpdatedAgeRanges] = useState<LCompAgeRangeDto[]>(ageRanges);
  const [selectedRows, setSelectedRows] = useState<number[]>([]); // IDs of selected rows
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editAgeRange, setEditAgeRange] = useState<LCompAgeRangeDto>(() => createEmptyAgeRange());

  // Important: Keep the local state in sync with props
  useEffect(() => {
    console.log("Received ageRanges in table:", ageRanges);
    setUpdatedAgeRanges(ageRanges);
    setSelectedRows([]);
  }, [ageRanges]);

  function createEmptyAgeRange(): LCompAgeRangeDto {
    return {
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
      compID: compID ?? 1,
      compCode: compCode ?? "",
      compName: compName ?? "",
      transferYN: "N",
      rNotes: "",
      rCreatedID: userID ?? 0,
      rCreatedBy: userName ?? "",
      rModifiedID: userID ?? 0,
      rModifiedBy: userName ?? "",
      rCreatedOn: serverDate ?? new Date(),
      rModifiedOn: serverDate ?? new Date(),
    };
  }

  function buildAgeRange(src: LCompAgeRangeDto): LCompAgeRangeDto {
    // Generate a new ID if it doesn't exist
    const newId = src.carID || Math.floor(Math.random() * -99999) - 1; // Use negative IDs for new temp items

    return {
      ...src,
      carID: newId,
      indexID,
      cappID: componentId,
      compOID: selectedComponent?.compoID,
      carAgeValue: `${src.carStart}-${src.carEnd} ${src.carAgeType}`,
      carSexValue: src.carSex,
      rActiveYN: "Y",
      rModifiedOn: serverDate ?? new Date(),
      rModifiedID: userID ?? 0,
      rModifiedBy: userName ?? "",
    };
  }

  const handleOpenModal = (editMode?: boolean, item?: LCompAgeRangeDto) => {
    setIsEditing(!!editMode);
    setEditAgeRange(item ? { ...item } : createEmptyAgeRange());
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setEditAgeRange(createEmptyAgeRange());
    setOpenModal(false);
  };

  const handleSave = async () => {
    if (!editAgeRange.carName?.trim()) {
      showAlert("warning", "Field 'Applicable For' cannot be blank.", "warning");
      return;
    }
    if (editAgeRange.carStart >= editAgeRange.carEnd) {
      showAlert("warning", "Age From cannot be >= Age To.", "warning");
      return;
    }

    const finalItem = buildAgeRange(editAgeRange);
    console.log("Saving age range:", finalItem);

    setUpdatedAgeRanges((prev) => {
      const index = prev.findIndex((x) => x.carID === finalItem.carID);
      if (index !== -1) {
        const clone = [...prev];
        clone[index] = finalItem;
        return clone;
      } else {
        return [...prev, finalItem];
      }
    });
    if (isEditing) {
      onUpdateAgeRange(finalItem);
    } else {
      onAddAgeRange(finalItem);
    }

    handleCloseModal();
  };

  const handleDeleteSingle = async (id: number) => {
    const confirmed = await showAlert("Confirm Deletion", "Are you sure?", "warning", true);
    if (confirmed) {
      onDeleteAgeRanges([id]);
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
      setUpdatedAgeRanges((prev) => prev.filter((item) => item.carID !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedRows.length) {
      showAlert("error", "No rows selected to delete", "error");
      return;
    }
    const confirmed = await showAlert("Confirm Deletion", `Delete ${selectedRows.length} record(s)?`, "warning", true);
    if (confirmed) {
      onDeleteAgeRanges(selectedRows);
      setUpdatedAgeRanges((prev) => prev.filter((item) => !selectedRows.includes(item.carID)));
      setSelectedRows([]);
    }
  };

  const handleInlineChange = (rowId: number, field: string, value: any) => {
    const numericVal = parseInt(value, 10) || 0;

    setUpdatedAgeRanges((prev) => {
      return prev.map((item) => {
        if (item.carID === rowId) {
          const updated = {
            indexID,
            ...item,
            [field]: numericVal,
            carAgeValue: `${field === "carStart" ? numericVal : item.carStart}-${field === "carEnd" ? numericVal : item.carEnd} ${item.carAgeType}`,
          };

          onUpdateAgeRange(updated); // keep parent in sync
          return updated;
        }
        return item;
      });
    });
  };

  const renderCheckboxCell = (row: LCompAgeRangeDto) => {
    const isSelected = selectedRows.includes(row.carID);
    return (
      <Checkbox
        checked={isSelected}
        onChange={() => {
          if (isSelected) {
            setSelectedRows((prev) => prev.filter((id) => id !== row.carID));
          } else {
            setSelectedRows((prev) => [...prev, row.carID]);
          }
        }}
      />
    );
  };

  const renderActionsCell = (row: LCompAgeRangeDto) => (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenModal(true, row)} sx={{ minWidth: "auto" }}>
        Edit
      </Button>
      <Tooltip title="Delete">
        <IconButton size="small" color="error" onClick={() => handleDeleteSingle(row.carID)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
  const columns: ColumnConfig<LCompAgeRangeDto>[] = [
    {
      key: "checkbox",
      label: "",
      width: "50",
      renderCell: renderCheckboxCell,
    },
    {
      key: "actions",
      label: "Actions",
      width: "120",
      renderCell: renderActionsCell,
    },
    {
      key: "carAgeValue",
      label: "Applicable For - Age Range",
      width: "200",
      renderCell: (row) => `${row.carSex} ${row.carStart}-${row.carEnd} ${row.carAgeType}`,
    },
    {
      key: "carStart",
      label: "Lower",
      width: "80",
      renderCell: (row) => <input type="number" style={{ width: "60px" }} value={row.carStart} onChange={(e) => handleInlineChange(row.carID, "carStart", e.target.value)} />,
    },
    {
      key: "carEnd",
      label: "Upper",
      width: "80",
      renderCell: (row) => <input type="number" style={{ width: "60px" }} value={row.carEnd} onChange={(e) => handleInlineChange(row.carID, "carEnd", e.target.value)} />,
    },
    {
      key: "carName",
      label: "Normal Value",
      width: "120",
      renderCell: (row) => row.carName,
    },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Applicable Age Range Table
        </Typography>
        <Box>
          <CustomButton variant="contained" color="error" icon={DeleteIcon} onClick={handleDeleteSelected} disabled={!selectedRows.length} sx={{ mr: 2 }}>
            Delete Selected
          </CustomButton>
          <CustomButton variant="contained" color="primary" icon={AddCircleOutlineIcon} onClick={() => handleOpenModal(false)}>
            Add Age Range
          </CustomButton>
        </Box>
      </Grid>

      <AdvancedGrid<LCompAgeRangeDto> data={updatedAgeRanges.map((item) => ({ ...item, id: item.carID }))} columns={columns} maxHeight="500px" onCellEdit={handleInlineChange} />

      <GenericDialog
        open={openModal}
        onClose={handleCloseModal}
        title={isEditing ? "Edit Age Range" : "Add Age Range"}
        disableBackdropClick
        maxWidth="sm"
        fullWidth
        actions={
          <>
            <CustomButton variant="contained" color="success" onClick={handleSave}>
              {isEditing ? "Update" : "Save"}
            </CustomButton>
            <CustomButton variant="contained" color="error" onClick={handleCloseModal}>
              Close
            </CustomButton>
          </>
        }
      >
        <FormField
          type="text"
          label="Applicable For"
          name="carName"
          ControlID="carName"
          value={editAgeRange.carName}
          onChange={(e) => setEditAgeRange({ ...editAgeRange, carName: e.target.value })}
        />
        <FormField
          type="select"
          label="Sex"
          name="carSex"
          ControlID="carSex"
          value={editAgeRange.carSex}
          options={[
            { value: "Either", label: "Either" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
          onChange={(e) => setEditAgeRange({ ...editAgeRange, carSex: e.target.value })}
        />
        <FormField
          type="number"
          label="Age From"
          name="carStart"
          ControlID="carStart"
          value={editAgeRange.carStart}
          onChange={(e) => setEditAgeRange({ ...editAgeRange, carStart: Number(e.target.value) })}
        />
        <FormField
          type="number"
          label="Age To"
          name="carEnd"
          ControlID="carEnd"
          value={editAgeRange.carEnd}
          onChange={(e) => setEditAgeRange({ ...editAgeRange, carEnd: Number(e.target.value) })}
          onBlur={() => {
            if (editAgeRange.carEnd <= editAgeRange.carStart) {
              showAlert("warning", "Age To must be greater than Age From.", "warning");
              setEditAgeRange((prev) => ({ ...prev, carEnd: 0 }));
            }
          }}
        />
        <FormField
          type="select"
          label="Period"
          name="carAgeType"
          ControlID="carAgeType"
          value={editAgeRange.carAgeType}
          options={[
            { value: "Days", label: "Days" },
            { value: "Months", label: "Months" },
            { value: "Years", label: "Years" },
          ]}
          onChange={(e) => setEditAgeRange({ ...editAgeRange, carAgeType: e.target.value })}
        />
        <FormField
          type="text"
          label="Description"
          name="description"
          ControlID="description"
          disabled
          value={`${editAgeRange.carName} - ${editAgeRange.carSex} ${editAgeRange.carStart}-${editAgeRange.carEnd} ${editAgeRange.carAgeType}`}
          onChange={() => {}}
        />
      </GenericDialog>
    </Box>
  );
};

export default ApplicableAgeRangeTable;
