// src/pages/laboratory/InvestigationListPage/SubPage/ApplicableAgeRanges.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Box, Grid, Typography, Button, IconButton, Tooltip, Checkbox, Paper } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { showAlert } from "@/utils/Common/showAlert";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { LCompAgeRangeDto, LComponentDto } from "@/interfaces/Laboratory/LInvMastDto";
import CustomButton from "@/components/Button/CustomButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface ApplicableAgeRangeTableProps {
  ageRanges: LCompAgeRangeDto[];
  componentId?: number;
  selectedComponent?: LComponentDto;
  onAddAgeRange: (newAgeRange: LCompAgeRangeDto) => void;
  onUpdateAgeRange: (updatedAgeRange: LCompAgeRangeDto) => void;
  onDeleteAgeRanges: (ageRangeIds: number[]) => void;
  indexID: number;
}

// Form validation schema
const ageRangeSchema = z
  .object({
    carName: z.string().min(1, "Applicable For is required"),
    carSex: z.string(),
    carStart: z.number().min(0, "Start value must be at least 0"),
    carEnd: z.number().min(1, "End value must be at least 1"),
    carAgeType: z.string(),
  })
  .refine((data) => data.carEnd > data.carStart, {
    message: "End value must be greater than start value",
    path: ["carEnd"],
  });

type AgeRangeFormData = z.infer<typeof ageRangeSchema>;

const ApplicableAgeRangeTable: React.FC<ApplicableAgeRangeTableProps> = ({
  ageRanges,
  componentId,
  selectedComponent,
  onAddAgeRange,
  onUpdateAgeRange,
  onDeleteAgeRanges,
  indexID,
}) => {
  // Local states
  const [updatedAgeRanges, setUpdatedAgeRanges] = useState<LCompAgeRangeDto[]>(ageRanges);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAgeRange, setCurrentAgeRange] = useState<LCompAgeRangeDto | null>(null);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AgeRangeFormData>({
    resolver: zodResolver(ageRangeSchema),
    defaultValues: {
      carName: "",
      carSex: "Either",
      carStart: 0,
      carEnd: 0,
      carAgeType: "Years",
    },
  });

  // For preview
  const formValues = watch();

  useEffect(() => {
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
      transferYN: "N",
      rNotes: "",
    };
  }

  function buildAgeRange(formData: AgeRangeFormData, carID: number = 0): LCompAgeRangeDto {
    const newId = carID || Math.floor(Math.random() * -99999) - 1;
    return {
      carID: newId,
      indexID,
      cappID: componentId,
      compOID: selectedComponent?.compoID,
      carName: formData.carName,
      carSex: formData.carSex,
      carStart: formData.carStart,
      carEnd: formData.carEnd,
      carAgeType: formData.carAgeType,
      carAgeValue: `${formData.carStart}-${formData.carEnd} ${formData.carAgeType}`,
      carSexValue: formData.carSex,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
      cappName: "",
      cappOrder: 0,
    };
  }

  const handleOpenModal = (editMode?: boolean, item?: LCompAgeRangeDto) => {
    setIsEditing(!!editMode);

    if (item) {
      setCurrentAgeRange(item);
      reset({
        carName: item.carName || "",
        carSex: item.carSex || "Either",
        carStart: item.carStart || 0,
        carEnd: item.carEnd || 0,
        carAgeType: item.carAgeType || "Years",
      });
    } else {
      setCurrentAgeRange(null);
      reset({
        carName: "",
        carSex: "Either",
        carStart: 0,
        carEnd: 0,
        carAgeType: "Years",
      });
    }

    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setCurrentAgeRange(null);
    setOpenModal(false);
  };

  const onSubmitAgeRange = (data: AgeRangeFormData) => {
    const finalItem = buildAgeRange(data, currentAgeRange?.carID);

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
    const confirmed = await showAlert("Confirm Deletion", "Are you sure you want to delete this age range?", "warning", true);
    if (confirmed) {
      onDeleteAgeRanges([id]);
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
      setUpdatedAgeRanges((prev) => prev.filter((item) => item.carID !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedRows.length) {
      showAlert("Error", "No rows selected to delete", "error");
      return;
    }
    const confirmed = await showAlert("Confirm Deletion", `Delete ${selectedRows.length} selected age range(s)?`, "warning", true);
    if (confirmed) {
      onDeleteAgeRanges(selectedRows);
      setUpdatedAgeRanges((prev) => prev.filter((item) => !selectedRows.includes(item.carID)));
      setSelectedRows([]);
    }
  };

  const handleInlineChange = (row: LCompAgeRangeDto, field: string, value: string) => {
    const numericVal = parseInt(value, 10) || 0;

    if (field === "carStart" && numericVal >= row.carEnd) {
      showAlert("Warning", "Start value cannot be greater than or equal to end value", "warning");
      return;
    }

    if (field === "carEnd" && numericVal <= row.carStart) {
      showAlert("Warning", "End value cannot be less than or equal to start value", "warning");
      return;
    }

    setUpdatedAgeRanges((prev) => {
      return prev.map((item) => {
        if (item.carID === row.carID) {
          const updated = {
            ...item,
            indexID,
            [field]: numericVal,
            carAgeValue: `${field === "carStart" ? numericVal : item.carStart}-${field === "carEnd" ? numericVal : item.carEnd} ${item.carAgeType}`,
          };

          onUpdateAgeRange(updated);
          return updated;
        }
        return item;
      });
    });
  };

  // CustomGrid columns configuration
  const columns: Column<LCompAgeRangeDto>[] = useMemo(
    () => [
      {
        key: "checkbox",
        header: "",
        visible: true,
        width: 50,
        render: (row) => (
          <Checkbox
            checked={selectedRows.includes(row.carID)}
            onChange={() => {
              if (selectedRows.includes(row.carID)) {
                setSelectedRows((prev) => prev.filter((id) => id !== row.carID));
              } else {
                setSelectedRows((prev) => [...prev, row.carID]);
              }
            }}
          />
        ),
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 120,
        render: (row) => (
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
        ),
      },
      {
        key: "carAgeValue",
        header: "Applicable For - Age Range",
        visible: true,
        width: 200,
        render: (row) => `${row.carSex} ${row.carStart}-${row.carEnd} ${row.carAgeType}`,
      },
      {
        key: "carStart",
        header: "Lower",
        visible: true,
        width: 80,
        render: (row) => (
          <input
            type="number"
            style={{ width: "60px", padding: "4px", border: "1px solid #ccc", borderRadius: "4px" }}
            value={row.carStart}
            onChange={(e) => handleInlineChange(row, "carStart", e.target.value)}
          />
        ),
      },
      {
        key: "carEnd",
        header: "Upper",
        visible: true,
        width: 80,
        render: (row) => (
          <input
            type="number"
            style={{ width: "60px", padding: "4px", border: "1px solid #ccc", borderRadius: "4px" }}
            value={row.carEnd}
            onChange={(e) => handleInlineChange(row, "carEnd", e.target.value)}
          />
        ),
      },
      {
        key: "carName",
        header: "Normal Value",
        visible: true,
        width: 120,
        render: (row) => row.carName,
      },
    ],
    [selectedRows, handleInlineChange]
  );

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

      <CustomGrid columns={columns} data={updatedAgeRanges} maxHeight="500px" />

      <GenericDialog
        open={openModal}
        onClose={handleCloseModal}
        title={isEditing ? "Edit Age Range" : "Add Age Range"}
        disableBackdropClick
        maxWidth="sm"
        fullWidth
        actions={
          <>
            <CustomButton variant="contained" color="success" onClick={handleSubmit(onSubmitAgeRange)}>
              {isEditing ? "Update" : "Save"}
            </CustomButton>
            <CustomButton variant="contained" color="error" onClick={handleCloseModal}>
              Cancel
            </CustomButton>
          </>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <EnhancedFormField type="text" name="carName" control={control} label="Applicable For" required fullWidth helperText={errors.carName?.message} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <EnhancedFormField
              type="select"
              name="carSex"
              control={control}
              label="Sex"
              required
              fullWidth
              options={[
                { value: "Either", label: "Either" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ]}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <EnhancedFormField type="number" name="carStart" control={control} label="Age From" required fullWidth helperText={errors.carStart?.message} />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <EnhancedFormField type="number" name="carEnd" control={control} label="Age To" required fullWidth helperText={errors.carEnd?.message} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <EnhancedFormField
              type="select"
              name="carAgeType"
              control={control}
              label="Period"
              required
              fullWidth
              options={[
                { value: "Days", label: "Days" },
                { value: "Months", label: "Months" },
                { value: "Years", label: "Years" },
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Preview:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              {formValues.carName} - {formValues.carSex} {formValues.carStart}-{formValues.carEnd} {formValues.carAgeType}
            </Paper>
          </Grid>
        </Grid>
      </GenericDialog>
    </Box>
  );
};

export default ApplicableAgeRangeTable;
