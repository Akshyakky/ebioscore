import { IssualType } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { Info as InfoIcon } from "@mui/icons-material";
import { Alert, Box, Chip, Paper, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { Control, useWatch } from "react-hook-form";
import * as z from "zod";

// Define the schema and type within this file to avoid import issues
const issualDetailSchema = z.object({
  pisDetID: z.number(),
  pisid: z.number(),
  productID: z.number().min(1, "Product is required"),
  productCode: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  catValue: z.string().optional(),
  catDesc: z.string().optional(),
  mfID: z.number().optional(),
  mfName: z.string().optional(),
  pUnitID: z.number().optional(),
  pUnitName: z.string().optional(),
  pUnitsPerPack: z.number().optional(),
  pkgID: z.number().optional(),
  pkgName: z.string().optional(),
  batchNo: z.string().optional(),
  expiryDate: z.date().optional(),
  unitPrice: z.number().optional(),
  tax: z.number().optional(),
  sellUnitPrice: z.number().optional(),
  requestedQty: z.number().min(0, "Requested quantity must be non-negative"),
  issuedQty: z.number().min(0, "Issued quantity must be non-negative"),
  availableQty: z.number().optional(),
  expiryYN: z.string().optional(),
  psGrpID: z.number().optional(),
  psGrpName: z.string().optional(),
  pGrpID: z.number().optional(),
  pGrpName: z.string().optional(),
  taxID: z.number().optional(),
  taxCode: z.string().optional(),
  taxName: z.string().optional(),
  hsnCode: z.string().optional(),
  mrp: z.number().optional(),
  manufacturerID: z.number().optional(),
  manufacturerCode: z.string().optional(),
  manufacturerName: z.string().optional(),
  psbid: z.number().optional(),
  rActiveYN: z.string().default("Y"),
  remarks: z.string().optional(),
});

const schema = z.object({
  pisid: z.number(),
  pisDate: z.date(),
  issualType: z.nativeEnum(IssualType).default(IssualType.Department),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string(),
  toDeptID: z.number().min(1, "To department is required"),
  toDeptName: z.string(),
  auGrpID: z.number().optional(),
  catDesc: z.string().optional(),
  catValue: z.string().optional(),
  indentNo: z.string().optional(),
  pisCode: z.string().optional(),
  approvedYN: z.string(),
  approvedID: z.number().optional(),
  approvedBy: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  details: z.array(issualDetailSchema).min(1, "At least one product detail is required"),
});

type ProductIssualFormData = z.infer<typeof schema>;

interface BillingSectionProps {
  control: Control<ProductIssualFormData>;
}

const ProductBillingSection: React.FC<BillingSectionProps> = ({ control }) => {
  const watchedDetails = useWatch({ control, name: "details" });
  const fromDeptName = useWatch({ control, name: "fromDeptName" });
  const toDeptName = useWatch({ control, name: "toDeptName" });

  const calculations = useMemo(() => {
    if (!watchedDetails || watchedDetails.length === 0) {
      return {
        billAmount: 0,
        taxAmount: 0,
        netAmount: 0,
        discountPercentage: 0,
        discountAmount: 0,
        coinAdjustment: 0,
        balance: 0,
        totalItems: 0,
        totalRequestedQty: 0,
        totalIssuedQty: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
      };
    }
    const validDetails = watchedDetails.filter((detail) => detail.issuedQty > 0);
    const billAmount = validDetails.reduce((sum, detail) => {
      const itemTotal = (detail.sellUnitPrice || detail.unitPrice || 0) * detail.issuedQty;
      return sum + itemTotal;
    }, 0);

    const taxAmount = validDetails.reduce((sum, detail) => {
      const itemTotal = (detail.sellUnitPrice || detail.unitPrice || 0) * detail.issuedQty;
      const itemTax = (itemTotal * (detail.tax || 0)) / 100;
      return sum + itemTax;
    }, 0);

    const cgstAmount = taxAmount / 2;
    const sgstAmount = taxAmount / 2;
    const igstAmount = 0;
    const discountPercentage = 0;
    const discountAmount = (billAmount * discountPercentage) / 100;
    const netBeforeTax = billAmount - discountAmount;
    const netAmount = netBeforeTax + taxAmount;
    const coinAdjustment = Math.round(netAmount) - netAmount;
    const balance = netAmount + coinAdjustment;
    const totalItems = validDetails.length;
    const totalRequestedQty = validDetails.reduce((sum, detail) => sum + detail.requestedQty, 0);
    const totalIssuedQty = validDetails.reduce((sum, detail) => sum + detail.issuedQty, 0);

    return {
      billAmount: Math.round(billAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      discountPercentage,
      discountAmount: Math.round(discountAmount * 100) / 100,
      coinAdjustment: Math.round(coinAdjustment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      totalItems,
      totalRequestedQty: Math.round(totalRequestedQty * 100) / 100,
      totalIssuedQty: Math.round(totalIssuedQty * 100) / 100,
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      igstAmount: Math.round(igstAmount * 100) / 100,
    };
  }, [watchedDetails]);

  if (!watchedDetails || watchedDetails.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Department Transfer Summary
        </Typography>
        <Alert severity="info" icon={<InfoIcon />}>
          No products added yet. Add products to see transfer calculations.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        Department Transfer Summary
        <Chip label={`${calculations.totalItems} items`} size="small" color="primary" variant="outlined" />
        <Chip label={`From: ${fromDeptName || "Not Selected"}`} size="small" color="secondary" variant="outlined" />
        <Chip label={`To: ${toDeptName || "Not Selected"}`} size="small" color="success" variant="outlined" />
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
            Requested Qty:
          </Typography>
          <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
            {calculations.totalRequestedQty.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Issued Qty:
          </Typography>
          <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
            {calculations.totalIssuedQty.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Transfer Efficiency:
          </Typography>
          <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
            {calculations.totalRequestedQty > 0 ? `${((calculations.totalIssuedQty / calculations.totalRequestedQty) * 100).toFixed(1)}%` : "0%"}
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
            Bill Amount ₹ :
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
            {calculations.billAmount.toFixed(2)}
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
            Transfer Value ₹ :
          </Typography>
          <Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>
            {calculations.balance.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Department to Department Transfer:</strong> This is an internal transfer between departments. Stock will be deducted from{" "}
          <strong>{fromDeptName || "source department"}</strong> and added to <strong>{toDeptName || "destination department"}</strong> upon approval.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default ProductBillingSection;
