import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import useContactMastByCategory from "@/hooks/hospitalAdministration/useContactMastByCategory";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GrnMastDto, GrnSearchRequest } from "@/interfaces/InventoryManagement/GRNDto";
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
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import GrnDetailsDialog from "../Form/GrnDetailsDialog";
import ComprehensiveGrnFormDialog from "../Form/GrnFormDailogue";
import { useGrn } from "../hooks/useGrnhooks";

// Enhanced DTO combining properties for a richer UI
// interface GrnMastDto extends GrnMastDto {
//   totalItems: number;
//   totalValue: string;
//   totalValueNumeric: number;
//   supplierDisplay: string;
//   departmentDisplay: string;
//   statusColor: "success" | "warning" | "error" | "info" | "default";
//   daysOld: number;
//   isOverdue: boolean;
//   formattedGrnDate: string;
//   formattedInvDate: string;
// }

// Comprehensive state for the filter drawer
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
}

const ComprehensiveGRNManagementPage: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrn, setSelectedGrn] = useState<GrnMastDto | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isGrnFormOpen, setIsGrnFormOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; grnID: number | null }>({ open: false, grnID: null });
  const [statistics, setStatistics] = useState({ total: 0, approved: 0, pending: 0, overdue: 0, hidden: 0, totalValue: 0 });
  const [viewMode, setViewMode] = useState<"grid" | "cards" | "detailed">("grid");

  const [filters, setFilters] = useState<FilterState>({
    startDate: null,
    endDate: null,
    supplierID: "all",
    invoiceNo: "",
    grnCode: "",
    grnStatus: "all",
    approvedStatus: "all",
    grnType: "all",
    hideStatus: "show",
    amountFrom: "",
    amountTo: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HOOKS ---
  const { showAlert } = useAlert();
  const { deptId, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect } = useDepartmentSelection({});
  const { department: departments } = useDropdownValues(["department"]);
  const { contacts: suppliers } = useContactMastByCategory({ consValue: "SUP" });

  // Use the existing useGrn hook
  const { grnList, isLoading, error, fetchGrnList, getGrnById, createGrn, approveGrn, deleteGrn, refreshGrnList, canEditGrn, canDeleteGrn, getGrnStatusColor } = useGrn();

  // --- DATA FETCHING & DERIVED STATE ---
  useEffect(() => {
    if (isDepartmentSelected && deptId) {
      fetchGrnList({ departmentID: deptId });
    }
  }, [isDepartmentSelected, deptId, fetchGrnList]);

  useEffect(() => {
    if (!isDepartmentSelected && !isDialogOpen) {
      openDialog();
    }
  }, [isDepartmentSelected, isDialogOpen, openDialog]);

  const enhancedGrns = useMemo((): GrnMastDto[] => {
    return grnList.map((grn) => {
      const pendingApproval = grn.grnApprovedYN !== "Y";
      const grnDate = dayjs(grn.grnDate);
      const daysOld = dayjs().diff(grnDate, "days");
      const totalValue = grn.netTot || 0;

      return {
        ...grn,
        totalItems: grn.grnDetails?.length || 0,
        totalValue: formatCurrency(totalValue, "INR", "en-IN"),
        totalValueNumeric: totalValue,
        supplierDisplay: grn.supplrName || `Supplier #${grn.supplrID}`,
        departmentDisplay: grn.deptName || `Dept #${grn.deptID}`,
        statusColor: getGrnStatusColor(grn),
        daysOld,
        isOverdue: daysOld > 7 && pendingApproval,
        formattedGrnDate: grnDate.format("DD/MM/YYYY"),
        formattedInvDate: dayjs(grn.InvDate).format("DD/MM/YYYY"),
      };
    });
  }, [grnList, getGrnStatusColor]);

  // Combine server-side base query with client-side filtering
  const filteredAndSearchedGrns = useMemo(() => {
    let filtered = [...enhancedGrns];

    // Client-side search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (grn) =>
          grn.grnCode?.toLowerCase().includes(searchLower) ||
          grn.invoiceNo?.toLowerCase().includes(searchLower) ||
          grn.supplrName?.toLowerCase().includes(searchLower) ||
          grn.deptName?.toLowerCase().includes(searchLower)
      );
    }

    // Client-side filters for criteria not supported by the backend search
    if (filters.grnType !== "all") {
      filtered = filtered.filter((grn) => grn.GrnType === filters.grnType);
    }
    if (filters.hideStatus === "hidden") {
      filtered = filtered.filter((grn) => grn.HideYN === "Y");
    } else if (filters.hideStatus === "show") {
      filtered = filtered.filter((grn) => grn.HideYN !== "Y");
    }
    if (filters.amountFrom) {
      filtered = filtered.filter((grn) => grn.totalValueNumeric >= Number(filters.amountFrom));
    }
    if (filters.amountTo) {
      filtered = filtered.filter((grn) => grn.totalValueNumeric <= Number(filters.amountTo));
    }

    return filtered;
  }, [enhancedGrns, searchTerm, filters]);

  useEffect(() => {
    const total = enhancedGrns.length;
    const approved = enhancedGrns.filter((g) => g.GrnApprovedYN === "Y").length;
    const pending = total - approved;
    const overdue = enhancedGrns.filter((g) => g.isOverdue).length;
    const hidden = enhancedGrns.filter((g) => g.HideYN === "Y").length;
    const totalValue = enhancedGrns.reduce((sum, g) => sum + g.totalValueNumeric, 0);

    setStatistics({ total, approved, pending, overdue, hidden, totalValue });
  }, [enhancedGrns]);

  // --- EVENT HANDLERS ---

  const handleApplyFilters = useCallback(() => {
    const searchRequest: GrnSearchRequest = {
      departmentID: deptId,
      startDate: filters.startDate ? filters.startDate.toISOString() : undefined,
      endDate: filters.endDate ? filters.endDate.toISOString() : undefined,
      supplierID: filters.supplierID !== "all" ? Number(filters.supplierID) : undefined,
      approvedStatus: filters.approvedStatus !== "all" ? (filters.approvedStatus === "Y" ? "Y" : "N") : undefined,
      grnCode: filters.grnCode || undefined,
      invoiceNo: filters.invoiceNo || undefined,
    };
    fetchGrnList(searchRequest);
    setIsFilterDrawerOpen(false);
  }, [filters, deptId, fetchGrnList]);

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
      hideStatus: "show",
      amountFrom: "",
      amountTo: "",
    });
    // Refetch with only the department filter
    if (deptId) fetchGrnList({ departmentID: deptId });
    setIsFilterDrawerOpen(false);
  }, [deptId, fetchGrnList]);

  const handleRefresh = useCallback(async () => {
    setSearchTerm("");
    handleClearFilters();
    setSelectedRows([]);
    await refreshGrnList();
  }, [handleClearFilters, refreshGrnList]);

  const handleNewGrn = useCallback(() => {
    setSelectedGrn(null);
    setIsGrnFormOpen(true);
  }, []);

  const handleEditGrn = useCallback(
    async (grn: GrnMastDto) => {
      if (!canEditGrn(grn)) {
        showAlert("Warning", "This GRN is approved and cannot be edited.", "warning");
        return;
      }
      const fullGrnDetails = await getGrnById(grn.grnID);
      if (fullGrnDetails) {
        setSelectedGrn(fullGrnDetails);
        setIsGrnFormOpen(true);
      }
    },
    [getGrnById, canEditGrn, showAlert]
  );

  const handleViewDetails = useCallback(
    async (grn: GrnMastDto) => {
      const fullGrnDetails = await getGrnById(grn.grnID);
      if (fullGrnDetails) {
        setSelectedGrn(fullGrnDetails);
        setIsDetailsDialogOpen(true);
      }
    },
    [getGrnById]
  );

  const handleCopyGrn = useCallback(
    async (grnToCopy: GrnMastDto) => {
      const fullGrnDetails = await getGrnById(grnToCopy.grnID);
      if (!fullGrnDetails) return;

      const copiedGrn: GrnMastDto = {
        ...fullGrnDetails,
        grnID: 0,
        grnCode: "", // Will be generated on save
        InvoiceNo: `${fullGrnDetails.InvoiceNo} (Copy)`,
        GrnApprovedYN: "N",
        GrnStatus: "Pending",
        GrnStatusCode: "PENDING",
        HideYN: "N",
        GrnDetails: fullGrnDetails.GrnDetails?.map((d) => ({ ...d, GrnDetID: 0, grnID: 0 })) || [],
      };
      setSelectedGrn(copiedGrn);
      setIsGrnFormOpen(true);
    },
    [getGrnById]
  );

  const handleGrnSubmit = useCallback(
    async (grnData: GrnMastDto) => {
      const result = await createGrn(grnData);
      if (result.success) {
        setIsGrnFormOpen(false);
        setSelectedGrn(null);
        await refreshGrnList();
      }
    },
    [createGrn, refreshGrnList]
  );

  const handleApproveGrn = useCallback(
    async (grnID: number) => {
      await approveGrn(grnID);
      await refreshGrnList();
    },
    [approveGrn, refreshGrnList]
  );

  const handleDeleteClick = (grnID: number) => {
    const grn = grnList.find((g) => g.grnID === grnID);
    if (grn && canDeleteGrn(grn)) {
      setDeleteConfirmation({ open: true, grnID });
    } else {
      showAlert("Warning", "Approved or processed GRNs cannot be deleted.", "warning");
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.grnID) {
      await deleteGrn(deleteConfirmation.grnID);
      setDeleteConfirmation({ open: false, grnID: null });
      // The hook handles optimistic updates, no extra refresh needed unless desired
    }
  };

  // --- BULK ACTION HANDLERS ---
  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) return;
    showAlert("Info", `Approving ${selectedRows.length} GRNs...`, "info");
    const unapprovedRows = selectedRows.filter((id) => {
      const grn = grnList.find((g) => g.grnID === id);
      return grn && grn.GrnApprovedYN !== "Y";
    });

    await Promise.all(unapprovedRows.map((id) => approveGrn(id)));
    showAlert("Success", `${unapprovedRows.length} GRNs approved successfully.`, "success");
    setSelectedRows([]);
    setIsBulkActionsOpen(false);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} selected GRNs? This action cannot be undone.`)) {
      const deletableRows = selectedRows.filter((id) => {
        const grn = grnList.find((g) => g.grnID === id);
        return grn && canDeleteGrn(grn);
      });
      if (deletableRows.length < selectedRows.length) {
        showAlert("Warning", `${selectedRows.length - deletableRows.length} GRNs are approved and cannot be deleted.`, "warning");
      }
      await Promise.all(deletableRows.map((id) => deleteGrn(id)));
      setSelectedRows([]);
      setIsBulkActionsOpen(false);
    }
  };

  const handleUnsupportedBulkAction = (action: string) => {
    showAlert("Info", `Bulk ${action} is not available in the current implementation.`, "info");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) showAlert("Info", `File "${file.name}" selected. (Upload feature not implemented)`, "info");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const columns: Column<GrnMastDto>[] = [
    {
      key: "select",
      header: "",
      visible: true,
      sortable: false,
      width: 50,
      render: (grn: GrnMastDto) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(grn.grnID)}
          onChange={(e) => {
            e.stopPropagation();
            setSelectedRows((prev) => (e.target.checked ? [...prev, grn.grnID] : prev.filter((id) => id !== grn.grnID)));
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
      render: (grn: GrnMastDto) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" color="primary">
            {grn.grnCode || "Pending"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Type: {grn.GrnType} | {grn.formattedGrnDate}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Created: {grn.RCreatedBy}
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
      render: (grn: GrnMastDto) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {grn.invoiceNo}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Date: {grn.formattedInvDate}
          </Typography>
        </Box>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      visible: true,
      sortable: true,
      width: 200,
      render: (grn: GrnMastDto) => (
        <Typography variant="body2" fontWeight="medium">
          <SupplierIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
          {grn.supplrName}
        </Typography>
      ),
    },
    {
      key: "department",
      header: "Department",
      visible: true,
      sortable: true,
      width: 180,
      render: (grn) => (
        <Typography variant="body2">
          <DeptIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
          {grn.deptName}
        </Typography>
      ),
    },
    {
      key: "financial",
      header: "Value",
      visible: true,
      sortable: true,
      width: 150,
      render: (grn) => (
        <Typography variant="body2" fontWeight="medium" color="success.main">
          {grn.tot}
        </Typography>
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
            label={grn.GrnApprovedYN === "Y" ? "Approved" : "Pending"}
            size="small"
            color={getGrnStatusColor(grn)}
            variant="filled"
            icon={grn.GrnApprovedYN === "Y" ? <ApproveIcon /> : <WarningIcon />}
          />
          {grn.isOverdue && <Chip label="Overdue" size="small" color="error" variant="outlined" />}
          {grn.HideYN === "Y" && <Chip label="Hidden" size="small" color="default" variant="outlined" />}
        </Stack>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 200,
      render: (grn: GrnMastDto) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(grn);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canEditGrn(grn) && (
            <Tooltip title="Edit GRN">
              <IconButton
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
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
              onClick={(e) => {
                e.stopPropagation();
                handleCopyGrn(grn);
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {grn.GrnApprovedYN !== "Y" && (
            <Tooltip title="Approve GRN">
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveGrn(grn.grnID);
                }}
              >
                <ApproveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={grn.HideYN === "Y" ? "Unhide (Not Implemented)" : "Hide (Not Implemented)"}>
            <span>
              <IconButton
                size="small"
                color="warning"
                onClick={(e) => {
                  e.stopPropagation();
                  showAlert("Info", "Hide/Unhide feature not implemented.", "info");
                }}
                disabled
              >
                {grn.HideYN === "Y" ? <ViewIcon fontSize="small" /> : <HideIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
          {canDeleteGrn(grn) && (
            <Tooltip title="Delete GRN">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(grn.grnID);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {isDepartmentSelected && (
        <>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
              <GrnIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Goods Received Notes Management
            </Typography>
            <Stack direction="row" spacing={1}>
              <CustomButton variant="contained" icon={AddIcon} text="New GRN" onClick={handleNewGrn} />
              <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={handleRefresh} asynchronous />
            </Stack>
          </Box>

          {/* Enhanced Statistics Dashboard */}
          <Grid container spacing={2} mb={3}>
            {[
              { title: "Total GRNs", value: statistics.total, icon: <DashboardIcon />, color: "#1976d2" },
              { title: "Approved", value: statistics.approved, icon: <ApproveIcon />, color: "#4caf50" },
              { title: "Pending", value: statistics.pending, icon: <ScheduleIcon />, color: "#ff9800" },
              { title: "Overdue", value: statistics.overdue, icon: <WarningIcon />, color: "#f44336" },
              { title: "Hidden", value: statistics.hidden, icon: <HideIcon />, color: "#9e9e9e" },
              { title: "Total Value", value: formatCurrency(statistics.totalValue, "INR", "en-IN"), icon: <TrendingIcon />, color: "#9c27b0" },
            ].map((stat) => (
              <Grid size={{ xs: 12, sm: 4, md: 2 }} key={stat.title}>
                <Card sx={{ borderLeft: `4px solid ${stat.color}`, height: "100%" }}>
                  <CardContent sx={{ textAlign: "center", p: 2, "&:last-child": { pb: 2 }, "& .MuiSvgIcon-root": { fontSize: 32, color: stat.color, mb: 1 } }}>
                    {stat.icon}
                    <Typography variant="h5" color={stat.color} fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Advanced Toolbar */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Code, Invoice, or Supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                  <ToggleButtonGroup value={viewMode} exclusive onChange={(_, newMode) => newMode && setViewMode(newMode)} size="small" sx={{ mr: 1 }}>
                    <ToggleButton value="grid" disabled>
                      Grid
                    </ToggleButton>
                    <ToggleButton value="cards" disabled>
                      Cards
                    </ToggleButton>
                    <ToggleButton value="detailed" disabled>
                      Detailed
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <CustomButton variant="outlined" icon={FilterIcon} text="Advanced Filter" onClick={() => setIsFilterDrawerOpen(true)} size="small" />
                  <CustomButton
                    variant="outlined"
                    icon={selectedRows.length > 0 ? SelectAllIcon : UnselectAllIcon}
                    text={`Bulk (${selectedRows.length})`}
                    onClick={() => setIsBulkActionsOpen(true)}
                    size="small"
                    disabled={selectedRows.length === 0}
                  />
                  <CustomButton variant="outlined" icon={UploadIcon} text="Upload" onClick={() => fileInputRef.current?.click()} size="small" />
                  <CustomButton variant="outlined" icon={DownloadIcon} text="Template" onClick={() => handleUnsupportedBulkAction("Download Template")} size="small" disabled />
                  <CustomButton variant="outlined" icon={ReportIcon} text="Reports" onClick={() => handleUnsupportedBulkAction("Reports")} size="small" disabled />
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Results Summary */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredAndSearchedGrns.length} of {statistics.total} GRNs {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
            </Typography>
            {selectedRows.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => setSelectedRows(filteredAndSearchedGrns.map((g) => g.grnID))}>
                  Select All Visible
                </Button>
                <Button size="small" onClick={() => setSelectedRows([])}>
                  Clear Selection
                </Button>
              </Stack>
            )}
          </Box>

          {error && (
            <Typography color="error" mb={2}>
              Error: {error}
            </Typography>
          )}

          <Paper sx={{ p: 2 }}>
            <CustomGrid
              columns={columns}
              data={filteredAndSearchedGrns}
              loading={isLoading}
              maxHeight="600px"
              emptyStateMessage="No GRNs found matching your criteria."
              rowKeyField="grnID"
              onRowClick={handleViewDetails}
            />
          </Paper>
        </>
      )}

      {/* --- DIALOGS AND DRAWERS --- */}

      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelect} requireSelection />

      <ComprehensiveGrnFormDialog
        open={isGrnFormOpen}
        onClose={() => setIsGrnFormOpen(false)}
        // onSubmit={handleGrnSubmit}
        grn={selectedGrn}
        departments={departments}
        suppliers={suppliers}
        products={[]}
      />
      <GrnDetailsDialog open={isDetailsDialogOpen} onClose={() => setIsDetailsDialogOpen(false)} grn={selectedGrn} departments={departments} suppliers={suppliers} products={[]} />

      <Drawer anchor="right" open={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} sx={{ "& .MuiDrawer-paper": { width: 400, p: 3 } }}>
        <Typography variant="h6" gutterBottom>
          Advanced Filters
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Approval Status</InputLabel>
            <Select value={filters.approvedStatus} onChange={(e) => setFilters((p) => ({ ...p, approvedStatus: e.target.value }))} label="Approval Status">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Y">Approved</MenuItem>
              <MenuItem value="N">Pending</MenuItem>
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
          <DatePicker
            label="Start Date"
            value={filters.startDate ? dayjs(filters.startDate) : null}
            onChange={(d) => setFilters((p) => ({ ...p, startDate: d ? d.toDate() : null }))}
          />
          <DatePicker label="End Date" value={filters.endDate ? dayjs(filters.endDate) : null} onChange={(d) => setFilters((p) => ({ ...p, endDate: d ? d.toDate() : null }))} />
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
          <Box>
            <CustomButton variant="contained" text="Apply Server Filters" onClick={handleApplyFilters} />
            <CustomButton variant="text" text="Clear" onClick={handleClearFilters} sx={{ ml: 1 }} />
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

      <Dialog open={isBulkActionsOpen} onClose={() => setIsBulkActionsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Actions ({selectedRows.length} items selected)</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <CustomButton variant="outlined" icon={ApproveIcon} text="Approve Selected" onClick={handleBulkApprove} color="success" />
            <CustomButton variant="outlined" icon={HideIcon} text="Hide Selected" onClick={() => handleUnsupportedBulkAction("hide")} color="warning" disabled />
            <CustomButton variant="outlined" icon={ExportIcon} text="Export Selected" onClick={() => handleUnsupportedBulkAction("export")} color="info" disabled />
            <CustomButton variant="outlined" icon={DeleteIcon} text="Delete Selected" onClick={handleBulkDelete} color="error" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBulkActionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls" style={{ display: "none" }} />
    </Box>
  );
};

export default ComprehensiveGRNManagementPage;
