import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography, Grid, Button, Accordion, AccordionSummary, AccordionDetails, Chip, Tooltip, Paper, TextField, FormControlLabel, Checkbox } from "@mui/material";
import { ExpandMore as ExpandMoreIcon, Visibility as VisibilityIcon, Check as CheckIcon } from "@mui/icons-material";
import { useFieldArray, Control } from "react-hook-form";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";

interface PricingGridItem {
  id: string;
  picId: number;
  picName: string;
  selected: boolean;
  wardCategories: {
    [key: string]: {
      DcValue: number;
      hcValue: number;
      chValue: number;
    };
  };
}
interface WardCategory {
  id: number;
  name: string;
  color: string;
}

interface PriceDetailsComponentProps {
  control: Control<any>;
  expanded: boolean;
  onToggleExpand: () => void;
  pricingGridData: PricingGridItem[];
  setPricingGridData: React.Dispatch<React.SetStateAction<PricingGridItem[]>>;
  updateChargeDetailsFromGrid: () => void;
  wardCategories: WardCategory[];
  pic: { value: string; label: string }[];
  bedCategory: { value: string; label: string }[];
}

const PriceDetailsComponent: React.FC<PriceDetailsComponentProps> = ({ control, expanded, onToggleExpand, pricingGridData, wardCategories, pic, bedCategory }) => {
  const [picFilters, setPicFilters] = useState<string[]>([]);
  const [wardCategoryFilters, setWardCategoryFilters] = useState<string[]>([]);
  const [isPercentage, setIsPercentage] = useState<boolean>(false);
  const [amountValue, setAmountValue] = useState<string>("");
  const [priceChangeType, setPriceChangeType] = useState<string>("None");
  const [displayAmountType, setDisplayAmountType] = useState<string>("Dr Amt");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [gridData, setGridData] = useState<PricingGridItem[]>([]);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  useEffect(() => {
    setGridData([...pricingGridData]);
  }, [pricingGridData]);

  // Add this effect to automatically show the grid when filters are applied
  useEffect(() => {
    if (picFilters.length > 0 || wardCategoryFilters.length > 0) {
      setShowGrid(true);
    }
  }, [picFilters, wardCategoryFilters]);

  const chargeDetailsArray = useFieldArray({
    control,
    name: "ChargeDetails",
  });

  const picOptions = useMemo(() => pic.map((option) => ({ value: option.value, label: option.label })), [pic]);
  const wardCategoryOptions = useMemo(() => bedCategory.map((option) => ({ value: option.value, label: option.label })), [bedCategory]);

  const priceChangeOptions = useMemo(
    () => [
      { value: "None", label: "None" },
      { value: "Increase", label: "Increase" },
      { value: "Decrease", label: "Decrease" },
    ],
    []
  );

  const displayAmountOptions = useMemo(
    () => [
      { value: "Both", label: "Both" },
      { value: "Dr Amt", label: "Dr Amt" },
      { value: "Hosp Amt", label: "Hosp Amt" },
    ],
    []
  );

  const getFilteredWardCategories = useMemo(() => {
    // If no ward category filters selected, show all ward categories
    if (wardCategoryFilters.length === 0) {
      return bedCategory.map((category) => ({
        id: parseInt(category.value),
        name: category.label,
        color: "#4285F4",
      }));
    }

    // If ward category filters selected, show only selected ones
    return wardCategoryFilters.map((filterId) => {
      const category = bedCategory.find((cat) => cat.value === filterId);
      return {
        id: parseInt(filterId),
        name: category?.label || filterId,
        color: "#4285F4",
      };
    });
  }, [wardCategoryFilters, bedCategory]);

  const selectedWardCategoryNames = useMemo(() => {
    return wardCategoryFilters.map((filterId) => bedCategory.find((cat) => cat.value === filterId)?.label).filter(Boolean);
  }, [wardCategoryFilters, bedCategory]);

  const selectedPICNames = useMemo(() => {
    return picFilters.map((filterId) => pic.find((p) => p.value === filterId)?.label).filter(Boolean);
  }, [picFilters, pic]);

  const selectAllRows = () => {
    if (selectedRows.length === displayedPricingData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(displayedPricingData.map((row) => row.id));
    }
  };

  const toggleRowSelection = (rowId: string) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  const isRowSelected = (rowId: string) => {
    return selectedRows.includes(rowId);
  };

  const displayedPricingData = useMemo(() => {
    // Show grid automatically when any filters are applied or when showGrid is true
    const shouldShowGrid = showGrid || picFilters.length > 0 || wardCategoryFilters.length > 0;

    if (!shouldShowGrid) {
      return [];
    }

    // If specific PICs are filtered, show only those
    if (picFilters.length > 0) {
      const filteredData: PricingGridItem[] = [];

      picFilters.forEach((picId) => {
        // First check if this PIC exists in existing gridData
        const existingItem = gridData.find((item) => item.picId.toString() === picId);

        if (existingItem) {
          // Use existing data but ensure all ward categories are present
          const updatedItem = { ...existingItem };
          getFilteredWardCategories.forEach((category) => {
            if (!updatedItem.wardCategories[category.name]) {
              updatedItem.wardCategories[category.name] = {
                DcValue: 0,
                hcValue: 0,
                chValue: 0,
              };
            }
          });
          filteredData.push(updatedItem);
        } else {
          // Create new row for PIC not in existing data
          const picInfo = pic.find((p) => p.value === picId);
          if (picInfo) {
            const newRow: PricingGridItem = {
              id: `pic-${picId}`,
              picId: parseInt(picId),
              picName: picInfo.label,
              selected: false,
              wardCategories: {},
            };

            getFilteredWardCategories.forEach((category) => {
              newRow.wardCategories[category.name] = {
                DcValue: 0,
                hcValue: 0,
                chValue: 0,
              };
            });

            filteredData.push(newRow);
          }
        }
      });

      return filteredData;
    }

    // If no PIC filters selected, show all available PICs
    const allPicsData: PricingGridItem[] = [];

    pic.forEach((picOption) => {
      // Check if this PIC exists in existing gridData
      const existingItem = gridData.find((item) => item.picId.toString() === picOption.value);

      if (existingItem) {
        // Use existing data but ensure all ward categories are present
        const updatedItem = { ...existingItem };
        getFilteredWardCategories.forEach((category) => {
          if (!updatedItem.wardCategories[category.name]) {
            updatedItem.wardCategories[category.name] = {
              DcValue: 0,
              hcValue: 0,
              chValue: 0,
            };
          }
        });
        allPicsData.push(updatedItem);
      } else {
        // Create new row for PIC not in existing data
        const newRow: PricingGridItem = {
          id: `pic-${picOption.value}`,
          picId: parseInt(picOption.value),
          picName: picOption.label,
          selected: false,
          wardCategories: {},
        };

        getFilteredWardCategories.forEach((category) => {
          newRow.wardCategories[category.name] = {
            DcValue: 0,
            hcValue: 0,
            chValue: 0,
          };
        });

        allPicsData.push(newRow);
      }
    });

    return allPicsData;
  }, [gridData, picFilters, pic, getFilteredWardCategories, showGrid, wardCategoryFilters]);

  // Updated condition to enable Apply button when amount is entered and price change type is selected
  const isApplyReady = priceChangeType !== "None" && amountValue !== "" && parseFloat(amountValue) > 0;

  const applyChanges = () => {
    if (!isApplyReady) return;

    const numericAmount = parseFloat(amountValue);

    // Update the main gridData with changes
    setGridData((prevData) => {
      const updatedData = [...prevData];

      // Also handle any new items that exist only in displayedPricingData
      displayedPricingData.forEach((displayedItem) => {
        const existingIndex = updatedData.findIndex((item) => item.id === displayedItem.id);

        if (existingIndex === -1) {
          // This is a new item, add it to gridData
          updatedData.push({ ...displayedItem });
        }
      });

      // Apply changes to all items
      return updatedData.map((row) => {
        const updatedRow = { ...row, wardCategories: { ...row.wardCategories } };

        getFilteredWardCategories.forEach((category) => {
          const catName = category.name;
          if (!updatedRow.wardCategories[catName]) {
            updatedRow.wardCategories[catName] = { DcValue: 0, hcValue: 0, chValue: 0 };
          }

          const values = updatedRow.wardCategories[catName];
          const updateDr = displayAmountType === "Both" || displayAmountType === "Dr Amt";
          const updateHosp = displayAmountType === "Both" || displayAmountType === "Hosp Amt";

          const calculateNewValue = (current: number) =>
            isPercentage
              ? Math.round(current * (priceChangeType === "Increase" ? 1 + numericAmount / 100 : 1 - numericAmount / 100))
              : current + (priceChangeType === "Increase" ? numericAmount : -numericAmount);

          if (updateDr) {
            const newDrValue = calculateNewValue(values.DcValue);
            values.DcValue = Math.max(0, newDrValue);
          }
          if (updateHosp) {
            const newHospValue = calculateNewValue(values.hcValue);
            values.hcValue = Math.max(0, newHospValue);
          }
          values.chValue = values.DcValue + values.hcValue;
        });

        return updatedRow;
      });
    });
  };

  const handleViewClick = () => {
    setShowGrid(true);
  };

  const gridColumns = useMemo((): Column<PricingGridItem>[] => {
    const columns: Column<PricingGridItem>[] = [
      {
        key: "selected",
        header: "Select",
        visible: true,
        width: 70,
        render: (item: PricingGridItem) => (
          <input type="checkbox" checked={isRowSelected(item.id)} onChange={() => toggleRowSelection(item.id)} style={{ transform: "scale(1.2)" }} />
        ),
      },
      {
        key: "picName",
        header: "PIC Name",
        visible: true,
        width: 180,
        render: (item: PricingGridItem) => (
          <Typography variant="body2" fontWeight="medium">
            {item.picName}
          </Typography>
        ),
      },
    ];

    getFilteredWardCategories.forEach((category) => {
      columns.push({
        key: `${category.name}_drAmt`,
        header: `${category.name} - Dr Amt`,
        visible: true,
        width: 120,
        render: (item: PricingGridItem) => {
          const currentValue = item.wardCategories[category.name]?.DcValue || 0;

          return (
            <TextField
              type="number"
              size="small"
              value={currentValue}
              onChange={(e) => {
                const numValue = parseFloat(e.target.value) || 0;
                if (numValue >= 0) {
                  const updatedItem = {
                    ...item,
                    wardCategories: {
                      ...item.wardCategories,
                      [category.name]: {
                        ...item.wardCategories[category.name],
                        DcValue: numValue,
                        chValue: numValue + (item.wardCategories[category.name]?.hcValue || 0),
                      },
                    },
                  };
                  setGridData((prev) => prev.map((row) => (row.id === item.id ? updatedItem : row)));
                }
              }}
              fullWidth
              variant="outlined"
              inputProps={{ min: 0, step: "0.01" }}
            />
          );
        },
      });

      columns.push({
        key: `${category.name}_hospAmt`,
        header: `${category.name} - Hosp Amt`,
        visible: true,
        width: 120,
        render: (item: PricingGridItem) => {
          const currentValue = item.wardCategories[category.name]?.hcValue || 0;

          return (
            <TextField
              type="number"
              size="small"
              value={currentValue}
              onChange={(e) => {
                const numValue = parseFloat(e.target.value) || 0;
                if (numValue >= 0) {
                  const updatedItem = {
                    ...item,
                    wardCategories: {
                      ...item.wardCategories,
                      [category.name]: {
                        ...item.wardCategories[category.name],
                        hcValue: numValue,
                        chValue: (item.wardCategories[category.name]?.DcValue || 0) + numValue,
                      },
                    },
                  };

                  setGridData((prev) => prev.map((row) => (row.id === item.id ? updatedItem : row)));
                }
              }}
              fullWidth
              variant="outlined"
              inputProps={{ min: 0, step: "0.01" }}
            />
          );
        },
      });

      columns.push({
        key: `${category.name}_totalAmt`,
        header: `${category.name} - Total Amt`,
        visible: true,
        width: 120,
        render: (item: PricingGridItem) => {
          const totalAmount = item.wardCategories[category.name]?.chValue || 0;
          return <TextField value={totalAmount} disabled size="small" fullWidth variant="outlined" InputProps={{ readOnly: true }} />;
        },
      });
    });

    return columns;
  }, [getFilteredWardCategories, isRowSelected, toggleRowSelection]);

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <Typography variant="subtitle1" fontWeight="medium">
            Pricing Details
          </Typography>
          <Chip label={`${chargeDetailsArray.fields.length} entries`} size="small" color="primary" variant="outlined" />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="primary" fontWeight="medium">
              Filter & Bulk Operations
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="picFilters"
                  control={control}
                  type="multiselect"
                  label="Patient Categories (PIC)"
                  options={picOptions}
                  defaultValue={picFilters}
                  onChange={setPicFilters}
                  size="small"
                  placeholder="Select PICs"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="wardCategoryFilters"
                  control={control}
                  type="multiselect"
                  label="Ward Categories"
                  options={wardCategoryOptions}
                  defaultValue={wardCategoryFilters}
                  onChange={setWardCategoryFilters}
                  size="small"
                  placeholder="Select ward categories"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <FormControlLabel
                    control={<Checkbox checked={isPercentage} onChange={(e) => setIsPercentage(e.target.checked)} size="small" />}
                    label={isPercentage ? "Percentage" : "Amount"}
                  />
                </Box>
                <TextField
                  type="number"
                  size="small"
                  value={amountValue}
                  onChange={(e) => setAmountValue(e.target.value)}
                  placeholder={`Enter ${isPercentage ? "percentage" : "amount"}`}
                  fullWidth
                  variant="outlined"
                  inputProps={{ min: 0, step: "0.01" }}
                  InputProps={{
                    endAdornment: isPercentage ? "%" : undefined,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="priceChangeType"
                  control={control}
                  type="radio"
                  label="Price Change Type"
                  options={priceChangeOptions}
                  defaultValue={priceChangeType}
                  onChange={setPriceChangeType}
                  row
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="displayAmountType"
                  control={control}
                  type="radio"
                  label="Apply To Amount Type"
                  options={displayAmountOptions}
                  defaultValue={displayAmountType}
                  onChange={setDisplayAmountType}
                  row
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button variant="outlined" startIcon={<VisibilityIcon />} size="small" sx={{ minWidth: "90px" }} onClick={handleViewClick}>
                    View
                  </Button>
                  <Tooltip title={!isApplyReady ? "Select price change type and enter amount" : "Apply to all visible rows"}>
                    <Button variant="contained" startIcon={<CheckIcon />} size="small" color="success" onClick={applyChanges} disabled={!isApplyReady} sx={{ minWidth: "90px" }}>
                      Apply
                    </Button>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {(showGrid || picFilters.length > 0 || wardCategoryFilters.length > 0) && (
            <>
              <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {picFilters.length === 0
                      ? "Showing all PICs"
                      : picFilters.length === 1
                      ? `Filtered by PIC: ${selectedPICNames[0]}`
                      : `Filtered by PICs: ${selectedPICNames.join(", ")}`}
                    {" • "}
                    {wardCategoryFilters.length === 0
                      ? "All ward categories"
                      : wardCategoryFilters.length === 1
                      ? `Ward category: ${selectedWardCategoryNames[0]}`
                      : `Ward categories: ${selectedWardCategoryNames.join(", ")}`}
                  </Typography>
                </Box>
                <Box>
                  <Button size="small" color="primary" variant="outlined" onClick={selectAllRows} sx={{ minWidth: "100px" }}>
                    {selectedRows.length === displayedPricingData.length && displayedPricingData.length > 0 ? "Deselect All" : "Select All"}
                  </Button>
                </Box>
              </Box>

              <Paper elevation={1}>
                <CustomGrid
                  columns={gridColumns}
                  data={displayedPricingData}
                  maxHeight="500px"
                  density="small"
                  showDensityControls={true}
                  emptyStateMessage="No pricing data available. Please select PICs and Ward Categories to begin."
                  rowKeyField="id"
                  pagination={false}
                  selectable={false}
                />
              </Paper>
            </>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default PriceDetailsComponent;
