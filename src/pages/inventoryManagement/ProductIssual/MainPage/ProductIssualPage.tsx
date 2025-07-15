import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import {
  ProductIssualDto,
  ProductIssualSearchRequest,
  calculateTotalIssuedQty,
  calculateTotalItems,
  calculateTotalRequestedQty,
  eDateFilterType,
  formatCurrency,
} from "@/interfaces/InventoryManagement/ProductIssualDto";
import { useAlert } from "@/providers/AlertProvider";
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Assignment as AssignmentIcon,
  ViewModule as CardIcon,
  Clear as ClearIcon,
  Dashboard as DashboardIcon,
  Delete as DeleteIcon,
  Group as DeptIcon,
  Edit as EditIcon,
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
  Sort as SortIcon,
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
import dayjs, { Dayjs } from "dayjs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import CompleteProductIssualForm from "../Form/ProductIssualForm";
import { useProductIssual } from "../hooks/useProductIssual";

// Enhanced Product Issual interface for display purposes
interface EnhancedProductIssualDto extends ProductIssualDto {
  totalItems: number;
  totalRequestedQty: number;
  totalIssuedQty: number;
  totalValue: string;
  totalValueNumeric: number;
  fromDepartmentDisplay: string;
  toDepartmentDisplay: string;
  statusColor: string;
  daysOld: number;
  isOverdue: boolean;
  formattedIssueDate: string;
  searchableText: string;
}

// Enhanced filter state interface
interface FilterState {
  startDate: Date | null;
  endDate: Date | null;
  fromDepartmentID: string;
  toDepartmentID: string;
  approvedStatus: string;
  dateRange: string;
  sortBy: string;
  sortOrder: string;
  pisCode: string;
  indentNo: string;
}

// Sort options configuration
const SORT_OPTIONS = [
  { value: "pisDate", label: "Issue Date" },
  { value: "pisCode", label: "Issue Code" },
  { value: "indentNo", label: "Indent Number" },
  { value: "fromDeptName", label: "From Department" },
  { value: "toDeptName", label: "To Department" },
  { value: "approvedYN", label: "Status" },
];

// Date range quick filters
const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisWeek", label: "This Week" },
  { value: "lastWeek", label: "Last Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "last3Months", label: "Last 3 Months" },
  { value: "thisYear", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "Y", label: "Approved" },
  { value: "N", label: "Pending" },
];

// Utility functions
const formatIssueDate = (date: Date): string => {
  return date ? dayjs(date).format("DD/MM/YYYY") : "";
};

const calculateDaysOld = (date: Date): number => {
  return date ? dayjs().diff(dayjs(date), "days") : 0;
};

const isDateInRange = (date: Date, startDate: Dayjs, endDate: Dayjs): boolean => {
  if (!date) return false;
  const dayJsDate = dayjs(date);
  return dayJsDate.isAfter(startDate.subtract(1, "day")) && dayJsDate.isBefore(endDate.add(1, "day"));
};

const EnhancedProductIssualPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIssual, setSelectedIssual] = useState<ProductIssualDto | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "cards" | "detailed">("grid");
  const [reportsMenuAnchor, setReportsMenuAnchor] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    overdue: 0,
    totalValue: 0,
  });

  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect } = useDepartmentSelection({});
  const { department } = useDropdownValues(["department"]);
  const { paginatedIssuals, isLoading, error, issualSearch, deleteIssual, approveIssual, canEditIssual, canApproveIssual, canDeleteIssual } = useProductIssual();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    startDate: null,
    endDate: null,
    fromDepartmentID: "all",
    toDepartmentID: "all",
    approvedStatus: "all",
    dateRange: "thisMonth",
    sortBy: "pisDate",
    sortOrder: "desc",
    pisCode: "",
    indentNo: "",
  });

  const getDateFilterType = (dateRange: string): eDateFilterType => {
    switch (dateRange) {
      case "today":
        return eDateFilterType.Today;
      case "thisWeek":
        return eDateFilterType.LastOneWeek;
      case "thisMonth":
        return eDateFilterType.LastOneMonth;
      case "last3Months":
        return eDateFilterType.LastThreeMonths;
      case "custom":
        return eDateFilterType.Custom;
      default:
        return eDateFilterType.LastOneMonth;
    }
  };

  const fetchIssualsForDepartment = useCallback(
    async (departmentID: number) => {
      if (!departmentID) return;

      try {
        const searchRequest: ProductIssualSearchRequest = {
          pageIndex: 1,
          pageSize: 100,
          sortBy: filters.sortBy || "pisDate",
          sortAscending: filters.sortOrder === "asc",
          dateFilterType: getDateFilterType(filters.dateRange),
          fromDepartmentID: filters.fromDepartmentID !== "all" ? parseInt(filters.fromDepartmentID) : undefined,
          toDepartmentID: filters.toDepartmentID !== "all" ? parseInt(filters.toDepartmentID) : undefined,
          approvedStatus: filters.approvedStatus !== "all" ? filters.approvedStatus : undefined,
          pisCode: filters.pisCode || undefined,
          indentNo: filters.indentNo || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        };

        await issualSearch(searchRequest);
      } catch (error) {
        console.error("Error fetching Product Issuals for department:", error);
        showAlert("Error", "Failed to fetch Product Issual data for the selected department", "error");
      }
    },
    [issualSearch, filters, showAlert]
  );

  const handleDepartmentSelectWithIssualFetch = useCallback(
    async (selectedDeptId: number, selectedDeptName: string) => {
      try {
        await handleDepartmentSelect(selectedDeptId, selectedDeptName);
        await fetchIssualsForDepartment(selectedDeptId);
        showAlert("Success", `Loaded Product Issual data for ${selectedDeptName}`, "success");
      } catch (error) {
        console.error("Error in department selection:", error);
        showAlert("Error", "Failed to load data for the selected department", "error");
      }
    },
    [handleDepartmentSelect, fetchIssualsForDepartment, showAlert]
  );

  const handleDepartmentChange = useCallback(() => {
    openDialog();
  }, [openDialog]);

  useEffect(() => {
    if (!isDepartmentSelected && !isDialogOpen) {
      openDialog();
    }
  }, []);

  useEffect(() => {
    if (isDepartmentSelected && deptId) {
      fetchIssualsForDepartment(deptId);
    }
  }, [isDepartmentSelected, deptId, fetchIssualsForDepartment]);

  const enhancedIssuals = useMemo((): EnhancedProductIssualDto[] => {
    const issualsList = paginatedIssuals.items || [];

    return issualsList.map((issual) => {
      const pendingApproval = issual.approvedYN !== "Y";
      const daysOld = calculateDaysOld(issual.pisDate);
      const totalItems = calculateTotalItems(issual.details || []);
      const totalRequestedQty = calculateTotalRequestedQty(issual.details || []);
      const totalIssuedQty = calculateTotalIssuedQty(issual.details || []);
      const totalValue = (issual.details || []).reduce((sum, detail) => {
        const itemValue = (detail.unitPrice || 0) * detail.issuedQty;
        const taxValue = itemValue * ((detail.tax || 0) / 100);
        return sum + itemValue + taxValue;
      }, 0);

      return {
        ...issual,
        totalItems,
        totalRequestedQty,
        totalIssuedQty,
        totalValue: formatCurrency(totalValue),
        totalValueNumeric: totalValue,
        fromDepartmentDisplay: issual.fromDeptName || `Dept #${issual.fromDeptID}`,
        toDepartmentDisplay: issual.toDeptName || `Dept #${issual.toDeptID}`,
        statusColor: issual.approvedYN === "Y" ? "#4caf50" : "#ff9800",
        daysOld,
        isOverdue: daysOld > 7 && pendingApproval,
        formattedIssueDate: formatIssueDate(issual.pisDate),
        searchableText: `${issual.pisCode || ""} ${issual.indentNo || ""} ${issual.fromDeptName || ""} ${issual.toDeptName || ""}`.toLowerCase(),
      };
    });
  }, [paginatedIssuals]);

  // Enhanced filtering and searching
  const filteredAndSearchedIssuals = useMemo(() => {
    let filtered = [...enhancedIssuals];

    // Apply search term with comprehensive matching
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((issual) => issual.searchableText?.includes(searchLower));
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = dayjs();
      let startDate: Dayjs | null = null;
      let endDate: Dayjs | null = null;

      switch (filters.dateRange) {
        case "today":
          startDate = now.startOf("day");
          endDate = now.endOf("day");
          break;
        case "yesterday":
          startDate = now.subtract(1, "day").startOf("day");
          endDate = now.subtract(1, "day").endOf("day");
          break;
        case "thisWeek":
          startDate = now.startOf("week");
          endDate = now.endOf("week");
          break;
        case "lastWeek":
          startDate = now.subtract(1, "week").startOf("week");
          endDate = now.subtract(1, "week").endOf("week");
          break;
        case "thisMonth":
          startDate = now.startOf("month");
          endDate = now.endOf("month");
          break;
        case "lastMonth":
          startDate = now.subtract(1, "month").startOf("month");
          endDate = now.subtract(1, "month").endOf("month");
          break;
        case "last3Months":
          startDate = now.subtract(3, "month").startOf("month");
          endDate = now.endOf("month");
          break;
        case "thisYear":
          startDate = now.startOf("year");
          endDate = now.endOf("year");
          break;
        case "custom":
          if (filters.startDate) startDate = dayjs(filters.startDate);
          if (filters.endDate) endDate = dayjs(filters.endDate);
          break;
      }

      if (startDate && endDate) {
        filtered = filtered.filter((issual) => {
          return isDateInRange(issual.pisDate, startDate!, endDate!);
        });
      }
    }

    // Apply other filters
    if (filters.fromDepartmentID !== "all") {
      filtered = filtered.filter((issual) => issual.fromDeptID?.toString() === filters.fromDepartmentID);
    }

    if (filters.toDepartmentID !== "all") {
      filtered = filtered.filter((issual) => issual.toDeptID?.toString() === filters.toDepartmentID);
    }

    if (filters.approvedStatus !== "all") {
      filtered = filtered.filter((issual) => issual.approvedYN === filters.approvedStatus);
    }

    if (filters.pisCode) {
      filtered = filtered.filter((issual) => issual.pisCode?.toLowerCase().includes(filters.pisCode.toLowerCase()));
    }

    if (filters.indentNo) {
      filtered = filtered.filter((issual) => issual.indentNo?.toLowerCase().includes(filters.indentNo.toLowerCase()));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case "pisDate":
          aValue = new Date(a.pisDate || 0);
          bValue = new Date(b.pisDate || 0);
          break;
        case "pisCode":
          aValue = a.pisCode || "";
          bValue = b.pisCode || "";
          break;
        case "indentNo":
          aValue = a.indentNo || "";
          bValue = b.indentNo || "";
          break;
        case "fromDeptName":
          aValue = a.fromDeptName || "";
          bValue = b.fromDeptName || "";
          break;
        case "toDeptName":
          aValue = a.toDeptName || "";
          bValue = b.toDeptName || "";
          break;
        case "approvedYN":
          aValue = a.approvedYN || "";
          bValue = b.approvedYN || "";
          break;
        default:
          aValue = a.pisid;
          bValue = b.pisid;
      }

      if (typeof aValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return filters.sortOrder === "asc" ? comparison : -comparison;
      } else {
        const comparison = aValue - bValue;
        return filters.sortOrder === "asc" ? comparison : -comparison;
      }
    });

    return filtered;
  }, [enhancedIssuals, searchTerm, filters]);

  // Calculate statistics
  useEffect(() => {
    const total = enhancedIssuals.length;
    const approved = enhancedIssuals.filter((issual) => issual.approvedYN === "Y").length;
    const pending = total - approved;
    const overdue = enhancedIssuals.filter((issual) => issual.isOverdue).length;
    const totalValue = enhancedIssuals.reduce((sum, issual) => sum + issual.totalValueNumeric, 0);

    setStatistics({ total, approved, pending, overdue, totalValue });
  }, [enhancedIssuals]);

  // Event handlers
  const handleRefresh = useCallback(async () => {
    if (!deptId) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }

    setSearchTerm("");
    setSelectedRows([]);
    await fetchIssualsForDepartment(deptId);
    showAlert("Success", "Data refreshed successfully", "success");
  }, [deptId, fetchIssualsForDepartment, showAlert]);

  const handleAddNew = useCallback(() => {
    setSelectedIssual(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback(
    (issual: EnhancedProductIssualDto) => {
      if (!canEditIssual(issual)) {
        showAlert("Warning", "Approved issuals cannot be edited.", "warning");
        return;
      }
      setSelectedIssual(issual);
      setIsViewMode(false);
      setIsFormOpen(true);
    },
    [canEditIssual, showAlert]
  );

  const handleView = useCallback((issual: EnhancedProductIssualDto) => {
    setSelectedIssual(issual);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    (issual: EnhancedProductIssualDto) => {
      if (!canDeleteIssual(issual)) {
        showAlert("Warning", "Approved issuals cannot be deleted.", "warning");
        return;
      }
      setSelectedIssual(issual);
      setIsDeleteConfirmOpen(true);
    },
    [canDeleteIssual, showAlert]
  );

  const handleApproveClick = useCallback(
    (issual: EnhancedProductIssualDto) => {
      if (!canApproveIssual(issual)) {
        showAlert("Warning", "This issual is already approved.", "warning");
        return;
      }
      setSelectedIssual(issual);
      setIsApproveConfirmOpen(true);
    },
    [canApproveIssual, showAlert]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedIssual) return;
    await deleteIssual(selectedIssual.pisid);
    setIsDeleteConfirmOpen(false);
    setSelectedIssual(null);
    await fetchIssualsForDepartment(deptId);
  }, [selectedIssual, deleteIssual, deptId, fetchIssualsForDepartment]);

  const handleConfirmApprove = useCallback(async () => {
    if (!selectedIssual) return;
    await approveIssual(selectedIssual.pisid);
    setIsApproveConfirmOpen(false);
    setSelectedIssual(null);
    await fetchIssualsForDepartment(deptId);
  }, [selectedIssual, approveIssual, deptId, fetchIssualsForDepartment]);

  const handleFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFormOpen(false);
      setSelectedIssual(null);
      if (refreshData && deptId) {
        fetchIssualsForDepartment(deptId);
      }
    },
    [deptId, fetchIssualsForDepartment]
  );

  // Sort handling
  const handleSortChange = useCallback((sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setSortMenuAnchor(null);
  }, []);

  // Enhanced export functionality
  const handleExportIssuals = useCallback(
    (format: "excel" | "pdf" | "csv") => {
      const exportData = filteredAndSearchedIssuals.map((issual) => ({
        "Issue Code": issual.pisCode,
        "Issue Date": issual.formattedIssueDate,
        "Indent No": issual.indentNo,
        "From Department": issual.fromDeptName,
        "To Department": issual.toDeptName,
        "Total Items": issual.totalItems,
        "Total Requested Qty": issual.totalRequestedQty,
        "Total Issued Qty": issual.totalIssuedQty,
        "Total Value": issual.totalValue,
        Status: issual.approvedYN === "Y" ? "Approved" : "Pending",
        "Approved By": issual.approvedBy,
      }));

      if (format === "csv") {
        const csvContent = [Object.keys(exportData[0]).join(","), ...exportData.map((row) => Object.values(row).join(","))].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `product-issual-report-${deptName}-${dayjs().format("YYYY-MM-DD")}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      showAlert("Success", `${format.toUpperCase()} export initiated for ${filteredAndSearchedIssuals.length} records from ${deptName}`, "success");
      setReportsMenuAnchor(null);
    },
    [filteredAndSearchedIssuals, deptName, showAlert]
  );

  // Enhanced view mode rendering
  const renderContent = () => {
    if (viewMode === "cards") {
      return (
        <Grid container spacing={2}>
          {filteredAndSearchedIssuals.map((issual) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={issual.pisid}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  "&:hover": { elevation: 4 },
                  borderLeft: `4px solid ${issual.statusColor}`,
                }}
                onClick={() => handleView(issual)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" color="primary">
                      {issual.pisCode || "Pending"}
                    </Typography>
                    <Chip size="small" label={issual.approvedYN === "Y" ? "Approved" : "Pending"} color={issual.approvedYN === "Y" ? "success" : "warning"} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Indent: {issual.indentNo || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    From: {issual.fromDeptName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    To: {issual.toDeptName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {issual.formattedIssueDate}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Items: {issual.totalItems} | Issued: {issual.totalIssuedQty}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    Value: {issual.totalValue}
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
          {filteredAndSearchedIssuals.map((issual) => (
            <ListItem
              key={issual.pisid}
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
                    <Typography variant="h6">{issual.pisCode || "Pending"}</Typography>
                    <Chip size="small" label={issual.approvedYN === "Y" ? "Approved" : "Pending"} color={issual.approvedYN === "Y" ? "success" : "warning"} />
                    {issual.isOverdue && <Chip size="small" label="Overdue" color="error" />}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <Typography variant="caption" display="block">
                          Indent No
                        </Typography>
                        <Typography variant="body2">{issual.indentNo || "N/A"}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <Typography variant="caption" display="block">
                          From Department
                        </Typography>
                        <Typography variant="body2">{issual.fromDeptName}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <Typography variant="caption" display="block">
                          To Department
                        </Typography>
                        <Typography variant="body2">{issual.toDeptName}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <Typography variant="caption" display="block">
                          Date
                        </Typography>
                        <Typography variant="body2">{issual.formattedIssueDate}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <Typography variant="caption" display="block">
                          Total Items
                        </Typography>
                        <Typography variant="body2">{issual.totalItems}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <Typography variant="caption" display="block">
                          Total Value
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {issual.totalValue}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={() => handleView(issual)}>
                    <VisibilityIcon />
                  </IconButton>
                  {canEditIssual(issual) && (
                    <IconButton size="small" onClick={() => handleEdit(issual)}>
                      <EditIcon />
                    </IconButton>
                  )}
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      );
    }

    // Default grid view
    return (
      <CustomGrid
        columns={columns}
        data={filteredAndSearchedIssuals}
        loading={isLoading}
        maxHeight="600px"
        emptyStateMessage={`No product issuals found for ${deptName}. Click "New Issual" to create the first one.`}
        rowKeyField="pisid"
        onRowClick={handleView}
      />
    );
  };

  const columns: Column<EnhancedProductIssualDto>[] = [
    {
      key: "select",
      header: "",
      visible: true,
      sortable: false,
      width: 50,
      render: (issual: EnhancedProductIssualDto) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(issual.pisid)}
          onChange={(e) => {
            e.stopPropagation();
            setSelectedRows((prev) => (e.target.checked ? [...prev, issual.pisid] : prev.filter((id) => id !== issual.pisid)));
          }}
        />
      ),
    },
    {
      key: "issualInfo",
      header: "Issue Information",
      visible: true,
      sortable: true,
      width: 240,
      render: (issual: EnhancedProductIssualDto) => (
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <AssignmentIcon sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography variant="body2" fontWeight="600" color="primary.main">
              {issual.pisCode || "Pending"}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
            <strong>Indent:</strong> {issual.indentNo || "N/A"} • <strong>Date:</strong> {issual.formattedIssueDate}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Days: {issual.daysOld} • Items: {issual.totalItems}
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
      render: (issual: EnhancedProductIssualDto) => (
        <Box display="flex" alignItems="center" gap={1}>
          <DeptIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Box>
            <Typography variant="body2" fontWeight="500">
              {issual.fromDeptName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {issual.fromDeptID}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "toDepartment",
      header: "To Department",
      visible: true,
      sortable: true,
      width: 200,
      render: (issual: EnhancedProductIssualDto) => (
        <Box display="flex" alignItems="center" gap={1}>
          <TransferIcon sx={{ fontSize: 20, color: "secondary.main" }} />
          <Box>
            <Typography variant="body2" fontWeight="500">
              {issual.toDeptName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {issual.toDeptID}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "quantities",
      header: "Quantities",
      visible: true,
      sortable: false,
      width: 160,
      render: (issual: EnhancedProductIssualDto) => (
        <Box>
          <Typography variant="body2" color="text.secondary">
            <strong>Requested:</strong> {issual.totalRequestedQty}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Issued:</strong> {issual.totalIssuedQty}
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
      render: (issual: EnhancedProductIssualDto) => (
        <Stack spacing={1}>
          {issual.approvedYN === "Y" ? (
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
          {issual.isOverdue && <Chip label="Overdue" size="small" color="error" variant="outlined" sx={{ fontWeight: 500 }} />}
        </Stack>
      ),
    },
    {
      key: "totalValue",
      header: "Total Value",
      visible: true,
      sortable: true,
      width: 120,
      render: (issual: EnhancedProductIssualDto) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          {issual.totalValue}
        </Typography>
      ),
    },
    {
      key: "approvedBy",
      header: "Approved By",
      visible: true,
      sortable: true,
      width: 150,
      render: (issual: EnhancedProductIssualDto) => (
        <Typography variant="body2" color="text.secondary">
          {issual.approvedBy || "-"}
        </Typography>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 200,
      render: (issual: EnhancedProductIssualDto) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleView(issual);
              }}
              sx={{
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {canEditIssual(issual) && (
            <Tooltip title="Edit Issual">
              <IconButton
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(issual);
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: "secondary.main",
                    color: "white",
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {canApproveIssual(issual) && (
            <Tooltip title="Approve Issual">
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveClick(issual);
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

          {canDeleteIssual(issual) && (
            <Tooltip title="Delete Issual">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(issual);
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
          Error loading product issuals: {error}
        </Alert>
        <Button onClick={handleRefresh} variant="contained" color="primary">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {isDepartmentSelected && (
        <>
          {/* Enhanced Header */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <InventoryIcon sx={{ fontSize: 32, color: "primary.main" }} />
                <Box>
                  <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
                    Product Issual Management - {deptName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Department inventory transfer management system
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={2}>
                <SmartButton text={`${deptName}`} onClick={handleDepartmentChange} variant="contained" size="small" color="warning" icon={Sync} />
                <CustomButton variant="contained" icon={AddIcon} text="New Issual" onClick={handleAddNew} size="small" />
                <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={handleRefresh} asynchronous size="small" />
              </Stack>
            </Box>
          </Paper>

          {/* Enhanced Statistics Dashboard */}
          <Grid container spacing={3} mb={3}>
            {[
              { title: "Total Issuals", value: statistics.total, icon: <DashboardIcon />, color: "#1976d2" },
              { title: "Approved", value: statistics.approved, icon: <TaskAltIcon />, color: "#4caf50" },
              { title: "Pending", value: statistics.pending, icon: <PendingIcon />, color: "#ff9800" },
              { title: "Overdue", value: statistics.overdue, icon: <WarningIcon />, color: "#f44336" },
            ].map((stat) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    borderLeft: `4px solid ${stat.color}`,
                    transition: "box-shadow 0.2s",
                    "&:hover": { elevation: 4 },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", p: 2.5 }}>
                    <Box sx={{ color: stat.color, mb: 1 }}>{React.cloneElement(stat.icon, { sx: { fontSize: 32 } })}</Box>
                    <Typography variant="h5" fontWeight="700" sx={{ color: stat.color, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Enhanced Search and Filters */}
          <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Issue Code, Indent No, Department, or Remarks..."
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

          {/* Results Summary */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              Showing <strong>{filteredAndSearchedIssuals.length}</strong> of <strong>{statistics.total}</strong> issuals for <strong>{deptName}</strong>
              {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
              {searchTerm && ` • Filtered by: "${searchTerm}"`}
            </Typography>
            {selectedRows.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => setSelectedRows(filteredAndSearchedIssuals.map((i) => i.pisid))}>
                  Select All Visible
                </Button>
                <Button size="small" onClick={() => setSelectedRows([])}>
                  Clear Selection
                </Button>
              </Stack>
            )}
          </Box>

          {/* Main Content */}
          <Paper elevation={2} sx={{ overflow: "hidden" }}>
            {renderContent()}
          </Paper>
        </>
      )}

      {/* Sort Menu */}
      <Menu anchorEl={sortMenuAnchor} open={Boolean(sortMenuAnchor)} onClose={() => setSortMenuAnchor(null)}>
        <MenuList>
          {SORT_OPTIONS.map((option) => (
            <MenuItem key={option.value} onClick={() => handleSortChange(option.value)} selected={filters.sortBy === option.value}>
              <ListItemText>{option.label}</ListItemText>
              {filters.sortBy === option.value && (
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {filters.sortOrder === "asc" ? "↑" : "↓"}
                </Typography>
              )}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      {/* Reports/Export Menu */}
      <Menu anchorEl={reportsMenuAnchor} open={Boolean(reportsMenuAnchor)} onClose={() => setReportsMenuAnchor(null)}>
        <MenuList>
          <MenuItem onClick={() => handleExportIssuals("csv")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as CSV</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExportIssuals("excel")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as Excel</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExportIssuals("pdf")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Department Selection Dialog */}
      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelectWithIssualFetch} requireSelection />

      {/* Enhanced Filter Drawer */}
      <Drawer anchor="right" open={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} sx={{ "& .MuiDrawer-paper": { width: 400, p: 3 } }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="600">
          Advanced Filters for {deptName}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Date Range</InputLabel>
            <Select value={filters.dateRange} onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))} label="Date Range">
              {DATE_RANGES.map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {filters.dateRange === "custom" && (
            <>
              <DatePicker
                label="Start Date"
                value={filters.startDate ? dayjs(filters.startDate) : null}
                onChange={(d) => setFilters((p) => ({ ...p, startDate: d ? d.toDate() : null }))}
              />
              <DatePicker
                label="End Date"
                value={filters.endDate ? dayjs(filters.endDate) : null}
                onChange={(d) => setFilters((p) => ({ ...p, endDate: d ? d.toDate() : null }))}
              />
            </>
          )}

          <TextField label="Issue Code" size="small" fullWidth value={filters.pisCode} onChange={(e) => setFilters((p) => ({ ...p, pisCode: e.target.value }))} />

          <TextField label="Indent Number" size="small" fullWidth value={filters.indentNo} onChange={(e) => setFilters((p) => ({ ...p, indentNo: e.target.value }))} />

          <FormControl fullWidth size="small">
            <InputLabel>Approval Status</InputLabel>
            <Select value={filters.approvedStatus} onChange={(e) => setFilters((p) => ({ ...p, approvedStatus: e.target.value }))} label="Approval Status">
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>From Department</InputLabel>
            <Select value={filters.fromDepartmentID} onChange={(e) => setFilters((p) => ({ ...p, fromDepartmentID: e.target.value }))} label="From Department">
              <MenuItem value="all">All Departments</MenuItem>
              {department?.map((dept) => (
                <MenuItem key={dept.value} value={dept.value}>
                  {dept.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>To Department</InputLabel>
            <Select value={filters.toDepartmentID} onChange={(e) => setFilters((p) => ({ ...p, toDepartmentID: e.target.value }))} label="To Department">
              <MenuItem value="all">All Departments</MenuItem>
              {department?.map((dept) => (
                <MenuItem key={dept.value} value={dept.value}>
                  {dept.label}
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
                fetchIssualsForDepartment(deptId);
                showAlert("Success", "Filters applied successfully", "success");
              }}
              sx={{ flex: 1 }}
            />
            <CustomButton
              variant="outlined"
              text="Clear"
              onClick={() => {
                setFilters({
                  startDate: null,
                  endDate: null,
                  fromDepartmentID: "all",
                  toDepartmentID: "all",
                  approvedStatus: "all",
                  dateRange: "thisMonth",
                  sortBy: "pisDate",
                  sortOrder: "desc",
                  pisCode: "",
                  indentNo: "",
                });
                setIsFilterDrawerOpen(false);
                fetchIssualsForDepartment(deptId);
                showAlert("Success", "Filters cleared", "success");
              }}
            />
          </Box>
        </Stack>
      </Drawer>

      {/* Bulk Actions Dialog */}
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
                  const issual = enhancedIssuals.find((i) => i.pisid === id);
                  return issual && issual.approvedYN !== "Y";
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
                // Handle bulk export
                setIsBulkActionsOpen(false);
                showAlert("Info", "Bulk export functionality to be implemented", "info");
              }}
            />
            <CustomButton
              variant="outlined"
              icon={DeleteIcon}
              text={`Delete Selected (${
                selectedRows.filter((id) => {
                  const issual = enhancedIssuals.find((i) => i.pisid === id);
                  return issual && canDeleteIssual(issual);
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

      {/* Form Dialog */}
      {isFormOpen && (
        <CompleteProductIssualForm
          open={isFormOpen}
          onClose={handleFormClose}
          initialData={selectedIssual}
          viewOnly={isViewMode}
          selectedDepartmentId={deptId}
          selectedDepartmentName={deptName}
        />
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the product issual "${selectedIssual?.pisCode}"?`}
        type="error"
      />

      <ConfirmationDialog
        open={isApproveConfirmOpen}
        onClose={() => setIsApproveConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Confirm Approval"
        message={`Are you sure you want to approve the product issual "${selectedIssual?.pisCode}"? This action cannot be undone.`}
        type="warning"
      />

      <input type="file" ref={fileInputRef} style={{ display: "none" }} />
    </Box>
  );
};

export default EnhancedProductIssualPage;
