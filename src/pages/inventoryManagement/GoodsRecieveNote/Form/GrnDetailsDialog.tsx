import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { GRNWithAllDetailsDto } from "@/interfaces/InventoryManagement/GRNDto";
import { formatCurrency } from "@/utils/Common/formatUtils";
import {
  CheckCircle as ApproveIcon,
  ContentCopy as CopyIcon,
  CalendarToday as DateIcon,
  Delete as DeleteIcon,
  Business as DeptIcon,
  Edit as EditIcon,
  Receipt as GrnIcon,
  Info as InfoIcon,
  Description as InvoiceIcon,
  AccountBalance as PaymentIcon,
  Inventory as ProductIcon,
  LocalShipping as SupplierIcon,
  Assessment as TaxIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";

interface GrnDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  grn: GRNWithAllDetailsDto | null;
  mode?: "view" | "edit";
  onEdit: (grn: GRNWithAllDetailsDto) => void;
  onDelete: (grnId: number) => void;
  onApprove: (grnId: number) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`grn-tabpanel-${index}`} aria-labelledby={`grn-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const GrnDetailsDialog: React.FC<GrnDetailsDialogProps> = ({ open, onClose, grn, mode = "view", onEdit, onDelete, onApprove }) => {
  const [tabValue, setTabValue] = useState(0);

  const grnStatistics = useMemo(() => {
    if (!grn) return null;

    const grnDetails = grn.grnDetails || [];
    const totalItems = grnDetails.length;
    const totalQty = grnDetails.reduce((sum, detail) => sum + (detail.acceptQty || detail.recvdQty || 0), 0);
    const totalValue = grn.netTot || grn.tot || 0;
    const totalTax = (grn.netCGSTTaxAmt || 0) + (grn.netSGSTTaxAmt || 0);
    const pendingApproval = grn.grnApprovedYN !== "Y";
    const daysOld = dayjs().diff(dayjs(grn.grnDate), "days");

    let minPrice = 0;
    let maxPrice = 0;
    if (grnDetails.length > 0) {
      const prices = grnDetails.map((detail) => detail.productValue || 0).filter((price) => price > 0);
      if (prices.length > 0) {
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
      }
    }

    return {
      totalItems,
      totalQty,
      totalValue,
      totalTax,
      minPrice,
      maxPrice,
      pendingApproval,
      daysOld,
      isOverdue: daysOld > 7 && pendingApproval,
      canEdit: pendingApproval,
      canApprove: pendingApproval,
    };
  }, [grn]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (grn: GRNWithAllDetailsDto) => {
    if (grn.grnApprovedYN === "Y") return "success";
    if (grnStatistics?.isOverdue) return "error";
    if (grnStatistics?.daysOld && grnStatistics.daysOld > 3) return "warning";
    return "info";
  };

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text="Close" onClick={onClose} />
      {mode === "edit" && grn && grnStatistics?.canEdit && (
        <>
          <CustomButton variant="outlined" text="Copy" icon={CopyIcon} onClick={() => onEdit(grn)} color="info" />
          <CustomButton variant="outlined" text="Edit" icon={EditIcon} onClick={() => onEdit(grn)} color="primary" />
          <CustomButton variant="outlined" text="Delete" icon={DeleteIcon} onClick={() => onDelete(grn.grnID)} color="error" />
          {grnStatistics?.canApprove && <CustomButton variant="contained" text="Approve" icon={ApproveIcon} onClick={() => onApprove(grn.grnID)} color="success" />}
        </>
      )}
    </>
  );

  if (!grn) return null;

  return (
    <GenericDialog open={open} onClose={onClose} title={`GRN Details - ${grn.grnCode || "Pending"}`} maxWidth="xl" fullWidth actions={dialogActions}>
      <Box sx={{ width: "100%" }}>
        {/* Header Card */}
        <Card sx={{ mb: 3, borderLeft: "4px solid #1976d2" }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                    <GrnIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {grn.grnCode || "Pending Code Generation"}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      Invoice: {grn.invoiceNo} | Type: {grn.grnType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      GRN Date: {dayjs(grn.grnDate).format("DD/MM/YYYY")} | Invoice Date: {dayjs(grn.invDate).format("DD/MM/YYYY")}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Chip
                    label={grn.grnApprovedYN === "Y" ? "Approved" : "Pending Approval"}
                    color={getStatusColor(grn)}
                    variant="filled"
                    icon={grn.grnApprovedYN === "Y" ? <ApproveIcon /> : <WarningIcon />}
                  />
                  <Chip label={grn.grnStatus || "Pending"} color="primary" variant="outlined" />
                  <Chip label={grn.grnType || "INV"} color="secondary" variant="outlined" />
                  {grnStatistics?.isOverdue && <Chip label={`Overdue (${grnStatistics.daysOld} days)`} color="error" variant="filled" />}
                  {grn.grnApprovedYN === "Y" && grn.grnApprovedBy && <Chip label={`Approved by: ${grn.grnApprovedBy}`} color="success" variant="outlined" />}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box textAlign="right">
                  {grnStatistics && grnStatistics.totalValue > 0 && (
                    <Box mb={2}>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {formatCurrency(grnStatistics.totalValue, "INR", "en-IN")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Net Total Amount
                      </Typography>
                    </Box>
                  )}

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {grnStatistics?.totalItems || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Product Items
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h6" color="warning.main" fontWeight="bold">
                        {grnStatistics?.totalQty || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Quantity
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="grn details tabs">
            <Tab icon={<InfoIcon />} iconPosition="start" label="Basic Information" />
            <Tab icon={<ProductIcon />} iconPosition="start" label={`Product Details (${grnStatistics?.totalItems || 0})`} />
            <Tab icon={<TaxIcon />} iconPosition="start" label="Tax & Financial Summary" />
            <Tab icon={<PaymentIcon />} iconPosition="start" label="Purchase Order Details" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  <InfoIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  GRN Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      GRN Code
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {grn.grnCode || "Pending"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      GRN Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {grn.grnType || "INV"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      GRN Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      <DateIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                      {dayjs(grn.grnDate).format("DD/MM/YYYY")}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {grn.grnStatus || "Pending"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Invoice Number
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      <InvoiceIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                      {grn.invoiceNo}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Invoice Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      <DateIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                      {dayjs(grn.invDate).format("DD/MM/YYYY")}
                    </Typography>
                  </Grid>
                  {grn.dcNo && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">
                        DC Number
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {grn.dcNo}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  <SupplierIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Supplier & Department
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Supplier
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      <SupplierIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                      {grn.supplrID}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      <DeptIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                      {grn.deptID}
                    </Typography>
                  </Grid>
                  {grn.transDeptName && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">
                        Transfer Department
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {grn.transDeptName}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {grn.catDesc || "REVENUE"} ({grn.catValue || "MEDI"})
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Approval Information */}
          {grn.grnApprovedYN === "Y" && (
            <Paper sx={{ p: 3, mt: 3, backgroundColor: "success.light", color: "success.contrastText" }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                <ApproveIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Approval Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2">
                    <strong>Approved By:</strong> {grn.grnApprovedBy || "System"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2">
                    <strong>Approved ID:</strong> {grn.grnApprovedID || "N/A"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2">
                    <strong>Status:</strong> Stock Updated
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Warning for pending approval */}
          {grn.grnApprovedYN !== "Y" && (
            <Alert severity={grnStatistics?.isOverdue ? "error" : "warning"} sx={{ mt: 3 }}>
              <Typography variant="body2">
                This GRN is pending approval{grnStatistics?.isOverdue ? " and is overdue" : ""}. Product stock will not be updated until the GRN is approved.
                {grnStatistics?.daysOld && grnStatistics.daysOld > 0 && ` (${grnStatistics.daysOld} days old)`}
              </Typography>
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              <ProductIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Product Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {grn.grnDetails && grn.grnDetails.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "primary.main" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Batch/Expiry</TableCell>
                      <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                        Unit Price
                      </TableCell>
                      <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                        Received Qty
                      </TableCell>
                      <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                        Accept Qty
                      </TableCell>
                      <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                        Free Items
                      </TableCell>
                      <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                        Product Value
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grn.grnDetails.map((detail, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {detail.productName || `Product ${detail.productID}`}
                            </Typography>
                            {detail.productCode && (
                              <Typography variant="caption" color="text.secondary">
                                Code: {detail.productCode}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {detail.batchNo && <Typography variant="body2">Batch: {detail.batchNo}</Typography>}
                            {detail.expiryDate && (
                              <Typography variant="caption" color="text.secondary">
                                Exp: {dayjs(detail.expiryDate).format("DD/MM/YYYY")}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(detail.unitPrice || 0, "INR", "en-IN")}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{detail.recvdQty || 0}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color="primary">
                            {detail.acceptQty || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{detail.freeItems || 0}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold" color="success.main">
                            {formatCurrency(detail.productValue || 0, "INR", "en-IN")}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" py={6}>
                <ProductIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No product details available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Product details have not been added to this GRN.
                </Typography>
              </Box>
            )}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  <TaxIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Amount Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatCurrency(grn.tot || 0, "INR", "en-IN")}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Discount
                    </Typography>
                    <Typography variant="h6" color="warning.main" fontWeight="bold">
                      {formatCurrency(grn.disc || 0, "INR", "en-IN")}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Net Total
                    </Typography>
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      {formatCurrency(grn.netTot || 0, "INR", "en-IN")}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Balance Amount
                    </Typography>
                    <Typography variant="h6" color="info.main" fontWeight="bold">
                      {formatCurrency(grn.balanceAmt || 0, "INR", "en-IN")}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  Tax Breakdown
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Taxable Amount
                    </Typography>
                    <Typography variant="h6" fontWeight="medium">
                      {formatCurrency(grn.totalTaxableAmt || 0, "INR", "en-IN")}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Tax
                    </Typography>
                    <Typography variant="h6" color="error.main" fontWeight="bold">
                      {formatCurrency(grn.taxAmt || 0, "INR", "en-IN")}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      CGST Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(grn.netCGSTTaxAmt || 0, "INR", "en-IN")}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      SGST Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(grn.netSGSTTaxAmt || 0, "INR", "en-IN")}
                    </Typography>
                  </Grid>
                  {grn.otherAmt && grn.otherAmt > 0 && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Other Amount
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(grn.otherAmt, "INR", "en-IN")}
                      </Typography>
                    </Grid>
                  )}
                  {grn.coinAdj && grn.coinAdj !== 0 && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Coin Adjustment
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color={grn.coinAdj > 0 ? "success.main" : "error.main"}>
                        {formatCurrency(grn.coinAdj, "INR", "en-IN")}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              <PaymentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Purchase Order Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {grn.poNo || grn.poID ? (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        PO Number
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {grn.poNo || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        PO ID
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {grn.poID || "N/A"}
                      </Typography>
                    </Grid>
                    {grn.poDate && (
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          PO Date
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {dayjs(grn.poDate).format("DD/MM/YYYY")}
                        </Typography>
                      </Grid>
                    )}
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        PO Total Amount
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(grn.poTotalAmt || 0, "INR", "en-IN")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        PO Discount
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(grn.poDiscAmt || 0, "INR", "en-IN")}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        PO Coin Adjustment
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(grn.poCoinAdjAmt || 0, "INR", "en-IN")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {grn.rNotes && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Notes
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: "grey.50" }}>
                      <Typography variant="body2">{grn.rNotes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Box textAlign="center" py={6}>
                <PaymentIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No Purchase Order Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This GRN is not linked to any purchase order.
                </Typography>
              </Box>
            )}
          </Paper>
        </TabPanel>
      </Box>
    </GenericDialog>
  );
};

export default GrnDetailsDialog;
