import { ReturnType } from "@/interfaces/InventoryManagement/ProductStockReturnDto";
import { Info as InfoIcon } from "@mui/icons-material";
import { Alert, Box, Chip, Paper, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { Control, useWatch } from "react-hook-form";
import * as z from "zod";

// Define the schema and type within this file to avoid import issues
const returnDetailSchema = z.object({
  psrdID: z.number(),
  psrID: z.number(),
  productID: z.number().min(1, "Product is required"),
  productCode: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  totalAmount: z.number().min(0, "Total amount must be non-negative"),
  batchNo: z.string().optional(),
  expiryDate: z.date().optional(),
  prescriptionYN: z.string().optional(),
  expiryYN: z.string().optional(),
  sellableYN: z.string().optional(),
  taxableYN: z.string().optional(),
  availableQty: z.number().optional(),
  tax: z.number().optional(),
  returnReason: z.string().optional(),
  rActiveYN: z.string().default("Y"),
});

const schema = z.object({
  psrID: z.number(),
  psrDate: z.date(),
  returnTypeCode: z.string().min(1, "Return type is required"),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string(),
  toDeptID: z.number().optional(),
  toDeptName: z.string().optional(),
  supplierID: z.number().optional(),
  supplierName: z.string().optional(),
  auGrpID: z.number().optional(),
  catDesc: z.string().optional(),
  catValue: z.string().optional(),
  psrCode: z.string().optional(),
  approvedYN: z.string(),
  approvedID: z.number().optional(),
  approvedBy: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  productStockReturnDetails: z.array(returnDetailSchema).min(1, "At least one product detail is required"),
});

type ProductStockReturnFormData = z.infer<typeof schema>;

interface BillingSectionProps {
  control: Control<ProductStockReturnFormData>;
}

const StockReturnBillingSection: React.FC<BillingSectionProps> = ({ control }) => {
  const watchedDetails = useWatch({ control, name: "productStockReturnDetails" });
  const fromDeptName = useWatch({ control, name: "fromDeptName" });
  const toDeptName = useWatch({ control, name: "toDeptName" });
  const supplierName = useWatch({ control, name: "supplierName" });
  const returnTypeCode = useWatch({ control, name: "returnTypeCode" });

  const calculations = useMemo(() => {
    if (!watchedDetails || watchedDetails.length === 0) {
      return {
        grossAmount: 0,
        taxAmount: 0,
        netAmount: 0,
        coinAdjustment: 0,
        totalItems: 0,
        totalQuantity: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
      };
    }

    const validDetails = watchedDetails.filter((detail) => detail.quantity > 0);
    const grossAmount = validDetails.reduce((sum, detail) => {
      const itemTotal = (detail.unitPrice || 0) * detail.quantity;
      return sum + itemTotal;
    }, 0);

    const taxAmount = validDetails.reduce((sum, detail) => {
      const itemTotal = (detail.unitPrice || 0) * detail.quantity;
      const itemTax = (itemTotal * (detail.tax || 0)) / 100;
      return sum + itemTax;
    }, 0);

    const cgstAmount = taxAmount / 2;
    const sgstAmount = taxAmount / 2;
    const igstAmount = 0;
    const netAmount = grossAmount + taxAmount;
    const coinAdjustment = Math.round(netAmount) - netAmount;
    const totalItems = validDetails.length;
    const totalQuantity = validDetails.reduce((sum, detail) => sum + detail.quantity, 0);

    return {
      grossAmount: Math.round(grossAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      coinAdjustment: Math.round(coinAdjustment * 100) / 100,
      totalAmount: Math.round((netAmount + coinAdjustment) * 100) / 100,
      totalItems,
      totalQuantity: Math.round(totalQuantity * 100) / 100,
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      igstAmount: Math.round(igstAmount * 100) / 100,
    };
  }, [watchedDetails]);

  const getReturnTypeTitle = () => {
    switch (returnTypeCode) {
      case ReturnType.Supplier:
        return "Supplier Return Summary";
      case ReturnType.Internal:
        return "Internal Transfer Return Summary";
      case ReturnType.Expired:
        return "Expired Items Return Summary";
      case ReturnType.Damaged:
        return "Damaged Items Return Summary";
      default:
        return "Stock Return Summary";
    }
  };

  const getReturnDestination = () => {
    switch (returnTypeCode) {
      case ReturnType.Supplier:
        return supplierName ? `Supplier: ${supplierName}` : "No supplier selected";
      case ReturnType.Internal:
        return toDeptName ? `To: ${toDeptName}` : "No destination department selected";
      case ReturnType.Expired:
      case ReturnType.Damaged:
        return "Inventory adjustment";
      default:
        return "Unknown destination";
    }
  };

  if (!watchedDetails || watchedDetails.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {getReturnTypeTitle()}
        </Typography>
        <Alert severity="info" icon={<InfoIcon />}>
          No products added yet. Add products to see return calculations.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        {getReturnTypeTitle()}
        <Chip label={`${calculations.totalItems} items`} size="small" color="primary" variant="outlined" />
        <Chip label={`From: ${fromDeptName || "Not Selected"}`} size="small" color="secondary" variant="outlined" />
        <Chip label={getReturnDestination()} size="small" color="success" variant="outlined" />
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          bgcolor: "grey.50",
          borderRadius: 1,
          mb: 2,
        }}
      >
        <Box sx={{ textAlign: "left" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Total Items:
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
            {calculations.totalItems}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Total Quantity:
          </Typography>
          <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
            {calculations.totalQuantity.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Return Type:
          </Typography>
          <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
            {returnTypeCode}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          bgcolor: "grey.50",
          borderRadius: 1,
          mb: 2,
        }}
      >
        <Box sx={{ textAlign: "left" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Gross Amount ₹ :
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
            {calculations.grossAmount.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Tax Amount ₹ :
          </Typography>
          <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
            {calculations.taxAmount.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            CGST ₹ :
          </Typography>
          <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
            {calculations.cgstAmount.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            SGST ₹ :
          </Typography>
          <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
            {calculations.sgstAmount.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          bgcolor: "success.50",
          borderRadius: 1,
          mb: 2,
        }}
      >
        <Box sx={{ textAlign: "left" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Net Amount ₹ :
          </Typography>
          <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
            {calculations.netAmount.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Coin Adjustment ₹ :
          </Typography>
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
            {calculations.coinAdjustment.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Return Value ₹ :
          </Typography>
          <Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>
            {calculations.totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>{getReturnTypeTitle()}:</strong>{" "}
          {returnTypeCode === ReturnType.Supplier
            ? "Items will be returned to the supplier and inventory will be adjusted upon approval."
            : returnTypeCode === ReturnType.Internal
            ? `This is an internal transfer between departments. Stock will be adjusted from ${fromDeptName || "source department"} to ${
                toDeptName || "destination department"
              } upon approval.`
            : `This return is for ${returnTypeCode === ReturnType.Expired ? "expired" : "damaged"} items. Inventory will be adjusted upon approval.`}
        </Typography>
      </Alert>
    </Paper>
  );
};

export default StockReturnBillingSection;
