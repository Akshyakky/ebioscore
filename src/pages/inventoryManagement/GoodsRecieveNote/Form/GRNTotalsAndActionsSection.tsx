import CustomButton from "@/components/Button/CustomButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { GrnDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { useAlert } from "@/providers/AlertProvider";
import { Check as ApplyIcon, DeleteSweep as DeleteAllIcon, History as HistoryIcon, Info as InfoIcon, AddBusiness as NewDeptIcon } from "@mui/icons-material";
import { Alert, Box, Chip, FormControlLabel, Grid, Paper, Stack, Switch, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";

import IssueDepartmentDialog, { IssueDepartmentData } from "./NewIssueDepartmentDialog";
import ProductHistoryDialog from "./ProductHistoryDailogue";
import ProductSelectionDialog from "./ProductSelectionDailogue";

interface GRNTotalsAndActionsSectionProps {
  grnDetails: GrnDetailDto[];
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  onDeleteAll: () => void;
  onShowHistory: () => void;
  onNewIssueDepartment: () => void;
  onApplyDiscount: () => void;
  disabled?: boolean;
  isApproved?: boolean;
  issueDepartments?: IssueDepartmentData[];
  onIssueDepartmentChange?: (departments: IssueDepartmentData[]) => void;
  selectedProductForIssue?: GrnDetailDto | null;
  onSelectedProductForIssueChange?: (product: GrnDetailDto | null) => void;
  defaultIndentNo?: string;
  defaultRemarks?: string;
  departments: { value: string; label: string }[];
}

interface CalculatedTotals {
  itemsTotal: number;
  totalDiscountAmount: number;
  totalTaxAmount: number;
  totalCGSTAmount: number;
  totalSGSTAmount: number;
  totalTaxableAmount: number;
  netTotal: number;
  grandTotal: number;
}

const TotalDisplayField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box
    sx={{
      p: 2,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "100%",
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      backgroundColor: "background.paper",
    }}
  >
    <Typography variant="subtitle2" component="div" sx={{ fontWeight: "bold", mr: 1, whiteSpace: "nowrap" }}>
      {label}:
    </Typography>
    {children}
  </Box>
);

const GRNTotalsAndActionsSection: React.FC<GRNTotalsAndActionsSectionProps> = ({
  grnDetails,
  control,
  setValue,
  watch,
  onDeleteAll,
  onShowHistory,
  onNewIssueDepartment,
  onApplyDiscount,
  disabled = false,
  isApproved = false,
  issueDepartments = [],
  onIssueDepartmentChange,
  selectedProductForIssue,
  onSelectedProductForIssueChange,
  defaultIndentNo = "",
  defaultRemarks = "",
  departments,
}) => {
  const theme = useTheme();
  const { showAlert } = useAlert();
  const [isDiscountInPercentage, setIsDiscountInPercentage] = useState(watch("discPercentageYN") === "Y");
  const [isIssueDeptDialogOpen, setIsIssueDeptDialogOpen] = useState(false);
  const [editingIssueDepartment, setEditingIssueDepartment] = useState<IssueDepartmentData | null>(null);
  const [isProductSelectionOpen, setIsProductSelectionOpen] = useState(false);
  const [isProductHistoryOpen, setIsProductHistoryOpen] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<GrnDetailDto | null>(null);
  const watchedDiscountType = watch("discPercentageYN");
  const watchedDiscount = watch("disc") || 0;
  const watchedOtherAmount = watch("otherAmt") || 0;
  const watchedCoinAdjustment = watch("coinAdj") || 0;
  const watchedCreateProductIssuals = watch("createProductIssuals");

  // Handle discount type and product issuuals
  useEffect(() => {
    setIsDiscountInPercentage(watchedDiscountType === "Y");

    // Always enable product issuuals when there are issue departments
    if (issueDepartments.length > 0) {
      setValue("createProductIssuals", true, { shouldDirty: true });
    }
  }, [watchedDiscountType, issueDepartments, setValue]);

  const calculateTotals = useCallback((): CalculatedTotals => {
    if (!grnDetails || grnDetails.length === 0) {
      return {
        itemsTotal: 0,
        totalDiscountAmount: 0,
        totalTaxAmount: 0,
        totalCGSTAmount: 0,
        totalSGSTAmount: 0,
        totalTaxableAmount: 0,
        netTotal: 0,
        grandTotal: 0,
      };
    }

    let itemsTotal = 0;
    let totalLineDiscountAmount = 0;
    let totalTaxAmount = 0;
    let totalCGSTAmount = 0;
    let totalSGSTAmount = 0;
    let totalTaxableAmount = 0;

    grnDetails.forEach((detail) => {
      const receivedQty = detail.recvdQty || 0;
      const unitPrice = detail.unitPrice || 0;
      const discPercentage = detail.discPercentage || 0;
      const cgstPerValue = detail.cgstPerValue || 0;
      const sgstPerValue = detail.sgstPerValue || 0;
      const isTaxAfterDisc = detail.taxAfterDiscYN === "Y";
      const totalTaxPercentage = cgstPerValue + sgstPerValue;

      const lineItemsTotal = receivedQty * unitPrice;
      itemsTotal += lineItemsTotal;

      const lineDiscountAmount = lineItemsTotal * (discPercentage / 100);
      totalLineDiscountAmount += lineDiscountAmount;

      const lineTaxableAmount = lineItemsTotal - lineDiscountAmount;
      totalTaxableAmount += lineTaxableAmount;

      let lineTotalTaxAmount = 0;
      if (isTaxAfterDisc) {
        lineTotalTaxAmount = lineTaxableAmount * (totalTaxPercentage / 100);
      } else {
        lineTotalTaxAmount = lineItemsTotal * (totalTaxPercentage / 100);
      }
      totalTaxAmount += lineTotalTaxAmount;

      let lineCGSTAmount = 0;
      let lineSGSTAmount = 0;
      if (totalTaxPercentage > 0) {
        lineCGSTAmount = lineTotalTaxAmount * (cgstPerValue / totalTaxPercentage);
        lineSGSTAmount = lineTotalTaxAmount * (sgstPerValue / totalTaxPercentage);
      }
      totalCGSTAmount += lineCGSTAmount;
      totalSGSTAmount += lineSGSTAmount;
    });

    let globalDiscountAmount = 0;
    if (watchedDiscount > 0) {
      if (isDiscountInPercentage) {
        globalDiscountAmount = totalTaxableAmount * (watchedDiscount / 100);
      } else {
        globalDiscountAmount = watchedDiscount;
      }
    }

    const finalTaxableAmount = totalTaxableAmount - globalDiscountAmount;
    const netTotal = finalTaxableAmount;
    const grandTotal = netTotal + totalTaxAmount + watchedOtherAmount + watchedCoinAdjustment;
    const totalDiscount = totalLineDiscountAmount + globalDiscountAmount;

    return {
      itemsTotal: parseFloat(itemsTotal.toFixed(2)),
      totalDiscountAmount: parseFloat(totalDiscount.toFixed(2)),
      totalTaxAmount: parseFloat(totalTaxAmount.toFixed(2)),
      totalCGSTAmount: parseFloat(totalCGSTAmount.toFixed(2)),
      totalSGSTAmount: parseFloat(totalSGSTAmount.toFixed(2)),
      totalTaxableAmount: parseFloat(finalTaxableAmount.toFixed(2)),
      netTotal: parseFloat(netTotal.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  }, [grnDetails, watchedDiscount, isDiscountInPercentage, watchedOtherAmount, watchedCoinAdjustment]);

  useEffect(() => {
    const totals = calculateTotals();
    setValue("tot", totals.itemsTotal, { shouldDirty: false });
    setValue("taxAmt", totals.totalTaxAmount, { shouldDirty: false });
    setValue("poDiscAmt", totals.totalDiscountAmount, { shouldDirty: false });
    setValue("totalTaxableAmt", totals.totalTaxableAmount, { shouldDirty: false });
    setValue("netCGSTTaxAmt", totals.totalCGSTAmount, { shouldDirty: false });
    setValue("netSGSTTaxAmt", totals.totalSGSTAmount, { shouldDirty: false });
    setValue("netTot", totals.netTotal, { shouldDirty: false });
    setValue("balanceAmt", totals.grandTotal, { shouldDirty: false });
  }, [grnDetails, watchedDiscount, isDiscountInPercentage, watchedOtherAmount, watchedCoinAdjustment, setValue, calculateTotals]);

  const handleDiscountToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setValue("discPercentageYN", isChecked ? "Y" : "N", { shouldDirty: true });
    setValue("disc", 0, { shouldDirty: true });
  };

  const handleApplyDiscountClick = () => {
    onApplyDiscount();
    const totals = calculateTotals();
    setValue("tot", totals.itemsTotal, { shouldDirty: true });
    setValue("taxAmt", totals.totalTaxAmount, { shouldDirty: true });
    setValue("poDiscAmt", totals.totalDiscountAmount, { shouldDirty: true });
    setValue("netTot", totals.netTotal, { shouldDirty: true });
    setValue("balanceAmt", totals.grandTotal, { shouldDirty: true });
  };

  const handleNewIssueDepartmentClick = () => {
    if (!grnDetails || grnDetails.length === 0) {
      showAlert("Warning", "Please add products to the GRN before creating issue departments.", "warning");
      return;
    }

    const firstProduct = grnDetails[0];
    if (onSelectedProductForIssueChange) {
      onSelectedProductForIssueChange(firstProduct);
    }
    setEditingIssueDepartment(null);
    setIsIssueDeptDialogOpen(true);
    onNewIssueDepartment();
  };

  const handleIssueDepartmentSubmit = (data: IssueDepartmentData) => {
    if (onIssueDepartmentChange) {
      let updatedDepartments = [...issueDepartments];
      if (editingIssueDepartment) {
        const index = updatedDepartments.findIndex((dept) => dept.id === editingIssueDepartment.id);
        if (index !== -1) {
          updatedDepartments[index] = data;
          showAlert("Success", "Issue department updated successfully.", "success");
        }
      } else {
        updatedDepartments.push({ ...data, id: Date.now().toString() });
        showAlert("Success", "Issue department added successfully.", "success");
      }
      onIssueDepartmentChange(updatedDepartments);
    }
    setIsIssueDeptDialogOpen(false);
    setEditingIssueDepartment(null);
    if (onSelectedProductForIssueChange) {
      onSelectedProductForIssueChange(null);
    }
  };

  const handleIssueDepartmentDialogClose = () => {
    setIsIssueDeptDialogOpen(false);
    setEditingIssueDepartment(null);
    if (onSelectedProductForIssueChange) {
      onSelectedProductForIssueChange(null);
    }
  };

  const handleShowHistoryClick = () => {
    if (!grnDetails || grnDetails.length === 0) {
      showAlert("Warning", "Please add products to the GRN before viewing history.", "warning");
      return;
    }
    if (grnDetails.length === 1) {
      setSelectedProductForHistory(grnDetails[0]);
      setIsProductHistoryOpen(true);
    } else {
      setIsProductSelectionOpen(true);
    }
  };

  const handleProductSelectionForHistory = (product: GrnDetailDto) => {
    setSelectedProductForHistory(product);
    setIsProductSelectionOpen(false);
    setIsProductHistoryOpen(true);
  };

  const handleProductHistoryClose = () => {
    setIsProductHistoryOpen(false);
    setSelectedProductForHistory(null);
  };

  const handleProductSelectionClose = () => {
    setIsProductSelectionOpen(false);
  };

  const allDisabled = disabled || isApproved;
  const issueDeptSummary = useMemo(() => {
    const totalIssueDepts = issueDepartments.length;
    const totalIssueQty = issueDepartments.reduce((sum, dept) => sum + dept.quantity, 0);
    const uniqueProducts = new Set(issueDepartments.map((dept) => dept.productID)).size;

    return { totalIssueDepts, totalIssueQty, uniqueProducts };
  }, [issueDepartments]);

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          mt: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center" mb={2.5}>
          <CustomButton text="Delete All" icon={DeleteAllIcon} color="error" onClick={onDeleteAll} disabled={allDisabled || grnDetails.length === 0} />
          <CustomButton text="Show History" icon={HistoryIcon} color="warning" onClick={handleShowHistoryClick} disabled={!grnDetails || grnDetails.length === 0} />
          <CustomButton
            text="New Issue Department"
            icon={NewDeptIcon}
            color={watchedCreateProductIssuals && issueDepartments.length === 0 ? "error" : "primary"}
            onClick={handleNewIssueDepartmentClick}
            disabled={allDisabled || !grnDetails || grnDetails.length === 0}
          />

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <FormControlLabel
              control={<Switch checked={isDiscountInPercentage} onChange={handleDiscountToggle} disabled={allDisabled} color="primary" />}
              label=""
              title={isDiscountInPercentage ? "Switch to Amount-based Discount" : "Switch to Percentage-based Discount"}
              sx={{ mr: 0 }}
            />
            <EnhancedFormField
              name="disc"
              control={control}
              type="number"
              placeholder={isDiscountInPercentage ? "Discount %" : "Discount Amt"}
              size="small"
              disabled={allDisabled}
            />
            <CustomButton text="Apply" icon={ApplyIcon} color="secondary" onClick={handleApplyDiscountClick} disabled={allDisabled} />
          </Stack>
        </Stack>

        {issueDepartments.length > 0 && (
          <Alert severity={watchedCreateProductIssuals ? "success" : "info"} icon={<InfoIcon />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Issue Department Summary:</strong> {issueDeptSummary.totalIssueDepts} departments,
              {issueDeptSummary.uniqueProducts} products, Total Qty: {issueDeptSummary.totalIssueQty}
              {watchedCreateProductIssuals && " (Will be created on GRN approval)"}
            </Typography>
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {issueDepartments.slice(0, 5).map((dept) => (
                <Chip
                  key={dept.id}
                  label={`${dept.deptName}: ${dept.quantity}`}
                  size="small"
                  variant={watchedCreateProductIssuals ? "filled" : "outlined"}
                  color={watchedCreateProductIssuals ? "success" : "primary"}
                />
              ))}
              {issueDepartments.length > 5 && <Chip label={`+${issueDepartments.length - 5} more`} size="small" variant="outlined" color="default" />}
            </Box>
          </Alert>
        )}

        {watchedCreateProductIssuals && issueDepartments.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Product Issual Enabled:</strong> Please add at least one issue department to create product issuuals on GRN approval.
            </Typography>
          </Alert>
        )}

        {/* Totals Grid */}
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
            <TotalDisplayField label="Items Total">
              <EnhancedFormField name="tot" control={control} type="number" disabled fullWidth variant="outlined" size="small" />
            </TotalDisplayField>
          </Grid>

          <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
            <TotalDisplayField label="Tax Amount">
              <EnhancedFormField name="taxAmt" control={control} type="number" disabled fullWidth variant="outlined" size="small" />
            </TotalDisplayField>
          </Grid>

          <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
            <TotalDisplayField label="Total Disc. Amt">
              <EnhancedFormField name="poDiscAmt" control={control} type="number" disabled fullWidth variant="outlined" size="small" />
            </TotalDisplayField>
          </Grid>

          <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
            <TotalDisplayField label="Net Total">
              <EnhancedFormField name="netTot" control={control} type="number" disabled fullWidth variant="outlined" size="small" />
            </TotalDisplayField>
          </Grid>

          <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
            <TotalDisplayField label="Others">
              <EnhancedFormField name="otherAmt" control={control} type="number" fullWidth variant="outlined" disabled={allDisabled} size="small" />
            </TotalDisplayField>
          </Grid>

          <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
            <TotalDisplayField label="CGST Total">
              <EnhancedFormField name="netCGSTTaxAmt" control={control} type="number" disabled fullWidth variant="outlined" size="small" />
            </TotalDisplayField>
          </Grid>

          <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
            <TotalDisplayField label="SGST Total">
              <EnhancedFormField name="netSGSTTaxAmt" control={control} type="number" disabled fullWidth variant="outlined" size="small" />
            </TotalDisplayField>
          </Grid>

          <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
            <TotalDisplayField label="Coin Adjustment">
              <EnhancedFormField name="coinAdj" control={control} type="number" fullWidth variant="outlined" disabled={allDisabled} size="small" />
            </TotalDisplayField>
          </Grid>

          <Grid size={{ xs: 12, md: 4.8, sm: 6 }}>
            <TotalDisplayField label="Balance">
              <EnhancedFormField name="balanceAmt" control={control} type="number" disabled fullWidth variant="outlined" size="small" />
            </TotalDisplayField>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Total Products:</strong> {grnDetails.length}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Total Received Qty:</strong> {grnDetails.reduce((sum, detail) => sum + (detail.recvdQty || 0), 0)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Issue Departments:</strong> {issueDeptSummary.totalIssueDepts}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <IssueDepartmentDialog
        open={isIssueDeptDialogOpen}
        onClose={handleIssueDepartmentDialogClose}
        onSubmit={handleIssueDepartmentSubmit}
        selectedProduct={selectedProductForIssue}
        editData={editingIssueDepartment}
        title={editingIssueDepartment ? "Edit Issue Department" : "New Issue Department"}
        defaultIndentNo={defaultIndentNo}
        defaultRemarks={defaultRemarks}
        departments={departments} // Pass departments prop
        existingIssueDepartments={issueDepartments} // Pass existing issue departments
        showAlert={showAlert} // Pass showAlert function
      />

      <ProductSelectionDialog
        open={isProductSelectionOpen}
        onClose={handleProductSelectionClose}
        products={grnDetails}
        onSelectProduct={handleProductSelectionForHistory}
        title="Select Product for History"
      />

      <ProductHistoryDialog
        open={isProductHistoryOpen}
        onClose={handleProductHistoryClose}
        productId={selectedProductForHistory?.productID || null}
        productName={selectedProductForHistory?.productName}
        productCode={selectedProductForHistory?.productCode}
      />
    </>
  );
};

export default GRNTotalsAndActionsSection;
