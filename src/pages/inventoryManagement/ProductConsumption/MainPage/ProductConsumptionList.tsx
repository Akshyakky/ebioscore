import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { DateFilterType, formatCurrency, ProductConsumptionCompositeDto, ProductConsumptionMastDto } from "@/interfaces/InventoryManagement/ProductConsumption";
import { useAlert } from "@/providers/AlertProvider";
import { productConsumptionMastService } from "@/services/InventoryManagementService/inventoryManagementService";
import {
  Add as AddIcon,
  ViewModule as CardIcon,
  Clear as ClearIcon,
  Inventory2 as ConsumptionIcon,
  ContentCopy as ContentCopyIcon,
  Dashboard as DashboardIcon,
  Delete as DeleteIcon,
  Group as DeptIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as ExportIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  ViewList as ListIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  Search as SearchIcon,
  CheckBox as SelectAllIcon,
  Sort as SortIcon,
  BarChart as StatisticsIcon,
  Sync,
  CheckBoxOutlineBlank as UnselectAllIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import DepartmentConsumptionForm from "../Form/ProductConsumptionForm";
import useDepartmentConsumption from "../hook/useProductConsumption";

const DepartmentConsumptionPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedConsumption, setSelectedConsumption] = useState<ProductConsumptionMastDto | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [isCopyMode, setIsCopyMode] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "cards" | "detailed">("grid");
  const [reportsMenuAnchor, setReportsMenuAnchor] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [showStatistics, setShowStatistics] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paginatedConsumptions, setPaginatedConsumptions] = useState<ProductConsumptionMastDto[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [categoryValue, setCategoryValue] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<string>("thisMonth");
  const [sortBy, setSortBy] = useState<string>("deptConsDate");
  const [sortOrder, setSortOrder] = useState<boolean>(false);
  const [deptConsCode, setDeptConsCode] = useState<string>("");
  const [minConsumedQty, setMinConsumedQty] = useState<number | undefined>(undefined);
  const [maxConsumedQty, setMaxConsumedQty] = useState<number | undefined>(undefined);

  const [statistics, setStatistics] = useState({
    total: 0,
    totalValue: 0,
    totalConsumedQty: 0,
    zeroStockItems: 0,
    expiringItems: 0,
    totalProducts: 0,
  });

  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect } = useDepartmentSelection({});
  const { department } = useDropdownValues(["department"]);
  const { clearError: hookClearError, getConsumptionWithDetailsById, deleteConsumption, canEditConsumption, canDeleteConsumption, searchConsumptions } = useDepartmentConsumption();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatConsumptionDate = (date: Date): string => {
    return date ? dayjs(date).format("DD/MM/YYYY") : "";
  };

  const calculateDaysOld = (date: Date): number => {
    return date ? dayjs().diff(dayjs(date), "days") : 0;
  };

  const clearError = useCallback(() => {
    setError(null);
    hookClearError();
  }, [hookClearError]);

  const fetchConsumptionsForDepartment = useCallback(async () => {
    if (!deptId) return;
    try {
      setIsLoading(true);
      clearError();
      const response = await productConsumptionMastService.getAll();
      if (response.success && response.data && Array.isArray(response.data)) {
        // Filter consumptions for the selected department
        let departmentConsumptions = response.data.filter((consumption: ProductConsumptionMastDto) => {
          return consumption.fromDeptID === deptId;
        });

        // Set the filtered data first
        setPaginatedConsumptions(departmentConsumptions);

        // Show success message only once
        console.log(`Loaded ${departmentConsumptions.length} consumption records for department ${deptId}`);
      } else {
        throw new Error(response.errorMessage || "Failed to fetch Department Consumptions - invalid response");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch Department Consumption data";
      setError(errorMessage);
      showAlert("Error", "Failed to fetch Department Consumption data for the selected department", "error");
      setPaginatedConsumptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [deptId, showAlert, clearError]);

  const applyFiltersAndSorting = useCallback(
    (consumptions: ProductConsumptionMastDto[]) => {
      let filteredConsumptions = [...consumptions];

      // Apply filters
      if (deptConsCode) {
        filteredConsumptions = filteredConsumptions.filter((c) => c.deptConsCode?.toLowerCase().includes(deptConsCode.toLowerCase()));
      }

      if (categoryValue && categoryValue !== "all") {
        filteredConsumptions = filteredConsumptions.filter((c) => c.catValue === categoryValue);
      }

      if (startDate || endDate) {
        filteredConsumptions = filteredConsumptions.filter((c) => {
          if (!c.deptConsDate) return false;
          const consDate = new Date(c.deptConsDate);
          let matchesDateRange = true;

          if (startDate) {
            matchesDateRange = matchesDateRange && consDate >= startDate;
          }
          if (endDate) {
            matchesDateRange = matchesDateRange && consDate <= endDate;
          }

          return matchesDateRange;
        });
      }

      if (minConsumedQty !== undefined) {
        filteredConsumptions = filteredConsumptions.filter((c) => (c.totalConsumedQty || 0) >= minConsumedQty);
      }

      if (maxConsumedQty !== undefined) {
        filteredConsumptions = filteredConsumptions.filter((c) => (c.totalConsumedQty || 0) <= maxConsumedQty);
      }

      // Apply sorting
      if (sortBy) {
        filteredConsumptions = filteredConsumptions.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          switch (sortBy) {
            case "deptConsDate":
              aValue = a.deptConsDate ? new Date(a.deptConsDate).getTime() : 0;
              bValue = b.deptConsDate ? new Date(b.deptConsDate).getTime() : 0;
              break;
            case "deptConsCode":
              aValue = a.deptConsCode || "";
              bValue = b.deptConsCode || "";
              break;
            case "fromDeptName":
              aValue = a.fromDeptName || "";
              bValue = b.fromDeptName || "";
              break;
            case "catValue":
              aValue = a.catValue || "";
              bValue = b.catValue || "";
              break;
            case "totalConsumedQty":
              aValue = a.totalConsumedQty || 0;
              bValue = b.totalConsumedQty || 0;
              break;
            case "totalValue":
              aValue = a.totalValue || 0;
              bValue = b.totalValue || 0;
              break;
            default:
              aValue = a.deptConsDate ? new Date(a.deptConsDate).getTime() : 0;
              bValue = b.deptConsDate ? new Date(b.deptConsDate).getTime() : 0;
          }

          if (typeof aValue === "string") {
            return sortOrder ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          } else {
            return sortOrder ? aValue - bValue : bValue - aValue;
          }
        });
      }

      return filteredConsumptions;
    },
    [deptConsCode, categoryValue, startDate, endDate, minConsumedQty, maxConsumedQty, sortBy, sortOrder]
  );

  const [rawConsumptions, setRawConsumptions] = useState<ProductConsumptionMastDto[]>([]);

  // Update the fetch function to use raw data storage
  const fetchConsumptionsForDepartmentFixed = useCallback(async () => {
    if (!deptId) return;
    try {
      setIsLoading(true);
      clearError();
      const response = await productConsumptionMastService.getAll();
      if (response.success && response.data && Array.isArray(response.data)) {
        // Filter consumptions for the selected department
        const departmentConsumptions = response.data.filter((consumption: ProductConsumptionMastDto) => {
          return consumption.fromDeptID === deptId;
        });

        // Store raw data
        setRawConsumptions(departmentConsumptions);

        console.log(`Loaded ${departmentConsumptions.length} consumption records for department ${deptId}`);
      } else {
        throw new Error(response.errorMessage || "Failed to fetch Department Consumptions - invalid response");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch Department Consumption data";
      setError(errorMessage);
      showAlert("Error", "Failed to fetch Department Consumption data for the selected department", "error");
      setRawConsumptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [deptId, showAlert, clearError]);

  // Apply filters whenever raw data or filter criteria change
  useEffect(() => {
    if (rawConsumptions.length > 0 || rawConsumptions.length === 0) {
      const filteredData = applyFiltersAndSorting(rawConsumptions);
      setPaginatedConsumptions(filteredData);
    }
  }, [rawConsumptions, applyFiltersAndSorting]);

  // Update the useEffect that triggers the fetch
  useEffect(() => {
    if (isDepartmentSelected && deptId) {
      fetchConsumptionsForDepartmentFixed();
    }
  }, [isDepartmentSelected, deptId, fetchConsumptionsForDepartmentFixed]);

  // Update the refresh function
  const handleRefresh = useCallback(async () => {
    if (!deptId) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }
    setSearchTerm("");
    setSelectedRows([]);
    await fetchConsumptionsForDepartmentFixed();
    showAlert("Success", "Data refreshed successfully", "success");
  }, [deptId, fetchConsumptionsForDepartmentFixed, showAlert]);

  // Update the form close handler
  const handleFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFormOpen(false);
      setSelectedConsumption(null);
      setIsCopyMode(false);
      setIsViewMode(false);
      if (refreshData && deptId) {
        fetchConsumptionsForDepartmentFixed();
      }
    },
    [deptId, fetchConsumptionsForDepartmentFixed]
  );

  // Update the delete confirm handler
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedConsumption) return;
    try {
      const success = await deleteConsumption(selectedConsumption.deptConsID);
      if (success) {
        await fetchConsumptionsForDepartmentFixed();
      }
    } catch (error) {
      showAlert("Error", "Failed to delete Department Consumption", "error");
    }
    setIsDeleteConfirmOpen(false);
    setSelectedConsumption(null);
  }, [selectedConsumption, deleteConsumption, fetchConsumptionsForDepartmentFixed, showAlert]);

  const getDateFilterType = (): DateFilterType | undefined => {
    switch (dateRange) {
      case "today":
        return DateFilterType.Today;
      case "thisWeek":
        return DateFilterType.LastOneWeek;
      case "thisMonth":
        return DateFilterType.LastOneMonth;
      case "last3Months":
        return DateFilterType.LastThreeMonths;
      case "custom":
        return DateFilterType.Custom;
      default:
        return DateFilterType.LastOneMonth;
    }
  };

  const getConsumptionWithDetailsByIdLocal = useCallback(
    async (consumptionId: number): Promise<ProductConsumptionCompositeDto | null> => {
      try {
        const compositeDto = await getConsumptionWithDetailsById(consumptionId);
        return compositeDto;
      } catch (error) {
        return null;
      }
    },
    [getConsumptionWithDetailsById]
  );

  const handleDepartmentSelectWithConsumptionFetch = useCallback(
    async (selectedDeptId: number, selectedDeptName: string) => {
      try {
        await handleDepartmentSelect(selectedDeptId, selectedDeptName);
        setCategoryValue(undefined);
        setProductName("");
        setDeptConsCode("");
        setMinConsumedQty(undefined);
        setMaxConsumedQty(undefined);
        clearError();
        showAlert("Success", `Selected department: ${selectedDeptName}`, "success");
      } catch (error) {
        showAlert("Error", "Failed to load data for the selected department", "error");
      }
    },
    [handleDepartmentSelect, showAlert, clearError]
  );

  const handleDepartmentChange = useCallback(() => {
    openDialog();
  }, [openDialog]);

  useEffect(() => {
    if (!isDepartmentSelected && !isDialogOpen) {
      openDialog();
    }
  }, [isDepartmentSelected, isDialogOpen, openDialog]);

  useEffect(() => {
    if (isDepartmentSelected && deptId) {
      fetchConsumptionsForDepartment();
    }
  }, [isDepartmentSelected, deptId, fetchConsumptionsForDepartment]);

  const filteredAndSearchedConsumptions = useMemo(() => {
    let filtered = [...paginatedConsumptions];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((consumption) => {
        const searchableText = `${consumption.deptConsCode || ""} ${consumption.fromDeptName || ""} ${consumption.catValue || ""} ${consumption.catDesc || ""}`.toLowerCase();
        return searchableText.includes(searchLower);
      });
    }
    return filtered;
  }, [paginatedConsumptions, searchTerm]);

  useEffect(() => {
    const consumptions = paginatedConsumptions || [];
    const total = consumptions.length;
    const totalValue = consumptions.reduce((sum, consumption) => {
      const value = consumption.totalValue || 0;
      return sum + (typeof value === "number" ? value : 0);
    }, 0);
    const totalConsumedQty = consumptions.reduce((sum, consumption) => {
      const qty = consumption.totalConsumedQty || 0;
      return sum + (typeof qty === "number" ? qty : 0);
    }, 0);
    const totalProducts = consumptions.reduce((sum, consumption) => {
      const items = consumption.totalItems || 0;
      return sum + (typeof items === "number" ? items : 0);
    }, 0);

    // Mock calculations for zero stock and expiring items - would need actual product details
    const zeroStockItems = Math.floor(totalProducts * 0.1); // 10% assumption
    const expiringItems = Math.floor(totalProducts * 0.05); // 5% assumption

    setStatistics({
      total,
      totalValue,
      totalConsumedQty,
      zeroStockItems,
      expiringItems,
      totalProducts,
    });
  }, [paginatedConsumptions]);

  const handleAddNew = useCallback(() => {
    setSelectedConsumption(null);
    setIsViewMode(false);
    setIsCopyMode(false);
    setIsFormOpen(true);
  }, []);

  const handleCopy = useCallback(
    async (consumption: ProductConsumptionMastDto) => {
      try {
        setIsLoadingDetails(true);
        const compositeDto = await getConsumptionWithDetailsByIdLocal(consumption.deptConsID);
        if (!compositeDto || !compositeDto.productConsumption) {
          throw new Error("Failed to load Department Consumption details for copying");
        }
        const consumptionToCopy: ProductConsumptionMastDto = {
          ...compositeDto.productConsumption,
          details: compositeDto.consumptionDetails || [],
        };
        setSelectedConsumption(consumptionToCopy);
        setIsCopyMode(true);
        setIsViewMode(false);
        setIsFormOpen(true);
        showAlert("Info", `Copying Department Consumption "${consumption.deptConsCode}" with ${consumptionToCopy.details?.length || 0} products. Please review and save.`, "info");
      } catch (error) {
        showAlert("Error", "Failed to load Department Consumption details for copying", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [getConsumptionWithDetailsByIdLocal, showAlert]
  );

  const handleEdit = useCallback(
    async (consumption: ProductConsumptionMastDto) => {
      if (!canEditConsumption(consumption)) {
        showAlert("Warning", "This Department Consumption cannot be edited.", "warning");
        return;
      }
      try {
        setIsLoadingDetails(true);
        const compositeDto = await getConsumptionWithDetailsByIdLocal(consumption.deptConsID);
        if (!compositeDto || !compositeDto.productConsumption) {
          throw new Error("Failed to load Department Consumption details for editing");
        }
        const consumptionToEdit: ProductConsumptionMastDto = {
          ...compositeDto.productConsumption,
          details: compositeDto.consumptionDetails || [],
        };
        setSelectedConsumption(consumptionToEdit);
        setIsCopyMode(false);
        setIsViewMode(false);
        setIsFormOpen(true);
        showAlert("Info", `Loading Department Consumption "${consumption.deptConsCode}" with ${consumptionToEdit.details?.length || 0} products for editing...`, "info");
      } catch (error) {
        showAlert("Error", "Failed to load Department Consumption details for editing", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [canEditConsumption, getConsumptionWithDetailsByIdLocal, showAlert]
  );

  const handleView = useCallback(
    async (consumption: ProductConsumptionMastDto) => {
      try {
        setIsLoadingDetails(true);
        const compositeDto = await getConsumptionWithDetailsByIdLocal(consumption.deptConsID);
        if (!compositeDto || !compositeDto.productConsumption) {
          throw new Error("Failed to load Department Consumption details for viewing");
        }
        const consumptionToView: ProductConsumptionMastDto = {
          ...compositeDto.productConsumption,
          details: compositeDto.consumptionDetails || [],
        };
        setSelectedConsumption(consumptionToView);
        setIsCopyMode(false);
        setIsViewMode(true);
        setIsFormOpen(true);
        showAlert("Info", `Loading Department Consumption "${consumption.deptConsCode}" with ${consumptionToView.details?.length || 0} products for viewing...`, "info");
      } catch (error) {
        showAlert("Error", "Failed to load Department Consumption details for viewing", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [getConsumptionWithDetailsByIdLocal, showAlert]
  );

  const handleDeleteClick = useCallback(
    (consumption: ProductConsumptionMastDto) => {
      if (!canDeleteConsumption(consumption)) {
        showAlert("Warning", "This Department Consumption cannot be deleted.", "warning");
        return;
      }
      setSelectedConsumption(consumption);
      setIsDeleteConfirmOpen(true);
    },
    [canDeleteConsumption, showAlert]
  );

  const handleSortChange = useCallback(
    (sortByValue: string) => {
      setSortOrder((prev) => (sortBy === sortByValue ? !prev : false));
      setSortBy(sortByValue);
      setSortMenuAnchor(null);
    },
    [sortBy]
  );

  const handleExportConsumptions = useCallback(
    (format: "excel" | "pdf" | "csv") => {
      const exportData = filteredAndSearchedConsumptions.map((consumption) => ({
        "Consumption Code": consumption.deptConsCode,
        "Consumption Date": formatConsumptionDate(consumption.deptConsDate || new Date()),
        Department: consumption.fromDeptName,
        "Total Items": consumption.totalItems,
        "Total Consumed Qty": consumption.totalConsumedQty,
        "Total Value": formatCurrency(consumption.totalValue || 0),
        Category: consumption.catValue,
        Description: consumption.catDesc,
        "Days Old": calculateDaysOld(consumption.deptConsDate || new Date()),
      }));

      if (format === "csv") {
        const csvContent = [Object.keys(exportData[0]).join(","), ...exportData.map((row) => Object.values(row).join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `department-consumption-report-${deptName}-${dayjs().format("YYYY-MM-DD")}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      showAlert("Success", `${format.toUpperCase()} export initiated for ${filteredAndSearchedConsumptions.length} records from ${deptName}`, "success");
      setReportsMenuAnchor(null);
    },
    [filteredAndSearchedConsumptions, deptName, showAlert]
  );

  const renderContent = () => {
    if (viewMode === "cards") {
      return (
        <Grid container spacing={2}>
          {filteredAndSearchedConsumptions.map((consumption) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={consumption.deptConsID}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  "&:hover": { elevation: 4 },
                  borderLeft: `4px solid #2196f3`,
                }}
                onClick={() => handleView(consumption)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" color="primary">
                      {consumption.deptConsCode || "Pending"}
                    </Typography>
                    <Chip size="small" label="Active" color="success" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Department: {consumption.fromDeptName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {formatConsumptionDate(consumption.deptConsDate || new Date())}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Items: {consumption.totalItems} | Consumed: {consumption.totalConsumedQty}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    Value: {formatCurrency(consumption.totalValue || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (viewMode === "detailed") {
      return (
        <List>
          {filteredAndSearchedConsumptions.map((consumption) => {
            const daysOld = calculateDaysOld(consumption.deptConsDate || new Date());
            const isOld = daysOld > 30;

            return (
              <ListItem
                key={consumption.deptConsID}
                sx={{
                  mb: 1,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{consumption.deptConsCode || "Pending"}</Typography>
                      <Chip size="small" label="Active" color="success" />
                      {isOld && <Chip size="small" label="Old Record" color="warning" />}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Department
                          </Typography>
                          <Typography variant="body2">{consumption.fromDeptName}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Date
                          </Typography>
                          <Typography variant="body2">{formatConsumptionDate(consumption.deptConsDate || new Date())}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Total Items
                          </Typography>
                          <Typography variant="body2">{consumption.totalItems}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Consumed Qty
                          </Typography>
                          <Typography variant="body2">{consumption.totalConsumedQty}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Category
                          </Typography>
                          <Typography variant="body2">{consumption.catValue}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Total Value
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(consumption.totalValue || 0)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleView(consumption)} disabled={isLoadingDetails}>
                      {isLoadingDetails ? <CircularProgress size={16} /> : <VisibilityIcon />}
                    </IconButton>
                    {canEditConsumption(consumption) && (
                      <IconButton size="small" onClick={() => handleEdit(consumption)} disabled={isLoadingDetails}>
                        {isLoadingDetails ? <CircularProgress size={16} /> : <EditIcon />}
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => handleCopy(consumption)} disabled={isLoadingDetails}>
                      {isLoadingDetails ? <CircularProgress size={16} /> : <ContentCopyIcon />}
                    </IconButton>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      );
    }

    return (
      <CustomGrid
        columns={columns}
        data={filteredAndSearchedConsumptions}
        loading={isLoading}
        maxHeight="600px"
        emptyStateMessage={`No Department Consumptions found for ${deptName}. Click "New Consumption" to create the first one.`}
        rowKeyField="deptConsID"
        onRowClick={(consumption) => handleView(consumption)}
      />
    );
  };

  const columns: Column<ProductConsumptionMastDto>[] = [
    {
      key: "select",
      header: "",
      visible: true,
      sortable: false,
      width: 50,
      render: (consumption: ProductConsumptionMastDto) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(consumption.deptConsID)}
          onChange={(e) => {
            e.stopPropagation();
            setSelectedRows((prev) => (e.target.checked ? [...prev, consumption.deptConsID] : prev.filter((id) => id !== consumption.deptConsID)));
          }}
        />
      ),
    },
    {
      key: "consumptionInfo",
      header: "Department Consumption Information",
      visible: true,
      sortable: true,
      width: 280,
      render: (consumption: ProductConsumptionMastDto) => (
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <ConsumptionIcon sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography variant="body2" fontWeight="600" color="primary.main">
              {consumption.deptConsCode || "Pending"}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
            <strong>Date:</strong> {formatConsumptionDate(consumption.deptConsDate || new Date())} • <strong>Items:</strong> {consumption.totalItems || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Days: {calculateDaysOld(consumption.deptConsDate || new Date())} • Qty: {consumption.totalConsumedQty || 0}
          </Typography>
        </Box>
      ),
    },
    {
      key: "department",
      header: "Department",
      visible: true,
      sortable: true,
      width: 200,
      render: (consumption: ProductConsumptionMastDto) => (
        <Box display="flex" alignItems="center" gap={1}>
          <DeptIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Box>
            <Typography variant="body2" fontWeight="500">
              {consumption.fromDeptName || "N/A"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {consumption.fromDeptID || 0}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "category",
      header: "Category",
      visible: true,
      sortable: true,
      width: 150,
      render: (consumption: ProductConsumptionMastDto) => (
        <Box>
          <Typography variant="body2" fontWeight="500">
            {consumption.catValue || "N/A"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {consumption.catDesc || "N/A"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "quantities",
      header: "Quantities & Value",
      visible: true,
      sortable: true,
      width: 180,
      render: (consumption: ProductConsumptionMastDto) => (
        <Box>
          <Typography variant="body2">
            <strong>Consumed:</strong> {consumption.totalConsumedQty || 0}
          </Typography>
          <Typography variant="body2" color="primary" fontWeight="bold">
            <strong>Value:</strong> {formatCurrency(consumption.totalValue || 0)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 120,
      render: (consumption: ProductConsumptionMastDto) => {
        const daysOld = calculateDaysOld(consumption.deptConsDate || new Date());
        const isOld = daysOld > 30;

        return (
          <Stack spacing={1}>
            <Chip
              label={consumption.rActiveYN === "Y" ? "Active" : "Inactive"}
              size="small"
              variant="filled"
              color={consumption.rActiveYN === "Y" ? "success" : "default"}
              sx={{ fontWeight: 500 }}
            />
            {isOld && <Chip label="Old Record" size="small" color="warning" variant="outlined" sx={{ fontWeight: 500 }} />}
          </Stack>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 220,
      render: (consumption: ProductConsumptionMastDto) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleView(consumption);
              }}
              disabled={isLoadingDetails}
              sx={{
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              {isLoadingDetails ? <CircularProgress size={16} /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {canEditConsumption(consumption) && (
            <Tooltip title="Edit Consumption">
              <IconButton
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(consumption);
                }}
                disabled={isLoadingDetails}
                sx={{
                  "&:hover": {
                    backgroundColor: "secondary.main",
                    color: "white",
                  },
                }}
              >
                {isLoadingDetails ? <CircularProgress size={16} /> : <EditIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Copy Consumption">
            <IconButton
              size="small"
              color="info"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(consumption);
              }}
              disabled={isLoadingDetails}
              sx={{
                "&:hover": {
                  backgroundColor: "info.main",
                  color: "white",
                },
              }}
            >
              {isLoadingDetails ? <CircularProgress size={16} /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {canDeleteConsumption(consumption) && (
            <Tooltip title="Delete Consumption">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(consumption);
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: "error.main",
                    color: "white",
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Print">
            <IconButton size="small" color="info">
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading Department Consumptions: {error}
        </Alert>
        <Button onClick={handleRefresh} variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? "Loading..." : "Retry"}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {isLoadingDetails && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Box sx={{ bgcolor: "background.paper", p: 3, borderRadius: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress />
            <Typography>Loading Department Consumption details...</Typography>
          </Box>
        </Box>
      )}

      {isDepartmentSelected && (
        <>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <ConsumptionIcon sx={{ fontSize: 32, color: "primary.main" }} />
                <Box>
                  <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
                    Department Consumption Management - {deptName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Department inventory consumption tracking and management system
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<StatisticsIcon />}
                  endIcon={showStatistics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowStatistics(!showStatistics)}
                  size="small"
                >
                  Statistics
                </Button>
                <SmartButton text={`${deptName}`} onClick={handleDepartmentChange} variant="contained" size="small" color="warning" icon={Sync} />
                <CustomButton variant="contained" icon={AddIcon} text="New Consumption" onClick={handleAddNew} size="small" />
                <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={handleRefresh} asynchronous size="small" />
              </Stack>
            </Box>
          </Paper>

          <Collapse in={showStatistics}>
            <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: "grey.50" }}>
              <Grid container spacing={3} justifyContent="center">
                {[
                  {
                    title: "Total Records",
                    value: statistics.total,
                    icon: <DashboardIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#1976d2",
                  },
                  {
                    title: "Total Products",
                    value: statistics.totalProducts,
                    icon: <InventoryIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#2196f3",
                  },
                  {
                    title: "Consumed Qty",
                    value: Math.round(statistics.totalConsumedQty),
                    icon: <ConsumptionIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#4caf50",
                  },
                  {
                    title: "Total Value (K)",
                    value: Math.round(statistics.totalValue / 1000),
                    icon: <InventoryIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#ff9800",
                  },
                  {
                    title: "Zero Stock",
                    value: statistics.zeroStockItems,
                    icon: <WarningIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#f44336",
                  },
                  {
                    title: "Expiring Items",
                    value: statistics.expiringItems,
                    icon: <WarningIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#9c27b0",
                  },
                ].map((stat, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 2 }} key={stat.title}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: 1.5,
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        border: `3px solid ${stat.bgColor}`,
                        borderLeft: `6px solid ${stat.bgColor}`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "50%",
                          bgcolor: stat.bgColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: stat.bgColor,
                          lineHeight: 1,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          lineHeight: 1.2,
                        }}
                      >
                        {stat.title}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Collapse>

          <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Consumption Code, Department, Category, or Remarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                    endAdornment: searchTerm && (
                      <IconButton size="small" onClick={() => setSearchTerm("")}>
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                  <ToggleButtonGroup value={viewMode} exclusive onChange={(_, newMode) => newMode && setViewMode(newMode)} size="small" sx={{ mr: 1 }}>
                    <ToggleButton value="grid" title="Grid View" size="small">
                      <ListIcon />
                    </ToggleButton>
                    <ToggleButton value="cards" title="Card View" size="small">
                      <CardIcon />
                    </ToggleButton>
                    <ToggleButton value="detailed" title="Detailed List" size="small">
                      <VisibilityIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <CustomButton variant="outlined" icon={SortIcon} text="Sort" onClick={(e) => setSortMenuAnchor(e.currentTarget)} size="small" />
                  <CustomButton variant="outlined" icon={FilterIcon} text="Filter" onClick={() => setIsFilterDrawerOpen(true)} size="small" />
                  <CustomButton
                    variant="outlined"
                    icon={selectedRows.length > 0 ? SelectAllIcon : UnselectAllIcon}
                    text={`Bulk (${selectedRows.length})`}
                    onClick={() => setIsBulkActionsOpen(true)}
                    size="small"
                  />
                  <CustomButton variant="outlined" icon={ReportIcon} text="Export" onClick={(e) => setReportsMenuAnchor(e.currentTarget)} size="small" />
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              Showing <strong>{filteredAndSearchedConsumptions.length}</strong> of <strong>{statistics.total}</strong> Department Consumptions from <strong>{deptName}</strong>
              {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
              {searchTerm && ` • Filtered by: "${searchTerm}"`}
            </Typography>
            {selectedRows.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => setSelectedRows(filteredAndSearchedConsumptions.map((c) => c.deptConsID))}>
                  Select All Visible
                </Button>
                <Button size="small" onClick={() => setSelectedRows([])}>
                  Clear Selection
                </Button>
              </Stack>
            )}
          </Box>

          <Paper elevation={2} sx={{ overflow: "hidden" }}>
            {renderContent()}
          </Paper>
        </>
      )}

      <Menu anchorEl={sortMenuAnchor} open={Boolean(sortMenuAnchor)} onClose={() => setSortMenuAnchor(null)}>
        <MenuList>
          {[
            { value: "deptConsDate", label: "Consumption Date" },
            { value: "deptConsCode", label: "Consumption Code" },
            { value: "fromDeptName", label: "Department" },
            { value: "catValue", label: "Category" },
            { value: "totalConsumedQty", label: "Consumed Quantity" },
            { value: "totalValue", label: "Total Value" },
          ].map((option) => (
            <MenuItem key={option.value} onClick={() => handleSortChange(option.value)} selected={sortBy === option.value}>
              <ListItemText>{option.label}</ListItemText>
              {sortBy === option.value && (
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {sortOrder ? "↑" : "↓"}
                </Typography>
              )}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Menu anchorEl={reportsMenuAnchor} open={Boolean(reportsMenuAnchor)} onClose={() => setReportsMenuAnchor(null)}>
        <MenuList>
          <MenuItem onClick={() => handleExportConsumptions("csv")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as CSV</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExportConsumptions("excel")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as Excel</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExportConsumptions("pdf")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>

      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelectWithConsumptionFetch} requireSelection />

      <Drawer anchor="right" open={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} sx={{ "& .MuiDrawer-paper": { width: 400, p: 3 } }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="600">
          Advanced Filters for {deptName}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Date Range</InputLabel>
            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} label="Date Range">
              {[
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "thisWeek", label: "This Week" },
                { value: "lastWeek", label: "Last Week" },
                { value: "thisMonth", label: "This Month" },
                { value: "lastMonth", label: "Last Month" },
                { value: "last3Months", label: "Last 3 Months" },
                { value: "thisYear", label: "This Year" },
                { value: "custom", label: "Custom Range" },
              ].map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {dateRange === "custom" && (
            <>
              <DatePicker label="Start Date" value={startDate ? dayjs(startDate) : null} onChange={(d) => setStartDate(d ? d.toDate() : null)} />
              <DatePicker label="End Date" value={endDate ? dayjs(endDate) : null} onChange={(d) => setEndDate(d ? d.toDate() : null)} />
            </>
          )}

          <TextField label="Consumption Code" size="small" fullWidth value={deptConsCode} onChange={(e) => setDeptConsCode(e.target.value)} />

          <TextField label="Product Name" size="small" fullWidth value={productName} onChange={(e) => setProductName(e.target.value)} />

          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select value={categoryValue || "all"} onChange={(e) => setCategoryValue(e.target.value === "all" ? undefined : e.target.value)} label="Category">
              {[
                { value: "all", label: "All Categories" },
                { value: "MEDI", label: "Medical" },
                { value: "SURG", label: "Surgical" },
                { value: "CONS", label: "Consumables" },
              ].map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Min Consumed Qty"
            size="small"
            type="number"
            fullWidth
            value={minConsumedQty || ""}
            onChange={(e) => setMinConsumedQty(e.target.value ? parseFloat(e.target.value) : undefined)}
          />

          <TextField
            label="Max Consumed Qty"
            size="small"
            type="number"
            fullWidth
            value={maxConsumedQty || ""}
            onChange={(e) => setMaxConsumedQty(e.target.value ? parseFloat(e.target.value) : undefined)}
          />

          <Box display="flex" gap={1}>
            <CustomButton
              variant="contained"
              text="Apply Filters"
              onClick={() => {
                setIsFilterDrawerOpen(false);
                fetchConsumptionsForDepartment();
                showAlert("Success", "Filters applied successfully", "success");
              }}
              sx={{ flex: 1 }}
            />
            <CustomButton
              variant="outlined"
              text="Clear"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setCategoryValue(undefined);
                setProductName("");
                setDeptConsCode("");
                setMinConsumedQty(undefined);
                setMaxConsumedQty(undefined);
                setDateRange("thisMonth");
                setSortBy("deptConsDate");
                setSortOrder(false);
                setIsFilterDrawerOpen(false);
                fetchConsumptionsForDepartment();
                showAlert("Success", "Filters cleared", "success");
              }}
            />
          </Box>
        </Stack>
      </Drawer>

      <Dialog open={isBulkActionsOpen} onClose={() => setIsBulkActionsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Bulk Actions ({selectedRows.length} items selected from {deptName})
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <CustomButton
              variant="outlined"
              icon={ExportIcon}
              text="Export Selected"
              color="info"
              onClick={() => {
                setIsBulkActionsOpen(false);
                showAlert("Info", "Bulk export functionality to be implemented", "info");
              }}
            />
            <CustomButton
              variant="outlined"
              icon={DeleteIcon}
              text={`Delete Selected (${
                selectedRows.filter((id) => {
                  const consumption = filteredAndSearchedConsumptions.find((c) => c.deptConsID === id);
                  return consumption && canDeleteConsumption(consumption);
                }).length
              } eligible)`}
              color="error"
              onClick={() => {
                setIsBulkActionsOpen(false);
                showAlert("Info", "Bulk delete functionality to be implemented", "info");
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBulkActionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {isFormOpen && (
        <DepartmentConsumptionForm
          open={isFormOpen}
          onClose={handleFormClose}
          initialData={selectedConsumption}
          viewOnly={isViewMode}
          copyMode={isCopyMode}
          selectedDepartmentId={deptId}
          selectedDepartmentName={deptName}
        />
      )}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the Department Consumption "${selectedConsumption?.deptConsCode}"?`}
        type="error"
      />

      <input type="file" ref={fileInputRef} style={{ display: "none" }} />
    </Box>
  );
};

export default DepartmentConsumptionPage;
