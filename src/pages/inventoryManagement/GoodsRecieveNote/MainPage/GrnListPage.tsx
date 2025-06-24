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
  Group as DeptIcon,
  Edit as EditIcon,
  Receipt as GrnIcon,
  Inventory as InventoryIcon,
  Warning as PendingIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  Search as SearchIcon,
  LocalShipping as SupplierIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Grid, IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import GrnDetailsDialog from "../Form/GrnDetailsDialog";
import GrnFormDialog from "../Form/GrnFormDailogue";
import useGRN from "../hooks/useGrnhooks";

interface EnhancedGRNDto extends GRNWithAllDetailsDto {
  totalItems?: number;
  totalValue?: string;
  pendingApproval?: boolean;
  supplierDisplay?: string;
  departmentDisplay?: string;
  statusColor?: "success" | "warning" | "error" | "info" | "default";
  daysOld?: number;
}

const GRNManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrn, setSelectedGrn] = useState<GRNWithAllDetailsDto | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterSupplier, setFilterSupplier] = useState<string>("all");
  const [isGrnFormOpen, setIsGrnFormOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");

  const { showAlert } = useAlert();
  const { grns, loading, refreshGrns, saveGrn, deleteGrn, approveGrn, getGrnById } = useGRN();

  useEffect(() => {
    refreshGrns();
  }, [refreshGrns]);

  const handleRefresh = useCallback(async () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterDepartment("all");
    setFilterSupplier("all");
    await refreshGrns();
  }, [refreshGrns]);

  // Enhanced GRNs with computed properties
  const enhancedGrns = useMemo((): EnhancedGRNDto[] => {
    if (!grns || !Array.isArray(grns) || grns.length === 0) {
      return [];
    }

    return grns.map((grn) => {
      const totalItems = grn.grnDetails?.length || 0;
      const totalValue = grn.netTot || grn.tot || 0;
      const pendingApproval = grn.grnApprovedYN !== "Y";

      // Calculate days old
      const grnDate = dayjs(grn.grnDate);
      const daysOld = dayjs().diff(grnDate, "days");
      let statusColor: "success" | "warning" | "error" | "info" | "default" = "default";
      if (grn.grnApprovedYN === "Y") {
        statusColor = "success";
      } else if (daysOld > 7) {
        statusColor = "error";
      } else if (daysOld > 3) {
        statusColor = "warning";
      } else {
        statusColor = "info";
      }

      // Find department and supplier names

      return {
        ...grn,
        totalItems,
        totalValue: formatCurrency(totalValue, "INR", "en-IN"),
        pendingApproval,

        statusColor,
        daysOld,
      };
    });
  }, [grns]);

  // Filtered GRNs based on search and filters
  const filteredGrns = useMemo(() => {
    if (!enhancedGrns || enhancedGrns.length === 0) {
      return [];
    }

    let filtered = [...enhancedGrns];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((grn) => {
        return (
          (grn.grnCode && grn.grnCode.toLowerCase().includes(searchLower)) ||
          (grn.invoiceNo && grn.invoiceNo.toLowerCase().includes(searchLower)) ||
          (grn.supplrName && grn.supplrName.toLowerCase().includes(searchLower)) ||
          (grn.deptName && grn.deptName.toLowerCase().includes(searchLower)) ||
          (grn.grnStatus && grn.grnStatus.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply status filter
    if (filterStatus !== "all") {
      if (filterStatus === "approved") {
        filtered = filtered.filter((grn) => grn.grnApprovedYN === "Y");
      } else if (filterStatus === "pending") {
        filtered = filtered.filter((grn) => grn.grnApprovedYN !== "Y");
      } else if (filterStatus === "completed") {
        filtered = filtered.filter((grn) => grn.grnStatus === "Completed" || grn.grnStatusCode === "COMP");
      }
    }

    // Apply department filter
    if (filterDepartment !== "all") {
      filtered = filtered.filter((grn) => grn.deptID.toString() === filterDepartment);
    }

    // Apply supplier filter
    if (filterSupplier !== "all") {
      filtered = filtered.filter((grn) => grn.supplrID.toString() === filterSupplier);
    }

    return filtered;
  }, [enhancedGrns, searchTerm, filterStatus, filterDepartment, filterSupplier]);

  // Statistics
  const statistics = useMemo(() => {
    if (!enhancedGrns || enhancedGrns.length === 0) {
      return {
        total: 0,
        approved: 0,
        pending: 0,
        completed: 0,
        overdue: 0,
        totalValue: 0,
      };
    }

    const total = enhancedGrns.length;
    const approved = enhancedGrns.filter((g) => g.grnApprovedYN === "Y").length;
    const pending = enhancedGrns.filter((g) => g.grnApprovedYN !== "Y").length;
    const completed = enhancedGrns.filter((g) => g.grnStatus === "Completed").length;
    const overdue = enhancedGrns.filter((g) => g.daysOld && g.daysOld > 7 && g.grnApprovedYN !== "Y").length;
    const totalValue = enhancedGrns.reduce((sum, grn) => sum + (grn.netTot || grn.tot || 0), 0);

    return {
      total,
      approved,
      pending,
      completed,
      overdue,
      totalValue,
    };
  }, [enhancedGrns]);

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
          setDialogMode("view");
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
          grnCode: "", // Will be generated
          invoiceNo: `${fullGrnDetails.invoiceNo} (Copy)`,
          grnDate: new Date().toISOString(),
          grnApprovedYN: "N",
          grnApprovedBy: "",
          grnApprovedID: 0,
          grnStatus: "Pending",
          grnStatusCode: "PEND",
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

  const handleApproveGrn = useCallback(
    async (grnId: number) => {
      try {
        await approveGrn(grnId);
        showAlert("Success", "GRN approved and stock updated successfully", "success");
      } catch (error) {
        // Error handling is done in the hook
      }
    },
    [approveGrn, showAlert]
  );

  const handleGrnSubmit = useCallback(
    async (grnData: GRNWithAllDetailsDto) => {
      try {
        await saveGrn(grnData);
        setIsGrnFormOpen(false);
        setSelectedGrn(null);
        await refreshGrns();
      } catch (error) {
        // Error handling is done in the hook
      }
    },
    [saveGrn, refreshGrns]
  );

  const handleDeleteGrn = useCallback(
    async (grnId: number) => {
      try {
        await deleteGrn(grnId);
        await refreshGrns();
      } catch (error) {
        // Error handling is done in the hook
      }
    },
    [deleteGrn, refreshGrns]
  );

  const columns: Column<EnhancedGRNDto>[] = [
    {
      key: "grnInfo",
      header: "GRN Information",
      visible: true,
      sortable: true,
      width: 220,
      render: (grn) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {grn.grnCode || "Pending"}
          </Typography>
          <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
            Invoice: {grn.invoiceNo}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {dayjs(grn.grnDate).format("DD/MM/YYYY")}
          </Typography>
        </Box>
      ),
    },
    {
      key: "supplier",
      header: "Supplier & Department",
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
            <DeptIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
            {grn.departmentDisplay}
          </Typography>
        </Box>
      ),
    },
    {
      key: "items",
      header: "Items & Value",
      visible: true,
      sortable: true,
      width: 150,
      render: (grn) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
            {grn.totalValue}
          </Typography>
          <Chip label={`${grn.totalItems} items`} size="small" color="info" variant="outlined" />
        </Box>
      ),
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 120,
      render: (grn) => (
        <Stack spacing={0.5}>
          <Chip
            label={grn.grnApprovedYN === "Y" ? "Approved" : "Pending"}
            size="small"
            color={grn.statusColor}
            variant="filled"
            icon={grn.grnApprovedYN === "Y" ? <ApproveIcon /> : <PendingIcon />}
          />
          {grn.daysOld !== undefined && grn.daysOld > 0 && (
            <Typography variant="caption" color="text.secondary">
              {grn.daysOld} days old
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      key: "approval",
      header: "Approval Info",
      visible: true,
      sortable: false,
      width: 150,
      render: (grn) => (
        <Box>
          {grn.grnApprovedYN === "Y" ? (
            <>
              <Typography variant="caption" color="success.main" fontWeight="medium">
                Approved by: {grn.grnApprovedBy || "System"}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Stock Updated
              </Typography>
            </>
          ) : (
            <Typography variant="caption" color="warning.main">
              Awaiting Approval
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
      width: 180,
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
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
          Goods Received Notes (GRN)
        </Typography>
        <Stack direction="row" spacing={2}>
          <CustomButton variant="contained" icon={AddIcon} text="New GRN" onClick={handleNewGrn} color="primary" />
          <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={handleRefresh} asynchronous />
        </Stack>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, md: 2 }}>
          <Card sx={{ borderLeft: "4px solid #1976d2" }}>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <GrnIcon sx={{ fontSize: 32, color: "#1976d2", mb: 1 }} />
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
          <Card sx={{ borderLeft: "4px solid #4caf50" }}>
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
          <Card sx={{ borderLeft: "4px solid #ff9800" }}>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <PendingIcon sx={{ fontSize: 32, color: "#ff9800", mb: 1 }} />
              <Typography variant="h5" color="#ff9800" fontWeight="bold">
                {statistics.pending}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Card sx={{ borderLeft: "4px solid #f44336" }}>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <ReportIcon sx={{ fontSize: 32, color: "#f44336", mb: 1 }} />
              <Typography variant="h5" color="#f44336" fontWeight="bold">
                {statistics.overdue}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Overdue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderLeft: "4px solid #9c27b0" }}>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <InventoryIcon sx={{ fontSize: 32, color: "#9c27b0", mb: 1 }} />
              <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                {formatCurrency(statistics.totalValue, "INR", "en-IN")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search GRNs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <TextField fullWidth size="small" select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth size="small" select label="Department" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
              <MenuItem value="all">All Departments</MenuItem>
              {/* {departments.map((dept) => (
                <MenuItem key={dept.value} value={dept.value}>
                  {dept.label}
                </MenuItem>
              ))} */}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth size="small" select label="Supplier" value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)}>
              <MenuItem value="all">All Suppliers</MenuItem>
              {/* {suppliers.map((supplier) => (
                <MenuItem key={supplier.value} value={supplier.value}>
                  {supplier.label}
                </MenuItem>
              ))} */}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredGrns.length} of {statistics.total} GRNs
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* GRN List */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GrnIcon />
            GRN List
          </Typography>
        </Box>

        <CustomGrid
          columns={columns}
          data={filteredGrns}
          loading={loading}
          maxHeight="600px"
          emptyStateMessage="No GRNs found"
          rowKeyField="grnID"
          density="medium"
          showDensityControls
          onRowClick={handleViewDetails}
        />
      </Paper>

      {/* Dialogs */}
      <GrnFormDialog
        open={isGrnFormOpen}
        onClose={() => {
          setIsGrnFormOpen(false);
          setSelectedGrn(null);
        }}
        onSubmit={handleGrnSubmit}
        grn={selectedGrn}
      />

      <GrnDetailsDialog
        open={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedGrn(null);
        }}
        grn={selectedGrn}
        mode={dialogMode}
        onEdit={handleEditGrn}
        onDelete={handleDeleteGrn}
        onApprove={handleApproveGrn}
      />
    </Box>
  );
};

export default GRNManagementPage;
