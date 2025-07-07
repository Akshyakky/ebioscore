import CustomButton from "@/components/Button/CustomButton";
import { useAlert } from "@/providers/AlertProvider";
import { ProductHistoryItem, productHistoryService } from "@/services/InventoryManagementService/GRNService/ProductHistoryService";
import { Close as CloseIcon, Download as DownloadIcon, History as HistoryIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import {
  Alert,
  alpha,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
interface ProductHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  productId: number | null;
  productName?: string;
  productCode?: string;
}

interface SortConfig {
  key: keyof ProductHistoryItem;
  direction: "asc" | "desc";
}

const ProductHistoryDialog: React.FC<ProductHistoryDialogProps> = ({ open, onClose, productId, productName = "Unknown Product", productCode = "N/A" }) => {
  const theme = useTheme();
  const { showAlert } = useAlert();
  const [historyData, setHistoryData] = useState<ProductHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "purchaseDate", direction: "desc" });

  const loadProductHistory = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await productHistoryService.getProductHistory(productId);

      if (result.success && result.data) {
        setHistoryData(result.data);
      } else {
        const errorMessage = result.errorMessage || "Failed to load product history";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load product history";
      setError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [productId, showAlert]);

  useEffect(() => {
    if (open && productId) {
      loadProductHistory();
    }
  }, [open, productId, loadProductHistory]);

  const handleSort = (key: keyof ProductHistoryItem) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return historyData;

    return [...historyData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (sortConfig.direction === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [historyData, sortConfig]);

  const handleRefresh = () => {
    loadProductHistory();
  };

  const handleExport = async () => {
    if (!productId) {
      showAlert("Warning", "No product selected for export", "warning");
      return;
    }

    try {
      const result = await productHistoryService.exportProductHistory(productId, "csv");
      if (result.success && result.data) {
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `product_history_${productCode}_${dayjs().format("YYYY-MM-DD")}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showAlert("Success", "Product history exported successfully", "success");
      } else {
        showAlert("Error", result.errorMessage || "Failed to export data", "error");
      }
    } catch (error) {
      showAlert("Error", "Failed to export product history", "error");
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    return dayjs(date).format("DD/MM/YYYY");
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "0.00";
    return amount.toFixed(2);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          bgcolor: theme.palette.background.default,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1.5,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <HistoryIcon />
          <Typography variant="h6" component="div">
            Product History
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: theme.palette.primary.contrastText }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                {productName}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Product Code: <strong>{productCode}</strong>
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2" color="text.secondary">
                  Product ID: <strong>{productId}</strong>
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Chip label={`${historyData.length} Purchase Records`} size="small" color="primary" variant="outlined" />
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <CustomButton size="small" variant="outlined" text="Refresh" icon={RefreshIcon} onClick={handleRefresh} disabled={loading} />
              <CustomButton size="small" variant="outlined" text="Export" icon={DownloadIcon} onClick={handleExport} disabled={loading || historyData.length === 0} />
            </Stack>
          </Stack>
        </Box>
        <Box sx={{ height: "calc(90vh - 200px)", overflow: "auto" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={40} />
                <Typography color="text.secondary">Loading purchase history...</Typography>
              </Stack>
            </Box>
          ) : error ? (
            <Box p={3}>
              <Alert severity="error" action={<CustomButton size="small" text="Retry" onClick={handleRefresh} />}>
                {error}
              </Alert>
            </Box>
          ) : historyData.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Stack alignItems="center" spacing={2}>
                <HistoryIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                <Typography variant="h6" color="text.secondary">
                  No Purchase History Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This product has no previous purchase records.
                </Typography>
              </Stack>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ m: 0 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "purchaseDate"}
                        direction={sortConfig.key === "purchaseDate" ? sortConfig.direction : "asc"}
                        onClick={() => handleSort("purchaseDate")}
                      >
                        Purchase Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 150,
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "department"}
                        direction={sortConfig.key === "department" ? sortConfig.direction : "asc"}
                        onClick={() => handleSort("department")}
                      >
                        Department
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 140,
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "supplier"}
                        direction={sortConfig.key === "supplier" ? sortConfig.direction : "asc"}
                        onClick={() => handleSort("supplier")}
                      >
                        Supplier
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      Manufacturer
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 80,
                      }}
                    >
                      <TableSortLabel active={sortConfig.key === "units"} direction={sortConfig.key === "units" ? sortConfig.direction : "asc"} onClick={() => handleSort("units")}>
                        Units
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 100,
                      }}
                    >
                      Package
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      Units/Package
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "expiryDate"}
                        direction={sortConfig.key === "expiryDate" ? sortConfig.direction : "asc"}
                        onClick={() => handleSort("expiryDate")}
                      >
                        Expiry Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 100,
                      }}
                    >
                      Batch No
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 80,
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "taxPercentage"}
                        direction={sortConfig.key === "taxPercentage" ? sortConfig.direction : "asc"}
                        onClick={() => handleSort("taxPercentage")}
                      >
                        Tax[%]
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "sellingPrice"}
                        direction={sortConfig.key === "sellingPrice" ? sortConfig.direction : "asc"}
                        onClick={() => handleSort("sellingPrice")}
                      >
                        Selling Price
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "taxAmount"}
                        direction={sortConfig.key === "taxAmount" ? sortConfig.direction : "asc"}
                        onClick={() => handleSort("taxAmount")}
                      >
                        Tax Amount
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "unitPrice"}
                        direction={sortConfig.key === "unitPrice" ? sortConfig.direction : "asc"}
                        onClick={() => handleSort("unitPrice")}
                      >
                        Unit Price
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "acceptedQty"}
                        direction={sortConfig.key === "acceptedQty" ? sortConfig.direction : "asc"}
                        onClick={() => handleSort("acceptedQty")}
                      >
                        Accepted Qty
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      <TableSortLabel active={sortConfig.key === "value"} direction={sortConfig.key === "value" ? sortConfig.direction : "asc"} onClick={() => handleSort("value")}>
                        Value
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      Remarks
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedData.map((item, index) => (
                    <TableRow
                      key={`${item.grnDetID}-${index}`}
                      sx={{
                        "&:nth-of-type(odd)": {
                          bgcolor: alpha(theme.palette.action.hover, 0.02),
                        },
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <TableCell>{formatDate(item.purchaseDate)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {item.department || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {item.supplier || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {item.manufacturer || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {item.units || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {item.package || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{item.unitsPerPackage || 0}</Typography>
                      </TableCell>
                      <TableCell>{formatDate(item.expiryDate)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {item.batchNo || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary">
                          {item.taxPercentage || 0}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          ₹{formatCurrency(item.sellingPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          ₹{formatCurrency(item.taxAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          ₹{formatCurrency(item.unitPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {item.acceptedQty || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          ₹{formatCurrency(item.value)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {item.remarks || "-"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Box display="flex" justifyContent="space-between" width="100%">
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
            Total Records: {historyData.length}
          </Typography>
          <Stack direction="row" spacing={1}>
            <CustomButton variant="outlined" text="Close" onClick={onClose} />
          </Stack>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ProductHistoryDialog;
