import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { usePurchaseOrder } from "@/pages/inventoryManagement/PurchaseOrder/hooks/usePurchaseOrder";
import { Close as CloseIcon, Assignment as POIcon, Refresh as RefreshIcon, Search as SearchIcon, Check as SelectIcon } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface POSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPO: (po: PurchaseOrderMastDto) => void;
  departmentId?: number;
  departmentName?: string;
  title?: string;
}

interface FilterState {
  status: string;
  sortBy: string;
  searchTerm: string;
  supplierFilter: string;
  approvedFilter: string;
  dateFrom: string;
  dateTo: string;
}

const POSearchDialog: React.FC<POSearchDialogProps> = ({ open, onClose, onSelectPO, departmentId, departmentName, title }) => {
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderMastDto | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    sortBy: "date_desc",
    searchTerm: "",
    supplierFilter: "all",
    approvedFilter: "all",
    dateFrom: "",
    dateTo: "",
  });

  const { purchaseOrderList, isLoading, getPurchaseOrdersByDepartment } = usePurchaseOrder();

  const handleRefresh = useCallback(async () => {
    if (departmentId) {
      await getPurchaseOrdersByDepartment(departmentId);
    }
  }, [departmentId, getPurchaseOrdersByDepartment]);

  useEffect(() => {
    if (open && departmentId) {
      handleRefresh();
    }
  }, [open, departmentId, handleRefresh]);

  const uniqueSuppliers = useMemo(() => {
    const suppliers = purchaseOrderList
      .map((po) => ({ id: po.supplierID, name: po.supplierName || `Supplier ${po.supplierID}` }))
      .filter((supplier, index, self) => self.findIndex((s) => s.id === supplier.id) === index);
    return suppliers;
  }, [purchaseOrderList]);

  const filteredAndSortedPOs = useMemo(() => {
    let filtered = [...purchaseOrderList];
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((po) => po.pOCode?.toLowerCase().includes(searchLower) || po.supplierName?.toLowerCase().includes(searchLower));
    }

    if (filters.status !== "all") {
      if (filters.status === "approved") {
        filtered = filtered.filter((po) => po.pOApprovedYN === "Y");
      } else if (filters.status === "pending") {
        filtered = filtered.filter((po) => po.pOApprovedYN !== "Y");
      }
    }
    if (filters.supplierFilter !== "all") {
      filtered = filtered.filter((po) => po.supplierID?.toString() === filters.supplierFilter);
    }
    if (filters.approvedFilter !== "all") {
      filtered = filtered.filter((po) => (filters.approvedFilter === "yes" ? po.pOApprovedYN === "Y" : po.pOApprovedYN !== "Y"));
    }
    if (filters.dateFrom) {
      filtered = filtered.filter((po) => po.pODate && dayjs(po.pODate).isAfter(dayjs(filters.dateFrom)));
    }

    if (filters.dateTo) {
      filtered = filtered.filter((po) => po.pODate && dayjs(po.pODate).isBefore(dayjs(filters.dateTo)));
    }
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "date_desc":
          return dayjs(b.pODate || 0).valueOf() - dayjs(a.pODate || 0).valueOf();
        case "date_asc":
          return dayjs(a.pODate || 0).valueOf() - dayjs(b.pODate || 0).valueOf();
        default:
          return 0;
      }
    });

    return filtered;
  }, [purchaseOrderList, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handleSelectPO = (po: PurchaseOrderMastDto) => {
    setSelectedPO(po);
  };
  const handleConfirmSelection = () => {
    if (selectedPO) {
      onSelectPO(selectedPO);
      onClose();
      setSelectedPO(null);
    }
  };

  const handleCloseDialog = () => {
    setSelectedPO(null);
    onClose();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  const columns: Column<PurchaseOrderMastDto>[] = [
    {
      key: "pOCode",
      header: "PO Code",
      visible: true,
      width: 150,
      render: (item: PurchaseOrderMastDto) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: selectedPO?.pOID === item.pOID ? "bold" : "normal",
            color: selectedPO?.pOID === item.pOID ? "primary.main" : "text.primary",
          }}
        >
          {item.pOCode}
        </Typography>
      ),
    },
    {
      key: "pODate",
      header: "PO Date",
      visible: true,
      width: 150,
      formatter: (v: any) => formatDate(v as string),
    },
    {
      key: "supplierName",
      header: "Supplier",
      visible: true,
      width: 250,
    },
    {
      key: "pOApprovedYN",
      header: "Approved",
      visible: true,
      width: 120,
      align: "center",
      render: (item: PurchaseOrderMastDto) => <Chip label={item.pOApprovedYN === "Y" ? "Yes" : "No"} size="small" color={item.pOApprovedYN === "Y" ? "success" : "warning"} />,
    },
    {
      key: "totalAmt",
      header: "Total Amt",
      visible: true,
      width: 150,
      align: "right",
      formatter: (v: any) => `₹${Number(v || 0).toFixed(2)}`,
    },
    {
      key: "pOStatusCode",
      header: "Status",
      visible: true,
      width: 100,
      render: (item: PurchaseOrderMastDto) => (
        <Chip label={item.pOStatusCode || "PENDING"} size="small" color={item.pOStatusCode === "APPROVED" ? "success" : "default"} variant="outlined" />
      ),
    },
    {
      key: "actions",
      header: "Select",
      visible: true,
      width: 100,
      align: "center",
      render: (item: PurchaseOrderMastDto) => (
        <CustomButton
          variant={selectedPO?.pOID === item.pOID ? "contained" : "outlined"}
          color={selectedPO?.pOID === item.pOID ? "primary" : "inherit"}
          size="small"
          text={selectedPO?.pOID === item.pOID ? "Selected" : "Select"}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectPO(item);
          }}
        />
      ),
    },
  ];

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="xl" fullWidth PaperProps={{ sx: { height: "90vh" } }}>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <POIcon color="primary" />
          <Typography variant="h6" color="primary" fontWeight="bold">
            {title || `PO Search for ${departmentName || "Department"}`}
          </Typography>
          {departmentId && <Chip label={`Dept ID: ${departmentId}`} size="small" color="info" variant="outlined" />}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 2 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ pb: "16px !important" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search PO Code, Supplier..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} label="Status">
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="pending">Pending Approval</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 2, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select value={filters.sortBy} onChange={(e) => handleFilterChange("sortBy", e.target.value)} label="Sort By">
                      <MenuItem value="date_desc">Newest First</MenuItem>
                      <MenuItem value="date_asc">Oldest First</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 2, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Supplier</InputLabel>
                    <Select value={filters.supplierFilter} onChange={(e) => handleFilterChange("supplierFilter", e.target.value)} label="Supplier">
                      <MenuItem value="all">All Suppliers</MenuItem>
                      {uniqueSuppliers.map((s) => (
                        <MenuItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 2, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Approved</InputLabel>
                    <Select value={filters.approvedFilter} onChange={(e) => handleFilterChange("approvedFilter", e.target.value)} label="Approved">
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 1 }}>
                  <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={handleRefresh} asynchronous size="small" />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="From Date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="To Date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary">
                      Showing {filteredAndSortedPOs.length} of {purchaseOrderList.length} records
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="text.secondary">
              Records: {filteredAndSortedPOs.length}
            </Typography>
            {selectedPO && <Chip label={`Selected: ${selectedPO.pOCode}`} color="primary" variant="filled" icon={<SelectIcon />} onDelete={() => setSelectedPO(null)} />}
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, px: 2, pb: 2 }}>
          <Paper sx={{ height: "100%" }}>
            <CustomGrid
              columns={columns}
              data={filteredAndSortedPOs}
              loading={isLoading}
              maxHeight="calc(100vh - 400px)"
              onRowClick={handleSelectPO}
              searchTerm={filters.searchTerm}
              emptyStateMessage="No purchase orders found"
              showDensityControls={true}
              density="medium"
              customRowStyle={(item: PurchaseOrderMastDto) => ({
                backgroundColor: selectedPO?.pOID === item.pOID ? "rgba(25, 118, 210, 0.08)" : "transparent",
                borderLeft: selectedPO?.pOID === item.pOID ? "3px solid #1976d2" : "3px solid transparent",
              })}
            />
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" spacing={1}>
          <CustomButton variant="outlined" text="Close" icon={CloseIcon} onClick={handleCloseDialog} />
          <CustomButton variant="contained" text="Select PO" icon={SelectIcon} onClick={handleConfirmSelection} disabled={!selectedPO} color="primary" />
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default POSearchDialog;
