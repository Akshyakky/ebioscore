import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { GrnDetailDto, GrnMastDto } from "@/interfaces/InventoryManagement/GRNDto";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle as ApproveIcon,
  Clear as ClearIcon,
  Business as DeptIcon,
  ExpandMore as ExpandMoreIcon,
  Receipt as InvoiceIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Chip, FormControlLabel, Grid, Stack, Switch, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import GrnDetailsComponent from "./GrnDetailsComponent";
import GRNTotalsAndActionsSection from "./GRNTotalsAndActionsSection";

import { useGrn } from "../hooks/useGrnhooks";
import { IssueDepartmentData } from "./NewIssueDepartmentDialog";
import PurchaseOrderSection from "./purchaseOrderSection";

// Helper functions for GRN calculations
const GRNHelpers = {
  /**
   * Calculate product value for a GRN detail with all considerations
   */
  calculateProductValue: (detail: Partial<GrnDetailDto>): number => {
    const qty = detail.AcceptQty || detail.RecvdQty || 0;
    const price = detail.UnitPrice || 0;
    const discount = detail.DiscAmt || 0;
    const discountPercentage = detail.DiscPercentage || 0;

    let productValue = qty * price;

    // Apply discount
    if (discount > 0) {
      productValue -= discount;
    } else if (discountPercentage > 0) {
      productValue -= (productValue * discountPercentage) / 100;
    }

    return Math.max(0, Math.round(productValue * 100) / 100);
  },

  /**
   * Calculate comprehensive tax amounts
   */
  calculateTaxAmounts: (
    detail: Partial<GrnDetailDto>
  ): {
    cgstAmount: number;
    sgstAmount: number;
    taxableAmount: number;
    totalTax: number;
    totalWithTax: number;
  } => {
    const productValue = GRNHelpers.calculateProductValue(detail);
    const cgstRate = detail.CgstPerValue || 0;
    const sgstRate = detail.SgstPerValue || 0;

    const taxableAmount = productValue;
    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const sgstAmount = (taxableAmount * sgstRate) / 100;
    const totalTax = cgstAmount + sgstAmount;

    return {
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalWithTax: Math.round((taxableAmount + totalTax) * 100) / 100,
    };
  },

  /**
   * Calculate comprehensive GRN totals
   */
  calculateGRNTotals: (
    details: GrnDetailDto[],
    discount: number = 0,
    otherCharges: number = 0,
    coinAdjustment: number = 0
  ): {
    total: number;
    netTotal: number;
    totalTaxable: number;
    totalCGST: number;
    totalSGST: number;
    totalTax: number;
    grandTotal: number;
    totalItems: number;
    totalQty: number;
  } => {
    let total = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalItems = details.length;
    let totalQty = 0;

    details.forEach((detail) => {
      const productValue = GRNHelpers.calculateProductValue(detail);
      const taxAmounts = GRNHelpers.calculateTaxAmounts(detail);

      total += productValue;
      totalTaxable += taxAmounts.taxableAmount;
      totalCGST += taxAmounts.cgstAmount;
      totalSGST += taxAmounts.sgstAmount;
      totalQty += detail.AcceptQty || detail.RecvdQty || 0;
    });

    const netTotal = total - discount;
    const totalTax = totalCGST + totalSGST;
    const grandTotal = netTotal + totalTax + otherCharges + coinAdjustment;

    return {
      total: Math.round(total * 100) / 100,
      netTotal: Math.round(netTotal * 100) / 100,
      totalTaxable: Math.round(totalTaxable * 100) / 100,
      totalCGST: Math.round(totalCGST * 100) / 100,
      totalSGST: Math.round(totalSGST * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      totalItems,
      totalQty,
    };
  },

  /**
   * Validate GRN master data with enhanced checks
   */
  validateGRNMaster: (grn: Partial<GrnMastDto>): { isValid: boolean; errors: string[]; warnings?: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validations
    if (!grn.DeptID || grn.DeptID <= 0) {
      errors.push("Department is required");
    }

    if (!grn.DeptName || grn.DeptName.trim() === "") {
      errors.push("Department name is required");
    }

    if (!grn.SupplrID || grn.SupplrID <= 0) {
      errors.push("Supplier is required");
    }

    if (!grn.SupplrName || grn.SupplrName.trim() === "") {
      errors.push("Supplier name is required");
    }

    if (!grn.InvoiceNo || grn.InvoiceNo.trim() === "") {
      errors.push("Invoice number is required");
    }

    if (!grn.GrnDate) {
      errors.push("GRN date is required");
    }

    if (!grn.InvDate) {
      errors.push("Invoice date is required");
    }

    // Date validations
    if (grn.GrnDate && grn.InvDate) {
      const grnDate = new Date(grn.GrnDate);
      const invDate = new Date(grn.InvDate);

      if (grnDate < invDate) {
        warnings.push("GRN date is earlier than invoice date");
      }

      const today = new Date();
      if (grnDate > today) {
        warnings.push("GRN date is in the future");
      }
    }

    // Business rule validations
    if (grn.Disc && grn.Tot && grn.Disc > grn.Tot) {
      errors.push("Discount cannot be greater than total amount");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Validate GRN detail data with comprehensive checks
   */
  validateGRNDetail: (detail: Partial<GrnDetailDto>, index: number): { isValid: boolean; errors: string[]; warnings?: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validations
    if (!detail.ProductID || detail.ProductID <= 0) {
      errors.push(`Product is required for item ${index + 1}`);
    }

    if (!detail.CatValue || detail.CatValue.trim() === "") {
      errors.push(`Category value is required for item ${index + 1}`);
    }

    if (!detail.RecvdQty || detail.RecvdQty <= 0) {
      errors.push(`Received quantity must be greater than 0 for item ${index + 1}`);
    }

    if (!detail.UnitPrice || detail.UnitPrice <= 0) {
      errors.push(`Unit price must be greater than 0 for item ${index + 1}`);
    }

    // Business rule validations
    if (detail.AcceptQty && detail.RecvdQty && detail.AcceptQty > detail.RecvdQty) {
      errors.push(`Accept quantity cannot be greater than received quantity for item ${index + 1}`);
    }

    if (detail.FreeItems && detail.RecvdQty && detail.FreeItems > detail.RecvdQty) {
      warnings.push(`Free items quantity seems high for item ${index + 1}`);
    }

    if (detail.DiscAmt && detail.UnitPrice && detail.RecvdQty) {
      const productValue = detail.UnitPrice * (detail.RecvdQty || 0);
      if (detail.DiscAmt > productValue) {
        errors.push(`Discount amount cannot be greater than product value for item ${index + 1}`);
      }
    }

    if (detail.DiscPercentage && detail.DiscPercentage > 100) {
      errors.push(`Discount percentage cannot be greater than 100% for item ${index + 1}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Validate complete GRN data with all checks
   */
  validateCompleteGRN: (grn: Partial<GrnMastDto & { GrnDetails: GrnDetailDto[] }>): { isValid: boolean; errors: string[]; warnings?: string[] } => {
    const masterValidation = GRNHelpers.validateGRNMaster(grn);
    const allErrors = [...masterValidation.errors];
    const allWarnings = [...(masterValidation.warnings || [])];

    // Validate details
    if (!grn.GrnDetails || grn.GrnDetails.length === 0) {
      allErrors.push("At least one product detail is required");
    } else {
      grn.GrnDetails.forEach((detail, index) => {
        const detailValidation = GRNHelpers.validateGRNDetail(detail, index);
        allErrors.push(...detailValidation.errors);
        allWarnings.push(...(detailValidation.warnings || []));
      });

      // Check for duplicate products
      const productIds = grn.GrnDetails.map((d) => d.ProductID);
      const duplicates = productIds.filter((id, index) => productIds.indexOf(id) !== index);
      if (duplicates.length > 0) {
        allWarnings.push("Duplicate products detected in the GRN");
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  },
};

// Schema based on exact backend DTO properties
const grnSchema = z.object({
  GrnID: z.number().default(0),
  GrnCode: z.string().optional(),
  DeptID: z.number().min(1, "Department is required"),
  DeptName: z.string().min(1, "Department name is required"),
  SupplrID: z.number().min(1, "Supplier is required"),
  SupplrName: z.string().min(1, "Supplier name is required"),
  GrnDate: z.union([z.date(), z.any()]).refine((date) => (date ? dayjs(date).isValid() : false), { message: "Valid GRN date is required" }),
  InvoiceNo: z.string().min(1, "Invoice number is required"),
  InvDate: z.union([z.date(), z.any()]).refine((date) => (date ? dayjs(date).isValid() : false), { message: "Valid invoice date is required" }),
  GrnType: z.string().default("Invoice"),
  GrnStatus: z.string().default("Pending"),
  GrnStatusCode: z.string().default("PEND"),
  GrnApprovedYN: z.string().default("N"),
  GrnApprovedBy: z.string().optional(),
  GrnApprovedID: z.number().optional(),
  PoNo: z.string().optional(),
  PoID: z.number().optional(),
  PoDate: z.union([z.date(), z.any()]).optional().nullable(),
  PoTotalAmt: z.number().optional().default(0),
  PoDiscAmt: z.number().optional().default(0),
  PoCoinAdjAmt: z.number().optional().default(0),
  DcNo: z.string().optional(),
  Tot: z.number().optional().default(0),
  Disc: z.number().optional().default(0),
  NetTot: z.number().optional().default(0),
  TaxAmt: z.number().optional().default(0),
  TotalTaxableAmt: z.number().optional().default(0),
  NetCGSTTaxAmt: z.number().optional().default(0),
  NetSGSTTaxAmt: z.number().optional().default(0),
  BalanceAmt: z.number().optional().default(0),
  OtherAmt: z.number().optional().default(0),
  CoinAdj: z.number().optional().default(0),
  TransDeptID: z.number().optional(),
  TransDeptName: z.string().optional(),
  CatValue: z.string().default("MEDI"),
  CatDesc: z.string().default("REVENUE"),
  AuGrpID: z.number().default(18),
  DiscPercentageYN: z.string().default("N"),
  GrnDetails: z.array(z.any()).default([]),
  RActiveYN: z.string().default("Y"),
  RNotes: z.string().optional().nullable(),
});

type GrnFormData = z.infer<typeof grnSchema>;

interface ComprehensiveGrnFormDialogProps {
  open: boolean;
  onClose: () => void;

  grn: GrnMastDto | null;
  departments: { value: string; label: string }[];
  suppliers: { value: string; label: string }[];
  products: { value: string; label: string }[];
}

const ComprehensiveGrnFormDialog: React.FC<ComprehensiveGrnFormDialogProps> = ({ open, onClose, grn, departments, suppliers, products }) => {
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [grnDetails, setGrnDetails] = useState<GrnDetailDto[]>([]); // For manually added products
  const [poGrnDetails, setPOGrnDetails] = useState<GrnDetailDto[]>([]); // For PO-based products
  const [issueDepartments, setIssueDepartments] = useState<IssueDepartmentData[]>([]); // Issue departments
  const [selectedProductForIssue, setSelectedProductForIssue] = useState<GrnDetailDto | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    invoice: true,
    po: false,
    manual: true,
    financial: false,
    configuration: false,
  });

  const isEditMode = !!grn && grn.GrnID > 0;
  const isApproved = grn?.GrnApprovedYN === "Y";
  const { generateGrnCode } = useGrn();
  const { showAlert } = useAlert();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<GrnFormData>({
    resolver: zodResolver(grnSchema),
    mode: "onChange",
  });

  const watchedDeptID = watch("DeptID");
  const watchedSupplierID = watch("SupplrID");
  const watchedGrnCode = watch("GrnCode");
  const watchedInvoiceNo = watch("InvoiceNo");
  const watchedDiscount = watch("Disc");
  const watchedDeptName = watch("DeptName");

  const isMandatoryFieldsFilled = !!(watchedDeptID && watchedSupplierID && watchedGrnCode && watchedInvoiceNo);

  // Combine both arrays for total calculations
  const allGrnDetails = useMemo(() => [...poGrnDetails, ...grnDetails], [poGrnDetails, grnDetails]);

  useEffect(() => {
    if (open) {
      if (grn) {
        const formData: GrnFormData = {
          GrnID: grn.GrnID || 0,
          GrnCode: grn.GrnCode || "",
          DeptID: grn.DeptID || 0,
          DeptName: grn.DeptName || "",
          SupplrID: grn.SupplrID || 0,
          SupplrName: grn.SupplrName || "",
          GrnDate: grn.GrnDate ? new Date(grn.GrnDate) : new Date(),
          InvoiceNo: grn.InvoiceNo || "",
          InvDate: grn.InvDate ? new Date(grn.InvDate) : new Date(),
          GrnType: grn.GrnType || "Invoice",
          GrnStatus: grn.GrnStatus || "Pending",
          GrnStatusCode: grn.GrnStatusCode || "PEND",
          GrnApprovedYN: grn.GrnApprovedYN || "N",
          GrnApprovedBy: grn.GrnApprovedBy || "",
          GrnApprovedID: grn.GrnApprovedID || 0,
          PoNo: grn.PoNo || "",
          PoID: grn.PoID || 0,
          PoDate: grn.PoDate ? new Date(grn.PoDate) : null,
          PoTotalAmt: grn.PoTotalAmt || 0,
          PoDiscAmt: grn.PoDiscAmt || 0,
          PoCoinAdjAmt: grn.PoCoinAdjAmt || 0,
          DcNo: grn.DcNo || "",
          Tot: grn.Tot || 0,
          Disc: grn.Disc || 0,
          NetTot: grn.NetTot || 0,
          TaxAmt: grn.TaxAmt || 0,
          TotalTaxableAmt: grn.TotalTaxableAmt || 0,
          NetCGSTTaxAmt: grn.NetCGSTTaxAmt || 0,
          NetSGSTTaxAmt: grn.NetSGSTTaxAmt || 0,
          BalanceAmt: grn.BalanceAmt || 0,
          OtherAmt: grn.OtherAmt || 0,
          CoinAdj: grn.CoinAdj || 0,
          TransDeptID: grn.TransDeptID || 0,
          TransDeptName: grn.TransDeptName || "",
          CatValue: grn.CatValue || "MEDI",
          CatDesc: grn.CatDesc || "REVENUE",
          AuGrpID: grn.AuGrpID || 18,
          DiscPercentageYN: grn.DiscPercentageYN || "N",
          GrnDetails: grn.GrnDetails || [],
          RActiveYN: grn.RActiveYN || "Y",
          RNotes: grn.RNotes || "",
        };

        reset(formData);
        const poBasedDetails = (grn.GrnDetails || []).filter((detail) => detail.PoDetID && detail.PoDetID > 0);
        const manualDetails = (grn.GrnDetails || []).filter((detail) => !detail.PoDetID || detail.PoDetID === 0);

        setPOGrnDetails(poBasedDetails);
        setGrnDetails(manualDetails);
        setIssueDepartments([]);
      } else {
        reset();
        setGrnDetails([]);
        setPOGrnDetails([]);
        setIssueDepartments([]);
      }
    }
  }, [open, grn, reset]);

  const handleGenerateCode = useCallback(async () => {
    if (!watchedDeptID) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }
    try {
      setIsGeneratingCode(true);
      const newCode = await generateGrnCode(watchedDeptID);
      setValue("GrnCode", newCode, { shouldValidate: true, shouldDirty: true });
      trigger();
    } catch (error) {
      showAlert("Error", "Failed to generate GRN code", "error");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [watchedDeptID, generateGrnCode, setValue, trigger, showAlert]);

  useEffect(() => {
    if (!isEditMode && watchedDeptID && !watchedGrnCode) {
      handleGenerateCode();
    }
  }, [watchedDeptID, isEditMode, watchedGrnCode, handleGenerateCode]);

  const handleDepartmentChange = useCallback(
    (value: any) => {
      const selectedDept = departments.find((dept) => dept.value === value.toString());
      if (selectedDept) {
        setValue("DeptID", Number(selectedDept.value), { shouldValidate: true, shouldDirty: true });
        setValue("DeptName", selectedDept.label, { shouldValidate: true, shouldDirty: true });
        trigger();
      }
    },
    [departments, setValue, trigger]
  );

  const handleSupplierChange = useCallback(
    (newValue: any) => {
      let selectedSupplier = null;
      if (newValue && typeof newValue === "object" && newValue.value) {
        selectedSupplier = suppliers.find((s) => s.value == newValue.value);
      } else if (newValue) {
        selectedSupplier = suppliers.find((s) => s.value == newValue);
      }
      if (selectedSupplier) {
        setValue("SupplrID", Number(selectedSupplier.value), { shouldValidate: true, shouldDirty: true });
        setValue("SupplrName", selectedSupplier.label, { shouldValidate: true, shouldDirty: true });
      } else {
        setValue("SupplrID", 0, { shouldValidate: true, shouldDirty: true });
        setValue("SupplrName", "", { shouldValidate: true, shouldDirty: true });
      }
      trigger("SupplrID");
    },
    [suppliers, setValue, trigger]
  );

  const calculateTotals = useCallback(
    (allDetails: GrnDetailDto[]) => {
      const itemsTotal = allDetails.reduce((sum, detail) => {
        const receivedQty = detail.RecvdQty || 0;
        const unitPrice = detail.UnitPrice || 0;
        return sum + receivedQty * unitPrice;
      }, 0);
      setValue("Tot", parseFloat(itemsTotal.toFixed(2)), { shouldDirty: true });
      const discountValue = watchedDiscount || 0;
      const otherCharges = getValues("OtherAmt") || 0;
      const coinAdjustment = getValues("CoinAdj") || 0;
      const totals = GRNHelpers.calculateGRNTotals(allDetails, discountValue, otherCharges, coinAdjustment);
      setValue("NetTot", totals.netTotal);
      setValue("TotalTaxableAmt", totals.totalTaxable);
      setValue("NetCGSTTaxAmt", totals.totalCGST);
      setValue("NetSGSTTaxAmt", totals.totalSGST);
      setValue("TaxAmt", totals.totalTax);
      setValue("BalanceAmt", totals.grandTotal);
      trigger();
    },
    [setValue, trigger, watchedDiscount, getValues]
  );

  const handleManualGrnDetailsChange = useCallback(
    (details: GrnDetailDto[]) => {
      setGrnDetails(details);
      calculateTotals([...poGrnDetails, ...details]);
    },
    [poGrnDetails, calculateTotals]
  );

  const handlePOGrnDetailsChange = useCallback(
    (details: GrnDetailDto[]) => {
      setPOGrnDetails(details);
      calculateTotals([...details, ...grnDetails]);
    },
    [grnDetails, calculateTotals]
  );

  const handlePoDataFetched = useCallback(
    (mast: PurchaseOrderMastDto | null, details: PurchaseOrderDetailDto[]) => {
      if (mast && details.length > 0) {
        showAlert("Success", `PO ${mast.pOCode} selected with ${details.length} items.`, "success");
        if (!watchedSupplierID && mast.supplierID) {
          handleSupplierChange(mast.supplierID);
        }
      } else if (mast) {
        showAlert("Info", `PO ${mast.pOCode} selected, but it has no item details.`, "info");
        setPOGrnDetails([]);
      } else {
        setPOGrnDetails([]);
        showAlert("Info", "PO selection cleared.", "info");
      }
    },
    [showAlert, watchedSupplierID, handleSupplierChange]
  );

  const handleIssueDepartmentChange = useCallback((departments: IssueDepartmentData[]) => {
    setIssueDepartments(departments);
  }, []);

  const handleDeleteAll = useCallback(() => {
    setGrnDetails([]);
    setPOGrnDetails([]);
    setIssueDepartments([]);
    calculateTotals([]);
    showAlert("Success", "All products removed from GRN", "success");
  }, [calculateTotals, showAlert]);

  const handleShowHistory = useCallback(() => {
    showAlert("Info", "History functionality to be implemented", "info");
  }, [showAlert]);

  const handleNewIssueDepartment = useCallback(() => {}, []);

  const handleApplyDiscount = useCallback(() => {
    calculateTotals(allGrnDetails);
    showAlert("Success", "Discount applied and totals recalculated", "success");
  }, [allGrnDetails, calculateTotals, showAlert]);

  const onFormSubmit = async (data: GrnFormData) => {
    if (!allGrnDetails || allGrnDetails.length === 0) {
      showAlert("Validation Error", "Please add at least one product to the GRN", "warning");
      return;
    }

    const validationResult = GRNHelpers.validateCompleteGRN({ ...data, GrnDetails: allGrnDetails });
    if (!validationResult.isValid) {
      showAlert("Validation Error", validationResult.errors.join(", "), "error");
      return;
    }
  };

  const handleClear = () => {
    reset();
    setGrnDetails([]);
    setPOGrnDetails([]);
    setIssueDepartments([]);
  };

  const handleSectionToggle = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const dialogActions = useMemo(() => {
    return (
      <Box sx={{ display: "flex", gap: 1 }}>
        <CustomButton variant="outlined" text={isEditMode ? "Reset" : "Clear"} icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || isApproved} color="inherit" />
        <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} />

        <SmartButton
          text={isEditMode ? "Update GRN" : "Create GRN"}
          onClick={handleSubmit(onFormSubmit)}
          variant="contained"
          color="primary"
          icon={SaveIcon}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isEditMode ? "Updating..." : "Creating..."}
          successText={isEditMode ? "Updated!" : "Created!"}
          disabled={isSubmitting || !isMandatoryFieldsFilled || isApproved}
        />
      </Box>
    );
  }, [handleSubmit, onFormSubmit, onClose, isEditMode, isSubmitting, isMandatoryFieldsFilled, isApproved]);

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title="Goods Receive Note (GRN)"
      maxWidth="xl"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <Box sx={{ width: "100%" }}>
        <form id="grn-form" onSubmit={handleSubmit(onFormSubmit)}>
          {isApproved && (
            <Alert severity="info" sx={{ mb: 2 }} icon={<ApproveIcon />}>
              This GRN has been approved and cannot be modified. Stock has been updated.
            </Alert>
          )}

          <Accordion expanded={expandedSections.basic} onChange={() => handleSectionToggle("basic")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <DeptIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Basic GRN Information
                </Typography>
                <Chip label="Required" size="small" color="error" variant="outlined" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="GrnCode"
                    control={control}
                    type="text"
                    label="GRN Code"
                    required
                    disabled={isEditMode || isApproved}
                    size="small"
                    helperText={isEditMode ? "Code cannot be changed" : isGeneratingCode ? "Generating..." : "Auto-generated"}
                    adornment={
                      !isEditMode &&
                      !isApproved && <CustomButton size="small" variant="outlined" text="Generate" onClick={handleGenerateCode} disabled={!watchedDeptID || isGeneratingCode} />
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="DeptID"
                    control={control}
                    type="select"
                    label="Department"
                    required
                    size="small"
                    options={departments}
                    onChange={handleDepartmentChange}
                    disabled={isEditMode || isApproved}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="SupplrID"
                    control={control}
                    type="select"
                    label="Supplier"
                    required
                    size="small"
                    options={suppliers}
                    onChange={handleSupplierChange}
                    disabled={isApproved}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name="GrnDate" control={control} type="datepicker" label="GRN Date" required size="small" disabled={isApproved} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="GrnType"
                    control={control}
                    type="select"
                    label="GRN Type"
                    size="small"
                    disabled={isApproved}
                    options={[{ value: "Invoice", label: "Invoice" }]}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name="DcNo" control={control} type="text" label="DC Number" size="small" disabled={isApproved} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expandedSections.invoice} onChange={() => handleSectionToggle("invoice")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <InvoiceIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Invoice Information
                </Typography>
                <Chip label="Required" size="small" color="error" variant="outlined" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <EnhancedFormField name="InvoiceNo" control={control} type="text" label="Invoice Number" required size="small" disabled={isApproved} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <EnhancedFormField name="InvDate" control={control} type="datepicker" label="Invoice Date" required size="small" disabled={isApproved} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <PurchaseOrderSection
            expanded={expandedSections.po}
            onChange={() => handleSectionToggle("po")}
            isApproved={isApproved}
            watchedDeptID={watchedDeptID}
            watchedDeptName={watchedDeptName}
            onPoDataFetched={handlePoDataFetched}
            onGRNDataFetched={handlePOGrnDetailsChange}
            issueDepartments={issueDepartments}
            onIssueDepartmentChange={handleIssueDepartmentChange}
          />

          <GrnDetailsComponent
            grnDetails={grnDetails}
            onGrnDetailsChange={handleManualGrnDetailsChange}
            disabled={isSubmitting}
            grnApproved={isApproved}
            expanded={expandedSections.manual}
            onToggle={() => handleSectionToggle("manual")}
            issueDepartments={issueDepartments}
            onIssueDepartmentChange={handleIssueDepartmentChange}
          />

          <GRNTotalsAndActionsSection
            grnDetails={allGrnDetails}
            control={control}
            setValue={setValue}
            watch={watch}
            onDeleteAll={handleDeleteAll}
            onShowHistory={handleShowHistory}
            onNewIssueDepartment={handleNewIssueDepartment}
            onApplyDiscount={handleApplyDiscount}
            disabled={isSubmitting}
            isApproved={isApproved}
            issueDepartments={issueDepartments}
            onIssueDepartmentChange={handleIssueDepartmentChange}
            selectedProductForIssue={selectedProductForIssue}
            onSelectedProductForIssueChange={setSelectedProductForIssue}
          />

          <Accordion expanded={expandedSections.configuration} onChange={() => handleSectionToggle("configuration")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Advanced Configuration
                </Typography>
                <Chip label="Optional" size="small" color="default" variant="outlined" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={getValues("DiscPercentageYN") === "Y"}
                          onChange={(e) => setValue("DiscPercentageYN", e.target.checked ? "Y" : "N")}
                          disabled={isApproved}
                        />
                      }
                      label="Discount as Percentage"
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Additional configuration options for discount calculations.
                  </Typography>

                  {issueDepartments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Issue Departments Summary:
                      </Typography>
                      <Stack spacing={1}>
                        {issueDepartments.map((dept) => (
                          <Chip key={dept.id} label={`${dept.productName} → ${dept.deptName} (${dept.quantity})`} size="small" variant="outlined" color="primary" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </form>
      </Box>
    </GenericDialog>
  );
};

export default ComprehensiveGrnFormDialog;
