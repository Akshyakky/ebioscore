import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Grid, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, IconButton, Alert, Stack, Button, Tooltip } from "@mui/material";
import { ExpandMore as ExpandMoreIcon, Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, CalendarMonth as CalendarIcon } from "@mui/icons-material";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useFieldArray, Control, useWatch } from "react-hook-form";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { BChargePackDto } from "@/interfaces/Billing/ChargeDto";
import dayjs from "dayjs";

interface ChargePacksComponentProps {
  control: Control<any>;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdateFunction?: (updateFn: () => void) => void;
}

const ChargePacksComponent: React.FC<ChargePacksComponentProps> = ({ control, expanded, onToggleExpand, onUpdateFunction }) => {
  const [editMode, setEditMode] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<BChargePackDto>>({
    chPackID: 0,
    chargeID: 0,
    chargeRevise: "",
    chargeStatus: "AC",
    dcValue: 0,
    hcValue: 0,
    chValue: 0,
  });

  const packsArray = useFieldArray({
    control,
    name: "ChargePacks",
  });

  const chargePacks = useWatch({
    control,
    name: "ChargePacks",
    defaultValue: [],
  });

  // Register the update function with the parent component if needed
  useEffect(() => {
    if (onUpdateFunction) {
      onUpdateFunction(() => {
        // Any updates needed before form submission
      });
    }
  }, [onUpdateFunction]);

  const addPack = () => {
    setFormData({
      chPackID: 0,
      chargeID: 0,
      chargeRevise: "",
      chargeStatus: "AC",
      dcValue: 0,
      hcValue: 0,
      chValue: 0,
      effectiveFromDate: new Date(),
    });
    setEditMode(-1); // -1 indicates adding a new item
    if (!expanded) {
      onToggleExpand();
    }
  };

  const editPack = (index: number) => {
    setFormData(chargePacks[index]);
    setEditMode(index);
  };

  const cancelEdit = () => {
    setEditMode(null);
    setFormData({
      chPackID: 0,
      chargeID: 0,
      chargeRevise: "",
      chargeStatus: "AC",
      dcValue: 0,
      hcValue: 0,
      chValue: 0,
    });
  };

  const savePack = () => {
    // Calculate total charge value
    const dcValue = Number(formData.dcValue) || 0;
    const hcValue = Number(formData.hcValue) || 0;
    const totalCharge = dcValue + hcValue;

    const updatedData = {
      ...formData,
      dcValue,
      hcValue,
      chValue: totalCharge,
    };

    if (editMode === -1) {
      // Adding new pack
      packsArray.append(updatedData);
    } else if (editMode !== null) {
      // Updating existing pack
      packsArray.update(editMode, updatedData);
    }

    // Reset form state
    cancelEdit();
  };

  const handleInputChange = (field: keyof BChargePackDto, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // If dc or hc values change, update total automatically
      if (field === "dcValue" || field === "hcValue") {
        const dcValue = field === "dcValue" ? Number(value) || 0 : Number(prev.dcValue) || 0;
        const hcValue = field === "hcValue" ? Number(value) || 0 : Number(prev.hcValue) || 0;
        updated.chValue = dcValue + hcValue;
      }

      return updated;
    });
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "₹0.00";
    return `₹${value.toFixed(2)}`;
  };

  const columns = useMemo<Column<any>[]>(
    () => [
      {
        key: "chargeRevise",
        header: "Revision",
        visible: true,
        width: 120,
        render: (item) => (
          <Typography variant="body2" fontWeight="medium">
            {item.chargeRevise || "Default"}
          </Typography>
        ),
      },
      {
        key: "effectiveDate",
        header: "Effective Period",
        visible: true,
        width: 180,
        render: (item) => (
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {item.effectiveFromDate ? dayjs(item.effectiveFromDate).format("DD/MM/YYYY") : "N/A"}
              {item.effectiveToDate ? ` to ${dayjs(item.effectiveToDate).format("DD/MM/YYYY")}` : ""}
            </Typography>
          </Box>
        ),
      },
      {
        key: "dcValue",
        header: "Doctor Charge",
        visible: true,
        width: 120,
        render: (item) => <Typography variant="body2">{formatCurrency(item.dcValue)}</Typography>,
      },
      {
        key: "hcValue",
        header: "Hospital Charge",
        visible: true,
        width: 120,
        render: (item) => <Typography variant="body2">{formatCurrency(item.hcValue)}</Typography>,
      },
      {
        key: "chValue",
        header: "Total Charge",
        visible: true,
        width: 120,
        render: (item) => (
          <Typography variant="body2" fontWeight="medium" color="primary">
            {formatCurrency(item.chValue)}
          </Typography>
        ),
      },
      {
        key: "chargeStatus",
        header: "Status",
        visible: true,
        width: 100,
        render: (item) => (
          <Chip label={item.chargeStatus === "AC" ? "Active" : "Inactive"} size="small" color={item.chargeStatus === "AC" ? "success" : "default"} variant="outlined" />
        ),
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 100,
        render: (item, rowIndex) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                editPack(rowIndex);
              }}
            >
              <Tooltip title="Edit pack">
                <EditIcon fontSize="small" />
              </Tooltip>
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                packsArray.remove(rowIndex);
              }}
            >
              <Tooltip title="Delete pack">
                <DeleteIcon fontSize="small" />
              </Tooltip>
            </IconButton>
          </Stack>
        ),
      },
    ],
    [packsArray]
  );

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <Typography variant="subtitle1">Charge Packs</Typography>
          <Chip label={`${chargePacks.length} packs`} size="small" color="primary" variant="outlined" />
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                addPack();
              }}
              color="primary"
            >
              <Tooltip title="Add new pack">
                <AddIcon />
              </Tooltip>
            </IconButton>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {editMode !== null && (
            <Paper sx={{ p: 2, backgroundColor: "grey.50", border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" color="primary" fontWeight="medium">
                  {editMode === -1 ? "Add New Charge Pack" : "Edit Charge Pack"}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="chargeRevise"
                    control={control}
                    type="text"
                    label="Revision Identifier"
                    size="small"
                    helperText="Package version (e.g. 2023, V1)"
                    defaultValue={formData.chargeRevise}
                    onChange={(value) => handleInputChange("chargeRevise", value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="dcValue"
                    control={control}
                    type="number"
                    label="Doctor Charge"
                    size="small"
                    defaultValue={formData.dcValue}
                    onChange={(value) => handleInputChange("dcValue", value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="hcValue"
                    control={control}
                    type="number"
                    label="Hospital Charge"
                    size="small"
                    defaultValue={formData.hcValue}
                    onChange={(value) => handleInputChange("hcValue", value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name="chValue" control={control} type="number" label="Total Charge" size="small" defaultValue={formData.chValue} disabled />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="effectiveFromDate"
                    control={control}
                    type="datepicker"
                    label="Effective From"
                    size="small"
                    defaultValue={formData.effectiveFromDate}
                    onChange={(value) => handleInputChange("effectiveFromDate", value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="effectiveToDate"
                    control={control}
                    type="datepicker"
                    label="Effective To"
                    size="small"
                    defaultValue={formData.effectiveToDate}
                    onChange={(value) => handleInputChange("effectiveToDate", value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <EnhancedFormField
                    name="chargeStatus"
                    control={control}
                    type="select"
                    label="Status"
                    size="small"
                    defaultValue={formData.chargeStatus}
                    onChange={(value) => handleInputChange("chargeStatus", value)}
                    options={[
                      { value: "AC", label: "Active" },
                      { value: "IN", label: "Inactive" },
                    ]}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                    <Button variant="outlined" size="small" onClick={cancelEdit}>
                      Cancel
                    </Button>
                    <Button variant="contained" size="small" onClick={savePack} color="primary" disabled={!formData.chargeRevise}>
                      {editMode === -1 ? "Add Pack" : "Update Pack"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {chargePacks.length > 0 ? (
            <CustomGrid
              columns={columns}
              data={chargePacks}
              maxHeight="400px"
              density="small"
              showDensityControls={false}
              pagination={false}
              // onRowClick={(item, rowIndex) => editPack(rowIndex)}
            />
          ) : (
            <Alert severity="info">
              No charge packs configured. Charge packs allow you to define different versions of a charge with effective dates for price changes or seasonal rates.
            </Alert>
          )}

          {chargePacks.length === 0 && editMode === null && (
            <Box textAlign="center" mt={2}>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addPack} size="small">
                Add First Charge Pack
              </Button>
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default ChargePacksComponent;
