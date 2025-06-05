import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
  Checkbox,
  ListItemText,
  Select,
  OutlinedInput,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon, Visibility as VisibilityIcon, Check as CheckIcon } from "@mui/icons-material";
import { useFieldArray, Control } from "react-hook-form";

interface PricingGridItem {
  id: string;
  picId: number;
  picName: string;
  selected: boolean;
  wardCategories: {
    [key: string]: {
      drAmt: number;
      hospAmt: number;
      totAmt: number;
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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const PriceDetailsComponent: React.FC<PriceDetailsComponentProps> = ({
  control,
  expanded,
  onToggleExpand,
  pricingGridData,
  setPricingGridData,
  updateChargeDetailsFromGrid,
  wardCategories,
  pic,
  bedCategory,
}) => {
  // Using arrays for multi-select
  const [picFilters, setPicFilters] = useState<string[]>([]);
  const [wardCategoryFilters, setWardCategoryFilters] = useState<string[]>([]);
  const [isPercentage, setIsPercentage] = useState<boolean>(false);
  const [amountValue, setAmountValue] = useState<number>(0);
  const [priceChangeType, setPriceChangeType] = useState<string>("None");
  const [displayAmountType, setDisplayAmountType] = useState<string>("Dr Amt");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [gridData, setGridData] = useState<PricingGridItem[]>([]);

  // When pricingGridData changes from parent, update local state
  useEffect(() => {
    setGridData([...pricingGridData]);
  }, [pricingGridData]);

  const chargeDetailsArray = useFieldArray({
    control,
    name: "ChargeDetails",
  });

  // Handle PIC multi-select change
  const handlePicChange = (event) => {
    const {
      target: { value },
    } = event;
    setPicFilters(typeof value === "string" ? value.split(",") : value);
  };

  // Handle Ward Category multi-select change
  const handleWardCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setWardCategoryFilters(typeof value === "string" ? value.split(",") : value);
  };

  // Function to select all rows
  const selectAllRows = () => {
    if (selectedRows.length === displayedPricingData.length) {
      // If all are selected, deselect all
      setSelectedRows([]);
    } else {
      // Otherwise, select all
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

  // Fixed applyChanges function that correctly updates the grid
  const applyChanges = () => {
    if (priceChangeType === "None" || selectedRows.length === 0 || amountValue <= 0) {
      return;
    }

    // Create a deep copy of the current grid data to work with
    const updatedData = JSON.parse(JSON.stringify(gridData));

    selectedRows.forEach((rowId) => {
      const rowIndex = updatedData.findIndex((row) => row.id === rowId);

      if (rowIndex !== -1) {
        // Get the categories to update
        const categoriesToUpdate =
          wardCategoryFilters.length === 0
            ? Object.keys(updatedData[rowIndex].wardCategories)
            : (wardCategoryFilters.map((filterId) => bedCategory.find((cat) => cat.value === filterId)?.label).filter(Boolean) as string[]);

        // If no ward categories exist yet, initialize with selected ones
        if (Object.keys(updatedData[rowIndex].wardCategories).length === 0 && categoriesToUpdate.length > 0) {
          categoriesToUpdate.forEach((catName) => {
            updatedData[rowIndex].wardCategories[catName] = { drAmt: 0, hospAmt: 0, totAmt: 0 };
          });
        }

        // Update each selected category
        categoriesToUpdate.forEach((categoryName) => {
          // If this category doesn't exist for this row, initialize it
          if (!updatedData[rowIndex].wardCategories[categoryName]) {
            updatedData[rowIndex].wardCategories[categoryName] = {
              drAmt: 0,
              hospAmt: 0,
              totAmt: 0,
            };
          }

          const values = updatedData[rowIndex].wardCategories[categoryName];

          // Determine which amounts to update
          const updateDr = displayAmountType === "Both" || displayAmountType === "Dr Amt";
          const updateHosp = displayAmountType === "Both" || displayAmountType === "Hosp Amt";

          // Update doctor amount if selected
          if (updateDr) {
            if (priceChangeType === "Increase") {
              if (isPercentage) {
                values.drAmt += Math.round((values.drAmt * amountValue) / 100);
              } else {
                values.drAmt += amountValue;
              }
            } else if (priceChangeType === "Decrease") {
              if (isPercentage) {
                values.drAmt -= Math.round((values.drAmt * amountValue) / 100);
              } else {
                values.drAmt -= amountValue;
              }

              // Ensure we don't go below zero
              if (values.drAmt < 0) values.drAmt = 0;
            }
          }

          // Update hospital amount if selected
          if (updateHosp) {
            if (priceChangeType === "Increase") {
              if (isPercentage) {
                values.hospAmt += Math.round((values.hospAmt * amountValue) / 100);
              } else {
                values.hospAmt += amountValue;
              }
            } else if (priceChangeType === "Decrease") {
              if (isPercentage) {
                values.hospAmt -= Math.round((values.hospAmt * amountValue) / 100);
              } else {
                values.hospAmt -= amountValue;
              }

              // Ensure we don't go below zero
              if (values.hospAmt < 0) values.hospAmt = 0;
            }
          }

          // Always recalculate the total
          values.totAmt = values.drAmt + values.hospAmt;
        });
      }
    });

    // Update both the local state and parent state
    setGridData(updatedData);
    setPricingGridData(updatedData);
    updateChargeDetailsFromGrid();

    console.log("Changes applied:", updatedData);
  };

  // Get filtered ward categories based on selection
  const getFilteredWardCategories = useMemo(() => {
    // If no ward category filters are selected, show all available ward categories
    if (wardCategoryFilters.length === 0) {
      return bedCategory.map((category) => ({
        id: parseInt(category.value),
        name: category.label,
        color: getColorForCategory(category.label),
      }));
    }

    // Otherwise, show only the selected ward categories
    return wardCategoryFilters.map((filterId) => {
      const category = bedCategory.find((cat) => cat.value === filterId);
      return {
        id: parseInt(filterId),
        name: category?.label || filterId,
        color: getColorForCategory(category?.label || filterId),
      };
    });
  }, [wardCategoryFilters, bedCategory]);

  // Function to assign colors to ward categories
  function getColorForCategory(categoryName: string): string {
    // Map of category names to colors
    const colorMap: Record<string, string> = {
      "in-patient": "#4285F4", // Blue
      "out-patient": "#34A853", // Green
      "WARD CATEGORY 03": "#FBBC05", // Yellow
      OPD: "#4285F4", // Blue
      "GENERAL WARD": "#34A853", // Green
      "SEMI SPECIAL": "#FBBC05", // Yellow
      "SPECIAL WARD AC": "#EA4335", // Red
      "SPECIAL ROOM": "#9C27B0", // Purple
    };

    // Return the mapped color or a default blue if no mapping exists
    return colorMap[categoryName] || "#4285F4";
  }

  // Get the filtered data based on selected PICs
  const filteredPricingData = useMemo(() => {
    if (picFilters.length === 0) {
      // If no PICs selected, show all
      return gridData;
    }

    // Filter to only include selected PICs
    return gridData.filter((row) => picFilters.includes(row.picId.toString()));
  }, [gridData, picFilters]);

  // Create a complete list of PICs with empty data for selected ones if needed
  const displayedPricingData = useMemo(() => {
    // If no PIC filters, show whatever is in filtered data
    if (picFilters.length === 0) {
      return filteredPricingData;
    }

    // Create a map of existing PICs in the filtered data
    const existingPicsMap = new Map(filteredPricingData.map((item) => [item.picId.toString(), item]));

    // Start with the filtered data
    const result = [...filteredPricingData];

    // Add any selected PICs that aren't already in the result
    picFilters.forEach((picId) => {
      if (!existingPicsMap.has(picId)) {
        const picInfo = pic.find((p) => p.value === picId);
        if (picInfo) {
          // Create an empty row for this PIC
          const newRow: PricingGridItem = {
            id: `pic-${picId}-new`,
            picId: parseInt(picId),
            picName: picInfo.label,
            selected: false,
            wardCategories: {},
          };

          // Initialize empty data for each selected ward category
          getFilteredWardCategories.forEach((category) => {
            newRow.wardCategories[category.name] = {
              drAmt: 0,
              hospAmt: 0,
              totAmt: 0,
            };
          });

          result.push(newRow);
        }
      }
    });

    return result;
  }, [filteredPricingData, picFilters, pic, getFilteredWardCategories]);

  // Helper function to check if all changes are ready to apply
  const isApplyReady = useMemo(() => {
    return selectedRows.length > 0 && priceChangeType !== "None" && amountValue > 0;
  }, [selectedRows, priceChangeType, amountValue]);

  // Get the display names for the selected ward categories
  const selectedWardCategoryNames = useMemo(() => {
    return wardCategoryFilters.map((filterId) => bedCategory.find((cat) => cat.value === filterId)?.label).filter(Boolean);
  }, [wardCategoryFilters, bedCategory]);

  // Get the display names for the selected PICs
  const selectedPICNames = useMemo(() => {
    return picFilters.map((filterId) => pic.find((p) => p.value === filterId)?.label).filter(Boolean);
  }, [picFilters, pic]);

  // Updated handler for input change in the table
  const handleAmountChange = (rowId: string, categoryName: string, field: "drAmt" | "hospAmt" | "totAmt", value: number) => {
    debugger;
    // Create a deep copy of the current data
    const updatedData = JSON.parse(JSON.stringify(gridData));

    let rowIndex = updatedData.findIndex((r) => r.id === rowId);

    // If row doesn't exist in the data, we need to add it
    if (rowIndex === -1) {
      const displayRow = displayedPricingData.find((row) => row.id === rowId);
      if (displayRow) {
        const newRow = JSON.parse(JSON.stringify(displayRow));
        updatedData.push(newRow);
        rowIndex = updatedData.length - 1;
      }
    }

    if (rowIndex !== -1) {
      // Initialize the category if it doesn't exist
      if (!updatedData[rowIndex].wardCategories[categoryName]) {
        updatedData[rowIndex].wardCategories[categoryName] = { drAmt: 0, hospAmt: 0, totAmt: 0 };
      }

      // Update the specified field
      updatedData[rowIndex].wardCategories[categoryName][field] = value;

      // If changing doctor or hospital amount, recalculate the total
      if (field === "drAmt" || field === "hospAmt") {
        updatedData[rowIndex].wardCategories[categoryName].totAmt =
          (updatedData[rowIndex].wardCategories[categoryName].drAmt || 0) + (updatedData[rowIndex].wardCategories[categoryName].hospAmt || 0);
      }

      // Update both local and parent state
      setGridData(updatedData);
      setPricingGridData(updatedData);
      updateChargeDetailsFromGrid();
    }
  };

  // Toggle handler for percentage/amount switch
  const handlePercentageToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsPercentage(event.target.checked);
  };

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <Typography variant="subtitle1">Pricing Details</Typography>
          <Chip label={`${chargeDetailsArray.fields.length} entries`} size="small" color="primary" variant="outlined" />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle2">PIC</Typography>
              <Select
                multiple
                fullWidth
                size="small"
                value={picFilters}
                onChange={handlePicChange}
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return (
                      <Typography variant="body2" color="text.secondary">
                        All PICs
                      </Typography>
                    );
                  }
                  if (selected.length === 1) {
                    const displayName = pic.find((p) => p.value === selected[0])?.label || selected[0];
                    return <Typography variant="body2">{displayName}</Typography>;
                  }
                  return <Typography variant="body2">{selected.length} PICs selected</Typography>;
                }}
                MenuProps={MenuProps}
              >
                {pic.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox checked={picFilters.indexOf(option.value) > -1} />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle2">Ward Category</Typography>
              <Select
                multiple
                fullWidth
                size="small"
                value={wardCategoryFilters}
                onChange={handleWardCategoryChange}
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return (
                      <Typography variant="body2" color="text.secondary">
                        All Ward Categories
                      </Typography>
                    );
                  }
                  if (selected.length === 1) {
                    const displayName = bedCategory.find((bc) => bc.value === selected[0])?.label || selected[0];
                    return <Typography variant="body2">{displayName}</Typography>;
                  }
                  return <Typography variant="body2">{selected.length} categories selected</Typography>;
                }}
                MenuProps={MenuProps}
              >
                {bedCategory.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox checked={wardCategoryFilters.indexOf(option.value) > -1} />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box display="flex" alignItems="center">
                <Switch checked={isPercentage} onChange={handlePercentageToggle} color="primary" />
                <Typography variant="body2" sx={{ minWidth: "90px" }}>
                  {isPercentage ? "Percentage" : "Amount"}
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={amountValue}
                  onChange={(e) => setAmountValue(Number(e.target.value))}
                  InputProps={{
                    inputProps: { min: 0 },
                    endAdornment: isPercentage ? <InputAdornment position="end">%</InputAdornment> : null,
                  }}
                  sx={{ width: 150, mr: 2 }}
                  placeholder={`Enter ${isPercentage ? "percentage" : "amount"}`}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl component="fieldset">
                <RadioGroup row value={priceChangeType} onChange={(e) => setPriceChangeType(e.target.value)}>
                  <FormControlLabel value="None" control={<Radio size="small" />} label="None" />
                  <FormControlLabel value="Increase" control={<Radio size="small" />} label="Increase" />
                  <FormControlLabel value="Decrease" control={<Radio size="small" />} label="Decrease" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl component="fieldset">
                <RadioGroup row value={displayAmountType} onChange={(e) => setDisplayAmountType(e.target.value)}>
                  <FormControlLabel value="Both" control={<Radio size="small" />} label="Both" />
                  <FormControlLabel value="Dr Amt" control={<Radio size="small" />} label="Dr Amt" />
                  <FormControlLabel value="Hosp Amt" control={<Radio size="small" />} label="Hosp Amt" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Box display="flex" justifyContent="flex-end">
                <Button variant="contained" startIcon={<VisibilityIcon />} size="small" color="primary" sx={{ mr: 1 }} disabled={selectedRows.length === 0}>
                  View
                </Button>
                <Tooltip title={!isApplyReady ? "Select rows, set amount and action type" : "Apply changes to selected rows"}>
                  <span>
                    <Button variant="contained" startIcon={<CheckIcon />} size="small" color="success" onClick={applyChanges} disabled={!isApplyReady}>
                      Apply
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>

          {/* Filter summary information */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body2">
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

          {/* Service Charges Table with Ward Category Column Groups */}
          <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: "auto" }}>
            <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={2} sx={{ bgcolor: "#4285F4", color: "white", fontWeight: "bold", borderBottom: "2px solid #ddd" }}>
                    Service Charges
                  </TableCell>
                  {getFilteredWardCategories.map((category) => (
                    <TableCell
                      key={category.id}
                      colSpan={3}
                      align="center"
                      sx={{
                        bgcolor: category.color,
                        color: "white",
                        fontWeight: "bold",
                        borderBottom: "2px solid #ddd",
                        borderLeft: "1px solid #fff",
                      }}
                    >
                      {category.name}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#4285F4", color: "white", fontWeight: "bold", width: 70 }}>Select</TableCell>
                  <TableCell sx={{ bgcolor: "#4285F4", color: "white", fontWeight: "bold", width: 180 }}>PIC Name</TableCell>

                  {getFilteredWardCategories.map((category) => (
                    <React.Fragment key={`header-${category.id}`}>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: category.color,
                          color: "white",
                          fontWeight: "bold",
                          width: 100,
                        }}
                      >
                        dr Amt
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: category.color,
                          color: "white",
                          fontWeight: "bold",
                          width: 100,
                        }}
                      >
                        hosp Amt
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: category.color,
                          color: "white",
                          fontWeight: "bold",
                          width: 100,
                          borderRight: "1px solid #ddd",
                        }}
                      >
                        tot Amt
                      </TableCell>
                    </React.Fragment>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedPricingData.length > 0 ? (
                  displayedPricingData.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        "&:nth-of-type(odd)": { bgcolor: "rgba(0, 0, 0, 0.02)" },
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                      }}
                    >
                      <TableCell>
                        <Checkbox checked={isRowSelected(row.id)} onChange={() => toggleRowSelection(row.id)} size="small" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: "medium" }}>{row.picName}</TableCell>

                      {getFilteredWardCategories.map((category) => {
                        const categoryValues = row.wardCategories[category.name] || { drAmt: 0, hospAmt: 0, totAmt: 0 };

                        return (
                          <React.Fragment key={`data-${row.id}-${category.id}`}>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                value={categoryValues.drAmt || 0}
                                onChange={(e) => handleAmountChange(row.id, category.name, "drAmt", Number(e.target.value))}
                                inputProps={{
                                  min: 0,
                                  style: {
                                    textAlign: "right",
                                    padding: "4px 8px",
                                  },
                                }}
                                sx={{
                                  width: "90%",
                                  "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                      borderColor: "#ddd",
                                    },
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                value={categoryValues.hospAmt || 0}
                                onChange={(e) => handleAmountChange(row.id, category.name, "hospAmt", Number(e.target.value))}
                                inputProps={{
                                  min: 0,
                                  style: {
                                    textAlign: "right",
                                    padding: "4px 8px",
                                  },
                                }}
                                sx={{
                                  width: "90%",
                                  "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                      borderColor: "#ddd",
                                    },
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ borderRight: "1px solid #ddd" }}>
                              <TextField
                                type="number"
                                size="small"
                                value={categoryValues.totAmt || 0}
                                onChange={(e) => handleAmountChange(row.id, category.name, "totAmt", Number(e.target.value))}
                                inputProps={{
                                  min: 0,
                                  style: {
                                    textAlign: "right",
                                    padding: "4px 8px",
                                    fontWeight: "bold",
                                    backgroundColor: "#f0f7ff",
                                  },
                                }}
                                sx={{
                                  width: "90%",
                                  "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                      borderColor: "#ddd",
                                    },
                                  },
                                }}
                              />
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2 + getFilteredWardCategories.length * 3} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No pricing data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default PriceDetailsComponent;
