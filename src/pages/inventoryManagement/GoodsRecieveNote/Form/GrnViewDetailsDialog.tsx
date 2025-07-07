import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { formatCurrency } from "@/utils/Common/formatUtils";
import {
  CheckCircle as ApproveIcon,
  BusinessCenter as CategoryIcon,
  CalendarToday as DateIcon,
  Store as DeptIcon,
  ExpandMore as ExpandMoreIcon,
  VisibilityOff as HiddenIcon,
  Info as InfoIcon,
  Description as InvoiceIcon,
  PriorityHigh as OverdueIcon,
  Payment as PaymentIcon,
  Warning as PendingIcon,
  ShoppingCart as ProductIcon,
  CurrencyRupee as RupeeIcon,
  LocalShipping as SupplierIcon,
  Timeline as TaxIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Grid,
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
} from "@mui/material";
import dayjs from "dayjs";
import { useMemo } from "react";

const GrnViewDetailsDialog = ({ open, onClose, grn }) => {
  const isApproved = grn?.grnMastDto.grnApprovedYN === "Y";
  const isHidden = grn?.grnMastDto.rActiveYN === "N";
  const isOverdue = grn?.grnMastDto.isOverdue;
  const formattedDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD MMM YYYY");
  };

  const renderStatusChips = () => {
    return (
      <Stack direction="row" spacing={1}>
        <Chip icon={isApproved ? <ApproveIcon /> : <PendingIcon />} label={isApproved ? "Approved" : "Pending"} color={isApproved ? "success" : "warning"} variant="filled" />
        {isOverdue && <Chip icon={<OverdueIcon />} label="Overdue" color="error" variant="filled" />}
        {isHidden && <Chip icon={<HiddenIcon />} label="Hidden" color="default" variant="outlined" />}
      </Stack>
    );
  };

  const financialSummary = useMemo(() => {
    if (!grn) return null;

    return [
      { label: "Total", value: formatCurrency(grn.grnMastDto.tot || 0, "INR", "en-IN") },
      { label: "Discount", value: formatCurrency(grn.grnMastDto.disc || 0, "INR", "en-IN") },
      { label: "Net Total", value: formatCurrency(grn.grnMastDto.netTot || 0, "INR", "en-IN") },
      { label: "CGST", value: formatCurrency(grn.grnMastDto.netCGSTTaxAmt || 0, "INR", "en-IN") },
      { label: "SGST", value: formatCurrency(grn.grnMastDto.netSGSTTaxAmt || 0, "INR", "en-IN") },
      { label: "Total Tax", value: formatCurrency(grn.grnMastDto.taxAmt || 0, "INR", "en-IN") },
      { label: "Other Charges", value: formatCurrency(grn.grnMastDto.otherAmt || 0, "INR", "en-IN") },
      { label: "Coin Adjustment", value: formatCurrency(grn.grnMastDto.coinAdj || 0, "INR", "en-IN") },
      { label: "Grand Total", value: formatCurrency(grn.grnMastDto.balanceAmt || 0, "INR", "en-IN") },
    ];
  }, [grn]);

  if (!grn) return null;

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={`GRN Details: ${grn.grnMastDto.grnCode}`}
      maxWidth="lg"
      fullWidth
      actions={<CustomButton variant="outlined" text="Close" onClick={onClose} />}
    >
      <Box sx={{ p: 1 }}>
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">
                  Basic Information
                </Typography>
                <Box ml="auto">{renderStatusChips()}</Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                GRN Code
              </Typography>
              <Typography variant="body1">{grn.grnMastDto.grnCode || "N/A"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                GRN Date
              </Typography>
              <Typography variant="body1" display="flex" alignItems="center">
                <DateIcon fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
                {formattedDate(grn.grnMastDto.grnDate)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                GRN Type
              </Typography>
              <Typography variant="body1">{grn.grnMastDto.grnType || "Invoice"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Status Details
              </Typography>
              <Box>
                <Typography variant="body2">
                  {grn.grnMastDto.grnStatus || "Pending"} ({grn.grnMastDto.grnStatusCode || "PEND"})
                </Typography>
                {isApproved && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    Approved by: {grn.grnMastDto.grnApprovedBy || "N/A"}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                DC Number
              </Typography>
              <Typography variant="body1">{grn.grnMastDto.dcNo || "N/A"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body1" display="flex" alignItems="center">
                <CategoryIcon fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
                {grn.grnMastDto.catDesc || "N/A"} ({grn.grnMastDto.catValue || "N/A"})
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <DeptIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">
                  Department & Supplier
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body1" display="flex" alignItems="center">
                <DeptIcon fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
                {grn.grnMastDto.deptName || "N/A"} (ID: {grn.grnMastDto.deptID || "N/A"})
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Supplier
              </Typography>
              <Typography variant="body1" display="flex" alignItems="center">
                <SupplierIcon fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
                {grn.grnMastDto.supplrName || "N/A"} (ID: {grn.grnMastDto.supplrID || "N/A"})
              </Typography>
            </Grid>

            {grn.grnMastDto.transDeptID && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Transfer Department
                </Typography>
                <Typography variant="body1" display="flex" alignItems="center">
                  <DeptIcon fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
                  {grn.grnMastDto.transDeptName || "N/A"} (ID: {grn.grnMastDto.transDeptID || "N/A"})
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <InvoiceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">
                  Invoice Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Invoice Number
              </Typography>
              <Typography variant="body1">{grn.grnMastDto.invoiceNo || "N/A"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Invoice Date
              </Typography>
              <Typography variant="body1" display="flex" alignItems="center">
                <DateIcon fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
                {formattedDate(grn.grnMastDto.invDate)}
              </Typography>
            </Grid>

            {grn.grnMastDto.poNo && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Purchase Order Information
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    PO Number
                  </Typography>
                  <Typography variant="body1">{grn.grnMastDto.poNo}</Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    PO Date
                  </Typography>
                  <Typography variant="body1">{formattedDate(grn.grnMastDto.poDate)}</Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    PO Amount
                  </Typography>
                  <Typography variant="body1">{formatCurrency(grn.grnMastDto.poTotalAmt || 0, "INR", "en-IN")}</Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <PaymentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">
                  Financial Summary
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {financialSummary?.map((item, index) => (
              <Grid size={{ xs: 6, md: 4 }} key={index}>
                <Typography variant="subtitle2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="body1" display="flex" alignItems="center" sx={index === financialSummary.length - 1 ? { fontWeight: "bold", color: "success.main" } : {}}>
                  <RupeeIcon fontSize="small" sx={{ mr: 0.5, color: index === financialSummary.length - 1 ? "success.main" : "text.secondary" }} />
                  {item.value}
                </Typography>
              </Grid>
            ))}

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="text.secondary" display="flex" alignItems="center">
                <TaxIcon fontSize="small" sx={{ mr: 0.5 }} />
                Tax Summary
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Taxable Amount
                    </Typography>
                    <Typography variant="body1">{formatCurrency(grn.grnMastDto.totalTaxableAmt || 0, "INR", "en-IN")}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      CGST Amount
                    </Typography>
                    <Typography variant="body1">{formatCurrency(grn.grnMastDto.netCGSTTaxAmt || 0, "INR", "en-IN")}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      SGST Amount
                    </Typography>
                    <Typography variant="body1">{formatCurrency(grn.grnMastDto.netSGSTTaxAmt || 0, "INR", "en-IN")}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center">
              <ProductIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" color="primary">
                Products ({grn.grnDetailDto?.length || 0})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "action.hover" }}>
                    <TableCell width="40">SL</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Received Qty</TableCell>
                    <TableCell align="right">Accepted Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Discount</TableCell>
                    <TableCell align="right">Tax %</TableCell>
                    <TableCell align="right">Tax Amount</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grn.grnDetailDto?.map((detail, index) => {
                    const quantity = detail.acceptQty || detail.recvdQty || 0;
                    const unitPrice = detail.unitPrice || 0;
                    const discountAmt = detail.discAmt || 0;
                    const discountPercentage = detail.discPercentage || 0;
                    const taxRate = (detail.cgstPerValue || 0) + (detail.sgstPerValue || 0);
                    const productValue = quantity * unitPrice;
                    const discountValue = discountAmt || (productValue * discountPercentage) / 100;
                    const taxableAmount = productValue - discountValue;
                    const taxAmount = (detail.cgstTaxAmt || 0) + (detail.sgstTaxAmt || 0);
                    const totalWithTax = taxableAmount + taxAmount;
                    return (
                      <TableRow key={index} sx={{ "&:nth-of-type(odd)": { backgroundColor: "action.hover" } }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Tooltip title={`Product ID: ${detail.productID}, Code: ${detail.productCode}`} arrow placement="top">
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {detail.productName}
                              </Typography>
                              {detail.pGrpName && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Group: {detail.pGrpName}
                                </Typography>
                              )}
                              {detail.batchNo && (
                                <Typography variant="caption" display="block">
                                  Batch: {detail.batchNo}
                                  {detail.expiryDate && ` | Expiry: ${formattedDate(detail.expiryDate)}`}
                                </Typography>
                              )}
                              {detail.manufacturerName && (
                                <Typography variant="caption" display="block">
                                  Mfr: {detail.manufacturerName}
                                </Typography>
                              )}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          {detail.recvdQty} {detail.pUnitName && `(${detail.pUnitName})`}
                        </TableCell>
                        <TableCell align="right">{detail.acceptQty || detail.recvdQty}</TableCell>
                        <TableCell align="right">{formatCurrency(unitPrice, "INR", "en-IN")}</TableCell>
                        <TableCell align="right">
                          {discountAmt > 0 ? formatCurrency(discountAmt, "INR", "en-IN") : discountPercentage > 0 ? `${discountPercentage}%` : "-"}
                        </TableCell>
                        <TableCell align="right">{taxRate > 0 ? `${taxRate}%` : "-"}</TableCell>
                        <TableCell align="right">{formatCurrency(taxAmount, "INR", "en-IN")}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "medium" }}>
                          {formatCurrency(totalWithTax, "INR", "en-IN")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!grn.grnDetailDto || grn.grnDetailDto.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Box>
    </GenericDialog>
  );
};

export default GrnViewDetailsDialog;
