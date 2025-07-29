import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { formatCurrency, ProductStockReturnDto, ProductStockReturnSearchRequest, ReturnType } from "@/interfaces/InventoryManagement/ProductStockReturnDto";
import { useAlert } from "@/providers/AlertProvider";
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Assignment as AssignmentIcon,
  ViewModule as CardIcon,
  Clear as ClearIcon,
  ContentCopy as ContentCopyIcon,
  BrokenImage as DamagedIcon,
  Dashboard as DashboardIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as ExpiredIcon,
  GetApp as ExportIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  ViewList as ListIcon,
  PendingActions as PendingIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  Search as SearchIcon,
  CheckBox as SelectAllIcon,
  LocalShipping as ShippingIcon,
  Sort as SortIcon,
  BarChart as StatisticsIcon,
  Store as SupplierIcon,
  Sync,
  TaskAlt as TaskAltIcon,
  SwapHoriz as TransferIcon,
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
  Tab,
  Tabs,
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
import ProductStockReturnForm from "../Form/ProductStockReturnForm";
import { useProductStockReturn } from "../hook/useProductStockReturn";

const ProductStockReturnPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedReturn, setSelectedReturn] = useState<ProductStockReturnDto | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState<boolean>(false);
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
  const [paginatedReturns, setPaginatedReturns] = useState<ProductStockReturnDto[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [fromDepartmentID, setFromDepartmentID] = useState<number | undefined>(undefined);
  const [toDepartmentID, setToDepartmentID] = useState<number | undefined>(undefined);
  const [supplierID, setSupplierID] = useState<number | undefined>(undefined);
  const [approvedStatus, setApprovedStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<string>("thisMonth");
  const [sortBy, setSortBy] = useState<string>("psrDate");
  const [sortOrder, setSortOrder] = useState<boolean>(false);
  const [psrCode, setPsrCode] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentReturnType, setCurrentReturnType] = useState<string | undefined>(undefined);

  const [statistics, setStatistics] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    overdue: 0,
    totalValue: 0,
    supplierReturns: 0,
    internalReturns: 0,
    expiredReturns: 0,
    damagedReturns: 0,
  });

  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect } = useDepartmentSelection({});
  const { department } = useDropdownValues(["department"]);
  const {
    clearError: hookClearError,
    getReturnWithDetailsById,
    deleteReturn,
    approveReturn,
    canEditReturn,
    canApproveReturn,
    canDeleteReturn,
    genericReturnSearch,
    supplierReturnSearch,
    internalReturnSearch,
    expiredReturnSearch,
    damagedReturnSearch,
  } = useProductStockReturn();
  const supplier = [
    { value: "sup1", label: "Suplier1" },
    { value: "sup2", label: "Suplier2" },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatReturnDate = (date: Date): string => {
    return date ? dayjs(date).format("DD/MM/YYYY") : "";
  };

  const calculateDaysOld = (date: Date): number => {
    return date ? dayjs().diff(dayjs(date), "days") : 0;
  };

  const clearError = useCallback(() => {
    setError(null);
    hookClearError();
  }, [hookClearError]);

  const fetchReturnsForDepartment = useCallback(async () => {
    if (!deptId) return;
    try {
      setIsLoading(true);
      clearError();

      const searchParams: ProductStockReturnSearchRequest = {
        pageIndex: 1,
        pageSize: 1000,
        fromDepartmentID: deptId,
        toDepartmentID: toDepartmentID,
        supplierID: supplierID,
        psrCode: psrCode || undefined,
        returnTypeCode: currentReturnType,
        approvedStatus: approvedStatus,
        startDate: startDate,
        endDate: endDate,
        sortBy: sortBy,
        sortAscending: sortOrder,
      };

      let result;
      if (currentReturnType === ReturnType.Supplier) {
        result = await supplierReturnSearch(searchParams);
      } else if (currentReturnType === ReturnType.Internal) {
        result = await internalReturnSearch(searchParams);
      } else if (currentReturnType === ReturnType.Expired) {
        result = await expiredReturnSearch(searchParams);
      } else if (currentReturnType === ReturnType.Damaged) {
        result = await damagedReturnSearch(searchParams);
      } else {
        result = await genericReturnSearch(searchParams);
      }

      if (result && result.items) {
        setPaginatedReturns(result.items);
      } else {
        throw new Error("Failed to fetch Product Stock Returns - invalid response");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch Stock Return data";
      setError(errorMessage);
      showAlert("Error", "Failed to fetch Stock Return data for the selected department", "error");
      setPaginatedReturns([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    deptId,
    toDepartmentID,
    supplierID,
    approvedStatus,
    psrCode,
    currentReturnType,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    showAlert,
    clearError,
    genericReturnSearch,
    supplierReturnSearch,
    internalReturnSearch,
    expiredReturnSearch,
    damagedReturnSearch,
  ]);

  const filteredAndSearchedReturns = useMemo(() => {
    let filtered = [...paginatedReturns];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((stockReturn) => {
        const searchableText = `${stockReturn.psrCode || ""} ${stockReturn.fromDeptName || ""} ${stockReturn.toDeptName || ""} ${stockReturn.supplierName || ""}`.toLowerCase();
        return searchableText.includes(searchLower);
      });
    }
    return filtered;
  }, [paginatedReturns, searchTerm]);

  useEffect(() => {
    const returns = paginatedReturns || [];
    const total = returns.length;
    const approved = returns.filter((stockReturn) => stockReturn.approvedYN === "Y").length;
    const pending = total - approved;
    const daysOldCheck = (date: Date): number => (date ? dayjs().diff(dayjs(date), "days") : 0);
    const overdue = returns.filter((stockReturn) => daysOldCheck(stockReturn.psrDate) > 7 && stockReturn.approvedYN !== "Y").length;

    const supplierReturns = returns.filter((r) => r.returnTypeCode === ReturnType.Supplier).length;
    const internalReturns = returns.filter((r) => r.returnTypeCode === ReturnType.Internal).length;
    const expiredReturns = returns.filter((r) => r.returnTypeCode === ReturnType.Expired).length;
    const damagedReturns = returns.filter((r) => r.returnTypeCode === ReturnType.Damaged).length;

    const totalValue = returns.reduce((sum, stockReturn) => sum + (stockReturn.stkrRetAmt || 0), 0);

    setStatistics({
      total,
      approved,
      pending,
      overdue,
      totalValue,
      supplierReturns,
      internalReturns,
      expiredReturns,
      damagedReturns,
    });
  }, [paginatedReturns]);

  const handleRefresh = useCallback(async () => {
    if (!deptId) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }

    setSearchTerm("");
    setSelectedRows([]);
    await fetchReturnsForDepartment();
    showAlert("Success", "Data refreshed successfully", "success");
  }, [deptId, fetchReturnsForDepartment, showAlert]);

  const handleAddNew = useCallback(() => {
    setSelectedReturn(null);
    setIsViewMode(false);
    setIsCopyMode(false);
    setIsFormOpen(true);
  }, []);

  const handleCopy = useCallback(
    async (stockReturn: ProductStockReturnDto) => {
      try {
        setIsLoadingDetails(true);
        const compositeDto = await getReturnWithDetailsById(stockReturn.psrID);
        if (!compositeDto || !compositeDto.productStockReturn) {
          throw new Error("Failed to load Stock Return details for copying");
        }
        const returnToCopy: ProductStockReturnDto = {
          ...compositeDto.productStockReturn,
          details: compositeDto.productStockReturnDetails || [],
        };
        setSelectedReturn(returnToCopy);
        setIsCopyMode(true);
        setIsViewMode(false);
        setIsFormOpen(true);
        showAlert("Info", `Copying Stock Return "${stockReturn.psrCode}" with ${returnToCopy.details?.length || 0} products. Please review and save.`, "info");
      } catch (error) {
        console.error("Error initiating copy:", error);
        showAlert("Error", "Failed to load Stock Return details for copying", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [getReturnWithDetailsById, showAlert]
  );

  const handleEdit = useCallback(
    async (stockReturn: ProductStockReturnDto) => {
      if (!canEditReturn(stockReturn)) {
        showAlert("Warning", "Approved Stock Returns cannot be edited.", "warning");
        return;
      }
      try {
        setIsLoadingDetails(true);
        const compositeDto = await getReturnWithDetailsById(stockReturn.psrID);
        if (!compositeDto || !compositeDto.productStockReturn) {
          throw new Error("Failed to load Stock Return details for editing");
        }
        const returnToEdit: ProductStockReturnDto = {
          ...compositeDto.productStockReturn,
          details: compositeDto.productStockReturnDetails || [],
        };
        setSelectedReturn(returnToEdit);
        setIsCopyMode(false);
        setIsViewMode(false);
        setIsFormOpen(true);
        showAlert("Info", `Loading Stock Return "${stockReturn.psrCode}" with ${returnToEdit.details?.length || 0} products for editing...`, "info");
      } catch (error) {
        showAlert("Error", "Failed to load Stock Return details for editing", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [canEditReturn, getReturnWithDetailsById, showAlert]
  );

  const handleView = useCallback(
    async (stockReturn: ProductStockReturnDto) => {
      try {
        setIsLoadingDetails(true);
        const compositeDto = await getReturnWithDetailsById(stockReturn.psrID);
        if (!compositeDto || !compositeDto.productStockReturn) {
          throw new Error("Failed to load Stock Return details for viewing");
        }
        const returnToView: ProductStockReturnDto = {
          ...compositeDto.productStockReturn,
          details: compositeDto.productStockReturnDetails || [],
        };
        setSelectedReturn(returnToView);
        setIsCopyMode(false);
        setIsViewMode(true);
        setIsFormOpen(true);
        showAlert("Info", `Loading Stock Return "${stockReturn.psrCode}" with ${returnToView.details?.length || 0} products for viewing...`, "info");
      } catch (error) {
        console.error("Error initiating view:", error);
        showAlert("Error", "Failed to load Stock Return details for viewing", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [getReturnWithDetailsById, showAlert]
  );

  const handleDeleteClick = useCallback(
    (stockReturn: ProductStockReturnDto) => {
      if (!canDeleteReturn(stockReturn)) {
        showAlert("Warning", "Approved Stock Returns cannot be deleted.", "warning");
        return;
      }
      setSelectedReturn(stockReturn);
      setIsDeleteConfirmOpen(true);
    },
    [canDeleteReturn, showAlert]
  );

  const handleApproveClick = useCallback(
    (stockReturn: ProductStockReturnDto) => {
      if (!canApproveReturn(stockReturn)) {
        showAlert("Warning", "This Stock Return is already approved.", "warning");
        return;
      }
      setSelectedReturn(stockReturn);
      setIsApproveConfirmOpen(true);
    },
    [canApproveReturn, showAlert]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedReturn) return;
    try {
      const success = await deleteReturn(selectedReturn.psrID);
      if (success) {
        await fetchReturnsForDepartment();
        showAlert("Success", "Stock Return deleted successfully", "success");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete Stock Return", "error");
    }
    setIsDeleteConfirmOpen(false);
    setSelectedReturn(null);
  }, [selectedReturn, deleteReturn, fetchReturnsForDepartment, showAlert]);

  const handleConfirmApprove = useCallback(async () => {
    if (!selectedReturn) return;
    try {
      const success = await approveReturn(selectedReturn.psrID);
      if (success) {
        await fetchReturnsForDepartment();
        showAlert("Success", "Stock Return approved successfully", "success");
      }
    } catch (error) {
      showAlert("Error", "Failed to approve Stock Return", "error");
    }

    setIsApproveConfirmOpen(false);
    setSelectedReturn(null);
  }, [selectedReturn, approveReturn, fetchReturnsForDepartment, showAlert]);

  const handleFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFormOpen(false);
      setSelectedReturn(null);
      setIsCopyMode(false);
      setIsViewMode(false);
      if (refreshData && deptId) {
        fetchReturnsForDepartment();
      }
    },
    [deptId, fetchReturnsForDepartment]
  );

  const handleSortChange = useCallback(
    (sortByValue: string) => {
      setSortOrder((prev) => (sortBy === sortByValue ? !prev : false));
      setSortBy(sortByValue);
      setSortMenuAnchor(null);
    },
    [sortBy]
  );

  const handleExportReturns = useCallback(
    (format: "excel" | "pdf" | "csv") => {
      const exportData = filteredAndSearchedReturns.map((stockReturn) => ({
        "Return Code": stockReturn.psrCode,
        "Return Date": formatReturnDate(stockReturn.psrDate),
        "Return Type": stockReturn.returnTypeName,
        "From Department": stockReturn.fromDeptName,
        "To Department": stockReturn.toDeptName || "",
        Supplier: stockReturn.supplierName || "",
        "Total Items": stockReturn.totalItems,
        "Total Returned Qty": stockReturn.totalReturnedQty,
        "Total Value": formatCurrency(stockReturn.stkrRetAmt || 0),
        Status: stockReturn.approvedYN === "Y" ? "Approved" : "Pending",
        "Approved By": stockReturn.approvedBy,
      }));

      if (format === "csv") {
        const csvContent = [Object.keys(exportData[0]).join(","), ...exportData.map((row) => Object.values(row).join(","))].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `stock-return-report-${deptName}-${dayjs().format("YYYY-MM-DD")}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      showAlert("Success", `${format.toUpperCase()} export initiated for ${filteredAndSearchedReturns.length} records from ${deptName}`, "success");
      setReportsMenuAnchor(null);
    },
    [filteredAndSearchedReturns, deptName, showAlert]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);

    let newReturnType: string | undefined;
    switch (newValue) {
      case "supplier":
        newReturnType = ReturnType.Supplier;
        break;
      case "internal":
        newReturnType = ReturnType.Internal;
        break;
      case "expired":
        newReturnType = ReturnType.Expired;
        break;
      case "damaged":
        newReturnType = ReturnType.Damaged;
        break;
      default:
        newReturnType = undefined;
    }

    setCurrentReturnType(newReturnType);
  };

  useEffect(() => {
    if (deptId) {
      fetchReturnsForDepartment();
    }
  }, [deptId, currentReturnType, fetchReturnsForDepartment]);

  const handleDepartmentSelectWithReturnsFetch = useCallback(
    async (selectedDeptId: number, selectedDeptName: string) => {
      try {
        console.log("Department selected:", selectedDeptId, selectedDeptName);
        await handleDepartmentSelect(selectedDeptId, selectedDeptName);
        setFromDepartmentID(undefined);
        setToDepartmentID(undefined);
        setSupplierID(undefined);
        setApprovedStatus(undefined);
        setPsrCode("");
        clearError();
        showAlert("Success", `Selected department: ${selectedDeptName}`, "success");
      } catch (error) {
        console.error("Error in department selection:", error);
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

  const renderContent = () => {
    if (viewMode === "cards") {
      return (
        <Grid container spacing={2}>
          {filteredAndSearchedReturns.map((stockReturn) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stockReturn.psrID}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  "&:hover": { elevation: 4 },
                  borderLeft: `4px solid ${stockReturn.approvedYN === "Y" ? "#4caf50" : "#ff9800"}`,
                }}
                onClick={() => handleView(stockReturn)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" color="primary">
                      {stockReturn.psrCode || "Pending"}
                    </Typography>
                    <Chip size="small" label={stockReturn.approvedYN === "Y" ? "Approved" : "Pending"} color={stockReturn.approvedYN === "Y" ? "success" : "warning"} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type: {stockReturn.returnTypeName || getReturnTypeName(stockReturn.returnTypeCode || "")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    From: {stockReturn.fromDeptName}
                  </Typography>
                  {stockReturn.returnTypeCode === ReturnType.Internal && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      To: {stockReturn.toDeptName}
                    </Typography>
                  )}
                  {stockReturn.returnTypeCode === ReturnType.Supplier && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Supplier: {stockReturn.supplierName}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {formatReturnDate(stockReturn.psrDate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Items: {stockReturn.totalItems} | Qty: {stockReturn.totalReturnedQty}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    Value: {formatCurrency(stockReturn.stkrRetAmt || 0)}
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
          {filteredAndSearchedReturns.map((stockReturn) => {
            const daysOld = calculateDaysOld(stockReturn.psrDate);
            const isOverdue = daysOld > 7 && stockReturn.approvedYN !== "Y";

            return (
              <ListItem
                key={stockReturn.psrID}
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
                      <Typography variant="h6">{stockReturn.psrCode || "Pending"}</Typography>
                      <Chip size="small" label={stockReturn.approvedYN === "Y" ? "Approved" : "Pending"} color={stockReturn.approvedYN === "Y" ? "success" : "warning"} />
                      {isOverdue && <Chip size="small" label="Overdue" color="error" />}
                      <Chip size="small" label={stockReturn.returnTypeName || getReturnTypeName(stockReturn.returnTypeCode || "")} color="primary" />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Return Type
                          </Typography>
                          <Typography variant="body2">{stockReturn.returnTypeName || getReturnTypeName(stockReturn.returnTypeCode || "")}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            From Department
                          </Typography>
                          <Typography variant="body2">{stockReturn.fromDeptName}</Typography>
                        </Grid>
                        {stockReturn.returnTypeCode === ReturnType.Internal && (
                          <Grid size={{ xs: 6, md: 2 }}>
                            <Typography variant="caption" display="block">
                              To Department
                            </Typography>
                            <Typography variant="body2">{stockReturn.toDeptName}</Typography>
                          </Grid>
                        )}
                        {stockReturn.returnTypeCode === ReturnType.Supplier && (
                          <Grid size={{ xs: 6, md: 2 }}>
                            <Typography variant="caption" display="block">
                              Supplier
                            </Typography>
                            <Typography variant="body2">{stockReturn.supplierName}</Typography>
                          </Grid>
                        )}
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Date
                          </Typography>
                          <Typography variant="body2">{formatReturnDate(stockReturn.psrDate)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Total Items
                          </Typography>
                          <Typography variant="body2">{stockReturn.totalItems}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Total Value
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(stockReturn.stkrRetAmt || 0)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleView(stockReturn)} disabled={isLoadingDetails}>
                      {isLoadingDetails ? <CircularProgress size={16} /> : <VisibilityIcon />}
                    </IconButton>
                    {canEditReturn(stockReturn) && (
                      <IconButton size="small" onClick={() => handleEdit(stockReturn)} disabled={isLoadingDetails}>
                        {isLoadingDetails ? <CircularProgress size={16} /> : <EditIcon />}
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => handleCopy(stockReturn)} disabled={isLoadingDetails}>
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
        data={filteredAndSearchedReturns}
        loading={isLoading}
        maxHeight="600px"
        emptyStateMessage={`No Stock Returns found for ${deptName}. Click "New Return" to create the first one.`}
        rowKeyField="psrID"
        onRowClick={(stockReturn) => handleView(stockReturn)}
      />
    );
  };

  const getReturnTypeName = (returnTypeCode: string): string => {
    switch (returnTypeCode) {
      case ReturnType.Supplier:
        return "Supplier Return";
      case ReturnType.Internal:
        return "Internal Transfer";
      case ReturnType.Expired:
        return "Expired Items";
      case ReturnType.Damaged:
        return "Damaged Items";
      default:
        return "Unknown";
    }
  };

  const getReturnTypeIcon = (returnTypeCode: string) => {
    switch (returnTypeCode) {
      case ReturnType.Supplier:
        return <SupplierIcon sx={{ fontSize: 20, color: "primary.main" }} />;
      case ReturnType.Internal:
        return <TransferIcon sx={{ fontSize: 20, color: "secondary.main" }} />;
      case ReturnType.Expired:
        return <ExpiredIcon sx={{ fontSize: 20, color: "warning.main" }} />;
      case ReturnType.Damaged:
        return <DamagedIcon sx={{ fontSize: 20, color: "error.main" }} />;
      default:
        return <AssignmentIcon sx={{ fontSize: 20, color: "primary.main" }} />;
    }
  };

  const columns: Column<ProductStockReturnDto>[] = [
    {
      key: "select",
      header: "",
      visible: true,
      sortable: false,
      width: 50,
      render: (stockReturn: ProductStockReturnDto) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(stockReturn.psrID)}
          onChange={(e) => {
            e.stopPropagation();
            setSelectedRows((prev) => (e.target.checked ? [...prev, stockReturn.psrID] : prev.filter((id) => id !== stockReturn.psrID)));
          }}
        />
      ),
    },
    {
      key: "returnInfo",
      header: "Stock Return Information",
      visible: true,
      sortable: true,
      width: 240,
      render: (stockReturn: ProductStockReturnDto) => (
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            {getReturnTypeIcon(stockReturn.returnTypeCode || "")}
            <Typography variant="body2" fontWeight="600" color="primary.main">
              {stockReturn.psrCode || "Pending"}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
            <strong>Type:</strong> {stockReturn.returnTypeName || getReturnTypeName(stockReturn.returnTypeCode || "")} • <strong>Date:</strong>{" "}
            {formatReturnDate(stockReturn.psrDate)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Days: {calculateDaysOld(stockReturn.psrDate)} • Items: {stockReturn.totalItems}
          </Typography>
        </Box>
      ),
    },
    {
      key: "fromDepartment",
      header: "From Department",
      visible: true,
      sortable: true,
      width: 200,
      render: (stockReturn: ProductStockReturnDto) => (
        <Box display="flex" alignItems="center" gap={1}>
          <ShippingIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Box>
            <Typography variant="body2" fontWeight="500">
              {stockReturn.fromDeptName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {stockReturn.fromDeptID}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "destination",
      header: "Destination",
      visible: true,
      sortable: true,
      width: 200,
      render: (stockReturn: ProductStockReturnDto) => {
        if (stockReturn.returnTypeCode === ReturnType.Internal && stockReturn.toDeptID) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <TransferIcon sx={{ fontSize: 20, color: "secondary.main" }} />
              <Box>
                <Typography variant="body2" fontWeight="500">
                  {stockReturn.toDeptName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {stockReturn.toDeptID}
                </Typography>
              </Box>
            </Box>
          );
        } else if (stockReturn.returnTypeCode === ReturnType.Supplier && stockReturn.supplierID) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <SupplierIcon sx={{ fontSize: 20, color: "info.main" }} />
              <Box>
                <Typography variant="body2" fontWeight="500">
                  {stockReturn.supplierName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {stockReturn.supplierID}
                </Typography>
              </Box>
            </Box>
          );
        } else {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <InventoryIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {stockReturn.returnTypeCode === ReturnType.Expired ? "Expired Stock" : stockReturn.returnTypeCode === ReturnType.Damaged ? "Damaged Stock" : "Inventory Adjustment"}
              </Typography>
            </Box>
          );
        }
      },
    },
    {
      key: "returnDetails",
      header: "Return Details",
      visible: true,
      sortable: true,
      width: 180,
      render: (stockReturn: ProductStockReturnDto) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Items: {stockReturn.totalItems}
          </Typography>
          <Typography variant="body2">Qty: {stockReturn.totalReturnedQty}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
            {formatCurrency(stockReturn.stkrRetAmt || 0)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 160,
      render: (stockReturn: ProductStockReturnDto) => {
        const daysOld = calculateDaysOld(stockReturn.psrDate);
        const isOverdue = daysOld > 7 && stockReturn.approvedYN !== "Y";

        return (
          <Stack spacing={1}>
            {stockReturn.approvedYN === "Y" ? (
              <Chip label="Approved" size="small" variant="filled" color="success" icon={<ApproveIcon />} sx={{ fontWeight: 500 }} />
            ) : (
              <Chip
                label="Pending"
                size="small"
                variant="filled"
                icon={<PendingIcon />}
                sx={{
                  backgroundColor: "#ff9800",
                  color: "white",
                  fontWeight: 500,
                  "& .MuiChip-icon": { color: "white" },
                }}
              />
            )}
            {isOverdue && <Chip label="Overdue" size="small" color="error" variant="outlined" sx={{ fontWeight: 500 }} />}
          </Stack>
        );
      },
    },
    {
      key: "approvedBy",
      header: "Approved By",
      visible: true,
      sortable: true,
      width: 150,
      render: (stockReturn: ProductStockReturnDto) => (
        <Typography variant="body2" color="text.secondary">
          {stockReturn.approvedBy || "-"}
        </Typography>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 250,
      render: (stockReturn: ProductStockReturnDto) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleView(stockReturn);
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

          {canEditReturn(stockReturn) && (
            <Tooltip title="Edit Stock Return">
              <IconButton
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(stockReturn);
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

          <Tooltip title="Copy Stock Return">
            <IconButton
              size="small"
              color="info"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(stockReturn);
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

          {canApproveReturn(stockReturn) && (
            <Tooltip title="Approve Stock Return">
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveClick(stockReturn);
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: "success.main",
                    color: "white",
                  },
                }}
              >
                <ApproveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {canDeleteReturn(stockReturn) && (
            <Tooltip title="Delete Stock Return">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(stockReturn);
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
          Error loading Stock Returns: {error}
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
            <Typography>Loading Stock Return details...</Typography>
          </Box>
        </Box>
      )}

      {isDepartmentSelected && (
        <>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <InventoryIcon sx={{ fontSize: 32, color: "primary.main" }} />
                <Box>
                  <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
                    Product Stock Return Management - {deptName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage supplier returns, internal transfers, expired and damaged stock returns
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
                <CustomButton variant="contained" icon={AddIcon} text="New Stock Return" onClick={handleAddNew} size="small" />
                <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={handleRefresh} asynchronous size="small" />
              </Stack>
            </Box>
          </Paper>

          <Collapse in={showStatistics}>
            <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: "grey.50" }}>
              <Grid container spacing={3} justifyContent="center">
                {[
                  {
                    title: "Total Returns",
                    value: statistics.total,
                    icon: <DashboardIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#1976d2",
                  },
                  {
                    title: "Pending",
                    value: statistics.pending,
                    icon: <PendingIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#ff9800",
                  },
                  {
                    title: "Approved",
                    value: statistics.approved,
                    icon: <TaskAltIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#4caf50",
                  },
                  {
                    title: "Overdue",
                    value: statistics.overdue,
                    icon: <WarningIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#f44336",
                  },
                  {
                    title: "Total Value (K)",
                    value: Math.round(statistics.totalValue / 1000),
                    icon: <InventoryIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#2196f3",
                  },
                  {
                    title: "Supplier Returns",
                    value: statistics.supplierReturns,
                    icon: <SupplierIcon sx={{ fontSize: 24, color: "white" }} />,
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

          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="stock return types" variant="scrollable" scrollButtons="auto">
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AssignmentIcon fontSize="small" />
                      <span>All Returns</span>
                      <Chip label={statistics.total} size="small" color="primary" />
                    </Box>
                  }
                  value="all"
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SupplierIcon fontSize="small" />
                      <span>Supplier Returns</span>
                      <Chip label={statistics.supplierReturns} size="small" color="secondary" />
                    </Box>
                  }
                  value="supplier"
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TransferIcon fontSize="small" />
                      <span>Internal Transfers</span>
                      <Chip label={statistics.internalReturns} size="small" color="info" />
                    </Box>
                  }
                  value="internal"
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ExpiredIcon fontSize="small" />
                      <span>Expired Items</span>
                      <Chip label={statistics.expiredReturns} size="small" color="warning" />
                    </Box>
                  }
                  value="expired"
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DamagedIcon fontSize="small" />
                      <span>Damaged Items</span>
                      <Chip label={statistics.damagedReturns} size="small" color="error" />
                    </Box>
                  }
                  value="damaged"
                />
              </Tabs>
            </Box>

            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Return Code, Department, or Supplier..."
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
              Showing <strong>{filteredAndSearchedReturns.length}</strong> of <strong>{statistics.total}</strong> Stock Returns from <strong>{deptName}</strong>
              {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
              {searchTerm && ` • Filtered by: "${searchTerm}"`}
              {currentReturnType && ` • Type: "${getReturnTypeName(currentReturnType)}"`}
            </Typography>
            {selectedRows.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => setSelectedRows(filteredAndSearchedReturns.map((i) => i.psrID))}>
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
            { value: "psrDate", label: "Return Date" },
            { value: "psrCode", label: "Return Code" },
            { value: "returnTypeCode", label: "Return Type" },
            { value: "fromDeptName", label: "From Department" },
            { value: "toDeptName", label: "To Department" },
            { value: "supplierName", label: "Supplier" },
            { value: "approvedYN", label: "Status" },
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
          <MenuItem onClick={() => handleExportReturns("csv")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as CSV</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExportReturns("excel")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as Excel</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExportReturns("pdf")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>

      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelectWithReturnsFetch} requireSelection />
      <Drawer anchor="right" open={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} sx={{ "& .MuiDrawer-paper": { width: 400, p: 3 } }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="600">
          Advanced Filters for {deptName}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Return Type</InputLabel>
            <Select value={currentReturnType || "all"} onChange={(e) => setCurrentReturnType(e.target.value === "all" ? undefined : e.target.value)} label="Return Type">
              <MenuItem value="all">All Return Types</MenuItem>
              <MenuItem value={ReturnType.Supplier}>Supplier Returns</MenuItem>
              <MenuItem value={ReturnType.Internal}>Internal Transfers</MenuItem>
              <MenuItem value={ReturnType.Expired}>Expired Items</MenuItem>
              <MenuItem value={ReturnType.Damaged}>Damaged Items</MenuItem>
            </Select>
          </FormControl>

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

          <TextField label="Return Code" size="small" fullWidth value={psrCode} onChange={(e) => setPsrCode(e.target.value)} />

          <FormControl fullWidth size="small">
            <InputLabel>Approval Status</InputLabel>
            <Select value={approvedStatus || "all"} onChange={(e) => setApprovedStatus(e.target.value === "all" ? undefined : e.target.value)} label="Approval Status">
              {[
                { value: "all", label: "All Status" },
                { value: "Y", label: "Approved" },
                { value: "N", label: "Pending" },
              ].map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>To Department</InputLabel>
            <Select value={toDepartmentID || "all"} onChange={(e) => setToDepartmentID(e.target.value === "all" ? undefined : Number(e.target.value))} label="To Department">
              <MenuItem value="all">All Departments</MenuItem>
              {department?.map((dept) => (
                <MenuItem key={dept.value} value={dept.value}>
                  {dept.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Supplier</InputLabel>
            <Select value={supplierID || "all"} onChange={(e) => setSupplierID(e.target.value === "all" ? undefined : Number(e.target.value))} label="Supplier">
              <MenuItem value="all">All Suppliers</MenuItem>
              {supplier?.map((sup) => (
                <MenuItem key={sup.value} value={sup.value}>
                  {sup.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" gap={1}>
            <CustomButton
              variant="contained"
              text="Apply Filters"
              onClick={() => {
                setIsFilterDrawerOpen(false);
                fetchReturnsForDepartment();
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
                setFromDepartmentID(undefined);
                setToDepartmentID(undefined);
                setSupplierID(undefined);
                setApprovedStatus(undefined);
                setDateRange("thisMonth");
                setSortBy("psrDate");
                setSortOrder(false);
                setPsrCode("");
                setCurrentReturnType(undefined);
                setActiveTab("all");
                setIsFilterDrawerOpen(false);
                fetchReturnsForDepartment();
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
              icon={ApproveIcon}
              text={`Approve Selected (${
                selectedRows.filter((id) => {
                  const stockReturn = filteredAndSearchedReturns.find((i) => i.psrID === id);
                  return stockReturn && stockReturn.approvedYN !== "Y";
                }).length
              } eligible)`}
              color="success"
              onClick={() => {
                setIsBulkActionsOpen(false);
                showAlert("Info", "Bulk approve functionality to be implemented", "info");
              }}
            />
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
                  const stockReturn = filteredAndSearchedReturns.find((i) => i.psrID === id);
                  return stockReturn && canDeleteReturn(stockReturn);
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
        <ProductStockReturnForm
          open={isFormOpen}
          onClose={handleFormClose}
          initialData={selectedReturn}
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
        message={`Are you sure you want to delete the Stock Return "${selectedReturn?.psrCode}"?`}
        type="error"
      />

      <ConfirmationDialog
        open={isApproveConfirmOpen}
        onClose={() => setIsApproveConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Confirm Approval"
        message={`Are you sure you want to approve the Stock Return "${selectedReturn?.psrCode}"? This action cannot be undone.`}
        type="warning"
      />

      <input type="file" ref={fileInputRef} style={{ display: "none" }} />
    </Box>
  );
};

export default ProductStockReturnPage;
