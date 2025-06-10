import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
  Paper,
  TextField,
  Alert,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  FilterList as FilterIcon,
  PercentOutlined as PercentIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { useFieldArray, Control } from "react-hook-form";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
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

const PriceDetailsComponent: React.FC<PriceDetailsComponentProps> = ({ control, expanded, onToggleExpand, pricingGridData, updateChargeDetailsFromGrid, pic, bedCategory }) => {
  const [picFilters, setPicFilters] = useState<string[]>([]);
  const [wardCategoryFilters, setWardCategoryFilters] = useState<string[]>([]);
  const [isPercentage, setIsPercentage] = useState<boolean>(false);
  const [amountValue, setAmountValue] = useState<string>("");
  const [priceChangeType, setPriceChangeType] = useState<string>("None");
  const [displayAmountType, setDisplayAmountType] = useState<string>("Dr Amt");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [gridData, setGridData] = useState<PricingGridItem[]>([]);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [applySuccess, setApplySuccess] = useState<boolean>(false);

  useEffect(() => {
    setGridData([...pricingGridData]);
  }, [pricingGridData]);

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
  const getFilteredWardCategories = useMemo(() => {
    if (wardCategoryFilters.length === 0) {
      return bedCategory.map((category) => ({
        id: parseInt(category.value),
        name: category.label,
      }));
    }

    return wardCategoryFilters.map((filterId, index) => {
      const category = bedCategory.find((cat) => cat.value === filterId);
      return {
        id: parseInt(filterId),
        name: category?.label || filterId,
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
    const shouldShowGrid = showGrid || picFilters.length > 0 || wardCategoryFilters.length > 0;
    if (!shouldShowGrid) {
      return [];
    }

    // If filters are applied, use them, otherwise use all data
    const filteredByPIC =
      picFilters.length > 0
        ? picFilters.map((picId) => {
            const existingItem = gridData.find((item) => item.picId.toString() === picId);
            if (existingItem) {
              return { ...existingItem };
            } else {
              const picInfo = pic.find((p) => p.value === picId);
              return {
                id: `pic-${picId}`,
                picId: parseInt(picId),
                picName: picInfo?.label || `PIC ${picId}`,
                selected: false,
                wardCategories: {},
              };
            }
          })
        : gridData.length > 0
        ? [...gridData]
        : pic.map((picOption) => ({
            id: `pic-${picOption.value}`,
            picId: parseInt(picOption.value),
            picName: picOption.label,
            selected: false,
            wardCategories: {},
          }));

    // Ensure all filtered ward categories are included
    return filteredByPIC.map((item) => {
      const updatedItem = { ...item, wardCategories: { ...item.wardCategories } };
      getFilteredWardCategories.forEach((category) => {
        if (!updatedItem.wardCategories[category.name]) {
          updatedItem.wardCategories[category.name] = {
            DcValue: 0,
            hcValue: 0,
            chValue: 0,
          };
        }
      });
      return updatedItem;
    });
  }, [gridData, picFilters, pic, getFilteredWardCategories, showGrid]);

  const isApplyReady = useMemo(() => {
    const numericAmount = parseFloat(amountValue);

    return (
      // Valid number greater than zero
      !isNaN(numericAmount) &&
      numericAmount > 0 &&
      // Valid price change type (not "None")
      (priceChangeType === "Increase" || priceChangeType === "Decrease")
    );
  }, [amountValue, priceChangeType]);

  const applyChanges = () => {
    if (!isApplyReady) return;
    const numericAmount = parseFloat(amountValue);
    const updatedGridData = [...gridData];
    const rowsToUpdate = selectedRows.length > 0 ? selectedRows : updatedGridData.map((row) => row.id);
    let changesMade = false;
    updatedGridData.forEach((row) => {
      if (!rowsToUpdate.includes(row.id) && rowsToUpdate.length > 0) {
        return;
      }

      getFilteredWardCategories.forEach((category) => {
        const catName = category.name;
        if (!row.wardCategories[catName]) {
          row.wardCategories[catName] = { DcValue: 0, hcValue: 0, chValue: 0 };
        }
        const values = row.wardCategories[catName];
        const updateDr = displayAmountType === "Both" || displayAmountType === "Dr Amt";
        const updateHosp = displayAmountType === "Both" || displayAmountType === "Hosp Amt";
        if (updateDr) {
          const currentValue = values.DcValue || 0;
          let newValue;
          if (isPercentage) {
            const factor = priceChangeType === "Increase" ? 1 + numericAmount / 100 : 1 - numericAmount / 100;
            newValue = Math.round(currentValue * factor * 100) / 100;
          } else {
            newValue = priceChangeType === "Increase" ? currentValue + numericAmount : currentValue - numericAmount;
          }
          values.DcValue = Math.max(0, newValue);
          changesMade = true;
        }
        if (updateHosp) {
          const currentValue = values.hcValue || 0;
          let newValue;
          if (isPercentage) {
            const factor = priceChangeType === "Increase" ? 1 + numericAmount / 100 : 1 - numericAmount / 100;
            newValue = Math.round(currentValue * factor * 100) / 100;
          } else {
            newValue = priceChangeType === "Increase" ? currentValue + numericAmount : currentValue - numericAmount;
          }
          values.hcValue = Math.max(0, newValue);
          changesMade = true;
        }
        values.chValue = values.DcValue + values.hcValue;
      });
    });
    if (changesMade) {
      setGridData([...updatedGridData]);
      updateChargeDetailsFromGrid();
      setApplySuccess(true);
    }
  };

  const getApplyButtonText = useMemo(() => {
    if (!isApplyReady) return "Apply";
    const actionSymbol = priceChangeType === "Increase" ? "+" : "-";
    const valueDisplay = isPercentage ? `${amountValue}%` : `₹${amountValue}`;
    return `${actionSymbol}${valueDisplay}`;
  }, [isApplyReady, priceChangeType, isPercentage, amountValue]);

  const handleViewClick = () => {
    setShowGrid(true);
  };

  const handleAmountTypeChange = (e: React.MouseEvent<HTMLElement>, newValue: boolean | null) => {
    if (newValue !== null) {
      setIsPercentage(newValue);
    }
  };

  const handleAmountValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmountValue(event.target.value);
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
          const totalAmount = (item.wardCategories[category.name]?.DcValue || 0) + (item.wardCategories[category.name]?.hcValue || 0);
          return (
            <TextField
              value={totalAmount}
              disabled
              size="small"
              fullWidth
              variant="outlined"
              InputProps={{
                readOnly: true,
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          );
        },
      });
    });

    return columns;
  }, [getFilteredWardCategories, isRowSelected, toggleRowSelection, updateChargeDetailsFromGrid]);

  const handlePriceChangeTypeChange = (e: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue) {
      setPriceChangeType(newValue);
    }
  };

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
          <Snackbar open={applySuccess} autoHideDuration={3000} onClose={() => setApplySuccess(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
            <Alert severity="success" sx={{ width: "100%" }}>
              Price changes applied successfully!
            </Alert>
          </Snackbar>

          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="primary" fontWeight="medium">
              Filter & Bulk Operations
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <FormField
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
                <FormField
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

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom color="primary" fontWeight="medium">
                  Price Adjustment
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Adjustment Type
                  </Typography>
                  <ToggleButtonGroup exclusive value={isPercentage} onChange={handleAmountTypeChange} aria-label="amount type" size="small" fullWidth>
                    <ToggleButton value={false} aria-label="amount">
                      <MoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Amount
                    </ToggleButton>
                    <ToggleButton value={true} aria-label="percentage">
                      <PercentIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Percentage
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <TextField
                  type="number"
                  label={isPercentage ? "Percentage Value" : "Amount Value"}
                  value={amountValue}
                  onChange={handleAmountValueChange}
                  size="small"
                  fullWidth
                  placeholder={`Enter ${isPercentage ? "percentage" : "amount"}`}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{isPercentage ? "%" : "₹"}</InputAdornment>,
                  }}
                  inputProps={{
                    min: 0,
                    step: "0.01",
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Price Change Type
                  </Typography>
                  <ToggleButtonGroup exclusive value={priceChangeType} onChange={handlePriceChangeTypeChange} aria-label="price change type" size="small" fullWidth>
                    <ToggleButton value="Increase" aria-label="increase">
                      <AddIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Increase
                    </ToggleButton>
                    <ToggleButton value="Decrease" aria-label="decrease">
                      <RemoveIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Decrease
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {isApplyReady && (
                  <Box sx={{ mt: 1, p: 1, border: "1px solid #e0e0e0", borderRadius: 1, bgcolor: "background.paper" }}>
                    <Typography variant="body2" align="center">
                      Example: <strong>100</strong> will become{" "}
                      <strong>
                        {priceChangeType === "Increase"
                          ? isPercentage
                            ? (100 * (1 + parseFloat(amountValue) / 100)).toFixed(2)
                            : (100 + parseFloat(amountValue)).toFixed(2)
                          : isPercentage
                          ? (100 * (1 - parseFloat(amountValue) / 100)).toFixed(2)
                          : Math.max(0, 100 - parseFloat(amountValue)).toFixed(2)}
                      </strong>
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Apply To Amount Type
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    value={displayAmountType}
                    onChange={(e, newValue) => {
                      if (newValue) {
                        setDisplayAmountType(newValue);
                      }
                    }}
                    aria-label="apply to amount type"
                    size="small"
                    fullWidth
                  >
                    <ToggleButton value="Dr Amt" aria-label="dr amount">
                      Dr Amt
                    </ToggleButton>
                    <ToggleButton value="Hosp Amt" aria-label="hosp amount">
                      Hosp Amt
                    </ToggleButton>
                    <ToggleButton value="Both" aria-label="both amounts">
                      Both
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Box display="flex" justifyContent="flex-end" gap={1} alignItems="flex-end" height="100%">
                  <Button variant="outlined" startIcon={<VisibilityIcon />} size="small" sx={{ minWidth: "90px" }} onClick={handleViewClick}>
                    View
                  </Button>

                  <Tooltip
                    title={
                      !isApplyReady
                        ? "Enter amount and select increase/decrease"
                        : `Apply ${getApplyButtonText} to ${displayAmountType === "Both" ? "all amounts" : displayAmountType}`
                    }
                  >
                    <span>
                      <Button variant="contained" startIcon={<CheckIcon />} size="small" color="success" onClick={() => applyChanges()} disabled={!isApplyReady}>
                        {getApplyButtonText}
                      </Button>
                    </span>
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
                <Box display="flex" gap={1}>
                  <Button size="small" color="primary" variant="outlined" onClick={selectAllRows} sx={{ minWidth: "100px" }}>
                    {selectedRows.length === displayedPricingData.length && displayedPricingData.length > 0 ? "Deselect All" : "Select All"}
                  </Button>
                  <Button size="small" color="secondary" variant="outlined" onClick={updateChargeDetailsFromGrid} startIcon={<FilterIcon />}>
                    Update Charge Details
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
