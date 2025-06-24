import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { GRNWithAllDetailsDto } from "@/interfaces/InventoryManagement/GRNDto";
import { useAlert } from "@/providers/AlertProvider";
import { formatCurrency } from "@/utils/Common/formatUtils";
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  ContentCopy as CopyIcon,
  Dashboard as DashboardIcon,
  Delete as DeleteIcon,
  Group as DeptIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  GetApp as ExportIcon,
  FilterList as FilterIcon,
  Receipt as GrnIcon,
  VisibilityOff as HideIcon,
  Assignment as QualityIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  CheckBox as SelectAllIcon,
  LocalShipping as SupplierIcon,
  TrendingUp as TrendingIcon,
  CheckBoxOutlineBlank as UnselectAllIcon,
  FileUpload as UploadIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Box,
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
  MenuItem,
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

import useContactMastByCategory from "@/hooks/hospitalAdministration/useContactMastByCategory";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import GrnDetailsDialog from "../Form/GrnDetailsDialog";
import ComprehensiveGrnFormDialog from "../Form/GrnFormDailogue";
import useEnhancedGRN from "../hooks/useGrnhooks";

interface EnhancedGRNDto extends GRNWithAllDetailsDto {
  totalItems?: number;
  totalValue?: string;
  pendingApproval?: boolean;
  supplierDisplay?: string;
  departmentDisplay?: string;
  statusColor?: "success" | "warning" | "error" | "info" | "default";
  daysOld?: number;
  isOverdue?: boolean;
  formattedGrnDate?: string;
  formattedInvDate?: string;
  qualityStatus?: string;
}

interface FilterState {
  dateFilterType: string;
  startDate: Date | null;
  endDate: Date | null;
  supplierID: string;
  departmentID: string;
  invoiceNo: string;
  grnCode: string;
  grnStatus: string;
  approvedStatus: string;
  grnType: string;
  hideStatus: string;
  qualityStatus: string;
  amountFrom: string;
  amountTo: string;
}

const ComprehensiveGRNManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrn, setSelectedGrn] = useState<GRNWithAllDetailsDto | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "cards" | "detailed">("grid");
  const [isGrnFormOpen, setIsGrnFormOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [, setIsExportDialogOpen] = useState(false);
  const [, setIsReportsDialogOpen] = useState(false);
  const { deptId, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect } = useDepartmentSelection({});
  const { department } = useDropdownValues(["department"]);
  const { contacts: suppliers } = useContactMastByCategory({ consValue: "SUP" });

  const [filters, setFilters] = useState<FilterState>({
    dateFilterType: "all",
    startDate: null,
    endDate: null,
    supplierID: "all",
    departmentID: "all",
    invoiceNo: "",
    grnCode: "",
    grnStatus: "all",
    approvedStatus: "all",
    grnType: "all",
    hideStatus: "show",
    qualityStatus: "all",
    amountFrom: "",
    amountTo: "",
  });

  const { showAlert } = useAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const products = [
    { value: "1", label: "Paracetamol 500mg" },
    { value: "2", label: "Surgical Gloves" },
    { value: "3", label: "Syringes 5ml" },
  ];

  const {
    grns,
    loading,
    statistics,
    refreshGrns,
    saveGrn,
    deleteGrn,
    approveGrn,
    bulkApproveGrns,
    bulkDeleteGrns,
    bulkHideGrns,
    hideGrn,
    unhideGrn,
    getGrnById,
    exportGrnToExcel,
    exportMultipleGrnsToExcel,
    downloadExcelTemplate,
  } = useEnhancedGRN();

  useEffect(() => {
    refreshGrns();
  }, [refreshGrns]);

  useEffect(() => {
    if (!isDepartmentSelected && !isDialogOpen) {
      openDialog();
    }
  }, [isDepartmentSelected, isDialogOpen, openDialog]);

  useEffect(() => {
    if (!isDepartmentSelected && !isDialogOpen) {
      openDialog();
    }
  }, [isDepartmentSelected, isDialogOpen, openDialog]);

  useEffect(() => {
    if (isDepartmentSelected && deptId) {
      handleRefresh();
    }
  }, [isDepartmentSelected, deptId]);

  const enhancedGrns = useMemo((): EnhancedGRNDto[] => {
    if (!grns || !Array.isArray(grns) || grns.length === 0) {
      return [];
    }
    return grns.map((grn) => {
      const totalItems = grn.grnDetails?.length || 0;
      const totalValue = grn.netTot || grn.tot || 0;
      const pendingApproval = grn.grnApprovedYN !== "Y";
      const grnDate = dayjs(grn.grnDate);
      const daysOld = dayjs().diff(grnDate, "days");
      const isOverdue = daysOld > 7 && pendingApproval;
      let statusColor: "success" | "warning" | "error" | "info" | "default" = "default";
      if (grn.grnApprovedYN === "Y") {
        statusColor = "success";
      } else if (isOverdue) {
        statusColor = "error";
      } else if (daysOld > 3) {
        statusColor = "warning";
      } else {
        statusColor = "info";
      }
      let qualityStatus = "pending";
      if (grn.qualityCheckYN === "Y") {
        qualityStatus = "completed";
      }
      return {
        ...grn,
        totalItems,
        totalValue: formatCurrency(totalValue, "INR", "en-IN"),
        pendingApproval,
        supplierDisplay: grn.supplrName || `Supplier ${grn.supplrID}`,
        departmentDisplay: grn.deptName || `Department ${grn.deptID}`,
        statusColor,
        daysOld,
        isOverdue,
        formattedGrnDate: dayjs(grn.grnDate).format("DD/MM/YYYY"),
        formattedInvDate: dayjs(grn.invDate).format("DD/MM/YYYY"),
        qualityStatus,
      };
    });
  }, [grns]);

  const filteredGrns = useMemo(() => {
    let filtered = [...enhancedGrns];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (grn) =>
          (grn.grnCode && grn.grnCode.toLowerCase().includes(searchLower)) ||
          (grn.invoiceNo && grn.invoiceNo.toLowerCase().includes(searchLower)) ||
          (grn.supplrName && grn.supplrName.toLowerCase().includes(searchLower)) ||
          (grn.deptName && grn.deptName.toLowerCase().includes(searchLower)) ||
          (grn.dcNo && grn.dcNo.toLowerCase().includes(searchLower)) ||
          (grn.poNo && grn.poNo.toLowerCase().includes(searchLower))
      );
    }

    if (filters.grnStatus !== "all") {
      if (filters.grnStatus === "approved") {
        filtered = filtered.filter((grn) => grn.grnApprovedYN === "Y");
      } else if (filters.grnStatus === "pending") {
        filtered = filtered.filter((grn) => grn.grnApprovedYN !== "Y");
      } else if (filters.grnStatus === "overdue") {
        filtered = filtered.filter((grn) => grn.isOverdue);
      }
    }
    if (filters.departmentID !== "all") {
      filtered = filtered.filter((grn) => grn.deptID.toString() === filters.departmentID);
    }
    if (filters.supplierID !== "all") {
      filtered = filtered.filter((grn) => grn.supplrID.toString() === filters.supplierID);
    }
    if (filters.grnType !== "all") {
      filtered = filtered.filter((grn) => grn.grnType === filters.grnType);
    }
    if (filters.hideStatus === "hidden") {
      filtered = filtered.filter((grn) => grn.hideYN === "Y");
    } else if (filters.hideStatus === "show") {
      filtered = filtered.filter((grn) => grn.hideYN !== "Y");
    }
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((grn) => {
        const grnDate = dayjs(grn.grnDate);
        return grnDate.isAfter(dayjs(filters.startDate).subtract(1, "day")) && grnDate.isBefore(dayjs(filters.endDate).add(1, "day"));
      });
    }
    if (filters.amountFrom) {
      filtered = filtered.filter((grn) => (grn.netTot || grn.tot || 0) >= Number(filters.amountFrom));
    }
    if (filters.amountTo) {
      filtered = filtered.filter((grn) => (grn.netTot || grn.tot || 0) <= Number(filters.amountTo));
    }

    return filtered;
  }, [enhancedGrns, searchTerm, filters]);

  const handleRefresh = useCallback(async () => {
    setSearchTerm("");
    setFilters({
      dateFilterType: "all",
      startDate: null,
      endDate: null,
      supplierID: "all",
      departmentID: "all",
      invoiceNo: "",
      grnCode: "",
      grnStatus: "all",
      approvedStatus: "all",
      grnType: "all",
      hideStatus: "show",
      qualityStatus: "all",
      amountFrom: "",
      amountTo: "",
    });
    setSelectedRows([]);
    await refreshGrns();
  }, [refreshGrns]);

  const handleNewGrn = useCallback(() => {
    setSelectedGrn(null);
    setIsGrnFormOpen(true);
  }, []);

  const handleEditGrn = useCallback(
    async (grn: GRNWithAllDetailsDto) => {
      try {
        const fullGrnDetails = await getGrnById(grn.grnID);
        if (fullGrnDetails) {
          setSelectedGrn(fullGrnDetails);
          setIsGrnFormOpen(true);
        } else {
          showAlert("Error", "Could not fetch complete GRN details. Please try again.", "error");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while fetching GRN details.", "error");
      }
    },
    [getGrnById, showAlert]
  );

  const handleViewDetails = useCallback(
    async (grn: EnhancedGRNDto) => {
      try {
        const fullGrnDetails = await getGrnById(grn.grnID);
        if (fullGrnDetails) {
          setSelectedGrn(fullGrnDetails);
          setIsDetailsDialogOpen(true);
        } else {
          showAlert("Error", "Could not fetch complete GRN details. Please try again.", "error");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while fetching GRN details.", "error");
      }
    },
    [getGrnById, showAlert]
  );

  const handleCopyGrn = useCallback(
    async (grn: EnhancedGRNDto) => {
      try {
        const fullGrnDetails = await getGrnById(grn.grnID);
        if (!fullGrnDetails) {
          showAlert("Error", "Could not fetch complete GRN details. Please try again.", "error");
          return;
        }

        const copiedGrn: GRNWithAllDetailsDto = {
          ...fullGrnDetails,
          grnID: 0,
          grnCode: "",
          invoiceNo: `${fullGrnDetails.invoiceNo} (Copy)`,
          grnDate: new Date().toISOString(),
          grnApprovedYN: "N",
          grnApprovedBy: "",
          grnApprovedID: 0,
          grnStatus: "Pending",
          grnStatusCode: "PEND",
          hideYN: "N",
          grnDetails:
            fullGrnDetails.grnDetails?.map((detail) => ({
              ...detail,
              grnDetID: 0,
              grnID: 0,
            })) || [],
        };

        setSelectedGrn(copiedGrn);
        setIsGrnFormOpen(true);
      } catch (error) {
        showAlert("Error", "Failed to copy GRN", "error");
      }
    },
    [getGrnById, showAlert]
  );

  const handleGrnSubmit = useCallback(
    async (grnData: GRNWithAllDetailsDto) => {
      try {
        await saveGrn(grnData);
        setIsGrnFormOpen(false);
        setSelectedGrn(null);
        await refreshGrns();
      } catch (error) {}
    },
    [saveGrn, refreshGrns]
  );

  const handleDeleteGrn = useCallback(
    async (grnId: number) => {
      try {
        await deleteGrn(grnId);
        await refreshGrns();
      } catch (error) {}
    },
    [deleteGrn, refreshGrns]
  );

  const handleApproveGrn = useCallback(
    async (grnId: number) => {
      try {
        await approveGrn(grnId);
        showAlert("Success", "GRN approved and stock updated successfully", "success");
      } catch (error) {}
    },
    [approveGrn, showAlert]
  );

  const handleHideGrn = useCallback(
    async (grnId: number) => {
      try {
        await hideGrn(grnId);
      } catch (error) {}
    },
    [hideGrn]
  );

  const handleUnhideGrn = useCallback(
    async (grnId: number) => {
      try {
        await unhideGrn(grnId);
      } catch (error) {}
    },
    [unhideGrn]
  );

  // Bulk Operations
  const handleBulkApprove = useCallback(async () => {
    if (selectedRows.length === 0) {
      showAlert("Warning", "Please select GRNs to approve", "warning");
      return;
    }
    try {
      await bulkApproveGrns(selectedRows);
      setSelectedRows([]);
      setIsBulkActionsOpen(false);
    } catch (error) {}
  }, [selectedRows, bulkApproveGrns, showAlert]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedRows.length === 0) {
      showAlert("Warning", "Please select GRNs to delete", "warning");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} GRNs?`)) {
      try {
        await bulkDeleteGrns(selectedRows);
        setSelectedRows([]);
        setIsBulkActionsOpen(false);
      } catch (error) {}
    }
  }, [selectedRows, bulkDeleteGrns, showAlert]);

  const handleBulkHide = useCallback(async () => {
    if (selectedRows.length === 0) {
      showAlert("Warning", "Please select GRNs to hide", "warning");
      return;
    }
    try {
      await bulkHideGrns(selectedRows);
      setSelectedRows([]);
      setIsBulkActionsOpen(false);
    } catch (error) {}
  }, [selectedRows, bulkHideGrns, showAlert]);

  const handleBulkExport = useCallback(async () => {
    if (selectedRows.length === 0) {
      showAlert("Warning", "Please select GRNs to export", "warning");
      return;
    }
    try {
      await exportMultipleGrnsToExcel(selectedRows);
      setSelectedRows([]);
      setIsExportDialogOpen(false);
    } catch (error) {}
  }, [selectedRows, exportMultipleGrnsToExcel, showAlert]);

  const handleExcelUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      showAlert("Info", "Excel upload functionality will process the file and create GRNs", "info");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [showAlert]
  );

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await downloadExcelTemplate();
    } catch (error) {}
  }, [downloadExcelTemplate]);

  // Grid Columns Definition
  const columns: Column<EnhancedGRNDto>[] = [
    {
      key: "select",
      header: "",
      visible: true,
      sortable: false,
      width: 50,
      render: (grn) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(grn.grnID)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows((prev) => [...prev, grn.grnID]);
            } else {
              setSelectedRows((prev) => prev.filter((id) => id !== grn.grnID));
            }
          }}
        />
      ),
    },
    {
      key: "grnInfo",
      header: "GRN Information",
      visible: true,
      sortable: true,
      width: 220,
      render: (grn) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" color="primary">
            {grn.grnCode || "Pending"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Type: {grn.grnType} | {grn.formattedGrnDate}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Created: {grn.rCreatedBy} | {dayjs(grn.rCreatedDate).format("DD/MM/YY")}
          </Typography>
        </Box>
      ),
    },
    {
      key: "invoice",
      header: "Invoice Details",
      visible: true,
      sortable: true,
      width: 180,
      render: (grn) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {grn.invoiceNo}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Date: {grn.formattedInvDate}
          </Typography>
          {grn.dcNo && (
            <Typography variant="caption" color="text.secondary" display="block">
              DC: {grn.dcNo}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      visible: true,
      sortable: true,
      width: 200,
      render: (grn) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
            <SupplierIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
            {grn.supplierDisplay}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            ID: {grn.supplrID}
          </Typography>
        </Box>
      ),
    },
    {
      key: "department",
      header: "Department",
      visible: true,
      sortable: true,
      width: 180,
      render: (grn) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
            <DeptIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
            {grn.departmentDisplay}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {grn.deptID}
          </Typography>
        </Box>
      ),
    },
    {
      key: "items",
      header: "Items & Qty",
      visible: true,
      sortable: true,
      width: 120,
      render: (grn) => (
        <Box textAlign="center">
          <Typography variant="body2" fontWeight="bold" color="primary">
            {grn.totalItems}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            items
          </Typography>
        </Box>
      ),
    },
    {
      key: "financial",
      header: "Financial",
      visible: true,
      sortable: true,
      width: 150,
      render: (grn) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" color="success.main">
            {grn.totalValue}
          </Typography>
          {grn.disc && grn.disc > 0 && (
            <Typography variant="caption" color="warning.main">
              Disc: {formatCurrency(grn.disc, "INR", "en-IN")}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 140,
      render: (grn) => (
        <Stack spacing={0.5}>
          <Chip
            label={grn.grnApprovedYN === "Y" ? "Approved" : "Pending"}
            size="small"
            color={grn.statusColor}
            variant="filled"
            icon={grn.grnApprovedYN === "Y" ? <ApproveIcon /> : <WarningIcon />}
          />
          {grn.isOverdue && <Chip label="Overdue" size="small" color="error" variant="outlined" />}
          {grn.hideYN === "Y" && <Chip label="Hidden" size="small" color="default" variant="outlined" />}
        </Stack>
      ),
    },
    {
      key: "quality",
      header: "Quality",
      visible: true,
      sortable: false,
      width: 100,
      render: (grn) => (
        <Chip
          label={grn.qualityCheckYN === "Y" ? "Done" : "Pending"}
          size="small"
          color={grn.qualityCheckYN === "Y" ? "success" : "warning"}
          variant="outlined"
          icon={<QualityIcon />}
        />
      ),
    },
    {
      key: "po",
      header: "PO Details",
      visible: true,
      sortable: false,
      width: 150,
      render: (grn) => (
        <Box>
          {grn.poNo ? (
            <>
              <Typography variant="body2" fontWeight="medium">
                {grn.poNo}
              </Typography>
              {grn.poDate && (
                <Typography variant="caption" color="text.secondary">
                  {dayjs(grn.poDate).format("DD/MM/YYYY")}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No PO
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 200,
      render: (grn) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={(event) => {
                event.stopPropagation();
                handleViewDetails(grn);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {grn.grnApprovedYN !== "Y" && (
            <Tooltip title="Edit GRN">
              <IconButton
                size="small"
                color="secondary"
                onClick={(event) => {
                  event.stopPropagation();
                  handleEditGrn(grn);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Copy GRN">
            <IconButton
              size="small"
              color="info"
              onClick={(event) => {
                event.stopPropagation();
                handleCopyGrn(grn);
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {grn.grnApprovedYN !== "Y" && (
            <Tooltip title="Approve GRN">
              <IconButton
                size="small"
                color="success"
                onClick={(event) => {
                  event.stopPropagation();
                  handleApproveGrn(grn.grnID);
                }}
              >
                <ApproveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={grn.hideYN === "Y" ? "Unhide" : "Hide"}>
            <IconButton
              size="small"
              color="warning"
              onClick={(event) => {
                event.stopPropagation();
                if (grn.hideYN === "Y") {
                  handleUnhideGrn(grn.grnID);
                } else {
                  handleHideGrn(grn.grnID);
                }
              }}
            >
              {grn.hideYN === "Y" ? <ViewIcon fontSize="small" /> : <HideIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Export to Excel">
            <IconButton
              size="small"
              color="default"
              onClick={(event) => {
                event.stopPropagation();
                exportGrnToExcel(grn.grnID);
              }}
            >
              <ExportIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {isDepartmentSelected && (
        <>
          {/* Header with Statistics */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
              <GrnIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Goods Received Notes Management
            </Typography>
            <Stack direction="row" spacing={1}>
              <CustomButton variant="contained" icon={AddIcon} text="New GRN" onClick={handleNewGrn} color="primary" />
              <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={handleRefresh} asynchronous />
            </Stack>
          </Box>

          {/* Statistics Dashboard */}
          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, md: 2 }}>
              <Card sx={{ borderLeft: "4px solid #1976d2", height: "100%" }}>
                <CardContent sx={{ textAlign: "center", p: 2 }}>
                  <DashboardIcon sx={{ fontSize: 32, color: "#1976d2", mb: 1 }} />
                  <Typography variant="h5" color="#1976d2" fontWeight="bold">
                    {statistics.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total GRNs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Card sx={{ borderLeft: "4px solid #4caf50", height: "100%" }}>
                <CardContent sx={{ textAlign: "center", p: 2 }}>
                  <ApproveIcon sx={{ fontSize: 32, color: "#4caf50", mb: 1 }} />
                  <Typography variant="h5" color="#4caf50" fontWeight="bold">
                    {statistics.approved}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Approved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Card sx={{ borderLeft: "4px solid #ff9800", height: "100%" }}>
                <CardContent sx={{ textAlign: "center", p: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 32, color: "#ff9800", mb: 1 }} />
                  <Typography variant="h5" color="#ff9800" fontWeight="bold">
                    {statistics.pending}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Card sx={{ borderLeft: "4px solid #f44336", height: "100%" }}>
                <CardContent sx={{ textAlign: "center", p: 2 }}>
                  <WarningIcon sx={{ fontSize: 32, color: "#f44336", mb: 1 }} />
                  <Typography variant="h5" color="#f44336" fontWeight="bold">
                    {statistics.overdue}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Overdue
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Card sx={{ borderLeft: "4px solid #9e9e9e", height: "100%" }}>
                <CardContent sx={{ textAlign: "center", p: 2 }}>
                  <HideIcon sx={{ fontSize: 32, color: "#9e9e9e", mb: 1 }} />
                  <Typography variant="h5" color="#9e9e9e" fontWeight="bold">
                    {statistics.hidden}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hidden
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Card sx={{ borderLeft: "4px solid #9c27b0", height: "100%" }}>
                <CardContent sx={{ textAlign: "center", p: 2 }}>
                  <TrendingIcon sx={{ fontSize: 32, color: "#9c27b0", mb: 1 }} />
                  <Typography variant="h4" color="#9c27b0" fontWeight="bold" fontSize="1.5rem">
                    {formatCurrency(statistics.totalValue, "INR", "en-IN")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Advanced Toolbar */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search GRNs (Code, Invoice, Supplier, Department)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </Grid>

              {/* View Mode Toggle */}
              <Grid size={{ xs: 12, md: 3 }}>
                <ToggleButtonGroup value={viewMode} exclusive onChange={(_, newMode) => newMode && setViewMode(newMode)} size="small">
                  <ToggleButton value="grid">Grid</ToggleButton>
                  <ToggleButton value="cards">Cards</ToggleButton>
                  <ToggleButton value="detailed">Detailed</ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {/* Quick Filters */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Stack direction="row" spacing={1}>
                  <CustomButton variant="outlined" icon={FilterIcon} text="Advanced Filter" onClick={() => setIsFilterDrawerOpen(true)} size="small" />
                  <CustomButton
                    variant="outlined"
                    icon={selectedRows.length > 0 ? SelectAllIcon : UnselectAllIcon}
                    text={`Bulk (${selectedRows.length})`}
                    onClick={() => setIsBulkActionsOpen(true)}
                    size="small"
                    disabled={selectedRows.length === 0}
                  />
                </Stack>
              </Grid>

              {/* Action Buttons */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Stack direction="row" spacing={1}>
                  <CustomButton variant="outlined" icon={UploadIcon} text="Upload" onClick={() => fileInputRef.current?.click()} size="small" />
                  <CustomButton variant="outlined" icon={DownloadIcon} text="Template" onClick={handleDownloadTemplate} size="small" />
                  <CustomButton variant="outlined" icon={ExportIcon} text="Export" onClick={() => setIsExportDialogOpen(true)} size="small" />
                  <CustomButton variant="outlined" icon={ReportIcon} text="Reports" onClick={() => setIsReportsDialogOpen(true)} size="small" />
                </Stack>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {(filters.grnStatus !== "all" || filters.departmentID !== "all" || filters.supplierID !== "all") && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Filters:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {filters.grnStatus !== "all" && (
                    <Chip label={`Status: ${filters.grnStatus}`} size="small" onDelete={() => setFilters((prev) => ({ ...prev, grnStatus: "all" }))} />
                  )}
                  {filters.departmentID !== "all" && (
                    <Chip
                      label={`Dept: ${department.find((d) => d.value === filters.departmentID)?.label}`}
                      size="small"
                      onDelete={() => setFilters((prev) => ({ ...prev, departmentID: "all" }))}
                    />
                  )}
                  {filters.supplierID !== "all" && (
                    <Chip
                      label={`Supplier: ${suppliers.find((s) => s.value === filters.supplierID)?.label}`}
                      size="small"
                      onDelete={() => setFilters((prev) => ({ ...prev, supplierID: "all" }))}
                    />
                  )}
                </Stack>
              </Box>
            )}
          </Paper>

          {/* Results Summary */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredGrns.length} of {statistics.total} GRNs
              {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
            </Typography>

            {selectedRows.length > 0 && (
              <Stack direction="row" spacing={1}>
                <CustomButton variant="text" text="Select All" onClick={() => setSelectedRows(filteredGrns.map((g) => g.grnID))} size="small" />
                <CustomButton variant="text" text="Clear Selection" onClick={() => setSelectedRows([])} size="small" />
              </Stack>
            )}
          </Box>

          {/* GRN List/Grid */}
          <Paper sx={{ p: 2 }}>
            <CustomGrid
              columns={columns}
              data={filteredGrns}
              loading={loading}
              maxHeight="600px"
              emptyStateMessage="No GRNs found matching your criteria"
              rowKeyField="grnID"
              density="medium"
              showDensityControls
              onRowClick={handleViewDetails}
            />
          </Paper>

          {/* Hidden File Input */}
          <input type="file" ref={fileInputRef} onChange={handleExcelUpload} accept=".xlsx,.xls" style={{ display: "none" }} />

          {/* Filter Drawer */}
          <Drawer anchor="right" open={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} sx={{ "& .MuiDrawer-paper": { width: 400, p: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Advanced Filters
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filters.grnStatus} onChange={(e) => setFilters((prev) => ({ ...prev, grnStatus: e.target.value }))}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={filters.departmentID} onChange={(e) => setFilters((prev) => ({ ...prev, departmentID: e.target.value }))}>
                  <MenuItem value="all">All Departments</MenuItem>
                  {department.map((dept) => (
                    <MenuItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Supplier</InputLabel>
                <Select value={filters.supplierID} onChange={(e) => setFilters((prev) => ({ ...prev, supplierID: e.target.value }))}>
                  <MenuItem value="all">All Suppliers</MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.value} value={supplier.value}>
                      {supplier.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>GRN Type</InputLabel>
                <Select value={filters.grnType} onChange={(e) => setFilters((prev) => ({ ...prev, grnType: e.target.value }))}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="Invoice">Invoice</MenuItem>
                  <MenuItem value="DC">Delivery Challan</MenuItem>
                  <MenuItem value="PO">Purchase Order</MenuItem>
                  <MenuItem value="Return">Return</MenuItem>
                </Select>
              </FormControl>

              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => setFilters((prev) => ({ ...prev, startDate: date }))}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />

              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => setFilters((prev) => ({ ...prev, endDate: date }))}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Amount From"
                    type="number"
                    size="small"
                    fullWidth
                    value={filters.amountFrom}
                    onChange={(e) => setFilters((prev) => ({ ...prev, amountFrom: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Amount To"
                    type="number"
                    size="small"
                    fullWidth
                    value={filters.amountTo}
                    onChange={(e) => setFilters((prev) => ({ ...prev, amountTo: e.target.value }))}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth size="small">
                <InputLabel>Visibility</InputLabel>
                <Select value={filters.hideStatus} onChange={(e) => setFilters((prev) => ({ ...prev, hideStatus: e.target.value }))}>
                  <MenuItem value="show">Show Visible</MenuItem>
                  <MenuItem value="hidden">Show Hidden</MenuItem>
                  <MenuItem value="all">Show All</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <CustomButton variant="contained" text="Apply Filters" onClick={() => setIsFilterDrawerOpen(false)} />
                <CustomButton
                  variant="outlined"
                  text="Clear All Filters"
                  onClick={() => {
                    setFilters({
                      dateFilterType: "all",
                      startDate: null,
                      endDate: null,
                      supplierID: "all",
                      departmentID: "all",
                      invoiceNo: "",
                      grnCode: "",
                      grnStatus: "all",
                      approvedStatus: "all",
                      grnType: "all",
                      hideStatus: "show",
                      qualityStatus: "all",
                      amountFrom: "",
                      amountTo: "",
                    });
                    setIsFilterDrawerOpen(false);
                  }}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>
          </Drawer>

          {/* Bulk Actions Dialog */}
          <Dialog open={isBulkActionsOpen} onClose={() => setIsBulkActionsOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Bulk Actions ({selectedRows.length} items selected)</DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <CustomButton variant="outlined" icon={ApproveIcon} text="Approve Selected GRNs" onClick={handleBulkApprove} color="success" />
                <CustomButton variant="outlined" icon={HideIcon} text="Hide Selected GRNs" onClick={handleBulkHide} color="warning" />
                <CustomButton variant="outlined" icon={ExportIcon} text="Export Selected GRNs" onClick={handleBulkExport} color="info" />
                <CustomButton variant="outlined" icon={DeleteIcon} text="Delete Selected GRNs" onClick={handleBulkDelete} color="error" />
              </Stack>
            </DialogContent>
            <DialogActions>
              <CustomButton variant="outlined" text="Close" onClick={() => setIsBulkActionsOpen(false)} />
            </DialogActions>
          </Dialog>
        </>
      )}

      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelect} initialDeptId={deptId} requireSelection={true} />

      {/* Main Dialogs */}
      <ComprehensiveGrnFormDialog
        open={isGrnFormOpen}
        onClose={() => {
          setIsGrnFormOpen(false);
          setSelectedGrn(null);
        }}
        onSubmit={handleGrnSubmit}
        grn={selectedGrn}
        departments={department}
        suppliers={suppliers}
        products={products}
      />

      <GrnDetailsDialog
        open={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedGrn(null);
        }}
        grn={selectedGrn}
        mode="edit"
        onEdit={handleEditGrn}
        onDelete={handleDeleteGrn}
        onApprove={handleApproveGrn}
      />
    </Box>
  );
};

export default ComprehensiveGRNManagementPage;
