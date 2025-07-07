import CustomButton from "@/components/Button/CustomButton";
import { GrnDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { Clear as ClearIcon, Close as CloseIcon, History as HistoryIcon, Inventory as ProductIcon, Search as SearchIcon } from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useMemo, useState } from "react";

interface ProductSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  products: GrnDetailDto[];
  onSelectProduct: (product: GrnDetailDto) => void;
  title?: string;
}

const ProductSelectionDialog: React.FC<ProductSelectionDialogProps> = ({ open, onClose, products, onSelectProduct, title = "Select Product" }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.productName?.toLowerCase().includes(term) ||
        product.productCode?.toLowerCase().includes(term) ||
        product.batchNo?.toLowerCase().includes(term) ||
        product.manufacturerName?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const handleProductSelect = (product: GrnDetailDto) => {
    onSelectProduct(product);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "0.00";
    return amount.toFixed(2);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
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
          <ProductIcon />
          <Typography variant="h6" component="div">
            {title}
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box flex={1}>
              <OutlinedInput
                size="small"
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by product name, code, batch number, or manufacturer..."
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                }
                endAdornment={
                  searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }
                sx={{
                  backgroundColor: theme.palette.background.paper,
                }}
              />
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`${filteredProducts.length} of ${products.length} products`} size="small" color="primary" variant="outlined" />
            </Stack>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Select a product to view its complete purchase history across all GRNs.
          </Typography>
        </Box>

        <Box sx={{ height: "calc(80vh - 200px)", overflow: "auto" }}>
          {filteredProducts.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
              <ProductIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm ? "No products match your search" : "No products available"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? "Try adjusting your search criteria or clear the search to see all products." : "Add products to the GRN first before viewing history."}
              </Typography>
              {searchTerm && (
                <Button variant="outlined" onClick={handleClearSearch} sx={{ mt: 2 }} startIcon={<ClearIcon />}>
                  Clear Search
                </Button>
              )}
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
                        minWidth: 60,
                      }}
                    >
                      S.No
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 200,
                      }}
                    >
                      Product Name
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      Product Code
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      Batch No
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 140,
                      }}
                    >
                      Manufacturer
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 100,
                      }}
                    >
                      Qty
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      Unit Price
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      Total Value
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: "bold",
                        minWidth: 120,
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                    <TableRow
                      key={`${product.productID}-${index}`}
                      sx={{
                        "&:nth-of-type(odd)": {
                          bgcolor: alpha(theme.palette.action.hover, 0.02),
                        },
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          cursor: "pointer",
                        },
                      }}
                      onClick={() => handleProductSelect(product)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {product.productName || "Unknown Product"}
                          </Typography>
                          {product.catValue && <Chip label={product.catValue} size="small" color="secondary" variant="outlined" sx={{ mt: 0.5 }} />}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {product.productCode || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {product.batchNo || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {product.manufacturerName || product.mfName || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {product.acceptQty || product.recvdQty || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          ₹{formatCurrency(product.unitPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          ₹{formatCurrency(product.productValue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Purchase History">
                          <CustomButton
                            size="small"
                            variant="contained"
                            text="History"
                            icon={HistoryIcon}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductSelect(product);
                            }}
                            color="primary"
                          />
                        </Tooltip>
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
            {filteredProducts.length === products.length ? `${products.length} products available` : `${filteredProducts.length} of ${products.length} products shown`}
          </Typography>
          <Stack direction="row" spacing={1}>
            <CustomButton variant="outlined" text="Cancel" onClick={onClose} />
          </Stack>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ProductSelectionDialog;
