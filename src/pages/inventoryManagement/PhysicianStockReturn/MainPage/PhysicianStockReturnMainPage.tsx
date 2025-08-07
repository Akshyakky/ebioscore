import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { formatCurrency, ProductStockReturnDto, ProductStockReturnSearchRequest } from "@/interfaces/InventoryManagement/ProductStockReturnDto";
import { useAlert } from "@/providers/AlertProvider";
import {
  Add as AddIcon,
  Settings as AdjustmentIcon,
  CheckCircle as ApproveIcon,
  Assignment as AssignmentIcon,
  ViewModule as CardIcon,
  Clear as ClearIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as ExportIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  ViewList as ListIcon,
  PendingActions as PendingIcon,
  MedicalServices as PhysicianIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  Search as SearchIcon,
  CheckBox as SelectAllIcon,
  Sort as SortIcon,
  BarChart as StatisticsIcon,
  Sync,
  TaskAlt as TaskAltIcon,
  CheckBoxOutlineBlank as UnselectAllIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
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
import PhysicianReturnForm from "../Form/PhysicianReturnForm";
import { PhysicianReturnType, usePhysicianReturn } from "../hook/usePhysicianReturn";

const PhysicianStockReturnPage: React.FC = () => {
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
  const [physicianID, setPhysicianID] = useState<number | undefined>(undefined);
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
    physicianReturns: 0,
    inventoryAdjustments: 0,
  });

  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect } = useDepartmentSelection({});
  const { department, attendingPhy } = useDropdownValues(["department", "attendingPhy"]);
  const {
    clearError: hookClearError,
    getReturnWithDetailsById,
    deleteReturn,
    approveReturn,
    canEditReturn,
    canApproveReturn,
    canDeleteReturn,
    physicianReturnSearch,
    inventoryAdjustmentSearch,
  } = usePhysicianReturn();

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
        // physicianID: physicianID,
        psrCode: psrCode || undefined,
        returnTypeCode: currentReturnType,
        approvedStatus: approvedStatus,
        startDate: startDate,
        endDate: endDate,
        sortBy: sortBy,
        sortAscending: sortOrder,
      };

      let result;
      if (currentReturnType === PhysicianReturnType.Physician) {
        result = await physicianReturnSearch(searchParams);
      } else if (currentReturnType === PhysicianReturnType.InventoryAdjustment) {
        result = await inventoryAdjustmentSearch(searchParams);
      } else {
        // Search for all physician return types
        const physicianResult = await physicianReturnSearch({ ...searchParams, returnTypeCode: PhysicianReturnType.Physician });
        const adjustmentResult = await inventoryAdjustmentSearch({ ...searchParams, returnTypeCode: PhysicianReturnType.InventoryAdjustment });

        // Combine results
        result = {
          items: [...(physicianResult?.items || []), ...(adjustmentResult?.items || [])],
          pageIndex: 1,
          pageSize: 1000,
          totalCount: (physicianResult?.totalCount || 0) + (adjustmentResult?.totalCount || 0),
          totalPages: 1,
        };
      }

      if (result && result.items) {
        setPaginatedReturns(result.items);
      } else {
        throw new Error("Failed to fetch Physician Stock Returns - invalid response");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch Physician Stock Return data";
      setError(errorMessage);
      showAlert("Error", "Failed to fetch Physician Stock Return data for the selected department", "error");
      setPaginatedReturns([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    deptId,
    physicianID,
    approvedStatus,
    psrCode,
    currentReturnType,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    showAlert,
    clearError,
    physicianReturnSearch,
    inventoryAdjustmentSearch,
  ]);

  const filteredAndSearchedReturns = useMemo(() => {
    let filtered = [...paginatedReturns];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((stockReturn) => {
        const searchableText = `${stockReturn.psrCode || ""} ${stockReturn.fromDeptName || ""} ${stockReturn.physicianName || ""}`.toLowerCase();
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

    const physicianReturns = returns.filter((r) => r.returnTypeCode === PhysicianReturnType.Physician).length;
    const inventoryAdjustments = returns.filter((r) => r.returnTypeCode === PhysicianReturnType.InventoryAdjustment).length;

    const totalValue = returns.reduce((sum, stockReturn) => sum + (stockReturn.stkrRetAmt || 0), 0);

    setStatistics({
      total,
      approved,
      pending,
      overdue,
      totalValue,
      physicianReturns,
      inventoryAdjustments,
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
          throw new Error("Failed to load Physician Return details for copying");
        }
        const returnToCopy: ProductStockReturnDto = {
          ...compositeDto.productStockReturn,
          details: compositeDto.productStockReturnDetails || [],
        };
        setSelectedReturn(returnToCopy);
        setIsCopyMode(true);
        setIsViewMode(false);
        setIsFormOpen(true);
        showAlert("Info", `Copying Physician Return "${stockReturn.psrCode}" with ${returnToCopy.details?.length || 0} products. Please review and save.`, "info");
      } catch (error) {
        console.error("Error initiating copy:", error);
        showAlert("Error", "Failed to load Physician Return details for copying", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [getReturnWithDetailsById, showAlert]
  );

  const handleEdit = useCallback(
    async (stockReturn: ProductStockReturnDto) => {
      if (!canEditReturn(stockReturn)) {
        showAlert("Warning", "Approved Physician Returns cannot be edited.", "warning");
        return;
      }
      try {
        setIsLoadingDetails(true);
        const compositeDto = await getReturnWithDetailsById(stockReturn.psrID);
        if (!compositeDto || !compositeDto.productStockReturn) {
          throw new Error("Failed to load Physician Return details for editing");
        }
        const returnToEdit: ProductStockReturnDto = {
          ...compositeDto.productStockReturn,
          details: compositeDto.productStockReturnDetails || [],
        };
        setSelectedReturn(returnToEdit);
        setIsCopyMode(false);
        setIsViewMode(false);
        setIsFormOpen(true);
        showAlert("Info", `Loading Physician Return "${stockReturn.psrCode}" with ${returnToEdit.details?.length || 0} products for editing...`, "info");
      } catch (error) {
        showAlert("Error", "Failed to load Physician Return details for editing", "error");
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
          throw new Error("Failed to load Physician Return details for viewing");
        }
        const returnToView: ProductStockReturnDto = {
          ...compositeDto.productStockReturn,
          details: compositeDto.productStockReturnDetails || [],
        };
        setSelectedReturn(returnToView);
        setIsCopyMode(false);
        setIsViewMode(true);
        setIsFormOpen(true);
        showAlert("Info", `Loading Physician Return "${stockReturn.psrCode}" with ${returnToView.details?.length || 0} products for viewing...`, "info");
      } catch (error) {
        console.error("Error initiating view:", error);
        showAlert("Error", "Failed to load Physician Return details for viewing", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [getReturnWithDetailsById, showAlert]
  );

  const handleDeleteClick = useCallback(
    (stockReturn: ProductStockReturnDto) => {
      if (!canDeleteReturn(stockReturn)) {
        showAlert("Warning", "Approved Physician Returns cannot be deleted.", "warning");
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
        showAlert("Warning", "This Physician Return is already approved.", "warning");
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
        showAlert("Success", "Physician Return deleted successfully", "success");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete Physician Return", "error");
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
        showAlert("Success", "Physician Return approved successfully", "success");
      }
    } catch (error) {
      showAlert("Error", "Failed to approve Physician Return", "error");
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
        "Return Type": stockReturn.returnTypeCode === PhysicianReturnType.Physician ? "Physician Return" : "Inventory Adjustment",
        "From Department": stockReturn.fromDeptName,
        Physician: stockReturn.physicianName || "",
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
        a.download = `physician-return-report-${deptName}-${dayjs().format("YYYY-MM-DD")}.csv`;
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
      case "physician":
        newReturnType = PhysicianReturnType.Physician;
        break;
      case "adjustment":
        newReturnType = PhysicianReturnType.InventoryAdjustment;
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
        setPhysicianID(undefined);
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

  const getReturnTypeName = (returnTypeCode: string): string => {
    switch (returnTypeCode) {
      case PhysicianReturnType.Physician:
        return "Physician Return";
      case PhysicianReturnType.InventoryAdjustment:
        return "Inventory Adjustment";
      default:
        return "Unknown";
    }
  };

  const getReturnTypeIcon = (returnTypeCode: string) => {
    switch (returnTypeCode) {
      case PhysicianReturnType.Physician:
        return <PhysicianIcon sx={{ fontSize: 20, color: "primary.main" }} />;
      case PhysicianReturnType.InventoryAdjustment:
        return <AdjustmentIcon sx={{ fontSize: 20, color: "secondary.main" }} />;
      default:
        return <AssignmentIcon sx={{ fontSize: 20, color: "primary.main" }} />;
    }
  };

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
                    Type: {getReturnTypeName(stockReturn.returnTypeCode || "")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    From: {stockReturn.fromDeptName}
                  </Typography>
                  {stockReturn.physicianName && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Physician: {stockReturn.physicianName}
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
                      <Chip size="small" label={getReturnTypeName(stockReturn.returnTypeCode || "")} color="primary" />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Return Type
                          </Typography>
                          <Typography variant="body2">{getReturnTypeName(stockReturn.returnTypeCode || "")}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            From Department
                          </Typography>
                          <Typography variant="body2">{stockReturn.fromDeptName}</Typography>
                        </Grid>
                        {stockReturn.physicianName && (
                          <Grid size={{ xs: 6, md: 2 }}>
                            <Typography variant="caption" display="block">
                              Physician
                            </Typography>
                            <Typography variant="body2">{stockReturn.physicianName}</Typography>
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
        emptyStateMessage={`No Physician Returns found for ${deptName}. Click "New Return" to create the first one.`}
        rowKeyField="psrID"
        onRowClick={(stockReturn) => handleView(stockReturn)}
      />
    );
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
      header: "Physician Return Information",
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
            <strong>Type:</strong> {getReturnTypeName(stockReturn.returnTypeCode || "")} • <strong>Date:</strong> {formatReturnDate(stockReturn.psrDate)}
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
          <InventoryIcon sx={{ fontSize: 20, color: "primary.main" }} />
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
      key: "physician",
      header: "Physician",
      visible: true,
      sortable: true,
      width: 200,
      render: (stockReturn: ProductStockReturnDto) => {
        if (stockReturn.returnTypeCode === PhysicianReturnType.Physician && stockReturn.physicianID) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <PhysicianIcon sx={{ fontSize: 20, color: "secondary.main" }} />
              <Box>
                <Typography variant="body2" fontWeight="500">
                  {stockReturn.physicianName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {stockReturn.physicianID}
                </Typography>
              </Box>
            </Box>
          );
        } else {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <AdjustmentIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {stockReturn.returnTypeCode === PhysicianReturnType.InventoryAdjustment ? "Inventory Adjustment" : "N/A"}
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
            <Tooltip title="Edit Physician Return">
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

          <Tooltip title="Copy Physician Return">
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
            <Tooltip title="Approve Physician Return">
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
            <Tooltip title="Delete Physician Return">
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
          Error loading Physician Returns: {error}
        </Alert>
        <Button onClick={handleRefresh} variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? "Loading..." : "Retry"}
        </Button>
      </Box>
    );
  }

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <PhysicianIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {statistics.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Returns
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #4caf50" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#4caf50", width: 40, height: 40 }}>
                <TaskAltIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#4caf50" fontWeight="bold">
                  {statistics.approved}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Approved
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #ff9800" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#ff9800", width: 40, height: 40 }}>
                <PendingIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {statistics.pending}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #f44336" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#f44336", width: 40, height: 40 }}>
                <WarningIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#f44336" fontWeight="bold">
                  {statistics.overdue}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Overdue
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #9c27b0" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#9c27b0", width: 40, height: 40 }}>
                <InventoryIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                  {formatCurrency(statistics.totalValue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Value
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #2196f3" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 40, height: 40 }}>
                <AdjustmentIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {statistics.inventoryAdjustments}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Adjustments
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Box sx={{ p: 3, borderRadius: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress />
            <Typography>Loading Physician Return details...</Typography>
          </Box>
        </Box>
      )}

      {isDepartmentSelected && (
        <>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <PhysicianIcon sx={{ fontSize: 32, color: "primary.main" }} />
                <Box>
                  <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
                    Physician Stock Return Management - {deptName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage physician returns and inventory adjustments for physician-assigned items
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
                <CustomButton variant="contained" icon={AddIcon} text="New Physician Return" onClick={handleAddNew} size="small" />
                <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={handleRefresh} asynchronous size="small" />
              </Stack>
            </Box>
          </Paper>

          <Collapse in={showStatistics}>
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              {renderStatsDashboard()}
            </Paper>
          </Collapse>

          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="physician return types" variant="scrollable" scrollButtons="auto">
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
                      <PhysicianIcon fontSize="small" />
                      <span>Physician Returns</span>
                      <Chip label={statistics.physicianReturns} size="small" color="secondary" />
                    </Box>
                  }
                  value="physician"
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AdjustmentIcon fontSize="small" />
                      <span>Inventory Adjustments</span>
                      <Chip label={statistics.inventoryAdjustments} size="small" color="info" />
                    </Box>
                  }
                  value="adjustment"
                />
              </Tabs>
            </Box>

            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Return Code, Department, or Physician..."
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
              Showing <strong>{filteredAndSearchedReturns.length}</strong> of <strong>{statistics.total}</strong> Physician Returns from <strong>{deptName}</strong>
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
            { value: "physicianName", label: "Physician" },
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
              <MenuItem value={PhysicianReturnType.Physician}>Physician Returns</MenuItem>
              <MenuItem value={PhysicianReturnType.InventoryAdjustment}>Inventory Adjustments</MenuItem>
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
            <InputLabel>Physician</InputLabel>
            <Select value={physicianID || "all"} onChange={(e) => setPhysicianID(e.target.value === "all" ? undefined : Number(e.target.value))} label="Physician">
              <MenuItem value="all">All Physicians</MenuItem>
              {attendingPhy?.map((phy) => (
                <MenuItem key={phy.value} value={phy.value}>
                  {phy.label}
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
                setPhysicianID(undefined);
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
        <PhysicianReturnForm
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
        message={`Are you sure you want to delete the Physician Return "${selectedReturn?.psrCode}"?`}
        type="error"
      />

      <ConfirmationDialog
        open={isApproveConfirmOpen}
        onClose={() => setIsApproveConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Confirm Approval"
        message={`Are you sure you want to approve the Physician Return "${selectedReturn?.psrCode}"? This action cannot be undone.`}
        type="warning"
      />

      <input type="file" ref={fileInputRef} style={{ display: "none" }} />
    </Box>
  );
};

export default PhysicianStockReturnPage;
