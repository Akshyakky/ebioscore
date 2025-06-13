import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import {
  Add as AddIcon,
  Calculate as CalculateIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  PercentOutlined as PercentIcon,
  Refresh as RefreshIcon,
  Remove as RemoveIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Control, useFieldArray } from "react-hook-form";

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
  disabled?: boolean;
}

interface PricingStatistics {
  totalConfigurations: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceRange: number;
  configurationPercentage: number;
  hasInconsistencies: boolean;
  totalDoctorAmount: number;
  totalHospitalAmount: number;
  doctorHospitalRatio: number;
}

const PriceDetailsComponent: React.FC<PriceDetailsComponentProps> = ({
  control,
  expanded,
  onToggleExpand,
  pricingGridData,
  updateChargeDetailsFromGrid,
  pic,
  bedCategory,
  disabled = false,
}) => {
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showAdvancedControls, setShowAdvancedControls] = useState<boolean>(false);

  const chargeDetailsArray = useFieldArray({
    control,
    name: "ChargeDetails",
  });

  const pricingStatistics = useMemo((): PricingStatistics => {
    const allPrices: number[] = [];
    const doctorAmounts: number[] = [];
    const hospitalAmounts: number[] = [];
    let configuredCount = 0;
    let totalPossibleConfigurations = 0;
    let hasInconsistencies = false;
    gridData.forEach((row) => {
      Object.values(row.wardCategories).forEach((category) => {
        totalPossibleConfigurations++;
        const total = category.DcValue + category.hcValue;
        if (total > 0) {
          configuredCount++;
          allPrices.push(total);
          doctorAmounts.push(category.DcValue);
          hospitalAmounts.push(category.hcValue);
          if (category.chValue !== total) {
            hasInconsistencies = true;
          }
        }
      });
    });

    const averagePrice = allPrices.length > 0 ? allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length : 0;
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
    const priceRange = maxPrice - minPrice;
    const configurationPercentage = totalPossibleConfigurations > 0 ? (configuredCount / totalPossibleConfigurations) * 100 : 0;
    const totalDoctorAmount = doctorAmounts.reduce((sum, amount) => sum + amount, 0);
    const totalHospitalAmount = hospitalAmounts.reduce((sum, amount) => sum + amount, 0);
    const doctorHospitalRatio = totalHospitalAmount > 0 ? totalDoctorAmount / totalHospitalAmount : 0;

    return {
      totalConfigurations: configuredCount,
      averagePrice,
      minPrice,
      maxPrice,
      priceRange,
      configurationPercentage,
      hasInconsistencies,
      totalDoctorAmount,
      totalHospitalAmount,
      doctorHospitalRatio,
    };
  }, [gridData]);

  useEffect(() => {
    if (pricingGridData.length > 0) {
      setShowGrid(true);
      setGridData([...pricingGridData]);
      const existingPicIds = [...new Set(pricingGridData.map((item) => item.picId.toString()))];
      const existingWardCategoryNames = new Set<string>();
      pricingGridData.forEach((item) => {
        Object.keys(item.wardCategories).forEach((wcName) => {
          const category = item.wardCategories[wcName];
          if (category && (category.DcValue > 0 || category.hcValue > 0 || category.chValue > 0)) {
            existingWardCategoryNames.add(wcName);
          }
        });
      });

      const existingWardCategoryIds = Array.from(existingWardCategoryNames)
        .map((name) => bedCategory.find((bc) => bc.label === name)?.value)
        .filter(Boolean) as string[];

      if (existingPicIds.length > 0) {
        setPicFilters(existingPicIds);
      }
      if (existingWardCategoryIds.length > 0) {
        setWardCategoryFilters(existingWardCategoryIds);
      }
    }
  }, [pricingGridData, bedCategory]);

  useEffect(() => {
    if (!showGrid && pricingGridData.length === 0) {
      setGridData([...pricingGridData]);
    }
  }, [pricingGridData, showGrid]);

  useEffect(() => {
    if (picFilters.length > 0 || wardCategoryFilters.length > 0) {
      setShowGrid(true);
    }
  }, [picFilters, wardCategoryFilters]);

  const picOptions = useMemo(() => pic.map((option) => ({ value: option.value, label: option.label })), [pic]);
  const wardCategoryOptions = useMemo(() => bedCategory.map((option) => ({ value: option.value, label: option.label })), [bedCategory]);
  const getFilteredWardCategories = useMemo(() => {
    if (wardCategoryFilters.length === 0) {
      return bedCategory.map((category) => ({
        id: parseInt(category.value),
        name: category.label,
      }));
    }

    return wardCategoryFilters.map((filterId) => {
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

  const displayedPricingData = useMemo(() => {
    const shouldShowGrid = showGrid || picFilters.length > 0 || wardCategoryFilters.length > 0 || pricingGridData.length > 0;

    if (!shouldShowGrid) {
      return [];
    }
    let filteredByPIC: PricingGridItem[] = [];
    if (picFilters.length > 0) {
      filteredByPIC = picFilters.map((picId) => {
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
      });
    } else if (gridData.length > 0) {
      filteredByPIC = [...gridData];
    } else {
      filteredByPIC = pic.slice(0, 5).map((picOption) => ({
        id: `pic-${picOption.value}`,
        picId: parseInt(picOption.value),
        picName: picOption.label,
        selected: false,
        wardCategories: {},
      }));
    }

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
  }, [gridData, picFilters, pic, getFilteredWardCategories, showGrid, pricingGridData]);

  const selectAllRows = useCallback(() => {
    if (selectedRows.length === displayedPricingData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(displayedPricingData.map((row) => row.id));
    }
  }, [selectedRows.length, displayedPricingData]);

  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedRows((prev) => (prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]));
  }, []);

  const isRowSelected = useCallback(
    (rowId: string) => {
      return selectedRows.includes(rowId);
    },
    [selectedRows]
  );

  const isApplyReady = useMemo(() => {
    const numericAmount = parseFloat(amountValue);
    const hasValidAmount = !isNaN(numericAmount) && numericAmount > 0;
    const hasValidOperation = priceChangeType === "Increase" || priceChangeType === "Decrease";
    const hasValidTargets = displayedPricingData.length > 0;
    return hasValidAmount && hasValidOperation && hasValidTargets;
  }, [amountValue, priceChangeType, displayedPricingData.length]);

  const validatePricingData = useCallback(() => {
    const errors: string[] = [];
    gridData.forEach((row, rowIndex) => {
      Object.entries(row.wardCategories).forEach(([wcName, values]) => {
        if (values.DcValue < 0) {
          errors.push(`Row ${rowIndex + 1} (${row.picName}) - ${wcName}: Doctor charge cannot be negative`);
        }
        if (values.hcValue < 0) {
          errors.push(`Row ${rowIndex + 1} (${row.picName}) - ${wcName}: Hospital charge cannot be negative`);
        }
        if (values.DcValue > 0 || values.hcValue > 0) {
          const expectedTotal = values.DcValue + values.hcValue;
          if (Math.abs(values.chValue - expectedTotal) > 0.01) {
            errors.push(`Row ${rowIndex + 1} (${row.picName}) - ${wcName}: Total charge mismatch`);
          }
        }
      });
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [gridData]);

  const applyChanges = useCallback(() => {
    if (!isApplyReady) return;
    const numericAmount = parseFloat(amountValue);
    const updatedGridData = [...gridData];
    const rowsToUpdate = selectedRows.length > 0 ? selectedRows : updatedGridData.map((row) => row.id);
    let changesMade = false;
    updatedGridData.forEach((row) => {
      if (selectedRows.length > 0 && !rowsToUpdate.includes(row.id)) {
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

      if (validatePricingData()) {
        setApplySuccess(true);
      }
    }
  }, [
    isApplyReady,
    amountValue,
    gridData,
    selectedRows,
    getFilteredWardCategories,
    displayAmountType,
    isPercentage,
    priceChangeType,
    updateChargeDetailsFromGrid,
    validatePricingData,
  ]);

  const getApplyButtonText = useMemo(() => {
    if (!isApplyReady) return "Apply";
    const actionSymbol = priceChangeType === "Increase" ? "+" : "-";
    const valueDisplay = isPercentage ? `${amountValue}%` : `₹${amountValue}`;
    return `${actionSymbol}${valueDisplay}`;
  }, [isApplyReady, priceChangeType, isPercentage, amountValue]);
  const generateOptimalPricing = useCallback(() => {
    const avgMarketPrice = 1000;
    const doctorShare = 0.6;
    const updatedGridData = [...gridData];
    updatedGridData.forEach((row) => {
      getFilteredWardCategories.forEach((category) => {
        const catName = category.name;

        if (!row.wardCategories[catName]) {
          row.wardCategories[catName] = { DcValue: 0, hcValue: 0, chValue: 0 };
        }
        const values = row.wardCategories[catName];
        values.DcValue = Math.round(avgMarketPrice * doctorShare);
        values.hcValue = Math.round(avgMarketPrice * (1 - doctorShare));
        values.chValue = values.DcValue + values.hcValue;
      });
    });

    setGridData(updatedGridData);
    updateChargeDetailsFromGrid();
  }, [gridData, getFilteredWardCategories, updateChargeDetailsFromGrid]);

  const gridColumns = useMemo((): Column<PricingGridItem>[] => {
    const columns: Column<PricingGridItem>[] = [
      {
        key: "selected",
        header: "Select",
        visible: true,
        width: 70,
        render: (item: PricingGridItem) => (
          <input type="checkbox" checked={isRowSelected(item.id)} onChange={() => toggleRowSelection(item.id)} style={{ transform: "scale(1.2)" }} disabled={disabled} />
        ),
      },
      {
        key: "picName",
        header: "Patient Type",
        visible: true,
        width: 200,
        render: (item: PricingGridItem) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" fontWeight="medium">
              {item.picName}
            </Typography>
            {Object.values(item.wardCategories).some((cat) => cat.chValue > 0) && <Chip label="Configured" size="small" color="success" variant="outlined" />}
          </Box>
        ),
      },
    ];

    getFilteredWardCategories.forEach((category) => {
      columns.push({
        key: `${category.name}_drAmt`,
        header: `${category.name} - Doctor`,
        visible: true,
        width: 140,
        render: (item: PricingGridItem) => {
          const currentValue = item.wardCategories[category.name]?.DcValue || 0;
          const isValid = currentValue >= 0;
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
                        DcValue: numValue,
                        hcValue: item.wardCategories[category.name]?.hcValue || 0,
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
              disabled={disabled}
              error={!isValid}
              helperText={!isValid ? "Must be positive" : undefined}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-error": {
                    "& fieldset": {
                      borderColor: "error.main",
                    },
                  },
                },
              }}
            />
          );
        },
      });

      columns.push({
        key: `${category.name}_hospAmt`,
        header: `${category.name} - Hospital`,
        visible: true,
        width: 140,
        render: (item: PricingGridItem) => {
          const currentValue = item.wardCategories[category.name]?.hcValue || 0;
          const isValid = currentValue >= 0;

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
                        DcValue: item.wardCategories[category.name]?.DcValue || 0,
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
              disabled={disabled}
              error={!isValid}
              helperText={!isValid ? "Must be positive" : undefined}
            />
          );
        },
      });

      columns.push({
        key: `${category.name}_totalAmt`,
        header: `${category.name} - Total`,
        visible: true,
        width: 140,
        render: (item: PricingGridItem) => {
          const totalAmount = (item.wardCategories[category.name]?.DcValue || 0) + (item.wardCategories[category.name]?.hcValue || 0);
          const isConfigured = totalAmount > 0;

          return (
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                value={totalAmount.toFixed(2)}
                disabled
                size="small"
                fullWidth
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
              {isConfigured && <CheckIcon color="success" sx={{ fontSize: 16 }} />}
            </Box>
          );
        },
      });
    });

    return columns;
  }, [getFilteredWardCategories, isRowSelected, toggleRowSelection, disabled]);

  const handlePriceChangeTypeChange = useCallback((e: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue) {
      setPriceChangeType(newValue);
    }
  }, []);

  const handleViewClick = useCallback(() => {
    setShowGrid(true);
  }, []);

  const handleAmountTypeChange = useCallback((e: React.MouseEvent<HTMLElement>, newValue: boolean | null) => {
    if (newValue !== null) {
      setIsPercentage(newValue);
    }
  }, []);

  const handleAmountValueChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setAmountValue(event.target.value);
  }, []);

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <MoneyIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Pricing Configuration
          </Typography>

          <Chip label={`${chargeDetailsArray.fields.length} entries`} size="small" color="primary" variant="outlined" />

          {pricingStatistics.totalConfigurations > 0 && (
            <Chip
              label={`${pricingStatistics.configurationPercentage.toFixed(0)}% configured`}
              size="small"
              color={pricingStatistics.configurationPercentage >= 80 ? "success" : "warning"}
              variant="filled"
            />
          )}

          {pricingStatistics.hasInconsistencies && (
            <Tooltip title="Price inconsistencies detected" arrow>
              <WarningIcon color="warning" sx={{ fontSize: 16 }} />
            </Tooltip>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ padding: "16px" }}>
        <Stack spacing={3}>
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert severity="error" variant="outlined">
              <Typography variant="body2" fontWeight={500} gutterBottom>
                Configuration Issues Found:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {validationErrors.slice(0, 5).map((error, index) => (
                  <li key={index}>
                    <Typography variant="body2">{error}</Typography>
                  </li>
                ))}
                {validationErrors.length > 5 && (
                  <li>
                    <Typography variant="body2">...and {validationErrors.length - 5} more issues</Typography>
                  </li>
                )}
              </Box>
            </Alert>
          )}

          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2" gutterBottom color="primary" fontWeight={600}>
                Configuration Controls
              </Typography>
              <IconButton size="small" onClick={() => setShowAdvancedControls(!showAdvancedControls)} color="primary">
                <CalculateIcon />
              </IconButton>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <FormField
                  name="picFilters"
                  control={control}
                  type="multiselect"
                  label="Patient Categories (PIC)"
                  options={picOptions}
                  defaultValue={picFilters}
                  onChange={setPicFilters}
                  size="small"
                  placeholder="Select patient types..."
                  disabled={disabled}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormField
                  name="wardCategoryFilters"
                  control={control}
                  type="multiselect"
                  label="Ward Categories"
                  options={wardCategoryOptions}
                  defaultValue={wardCategoryFilters}
                  onChange={setWardCategoryFilters}
                  size="small"
                  placeholder="Select ward categories..."
                  disabled={disabled}
                />
              </Grid>

              {/* Advanced Controls */}
              <Fade in={showAdvancedControls}>
                <Grid container spacing={2} sx={{ width: "100%", mt: 1 }}>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }}>
                      <Chip label="Bulk Price Operations" size="small" />
                    </Divider>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Adjustment Type
                      </Typography>
                      <ToggleButtonGroup exclusive value={isPercentage} onChange={handleAmountTypeChange} aria-label="amount type" size="small" fullWidth disabled={disabled}>
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
                      disabled={disabled}
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
                        Operation Type
                      </Typography>
                      <ToggleButtonGroup
                        exclusive
                        value={priceChangeType}
                        onChange={handlePriceChangeTypeChange}
                        aria-label="price change type"
                        size="small"
                        fullWidth
                        disabled={disabled}
                      >
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
                          Preview: <strong>100</strong> →{" "}
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
                        Apply To
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
                        disabled={disabled}
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
                      {!showGrid && pricingGridData.length === 0 && (
                        <Button variant="outlined" startIcon={<VisibilityIcon />} size="small" sx={{ minWidth: "90px" }} onClick={handleViewClick} disabled={disabled}>
                          View
                        </Button>
                      )}

                      <Tooltip
                        title={
                          !isApplyReady
                            ? "Enter amount and select operation type"
                            : `Apply ${getApplyButtonText} to ${displayAmountType === "Both" ? "all amounts" : displayAmountType}`
                        }
                      >
                        <span>
                          <Button variant="contained" startIcon={<CheckIcon />} size="small" color="success" onClick={applyChanges} disabled={!isApplyReady || disabled}>
                            {getApplyButtonText}
                          </Button>
                        </span>
                      </Tooltip>

                      <Button variant="outlined" startIcon={<TrendingUpIcon />} size="small" onClick={generateOptimalPricing} disabled={disabled} color="secondary">
                        Auto-Price
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Fade>
            </Grid>
          </Paper>

          {/* Enhanced Grid Display */}
          {(showGrid || picFilters.length > 0 || wardCategoryFilters.length > 0 || pricingGridData.length > 0) && (
            <>
              <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {picFilters.length === 0
                      ? "Showing all patient types"
                      : picFilters.length === 1
                      ? `Filtered by: ${selectedPICNames[0]}`
                      : `Filtered by: ${selectedPICNames.join(", ")}`}
                    {" • "}
                    {wardCategoryFilters.length === 0
                      ? "All ward categories"
                      : wardCategoryFilters.length === 1
                      ? `Ward: ${selectedWardCategoryNames[0]}`
                      : `Wards: ${selectedWardCategoryNames.join(", ")}`}
                  </Typography>
                </Box>

                <Box display="flex" gap={1}>
                  <Button size="small" color="primary" variant="outlined" onClick={selectAllRows} sx={{ minWidth: "100px" }} disabled={disabled}>
                    {selectedRows.length === displayedPricingData.length && displayedPricingData.length > 0 ? "Deselect All" : "Select All"}
                  </Button>

                  <Button size="small" color="secondary" variant="outlined" onClick={updateChargeDetailsFromGrid} startIcon={<RefreshIcon />} disabled={disabled}>
                    Update Details
                  </Button>
                </Box>
              </Box>

              <Paper elevation={1} sx={{ borderRadius: 2 }}>
                <CustomGrid
                  columns={gridColumns}
                  data={displayedPricingData}
                  maxHeight="500px"
                  density="small"
                  showDensityControls={false}
                  emptyStateMessage="No pricing data available. Please select patient types and ward categories to begin configuration."
                  rowKeyField="id"
                  pagination={false}
                  selectable={false}
                />
              </Paper>
            </>
          )}

          {/* Success Notification */}
          <Snackbar open={applySuccess} autoHideDuration={3000} onClose={() => setApplySuccess(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
            <Alert severity="success" sx={{ width: "100%" }}>
              Price changes applied successfully!
            </Alert>
          </Snackbar>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(PriceDetailsComponent);
