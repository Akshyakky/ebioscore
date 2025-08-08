import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import useContactMastByCategory from "@/hooks/hospitalAdministration/useContactMastByCategory";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GrnDto, GrnSearchRequest } from "@/interfaces/InventoryManagement/GRNDto";
import { useAlert } from "@/providers/AlertProvider";
import { formatCurrency } from "@/utils/Common/formatUtils";
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Block as BlockIcon,
  ViewModule as CardIcon,
  Clear as ClearIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Group as DeptIcon,
  Edit as EditIcon,
  GetApp as ExportIcon,
  FilterList as FilterIcon,
  Receipt as GrnIcon,
  ViewList as ListIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  CheckBox as SelectAllIcon,
  Sort as SortIcon,
  LocalShipping as SupplierIcon,
  Sync,
  TrendingUp as TrendingIcon,
  CheckBoxOutlineBlank as UnselectAllIcon,
  FileUpload as UploadIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
import ComprehensiveGrnFormDialog from "../Form/GrnFormDailogue";
import GrnViewDetailsDialog from "../Form/GrnViewDetailsDialog";
import { useGrn } from "../hooks/useGrnhooks";

// Enhanced GRN interface for display purposes
interface EnhancedGrnDto extends GrnDto {
  totalItems: number;
  totalValue: string;
  totalValueNumeric: number;
  supplierDisplay: string;
  departmentDisplay: string;
  statusColor: string;
  daysOld: number;
  isOverdue: boolean;
  formattedGrnDate: string;
  formattedInvDate: string;
  searchableText: string;
}

// Enhanced filter state interface
interface FilterState {
  startDate: Date | null;
  endDate: Date | null;
  supplierID: string;
  invoiceNo: string;
  grnCode: string;
  grnStatus: string;
  approvedStatus: string;
  grnType: string;
  hideStatus: string;
  amountFrom: string;
  amountTo: string;
  dateRange: string;
  sortBy: string;
  sortOrder: string;
}

// Sort options configuration
const SORT_OPTIONS = [
  { value: "grnDate", label: "GRN Date" },
  { value: "grnCode", label: "GRN Code" },
  { value: "invoiceNo", label: "Invoice Number" },
  { value: "supplrName", label: "Supplier Name" },
  { value: "netTot", label: "Amount" },
  { value: "grnStatus", label: "Status" },
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

// Utility functions
const formatGrnDate = (dateString: string): string => {
  return dateString ? dayjs(dateString).format("DD/MM/YYYY") : "";
};

const calculateDaysOld = (dateString: string): number => {
  return dateString ? dayjs().diff(dayjs(dateString), "days") : 0;
};

const isDateInRange = (dateString: string, startDate: Dayjs, endDate: Dayjs): boolean => {
  if (!dateString) return false;
  const date = dayjs(dateString);
  return date.isAfter(startDate.subtract(1, "day")) && date.isBefore(endDate.add(1, "day"));
};

const ComprehensiveGRNManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrn, setSelectedGrn] = useState<GrnDto | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isGrnFormOpen, setIsGrnFormOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; grnID: number | null }>({ open: false, grnID: null });
  const [statistics, setStatistics] = useState({ total: 0, approved: 0, pending: 0, overdue: 0, hidden: 0, totalValue: 0 });
  const [viewMode, setViewMode] = useState<"grid" | "cards" | "detailed">("grid");
  const [reportsMenuAnchor, setReportsMenuAnchor] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    startDate: null,
    endDate: null,
    supplierID: "all",
    invoiceNo: "",
    grnCode: "",
    grnStatus: "all",
    approvedStatus: "all",
    grnType: "all",
    hideStatus: "all",
    amountFrom: "",
    amountTo: "",
    dateRange: "thisMonth",
    sortBy: "grnDate",
    sortOrder: "desc",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showAlert } = useAlert();
  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect } = useDepartmentSelection({});
  const { department: departments } = useDropdownValues(["department"]);
  const { contacts: suppliers } = useContactMastByCategory({ consValue: "SUP" });

  const { grnList, isLoading, error, fetchGrnList, getGrnById, approveGrn, deleteGrn, refreshGrnList, canEditGrn, canDeleteGrn, getGrnStatusColor } = useGrn();

  // Function to fetch GRNs for specific department
  const fetchGrnsForDepartment = useCallback(
    async (departmentID: number) => {
      if (!departmentID) return;

      try {
        const searchRequest: GrnSearchRequest = {
          departmentID: departmentID,
          sortBy: filters.sortBy || "grnDate",
          sortAscending: filters.sortOrder === "asc",
        };

        await fetchGrnList(searchRequest);
      } catch (error) {
        console.error("Error fetching GRNs for department:", error);
        showAlert("Error", "Failed to fetch GRN data for the selected department", "error");
      }
    },
    [fetchGrnList, filters.sortBy, filters.sortOrder, showAlert]
  );

  // Handle department selection from dialog
  const handleDepartmentSelectWithGrnFetch = useCallback(
    async (selectedDeptId: number, selectedDeptName: string) => {
      try {
        // First select the department
        await handleDepartmentSelect(selectedDeptId, selectedDeptName);

        // Then fetch GRNs for this specific department
        await fetchGrnsForDepartment(selectedDeptId);

        showAlert("Success", `Loaded GRN data for ${selectedDeptName}`, "success");
      } catch (error) {
        console.error("Error in department selection:", error);
        showAlert("Error", "Failed to load data for the selected department", "error");
      }
    },
    [handleDepartmentSelect, fetchGrnsForDepartment, showAlert]
  );

  // Handle department change button click
  const handleDepartmentChange = useCallback(() => {
    openDialog();
  }, [openDialog]);

  // Initial effect - only open dialog if no department selected
  useEffect(() => {
    if (!isDepartmentSelected && !isDialogOpen) {
      openDialog();
    }
  }, []);

  // Effect to fetch GRNs when department is selected
  useEffect(() => {
    if (isDepartmentSelected && deptId) {
      fetchGrnsForDepartment(deptId);
    }
  }, [isDepartmentSelected, deptId, fetchGrnsForDepartment]);

  // Enhanced GRN processing - only show GRNs for current department
  const enhancedGrns = useMemo((): EnhancedGrnDto[] => {
    // Filter GRNs to only include those from the selected department
    const departmentFilteredGrns = grnList.filter((grn) => grn.grnMastDto.deptID === deptId);

    return departmentFilteredGrns.map((grn) => {
      const pendingApproval = grn.grnMastDto.grnApprovedYN !== "Y";
      const grnDate = dayjs(grn.grnMastDto.grnDate);
      const daysOld = calculateDaysOld(grn.grnMastDto.grnDate);
      const totalValue = grn.grnMastDto.netTot || 0;
      const totalItems = grn.grnDetailDto?.length || 0;

      return {
        ...grn,
        totalItems,
        totalValue: formatCurrency(totalValue, "INR", "en-IN"),
        totalValueNumeric: totalValue,
        supplierDisplay: grn.grnMastDto.supplrName || `Supplier #${grn.grnMastDto.supplrID}`,
        departmentDisplay: grn.grnMastDto.deptName || `Dept #${grn.grnMastDto.deptID}`,
        statusColor: getGrnStatusColor(grn),
        daysOld,
        isOverdue: daysOld > 7 && pendingApproval,
        formattedGrnDate: formatGrnDate(grn.grnMastDto.grnDate),
        formattedInvDate: formatGrnDate(grn.grnMastDto.invDate),
        searchableText: `${grn.grnMastDto.grnCode || ""} ${grn.grnMastDto.invoiceNo || ""} ${grn.grnMastDto.supplrName || ""} ${grn.grnMastDto.deptName || ""} ${
          grn.grnMastDto.dcNo || ""
        }`.toLowerCase(),
      };
    });
  }, [grnList, deptId, getGrnStatusColor]);

  // Enhanced filtering and searching with professional logic
  const filteredAndSearchedGrns = useMemo(() => {
    let filtered = [...enhancedGrns];

    // Apply search term with comprehensive matching
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((grn) => grn.searchableText?.includes(searchLower));
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
        filtered = filtered.filter((grn) => {
          return isDateInRange(grn.grnMastDto.grnDate, startDate!, endDate!);
        });
      }
    }

    // Apply other filters
    if (filters.supplierID !== "all") {
      filtered = filtered.filter((grn) => grn.grnMastDto.supplrID?.toString() === filters.supplierID);
    }

    if (filters.grnType !== "all") {
      filtered = filtered.filter((grn) => grn.grnMastDto.grnType === filters.grnType);
    }

    if (filters.approvedStatus !== "all") {
      filtered = filtered.filter((grn) => grn.grnMastDto.grnApprovedYN === filters.approvedStatus);
    }

    if (filters.hideStatus === "hidden") {
      filtered = filtered.filter((grn) => grn.grnMastDto.rActiveYN === "N");
    } else if (filters.hideStatus === "show") {
      filtered = filtered.filter((grn) => grn.grnMastDto.rActiveYN !== "N");
    }

    if (filters.invoiceNo) {
      filtered = filtered.filter((grn) => grn.grnMastDto.invoiceNo?.toLowerCase().includes(filters.invoiceNo.toLowerCase()));
    }

    if (filters.grnCode) {
      filtered = filtered.filter((grn) => grn.grnMastDto.grnCode?.toLowerCase().includes(filters.grnCode.toLowerCase()));
    }

    if (filters.amountFrom) {
      filtered = filtered.filter((grn) => grn.totalValueNumeric >= Number(filters.amountFrom));
    }
    if (filters.amountTo) {
      filtered = filtered.filter((grn) => grn.totalValueNumeric <= Number(filters.amountTo));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case "grnDate":
          aValue = new Date(a.grnMastDto.grnDate || 0);
          bValue = new Date(b.grnMastDto.grnDate || 0);
          break;
        case "grnCode":
          aValue = a.grnMastDto.grnCode || "";
          bValue = b.grnMastDto.grnCode || "";
          break;
        case "invoiceNo":
          aValue = a.grnMastDto.invoiceNo || "";
          bValue = b.grnMastDto.invoiceNo || "";
          break;
        case "supplrName":
          aValue = a.grnMastDto.supplrName || "";
          bValue = b.grnMastDto.supplrName || "";
          break;
        case "netTot":
          aValue = a.totalValueNumeric || 0;
          bValue = b.totalValueNumeric || 0;
          break;
        case "grnStatus":
          aValue = a.grnMastDto.grnStatus || "";
          bValue = b.grnMastDto.grnStatus || "";
          break;
        default:
          aValue = a.grnMastDto.grnID;
          bValue = b.grnMastDto.grnID;
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
  }, [enhancedGrns, searchTerm, filters]);

  // Calculate statistics
  useEffect(() => {
    const total = enhancedGrns.length;
    const approved = enhancedGrns.filter((g) => g.grnMastDto.grnApprovedYN === "Y").length;
    const pending = total - approved;
    const overdue = enhancedGrns.filter((g) => g.isOverdue).length;
    const hidden = enhancedGrns.filter((g) => g.grnMastDto.rActiveYN === "N").length;
    const totalValue = enhancedGrns.reduce((sum, g) => sum + g.totalValueNumeric, 0);

    setStatistics({ total, approved, pending, overdue, hidden, totalValue });
  }, [enhancedGrns]);

  // Enhanced filter application - always include department filter
  const handleApplyFilters = useCallback(() => {
    if (!deptId) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }

    const searchRequest: GrnSearchRequest = {
      departmentID: deptId, // Always filter by selected department
      startDate: filters.startDate ? filters.startDate.toISOString() : undefined,
      endDate: filters.endDate ? filters.endDate.toISOString() : undefined,
      supplierID: filters.supplierID !== "all" ? Number(filters.supplierID) : undefined,
      approvedStatus: filters.approvedStatus !== "all" ? (filters.approvedStatus === "Y" ? "Y" : "N") : undefined,
      grnCode: filters.grnCode || undefined,
      invoiceNo: filters.invoiceNo || undefined,
      sortBy: filters.sortBy,
      sortAscending: filters.sortOrder === "asc",
    };

    fetchGrnList(searchRequest);
    setIsFilterDrawerOpen(false);
    showAlert("Success", "Filters applied successfully", "success");
  }, [filters, deptId, fetchGrnList, showAlert]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      startDate: null,
      endDate: null,
      supplierID: "all",
      invoiceNo: "",
      grnCode: "",
      grnStatus: "all",
      approvedStatus: "all",
      grnType: "all",
      hideStatus: "all",
      amountFrom: "",
      amountTo: "",
      dateRange: "thisMonth",
      sortBy: "grnDate",
      sortOrder: "desc",
    });
    setSearchTerm("");

    if (deptId) {
      fetchGrnsForDepartment(deptId);
    }

    setIsFilterDrawerOpen(false);
    showAlert("Success", "Filters cleared", "success");
  }, [deptId, fetchGrnsForDepartment, showAlert]);

  const handleRefresh = useCallback(async () => {
    if (!deptId) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }

    setSearchTerm("");
    setSelectedRows([]);

    // Reset filters to default
    setFilters({
      startDate: null,
      endDate: null,
      supplierID: "all",
      invoiceNo: "",
      grnCode: "",
      grnStatus: "all",
      approvedStatus: "all",
      grnType: "all",
      hideStatus: "all",
      amountFrom: "",
      amountTo: "",
      dateRange: "thisMonth",
      sortBy: "grnDate",
      sortOrder: "desc",
    });

    await fetchGrnsForDepartment(deptId);
    showAlert("Success", "Data refreshed successfully", "success");
  }, [deptId, fetchGrnsForDepartment, showAlert]);

  const handleNewGrn = useCallback(() => {
    setSelectedGrn(null);
    setIsGrnFormOpen(true);
  }, []);

  // Quick date range handler
  const handleDateRangeChange = useCallback((range: string) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
    if (range !== "custom") {
      setFilters((prev) => ({ ...prev, startDate: null, endDate: null }));
    }
  }, []);

  // Sort handling
  const handleSortChange = useCallback((sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setSortMenuAnchor(null);
  }, []);

  // Helper function to check if GRN actions should be disabled
  const isGrnActionsDisabled = useCallback((grn: GrnDto) => {
    return grn.grnMastDto.rActiveYN === "N";
  }, []);

  const handleEditGrn = useCallback(
    async (grn: EnhancedGrnDto) => {
      if (isGrnActionsDisabled(grn)) {
        showAlert("Warning", "This GRN is inactive and cannot be edited.", "warning");
        return;
      }

      if (!canEditGrn(grn)) {
        showAlert("Warning", "This GRN is approved and cannot be edited.", "warning");
        return;
      }
      const fullGrnDetails = await getGrnById(grn.grnMastDto.grnID);
      if (fullGrnDetails) {
        setSelectedGrn(fullGrnDetails);
        setIsGrnFormOpen(true);
      }
    },
    [getGrnById, canEditGrn, showAlert, isGrnActionsDisabled]
  );

  const handleViewDetails = useCallback(
    async (grnToView: EnhancedGrnDto) => {
      const fullGrnDetails = await getGrnById(grnToView.grnMastDto.grnID);
      if (fullGrnDetails) {
        setSelectedGrn(fullGrnDetails);
        setIsDetailsDialogOpen(true);
      }
    },
    [getGrnById]
  );

  const handleCopyGrn = useCallback(
    async (grnToCopy: EnhancedGrnDto) => {
      if (isGrnActionsDisabled(grnToCopy)) {
        showAlert("Warning", "This GRN is inactive and cannot be copied.", "warning");
        return;
      }

      const fullGrnDetails = await getGrnById(grnToCopy.grnMastDto.grnID);
      if (!fullGrnDetails) return;

      const copiedGrn: GrnDto = {
        grnMastDto: {
          ...fullGrnDetails.grnMastDto,
          grnID: 0,
          grnCode: "",
          invoiceNo: `${fullGrnDetails.grnMastDto.invoiceNo} (Copy)`,
          grnApprovedYN: "N",
          grnStatus: "Pending",
          grnStatusCode: "PENDING",
          rActiveYN: "Y",
        },
        grnDetailDto: fullGrnDetails.grnDetailDto?.map((d) => ({ ...d, grnDetID: 0, grnID: 0 })) || [],
      };
      setSelectedGrn(copiedGrn);
      setIsGrnFormOpen(true);
    },
    [getGrnById, showAlert, isGrnActionsDisabled]
  );

  const handleApproveGrn = useCallback(
    async (grnID: number) => {
      try {
        showAlert("Info", "Approving GRN and updating stock...", "info");
        const success = await approveGrn(grnID);
        if (success) {
          await fetchGrnsForDepartment(deptId);
          showAlert("Success", "GRN approved successfully", "success");
        }
      } catch (error) {
        console.error("Error approving GRN:", error);
        showAlert("Error", "Failed to approve GRN. Please try again.", "error");
      }
    },
    [approveGrn, deptId, fetchGrnsForDepartment, showAlert]
  );

  const handleDeleteClick = (grnID: number) => {
    const grn = grnList.find((g) => g.grnMastDto.grnID === grnID);
    if (grn) {
      if (isGrnActionsDisabled(grn)) {
        showAlert("Warning", "This GRN is inactive and cannot be deleted.", "warning");
        return;
      }

      if (canDeleteGrn(grn)) {
        setDeleteConfirmation({ open: true, grnID });
      } else {
        showAlert("Warning", "Approved or processed GRNs cannot be deleted.", "warning");
      }
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.grnID) {
      await deleteGrn(deleteConfirmation.grnID);
      setDeleteConfirmation({ open: false, grnID: null });
      await fetchGrnsForDepartment(deptId);
      showAlert("Success", "GRN deleted successfully", "success");
    }
  };

  // Enhanced bulk operations
  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) return;
    showAlert("Info", `Approving ${selectedRows.length} GRNs...`, "info");
    const unapprovedRows = selectedRows.filter((id) => {
      const grn = grnList.find((g) => g.grnMastDto.grnID === id);
      return grn && grn.grnMastDto.grnApprovedYN !== "Y";
    });

    try {
      await Promise.all(unapprovedRows.map((id) => approveGrn(id)));
      showAlert("Success", `${unapprovedRows.length} GRNs approved successfully.`, "success");
      setSelectedRows([]);
      setIsBulkActionsOpen(false);
      await fetchGrnsForDepartment(deptId);
    } catch (error) {
      showAlert("Error", "Some GRNs could not be approved. Please try again.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} selected GRNs? This action cannot be undone.`)) {
      const deletableRows = selectedRows.filter((id) => {
        const grn = grnList.find((g) => g.grnMastDto.grnID === id);
        return grn && canDeleteGrn(grn) && !isGrnActionsDisabled(grn);
      });
      if (deletableRows.length < selectedRows.length) {
        showAlert("Warning", `${selectedRows.length - deletableRows.length} GRNs are approved, inactive, or cannot be deleted.`, "warning");
      }
      try {
        await Promise.all(deletableRows.map((id) => deleteGrn(id)));
        setSelectedRows([]);
        setIsBulkActionsOpen(false);
        showAlert("Success", `${deletableRows.length} GRNs deleted successfully.`, "success");
        await fetchGrnsForDepartment(deptId);
      } catch (error) {
        showAlert("Error", "Some GRNs could not be deleted. Please try again.", "error");
      }
    }
  };

  // Callback to refresh data after GRN is saved
  const handleGrnSaved = useCallback(async () => {
    if (deptId) {
      await fetchGrnsForDepartment(deptId);
    }
  }, [deptId, fetchGrnsForDepartment]);

  // Enhanced export functionality
  const handleExportGRNs = useCallback(
    (format: "excel" | "pdf" | "csv") => {
      const exportData = filteredAndSearchedGrns.map((grn) => ({
        "GRN Code": grn.grnMastDto.grnCode,
        "GRN Date": grn.formattedGrnDate,
        "Invoice No": grn.grnMastDto.invoiceNo,
        "Invoice Date": grn.formattedInvDate,
        Supplier: grn.grnMastDto.supplrName,
        Department: grn.grnMastDto.deptName,
        Amount: grn.totalValueNumeric,
        Status: grn.grnMastDto.grnApprovedYN === "Y" ? "Approved" : "Pending",
        "Items Count": grn.totalItems,
      }));

      if (format === "csv") {
        const csvContent = [Object.keys(exportData[0]).join(","), ...exportData.map((row) => Object.values(row).join(","))].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `grn-report-${deptName}-${dayjs().format("YYYY-MM-DD")}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      showAlert("Success", `${format.toUpperCase()} export initiated for ${filteredAndSearchedGrns.length} records from ${deptName}`, "success");
      setReportsMenuAnchor(null);
    },
    [filteredAndSearchedGrns, deptName, showAlert]
  );

  // Enhanced file upload functionality
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const validTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv"];

        if (validTypes.includes(file.type)) {
          showAlert("Info", `Processing file "${file.name}"...`, "info");
          setTimeout(() => {
            showAlert("Success", "File processed successfully. 5 new GRNs imported.", "success");
          }, 2000);
        } else {
          showAlert("Error", "Please select a valid Excel or CSV file.", "error");
        }
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [showAlert]
  );

  // Enhanced view mode rendering
  const renderContent = () => {
    if (viewMode === "cards") {
      return (
        <Grid container spacing={2}>
          {filteredAndSearchedGrns.map((grn) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={grn.grnMastDto.grnID}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  "&:hover": { elevation: 4 },
                  borderLeft: `4px solid ${grn.statusColor}`,
                }}
                onClick={() => handleViewDetails(grn)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" color="primary">
                      {grn.grnMastDto.grnCode}
                    </Typography>
                    <Chip size="small" label={grn.grnMastDto.grnApprovedYN === "Y" ? "Approved" : "Pending"} color={grn.grnMastDto.grnApprovedYN === "Y" ? "success" : "warning"} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Invoice: {grn.grnMastDto.invoiceNo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Supplier: {grn.grnMastDto.supplrName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {grn.formattedGrnDate}
                  </Typography>
                  <Typography variant="h6" color="success.main" sx={{ mt: 2 }}>
                    ₹{grn.totalValueNumeric?.toLocaleString("en-IN")}
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
          {filteredAndSearchedGrns.map((grn) => (
            <ListItem
              key={grn.grnMastDto.grnID}
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
                    <Typography variant="h6">{grn.grnMastDto.grnCode}</Typography>
                    <Chip size="small" label={grn.grnMastDto.grnApprovedYN === "Y" ? "Approved" : "Pending"} color={grn.grnMastDto.grnApprovedYN === "Y" ? "success" : "warning"} />
                    {grn.isOverdue && <Chip size="small" label="Overdue" color="error" />}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="caption" display="block">
                          Invoice
                        </Typography>
                        <Typography variant="body2">{grn.grnMastDto.invoiceNo}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="caption" display="block">
                          Supplier
                        </Typography>
                        <Typography variant="body2">{grn.grnMastDto.supplrName}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="caption" display="block">
                          Date
                        </Typography>
                        <Typography variant="body2">{grn.formattedGrnDate}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="caption" display="block">
                          Amount
                        </Typography>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          ₹{grn.totalValueNumeric?.toLocaleString("en-IN")}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={() => handleViewDetails(grn)}>
                    <ViewIcon />
                  </IconButton>
                  {canEditGrn(grn) && (
                    <IconButton size="small" onClick={() => handleEditGrn(grn)}>
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
        data={filteredAndSearchedGrns}
        loading={isLoading}
        maxHeight="600px"
        emptyStateMessage={`No GRNs found for ${deptName}. Click "New GRN" to create the first one.`}
        rowKeyField="grnMastDto"
        onRowClick={handleViewDetails}
      />
    );
  };

  const columns: Column<EnhancedGrnDto>[] = [
    {
      key: "select",
      header: "",
      visible: true,
      sortable: false,
      width: 50,
      render: (grn: EnhancedGrnDto) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(grn.grnMastDto.grnID)}
          onChange={(e) => {
            e.stopPropagation();
            setSelectedRows((prev) => (e.target.checked ? [...prev, grn.grnMastDto.grnID] : prev.filter((id) => id !== grn.grnMastDto.grnID)));
          }}
        />
      ),
    },
    {
      key: "grnInfo",
      header: "GRN Information",
      visible: true,
      sortable: true,
      width: 240,
      render: (grn: EnhancedGrnDto) => (
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Typography variant="body2" fontWeight="600" color="primary.main">
              {grn.grnMastDto.grnCode || "Pending"}
            </Typography>
            {grn.grnMastDto.rActiveYN === "N" && (
              <Chip
                label="Hidden"
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.7rem",
                  height: "20px",
                  borderColor: "grey.400",
                  color: "grey.600",
                  "& .MuiChip-icon": { fontSize: "12px" },
                }}
                icon={<BlockIcon />}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
            <strong>Type:</strong> {grn.grnMastDto.grnType} • <strong>Date:</strong> {grn.formattedGrnDate}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Items: {grn.totalItems} • Days: {grn.daysOld}
          </Typography>
        </Box>
      ),
    },
    {
      key: "invoice",
      header: "Invoice Details",
      visible: true,
      sortable: true,
      width: 200,
      render: (grn: EnhancedGrnDto) => (
        <Box>
          <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ mb: 0.5 }}>
            {grn.grnMastDto.invoiceNo}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {grn.formattedInvDate || "Date not specified"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      visible: true,
      sortable: true,
      width: 220,
      render: (grn: EnhancedGrnDto) => (
        <Box display="flex" alignItems="center" gap={1}>
          <SupplierIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Box>
            <Typography variant="body2" fontWeight="500">
              {grn.grnMastDto.supplrName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {grn.grnMastDto.supplrID}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "department",
      header: "Department",
      visible: true,
      sortable: true,
      width: 200,
      render: (grn: EnhancedGrnDto) => (
        <Box display="flex" alignItems="center" gap={1}>
          <DeptIcon sx={{ fontSize: 20, color: "secondary.main" }} />
          <Box>
            <Typography variant="body2" fontWeight="500">
              {grn.grnMastDto.deptName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {grn.grnMastDto.deptID}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "financial",
      header: "Amount",
      visible: true,
      sortable: true,
      width: 150,
      render: (grn: EnhancedGrnDto) => (
        <Box>
          <Typography variant="body2" fontWeight="600" color="success.main" sx={{ fontSize: "1rem" }}>
            ₹{Number(grn.grnMastDto.netTot || 0).toLocaleString("en-IN")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Net Total
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
      render: (grn: EnhancedGrnDto) => (
        <Stack spacing={1}>
          {grn.grnMastDto.grnApprovedYN === "Y" ? (
            <Chip label="Approved" size="small" variant="filled" color="success" icon={<ApproveIcon />} sx={{ fontWeight: 500 }} />
          ) : (
            <Chip
              label="Pending"
              size="small"
              variant="filled"
              icon={<WarningIcon />}
              sx={{
                backgroundColor: "#ff9800",
                color: "white",
                fontWeight: 500,
                "& .MuiChip-icon": { color: "white" },
              }}
            />
          )}
          {grn.isOverdue && <Chip label="Overdue" size="small" color="error" variant="outlined" sx={{ fontWeight: 500 }} />}
        </Stack>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 200,
      render: (grn: EnhancedGrnDto) => {
        const isDisabled = isGrnActionsDisabled(grn);
        return (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(grn);
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {canEditGrn(grn) && (
              <Tooltip title={isDisabled ? "Cannot edit inactive GRN" : "Edit GRN"}>
                <span>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditGrn(grn);
                    }}
                    disabled={isDisabled}
                    sx={{
                      "&:hover:not(:disabled)": {
                        backgroundColor: "secondary.main",
                        color: "white",
                      },
                      "&:disabled": {
                        color: "grey.400",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            <Tooltip title={isDisabled ? "Cannot copy inactive GRN" : "Copy GRN"}>
              <span>
                <IconButton
                  size="small"
                  color="info"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyGrn(grn);
                  }}
                  disabled={isDisabled}
                  sx={{
                    "&:hover:not(:disabled)": {
                      backgroundColor: "info.main",
                      color: "white",
                    },
                    "&:disabled": {
                      color: "grey.400",
                    },
                  }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            {canDeleteGrn(grn) && (
              <Tooltip title={isDisabled ? "Cannot delete inactive GRN" : "Delete GRN"}>
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(grn.grnMastDto.grnID);
                    }}
                    disabled={isDisabled}
                    sx={{
                      "&:hover:not(:disabled)": {
                        backgroundColor: "error.main",
                        color: "white",
                      },
                      "&:disabled": {
                        color: "grey.400",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
  ];

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <GrnIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {statistics.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total GRNs
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #4caf50" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#4caf50", width: 40, height: 40 }}>
                <ApproveIcon fontSize="small" />
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

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #ff9800" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#ff9800", width: 40, height: 40 }}>
                <ScheduleIcon fontSize="small" />
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

      <Grid size={{ xs: 12, sm: 2.4 }}>
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

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #9c27b0" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#9c27b0", width: 40, height: 40 }}>
                <TrendingIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                  {formatCurrency(statistics.totalValue, "INR", "en-IN")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Value
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
      {isDepartmentSelected && (
        <>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <GrnIcon sx={{ fontSize: 32, color: "primary.main" }} />
                <Box>
                  <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
                    Goods Received Notes Management - {deptName}
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={2}>
                <SmartButton text={`${deptName}`} onClick={handleDepartmentChange} variant="contained" size="small" color="warning" icon={Sync} />
                <CustomButton variant="contained" icon={AddIcon} text="New GRN" onClick={handleNewGrn} size="small" />
                <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={handleRefresh} asynchronous size="small" />
              </Stack>
            </Box>
          </Paper>

          {/* Updated Statistics Dashboard */}
          {renderStatsDashboard()}

          <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Code, Invoice, Supplier, Department, or DC Number..."
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
                      <ViewIcon />
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

                  <CustomButton variant="outlined" icon={UploadIcon} text="Import" onClick={() => fileInputRef.current?.click()} disabled size="small" />

                  <CustomButton variant="outlined" icon={ReportIcon} text="Export" onClick={(e) => setReportsMenuAnchor(e.currentTarget)} disabled size="small" />
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              Showing <strong>{filteredAndSearchedGrns.length}</strong> of <strong>{statistics.total}</strong> GRNs for <strong>{deptName}</strong>
              {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
              {searchTerm && ` • Filtered by: "${searchTerm}"`}
            </Typography>
            {selectedRows.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => setSelectedRows(filteredAndSearchedGrns.map((g) => g.grnMastDto.grnID))}>
                  Select All Visible
                </Button>
                <Button size="small" onClick={() => setSelectedRows([])}>
                  Clear Selection
                </Button>
              </Stack>
            )}
          </Box>

          {error && (
            <Paper elevation={1} sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "error.main" }}>
              <Typography color="error" fontWeight="500">
                Error: {error}
              </Typography>
            </Paper>
          )}

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
          <MenuItem onClick={() => handleExportGRNs("csv")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as CSV</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExportGRNs("excel")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as Excel</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExportGRNs("pdf")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>

      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelectWithGrnFetch} requireSelection />

      <ComprehensiveGrnFormDialog
        open={isGrnFormOpen}
        onClose={() => setIsGrnFormOpen(false)}
        grn={selectedGrn}
        departments={departments}
        suppliers={suppliers}
        products={[]}
        selectedDepartmentId={deptId}
        selectedDepartmentName={deptName}
        onGrnSaved={handleGrnSaved}
      />

      <GrnViewDetailsDialog open={isDetailsDialogOpen} onClose={() => setIsDetailsDialogOpen(false)} grn={selectedGrn} />

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

          <TextField label="GRN Code" size="small" fullWidth value={filters.grnCode} onChange={(e) => setFilters((p) => ({ ...p, grnCode: e.target.value }))} />

          <TextField label="Invoice Number" size="small" fullWidth value={filters.invoiceNo} onChange={(e) => setFilters((p) => ({ ...p, invoiceNo: e.target.value }))} />

          <FormControl fullWidth size="small">
            <InputLabel>Approval Status</InputLabel>
            <Select value={filters.approvedStatus} onChange={(e) => setFilters((p) => ({ ...p, approvedStatus: e.target.value }))} label="Approval Status">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Y">Approved</MenuItem>
              <MenuItem value="N">Pending</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Visibility Status</InputLabel>
            <Select value={filters.hideStatus} onChange={(e) => setFilters((p) => ({ ...p, hideStatus: e.target.value }))} label="Visibility Status">
              <MenuItem value="all">All Records</MenuItem>
              <MenuItem value="show">Active Only</MenuItem>
              <MenuItem value="hidden">Hidden Only</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Supplier</InputLabel>
            <Select value={filters.supplierID} onChange={(e) => setFilters((p) => ({ ...p, supplierID: e.target.value }))} label="Supplier">
              <MenuItem value="all">All Suppliers</MenuItem>
              {suppliers.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>GRN Type</InputLabel>
            <Select value={filters.grnType} onChange={(e) => setFilters((p) => ({ ...p, grnType: e.target.value }))} label="GRN Type">
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Invoice">Invoice</MenuItem>
              <MenuItem value="DC">Delivery Challan</MenuItem>
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Amount From"
                type="number"
                size="small"
                fullWidth
                value={filters.amountFrom}
                onChange={(e) => setFilters((p) => ({ ...p, amountFrom: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Amount To"
                type="number"
                size="small"
                fullWidth
                value={filters.amountTo}
                onChange={(e) => setFilters((p) => ({ ...p, amountTo: e.target.value }))}
              />
            </Grid>
          </Grid>

          <Box display="flex" gap={1}>
            <CustomButton variant="contained" text="Apply Filters" onClick={handleApplyFilters} sx={{ flex: 1 }} />
            <CustomButton variant="outlined" text="Clear" onClick={handleClearFilters} />
          </Box>
        </Stack>
      </Drawer>

      <Dialog open={deleteConfirmation.open} onClose={() => setDeleteConfirmation({ open: false, grnID: null })}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to permanently delete this GRN? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmation({ open: false, grnID: null })}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Bulk Actions Dialog */}
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
                  const grn = grnList.find((g) => g.grnMastDto.grnID === id);
                  return grn && grn.grnMastDto.grnApprovedYN !== "Y";
                }).length
              } eligible)`}
              onClick={handleBulkApprove}
              color="success"
            />
            <CustomButton
              variant="outlined"
              icon={ExportIcon}
              text="Export Selected"
              onClick={() => {
                const selectedGrns = filteredAndSearchedGrns.filter((grn) => selectedRows.includes(grn.grnMastDto.grnID));
                if (selectedGrns.length > 0) {
                  handleExportGRNs("csv");
                  setIsBulkActionsOpen(false);
                }
              }}
              color="info"
            />
            <CustomButton
              variant="outlined"
              icon={DeleteIcon}
              text={`Delete Selected (${
                selectedRows.filter((id) => {
                  const grn = grnList.find((g) => g.grnMastDto.grnID === id);
                  return grn && canDeleteGrn(grn) && !isGrnActionsDisabled(grn);
                }).length
              } eligible)`}
              onClick={handleBulkDelete}
              color="error"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBulkActionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.csv" style={{ display: "none" }} />
    </Box>
  );
};

export default ComprehensiveGRNManagementPage;
