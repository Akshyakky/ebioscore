import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useAlert } from "@/providers/AlertProvider";
import {
  Add as AddIcon,
  Calculate as CalculateIcon,
  CheckCircle as CheckCircle2Icon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  CurrencyRupee as MoneyIcon,
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
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowModel, GridRowModesModel } from "@mui/x-data-grid";
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

interface FlattenedPricingData {
  id: string;
  picId: number;
  picName: string;
  selected: boolean;
  [key: string]: any;
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
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const { showAlert } = useAlert();

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

  const flattenedData = useMemo((): FlattenedPricingData[] => {
    return displayedPricingData.map((item) => {
      const flattened: FlattenedPricingData = {
        id: item.id,
        picId: item.picId,
        picName: item.picName,
        selected: item.selected,
      };
      getFilteredWardCategories.forEach((category) => {
        const categoryData = item.wardCategories[category.name] || { DcValue: 0, hcValue: 0, chValue: 0 };
        flattened[`${category.name}_drAmt`] = categoryData.DcValue;
        flattened[`${category.name}_hospAmt`] = categoryData.hcValue;
        flattened[`${category.name}_totalAmt`] = categoryData.chValue;
      });

      return flattened;
    });
  }, [displayedPricingData, getFilteredWardCategories]);

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

    // Add percentage validation - should not exceed 100
    const hasValidPercentage = !isPercentage || (isPercentage && numericAmount <= 100);

    const hasValidOperation = priceChangeType === "Increase" || priceChangeType === "Decrease";
    const hasValidTargets = displayedPricingData.length > 0;

    return hasValidAmount && hasValidPercentage && hasValidOperation && hasValidTargets;
  }, [amountValue, isPercentage, priceChangeType, displayedPricingData.length]);

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
    if (isPercentage && numericAmount > 100) {
      showAlert("Invalid Input", "Percentage cannot exceed 100%", "warning");
      return;
    }
    const updatedGridData = [...gridData];
    const rowsToUpdate = selectedRows.length > 0 ? selectedRows : updatedGridData.map((row) => row.id);
    let actualChangesCount = 0;
    updatedGridData.forEach((row) => {
      if (selectedRows.length > 0 && !rowsToUpdate.includes(row.id)) return;
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
          if (priceChangeType === "Decrease" && currentValue === 0) {
            showAlert("Invalid Operation", "Cannot decrease values that are already zero", "warning");
            return;
          }
          let newValue;
          if (isPercentage) {
            const factor = priceChangeType === "Increase" ? 1 + numericAmount / 100 : 1 - numericAmount / 100;
            newValue = Math.round(currentValue * factor * 100) / 100;
          } else {
            newValue = priceChangeType === "Increase" ? currentValue + numericAmount : currentValue - numericAmount;
          }

          const finalValue = Math.max(0, newValue);
          if (Math.abs(currentValue - finalValue) > 0.01) {
            actualChangesCount++;
          }
          values.DcValue = finalValue;
        }

        if (updateHosp) {
          const currentValue = values.hcValue || 0;

          if (priceChangeType === "Decrease" && currentValue === 0) {
            showAlert("Invalid Operation", "Cannot decrease values that are already zero", "warning");
            return;
          }

          let newValue;
          if (isPercentage) {
            const factor = priceChangeType === "Increase" ? 1 + numericAmount / 100 : 1 - numericAmount / 100;
            newValue = Math.round(currentValue * factor * 100) / 100;
          } else {
            newValue = priceChangeType === "Increase" ? currentValue + numericAmount : currentValue - numericAmount;
          }

          const finalValue = Math.max(0, newValue);
          if (Math.abs(currentValue - finalValue) > 0.01) {
            actualChangesCount++;
          }
          values.hcValue = finalValue;
        }

        values.chValue = values.DcValue + values.hcValue;
      });
    });

    setGridData([...updatedGridData]);
    updateChargeDetailsFromGrid();

    if (validatePricingData()) {
      setApplySuccess(true);
    }
  }, [
    isApplyReady,
    amountValue,
    isPercentage,
    gridData,
    selectedRows,
    getFilteredWardCategories,
    displayAmountType,
    priceChangeType,
    updateChargeDetailsFromGrid,
    validatePricingData,
    showAlert,
  ]);

  const getApplyButtonText = useMemo(() => {
    if (!isApplyReady) {
      if (isPercentage && parseFloat(amountValue) > 100) {
        return "Invalid %";
      }
      return "Apply";
    }
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

  const processRowUpdate = useCallback(
    (newRow: GridRowModel) => {
      const rowId = newRow.id as string;
      setGridData((prev) => {
        return prev.map((row) => {
          if (row.id !== rowId) return row;
          const updatedRow = { ...row, wardCategories: { ...row.wardCategories } };
          getFilteredWardCategories.forEach((category) => {
            const drField = `${category.name}_drAmt`;
            const hospField = `${category.name}_hospAmt`;
            if (!updatedRow.wardCategories[category.name]) {
              updatedRow.wardCategories[category.name] = { DcValue: 0, hcValue: 0, chValue: 0 };
            }
            const values = updatedRow.wardCategories[category.name];
            if (newRow[drField] !== undefined) {
              values.DcValue = Math.max(0, parseFloat(newRow[drField]) || 0);
            }
            if (newRow[hospField] !== undefined) {
              values.hcValue = Math.max(0, parseFloat(newRow[hospField]) || 0);
            }
            values.chValue = values.DcValue + values.hcValue;
          });

          return updatedRow;
        });
      });
      updateChargeDetailsFromGrid();

      return newRow;
    },
    [getFilteredWardCategories, updateChargeDetailsFromGrid]
  );

  const handleProcessRowUpdateError = useCallback((error: Error) => {
    console.error("Row update error:", error);
  }, []);

  const gridColumns = useMemo((): GridColDef[] => {
    const columns: GridColDef[] = [
      {
        field: "selected",
        headerName: "SELECT",
        sortable: false,
        filterable: false,
        editable: false,
        headerAlign: "center",
        align: "center",
        renderCell: (params: GridRenderCellParams) => (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 2.5 }}>
            <input
              type="checkbox"
              checked={isRowSelected(params.id as string)}
              onChange={() => toggleRowSelection(params.id as string)}
              style={{
                transform: "scale(1.4)",
                cursor: disabled ? "not-allowed" : "pointer",
                accentColor: "#1976d2",
              }}
              disabled={disabled}
            />
          </Box>
        ),
      },
      {
        field: "picName",
        headerName: "PATIENT TYPE (PIC)",
        width: 280,
        minWidth: 220,
        maxWidth: 350,
        sortable: false,
        editable: false,
        headerAlign: "left",
        align: "left",
        renderCell: (params: GridRenderCellParams) => {
          const rowData = displayedPricingData.find((row) => row.id === params.id);
          const hasConfiguredCategories = rowData ? Object.values(rowData.wardCategories).some((cat: any) => cat.chValue > 0) : false;

          return (
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              sx={{
                py: 2.5,
                px: 1,
                height: "100%",
                minHeight: "80px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", minWidth: "24px" }}>
                {hasConfiguredCategories && (
                  <CheckCircle2Icon
                    sx={{
                      fontSize: 20,
                      color: "success.main",
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: hasConfiguredCategories ? 600 : 500,
                  fontSize: "0.9rem",
                  letterSpacing: "0.01em",
                  color: hasConfiguredCategories ? "text.primary" : "text.secondary",
                  lineHeight: 1.4,
                }}
              >
                {params.value}
              </Typography>
            </Box>
          );
        },
      },
    ];

    getFilteredWardCategories.forEach((category) => {
      columns.push({
        field: `${category.name}_drAmt`,
        headerName: `${category.name.toUpperCase()} - DOCTOR`,
        width: 180,
        minWidth: 150,
        maxWidth: 220,
        type: "number",
        editable: !disabled,
        sortable: false,
        headerAlign: "center",
        align: "right",
        preProcessEditCellProps: (params) => {
          const hasError = params.props.value < 0;
          return { ...params.props, error: hasError };
        },
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value || 0;
          const isConfigured = value > 0;
          return (
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              height="100%"
              sx={{
                pr: 2,
                minHeight: "80px",
                backgroundColor: isConfigured ? alpha("#2196f3", 0.04) : "transparent",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isConfigured ? 600 : 400,
                  fontSize: "0.9rem",
                  fontFamily: "monospace",
                  letterSpacing: "0.02em",
                  color: isConfigured ? "primary.main" : "text.secondary",
                }}
              >
                ₹{value.toFixed(2)}
              </Typography>
            </Box>
          );
        },
      });

      columns.push({
        field: `${category.name}_hospAmt`,
        headerName: `${category.name.toUpperCase()} - HOSPITAL`,
        width: 180,
        minWidth: 150,
        maxWidth: 220,
        type: "number",
        editable: !disabled,
        sortable: false,
        headerAlign: "center",
        align: "right",
        preProcessEditCellProps: (params) => {
          const hasError = params.props.value < 0;
          return { ...params.props, error: hasError };
        },
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value || 0;
          const isConfigured = value > 0;
          return (
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              height="100%"
              sx={{
                pr: 2,
                minHeight: "80px",
                backgroundColor: isConfigured ? alpha("#ff9800", 0.04) : "transparent",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isConfigured ? 600 : 400,
                  fontSize: "0.9rem",
                  fontFamily: "monospace",
                  letterSpacing: "0.02em",
                  color: isConfigured ? "warning.main" : "text.secondary",
                }}
              >
                ₹{value.toFixed(2)}
              </Typography>
            </Box>
          );
        },
      });
      columns.push({
        field: `${category.name}_totalAmt`,
        headerName: `${category.name.toUpperCase()} - TOTAL`,
        width: 200,
        minWidth: 170,
        maxWidth: 250,
        sortable: false,
        filterable: false,
        editable: false,
        headerAlign: "center",
        align: "right",
        renderCell: (params: GridRenderCellParams) => {
          const drValue = params.row[`${category.name}_drAmt`] || 0;
          const hospValue = params.row[`${category.name}_hospAmt`] || 0;
          const totalAmount = drValue + hospValue;
          const isConfigured = totalAmount > 0;

          return (
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={1.5}
              height="100%"
              sx={{
                pr: 2,
                minHeight: "80px",
                borderLeft: "3px solid",
                borderColor: isConfigured ? "success.main" : "divider",
                backgroundColor: isConfigured ? alpha("#4caf50", 0.06) : alpha("#f5f5f5", 0.3),
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  fontFamily: "monospace",
                  letterSpacing: "0.02em",
                  color: isConfigured ? "success.dark" : "text.secondary",
                }}
              >
                ₹{totalAmount.toFixed(2)}
              </Typography>
              {isConfigured && (
                <Box sx={{ ml: 0.5 }}>
                  <CheckCircle2Icon sx={{ fontSize: 18, color: "success.main" }} />
                </Box>
              )}
            </Box>
          );
        },
      });
    });

    return columns;
  }, [getFilteredWardCategories, isRowSelected, toggleRowSelection, disabled, displayedPricingData]);

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

  const handleAmountValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (isPercentage && parseFloat(value) > 100) {
        setAmountValue("100");
        return;
      }
      setAmountValue(value);
    },
    [isPercentage]
  );

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggleExpand}
      sx={{
        mt: 2,
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" width="100%">
          <MoneyIcon sx={{ fontSize: 22, color: "primary.main" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.02em" }}>
            PRICING CONFIGURATION
          </Typography>

          <Chip label={`${chargeDetailsArray.fields.length} entries`} size="small" />

          {pricingStatistics.totalConfigurations > 0 && (
            <Chip
              label={`${pricingStatistics.configurationPercentage.toFixed(0)}% configured`}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          )}

          {pricingStatistics.hasInconsistencies && (
            <Tooltip title="Price inconsistencies detected" arrow>
              <WarningIcon sx={{ fontSize: 20, color: "error.main" }} />
            </Tooltip>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ padding: "32px" }}>
        <Stack spacing={4}>
          {validationErrors.length > 0 && (
            <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
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

          <Paper elevation={1} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2" gutterBottom color="primary" fontWeight={600}>
                Configuration Controls
              </Typography>
              <Button
                size="medium"
                onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                color="primary"
                startIcon={<CalculateIcon />}
                variant={showAdvancedControls ? "contained" : "outlined"}
              >
                Bulk Price Operations
              </Button>
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
            </Grid>

            {/* Only show bulk operations when showAdvancedControls is true */}
            {showAdvancedControls && (
              <Fade in={showAdvancedControls}>
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 3 }}>
                    <Chip label="Bulk Price Operations" size="small" />
                  </Divider>

                  <Grid container spacing={2} alignItems="flex-end">
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
                        placeholder={`Enter ${isPercentage ? "percentage (0-100)" : "amount"}`}
                        disabled={disabled}
                        error={isPercentage && parseFloat(amountValue) > 100}
                        helperText={isPercentage && parseFloat(amountValue) > 100 ? "Percentage cannot exceed 100%" : isPercentage ? "Maximum value: 100%" : ""}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">{isPercentage ? "%" : "₹"}</InputAdornment>,
                        }}
                        inputProps={{
                          min: 0,
                          max: isPercentage ? 100 : undefined,
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
                        <Box sx={{ mt: 1, p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
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
                              ? isPercentage && parseFloat(amountValue) > 100
                                ? "Percentage cannot exceed 100%"
                                : "Enter amount and select operation type"
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
                </Box>
              </Fade>
            )}
          </Paper>

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

              <Paper
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box>
                  <DataGrid
                    rows={flattenedData}
                    columns={gridColumns}
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={setRowModesModel}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={handleProcessRowUpdateError}
                    density="comfortable"
                    disableRowSelectionOnClick
                    hideFooterSelectedRowCount
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 25 },
                      },
                    }}
                    sx={{
                      border: "none",
                      "& .MuiDataGrid-root": {
                        fontSize: "0.9rem",
                      },
                      "& .MuiDataGrid-row": {
                        minHeight: "80px !important",
                        "&:hover": {
                          transition: "background-color 0.2s ease-in-out",
                        },
                        "&:nth-of-type(even)": {},
                      },
                      "& .MuiDataGrid-cell": {
                        borderRight: "1px solid",
                        borderColor: "divider",
                        padding: "0",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        minHeight: "80px !important",
                        "&:focus": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "-2px",
                        },
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "primary.main",
                        borderBottom: "2px solid",
                        borderColor: "primary.dark",
                        minHeight: "64px !important",
                        "& .MuiDataGrid-columnHeader": {
                          padding: "16px 12px",
                          "&:focus": {
                            outline: "2px solid",
                            outlineColor: "primary.light",
                            outlineOffset: "-2px",
                          },
                        },
                        "& .MuiDataGrid-columnHeaderTitle": {
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          letterSpacing: "0.1em",
                          lineHeight: 1.3,
                        },
                        "& .MuiDataGrid-iconSeparator": {},
                      },
                      "& .MuiDataGrid-cell--editable": {
                        position: "relative",
                        "&:hover": {},
                      },
                      "& .MuiDataGrid-cell--editing": {
                        boxShadow: `inset 0 0 0 2px ${alpha("#1976d2", 0.5)}`,
                      },
                      "& .MuiDataGrid-footerContainer": {
                        borderTop: "2px solid",
                        borderColor: "divider",

                        minHeight: "64px",
                      },
                      "& .MuiTablePagination-root": {
                        fontSize: "0.875rem",
                      },
                      "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                        fontSize: "0.875rem",
                        fontWeight: "500",
                      },
                    }}
                    slots={{
                      noRowsOverlay: () => (
                        <Box
                          sx={{
                            p: 6,
                            textAlign: "center",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "grey.50",
                          }}
                        >
                          <MoneyIcon sx={{ fontSize: 64, color: "grey.400", mb: 3 }} />
                          <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}>
                            No Pricing Data Available
                          </Typography>
                          <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: "400px" }}>
                            Please select patient types and ward categories to begin configuration.
                          </Typography>
                        </Box>
                      ),
                    }}
                  />
                </Box>
              </Paper>
            </>
          )}

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
