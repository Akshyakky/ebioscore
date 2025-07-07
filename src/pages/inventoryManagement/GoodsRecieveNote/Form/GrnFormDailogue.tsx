import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { GrnDetailDto, GrnDto, GrnMastDto } from "@/interfaces/InventoryManagement/GRNDto";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle as ApproveIcon,
  Clear as ClearIcon,
  Business as DeptIcon,
  ExpandMore as ExpandMoreIcon,
  VisibilityOff as HideIcon,
  Receipt as InvoiceIcon,
  Save as SaveIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Chip, Grid, Stack, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGrn } from "../hooks/useGrnhooks";
import UnifiedGrnDetailsComponent from "./GrnPoandProductDetails";
import GRNTotalsAndActionsSection from "./GRNTotalsAndActionsSection";
import { IssueDepartmentData } from "./NewIssueDepartmentDialog";

const GRNHelpers = {
  calculateProductValue: (detail: Partial<GrnDetailDto>): number => {
    const qty = detail.acceptQty || detail.recvdQty || 0;
    const price = detail.unitPrice || 0;
    const discount = detail.discAmt || 0;
    const discountPercentage = detail.discPercentage || 0;
    let productValue = qty * price;
    if (discount > 0) {
      productValue -= discount;
    } else if (discountPercentage > 0) {
      productValue -= (productValue * discountPercentage) / 100;
    }
    return Math.max(0, Math.round(productValue * 100) / 100);
  },

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
    const cgstRate = detail.cgstPerValue || 0;
    const sgstRate = detail.sgstPerValue || 0;
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
      totalQty += detail.acceptQty || detail.recvdQty || 0;
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
};

const grnSchema = z.object({
  grnID: z.number().default(0),
  grnCode: z.string().optional(),
  deptID: z.number().optional().nullable(),
  deptName: z.string().optional(),
  supplrID: z.number().optional().nullable(),
  supplrName: z.string().optional(),
  grnDate: z.union([z.date(), z.any()]).optional().nullable(),
  invoiceNo: z.string().optional(),
  invDate: z.union([z.date(), z.any()]).optional().nullable(),
  grnType: z.string().default("Invoice"),
  grnStatus: z.string().default("Pending"),
  grnStatusCode: z.string().default("PEND"),
  grnApprovedYN: z.string().default("N"),
  grnApprovedBy: z.string().optional(),
  grnApprovedID: z.number().optional(),
  poNo: z.string().optional(),
  poID: z.number().optional(),
  poDate: z.union([z.date(), z.any()]).optional().nullable(),
  poTotalAmt: z.number().optional().default(0),
  poDiscAmt: z.number().optional().default(0),
  poCoinAdjAmt: z.number().optional().default(0),
  dcNo: z.string().optional(),
  tot: z.number().optional().default(0),
  disc: z.number().optional().default(0),
  netTot: z.number().optional().default(0),
  taxAmt: z.number().optional().default(0),
  totalTaxableAmt: z.number().optional().default(0),
  netCGSTTaxAmt: z.number().optional().default(0),
  netSGSTTaxAmt: z.number().optional().default(0),
  balanceAmt: z.number().optional().default(0),
  otherAmt: z.number().optional().default(0),
  coinAdj: z.number().optional().default(0),
  transDeptID: z.number().optional(),
  transDeptName: z.string().optional(),
  catValue: z.string().default("MEDI"),
  catDesc: z.string().default("REVENUE"),
  auGrpID: z.number().default(18),
  discPercentageYN: z.string().default("N"),
  rActiveYN: z.string().default("Y"),
  rNotes: z.string().optional().nullable(),
  grnApprovedDate: z.string().optional().nullable(),
});

type GrnFormData = z.infer<typeof grnSchema>;

interface ComprehensiveGrnFormDialogProps {
  open: boolean;
  onClose: () => void;
  grn: GrnDto | null;
  departments: { value: string; label: string }[];
  suppliers: { value: string; label: string }[];
  products: { value: string; label: string }[];
}

const ComprehensiveGrnFormDialog: React.FC<ComprehensiveGrnFormDialogProps> = ({ open, onClose, grn, departments, suppliers }) => {
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [allGrnDetails, setAllGrnDetails] = useState<GrnDetailDto[]>([]);
  const [issueDepartments, setIssueDepartments] = useState<IssueDepartmentData[]>([]);
  const [selectedProductForIssue, setSelectedProductForIssue] = useState<GrnDetailDto | null>(null);
  const [originalGrnID, setOriginalGrnID] = useState<number>(0);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    invoice: true,
    financial: false,
    configuration: false,
  });

  const isEditMode = !!grn && grn.grnMastDto.grnID > 0;
  const isApproved = grn?.grnMastDto.grnApprovedYN === "Y";
  const { generateGrnCode, createGrn } = useGrn();
  const { showAlert } = useAlert();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { isSubmitting },
  } = useForm<GrnFormData>({
    resolver: zodResolver(grnSchema),
    mode: "onChange",
  });

  const watcheddeptID = watch("deptID");
  const watchedgrnCode = watch("grnCode");
  const watcheddiscount = watch("disc");

  useEffect(() => {
    if (open) {
      if (grn) {
        setOriginalGrnID(grn.grnMastDto.grnID);
        const formData: GrnFormData = {
          grnID: grn.grnMastDto.grnID || 0,
          grnCode: grn.grnMastDto.grnCode || "",
          deptID: grn.grnMastDto.deptID || 0,
          deptName: grn.grnMastDto.deptName || "",
          supplrID: grn.grnMastDto.supplrID || 0,
          supplrName: grn.grnMastDto.supplrName || "",
          grnDate: grn.grnMastDto.grnDate ? new Date(grn.grnMastDto.grnDate) : null,
          invoiceNo: grn.grnMastDto.invoiceNo || "",
          invDate: grn.grnMastDto.invDate ? new Date(grn.grnMastDto.invDate) : null,
          grnType: grn.grnMastDto.grnType || "Invoice",
          grnStatus: grn.grnMastDto.grnStatus || "Pending",
          grnStatusCode: grn.grnMastDto.grnStatusCode || "PEND",
          grnApprovedYN: grn.grnMastDto.grnApprovedYN || "N",
          grnApprovedBy: grn.grnMastDto.grnApprovedBy || "",
          grnApprovedID: grn.grnMastDto.grnApprovedID || 0,
          grnApprovedDate: grn.grnMastDto.grnApprovedDate || null,
          poNo: grn.grnMastDto.poNo || "",
          poID: grn.grnMastDto.poID || 0,
          poDate: grn.grnMastDto.poDate ? new Date(grn.grnMastDto.poDate) : null,
          poTotalAmt: grn.grnMastDto.poTotalAmt || 0,
          poDiscAmt: grn.grnMastDto.poDiscAmt || 0,
          poCoinAdjAmt: grn.grnMastDto.poCoinAdjAmt || 0,
          dcNo: grn.grnMastDto.dcNo || "",
          tot: grn.grnMastDto.tot || 0,
          disc: grn.grnMastDto.disc || 0,
          netTot: grn.grnMastDto.netTot || 0,
          taxAmt: grn.grnMastDto.taxAmt || 0,
          totalTaxableAmt: grn.grnMastDto.totalTaxableAmt || 0,
          netCGSTTaxAmt: grn.grnMastDto.netCGSTTaxAmt || 0,
          netSGSTTaxAmt: grn.grnMastDto.netSGSTTaxAmt || 0,
          balanceAmt: grn.grnMastDto.balanceAmt || 0,
          otherAmt: grn.grnMastDto.otherAmt || 0,
          coinAdj: grn.grnMastDto.coinAdj || 0,
          transDeptID: grn.grnMastDto.transDeptID || 0,
          transDeptName: grn.grnMastDto.transDeptName || "",
          catValue: grn.grnMastDto.catValue || "MEDI",
          catDesc: grn.grnMastDto.catDesc || "REVENUE",
          auGrpID: grn.grnMastDto.auGrpID || 18,
          discPercentageYN: grn.grnMastDto.discPercentageYN || "N",
          rActiveYN: grn.grnMastDto.rActiveYN || "Y",
          rNotes: grn.grnMastDto.rNotes || "",
        };
        reset(formData);

        if (grn.grnMastDto.grnApprovedYN === "Y" || grn.grnMastDto.rActiveYN === "N") {
          setExpandedSections((prev) => ({ ...prev, configuration: true }));
        }

        const grnDetailsList = grn.grnDetailDto || [];
        setAllGrnDetails(grnDetailsList);
        setIssueDepartments([]);
      } else {
        setOriginalGrnID(0);
        reset();
        setAllGrnDetails([]);
        setIssueDepartments([]);
      }
    }
  }, [open, grn, reset]);

  const handleGenerateCode = useCallback(async () => {
    if (!watcheddeptID) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }
    try {
      setIsGeneratingCode(true);
      const newCode = await generateGrnCode(watcheddeptID);
      if (newCode) {
        setValue("grnCode", newCode, { shouldValidate: true, shouldDirty: true });
        trigger();
      }
    } catch (error) {
      showAlert("Error", "Failed to generate GRN code", "error");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [watcheddeptID, generateGrnCode, setValue, trigger, showAlert]);

  useEffect(() => {
    if (!isEditMode && watcheddeptID && !watchedgrnCode) {
      handleGenerateCode();
    }
  }, [watcheddeptID, isEditMode, watchedgrnCode, handleGenerateCode]);

  const handleDepartmentChange = useCallback(
    (value: any) => {
      const selectedDept = departments.find((dept) => dept.value === value.toString());
      if (selectedDept) {
        setValue("deptID", Number(selectedDept.value), { shouldValidate: true, shouldDirty: true });
        setValue("deptName", selectedDept.label, { shouldValidate: true, shouldDirty: true });
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
        setValue("supplrID", Number(selectedSupplier.value), { shouldValidate: true, shouldDirty: true });
        setValue("supplrName", selectedSupplier.label, { shouldValidate: true, shouldDirty: true });
      } else {
        setValue("supplrID", 0, { shouldValidate: true, shouldDirty: true });
        setValue("supplrName", "", { shouldValidate: true, shouldDirty: true });
      }
      trigger("supplrID");
    },
    [suppliers, setValue, trigger]
  );

  const calculateTotals = useCallback(
    (details: GrnDetailDto[]) => {
      const itemsTotal = details.reduce((sum, detail) => {
        const receivedQty = detail.recvdQty || 0;
        const unitPrice = detail.unitPrice || 0;
        return sum + receivedQty * unitPrice;
      }, 0);
      setValue("tot", parseFloat(itemsTotal.toFixed(2)), { shouldDirty: true });
      const discountValue = watcheddiscount || 0;
      const otherCharges = getValues("otherAmt") || 0;
      const coinAdjustment = getValues("coinAdj") || 0;
      const totals = GRNHelpers.calculateGRNTotals(details, discountValue, otherCharges, coinAdjustment);
      setValue("netTot", totals.netTotal);
      setValue("totalTaxableAmt", totals.totalTaxable);
      setValue("netCGSTTaxAmt", totals.totalCGST);
      setValue("netSGSTTaxAmt", totals.totalSGST);
      setValue("taxAmt", totals.totalTax);
      setValue("balanceAmt", totals.grandTotal);
      trigger();
    },
    [setValue, trigger, watcheddiscount, getValues]
  );

  const handleApprovalChange = useCallback(
    (value: boolean) => {
      const stringValue = value ? "Y" : "N";
      setValue("grnApprovedYN", stringValue, { shouldValidate: true, shouldDirty: true });

      if (value) {
        setValue("grnStatus", "Approved", { shouldValidate: true, shouldDirty: true });
        setValue("grnStatusCode", "APPR", { shouldValidate: true, shouldDirty: true });
        setValue("grnApprovedDate", new Date().toISOString(), { shouldValidate: true, shouldDirty: true });
      } else {
        setValue("grnStatus", "Pending", { shouldValidate: true, shouldDirty: true });
        setValue("grnStatusCode", "PEND", { shouldValidate: true, shouldDirty: true });
        setValue("grnApprovedDate", null, { shouldValidate: true, shouldDirty: true });
      }
      trigger();
    },
    [setValue, trigger]
  );

  const handleDiscountPercentageChange = useCallback(
    (value: boolean) => {
      const stringValue = value ? "Y" : "N";
      setValue("discPercentageYN", stringValue, { shouldValidate: true, shouldDirty: true });
      trigger();
    },
    [setValue, trigger]
  );

  const handleActiveStatusChange = useCallback(
    (value: boolean) => {
      const stringValue = value ? "Y" : "N";
      setValue("rActiveYN", stringValue, { shouldValidate: true, shouldDirty: true });
      trigger();
    },
    [setValue, trigger]
  );

  const handleUnifiedGrnDetailsChange = useCallback(
    (details: GrnDetailDto[]) => {
      setAllGrnDetails(details);
      calculateTotals(details);
    },
    [calculateTotals]
  );

  const handlePoDataFetched = useCallback(
    (mast: PurchaseOrderMastDto | null, details: PurchaseOrderDetailDto[]) => {
      if (mast && details.length > 0) {
        showAlert("Success", `PO ${mast.pOCode} selected with ${details.length} items.`, "success");
        if (!watch("supplrID") && mast.supplierID) {
          handleSupplierChange(mast.supplierID);
        }
        setValue("poID", mast.pOID);
        setValue("poNo", mast.pOCode || "");
        setValue("poDate", mast.pODate ? new Date(mast.pODate) : null);
        setValue("poTotalAmt", mast.totalAmt || 0);
        setValue("poDiscAmt", mast.discAmt || 0);
      } else if (mast) {
        showAlert("Info", `PO ${mast.pOCode} selected, but it has no item details.`, "info");
      } else {
        showAlert("Info", "PO selection cleared.", "info");
      }
    },
    [showAlert, watch, handleSupplierChange, setValue]
  );

  const handleIssueDepartmentChange = useCallback((departments: IssueDepartmentData[]) => {
    setIssueDepartments(departments);
  }, []);

  const handleDeleteAll = useCallback(() => {
    setAllGrnDetails([]);
    setIssueDepartments([]);
    calculateTotals([]);
    showAlert("Success", "All products removed from GRN", "success");
  }, [calculateTotals, showAlert]);

  const handleShowHistory = useCallback(() => {
    showAlert("Info", "History functionality to be implemented", "info");
  }, [showAlert]);

  const handleNewIssueDepartment = useCallback(() => {}, []);

  const handleApplydiscount = useCallback(() => {
    calculateTotals(allGrnDetails);
    showAlert("Success", "Discount applied and totals recalculated", "success");
  }, [allGrnDetails, calculateTotals, showAlert]);

  const onSubmit = async (data: GrnFormData) => {
    try {
      if (!data.deptID || data.deptID === 0) {
        showAlert("Validation Error", "Department is required", "error");
        return;
      }
      if (!data.supplrID || data.supplrID === 0) {
        showAlert("Validation Error", "Supplier is required", "error");
        return;
      }
      if (!data.invoiceNo || data.invoiceNo.trim() === "") {
        showAlert("Validation Error", "Invoice number is required", "error");
        return;
      }
      if (allGrnDetails.length === 0) {
        showAlert("Validation Error", "At least one product detail is required", "error");
        return;
      }

      const selectedDept = departments.find((d) => Number(d.value) === Number(data.deptID));
      const selectedSupplier = suppliers.find((s) => Number(s.value) === Number(data.supplrID));
      const masterGrnID = isEditMode ? originalGrnID : 0;

      const isBeingApproved = data.grnApprovedYN === "Y";
      const currentTime = new Date().toISOString();

      const processedGrnDetails = allGrnDetails.map((detail, index) => {
        if (!detail.productID || detail.productID === 0) {
          throw new Error(`Product ID is required for item ${detail.productName || "Unknown Product"}`);
        }
        if (!detail.recvdQty || detail.recvdQty <= 0) {
          throw new Error(`Received quantity must be greater than 0 for ${detail.productName || "Unknown Product"}`);
        }
        if (!detail.unitPrice || detail.unitPrice <= 0) {
          throw new Error(`Unit price must be greater than 0 for ${detail.productName || "Unknown Product"}`);
        }

        return {
          grnDetID: detail.grnDetID,
          grnID: masterGrnID,
          productID: detail.productID,
          catValue: detail.catValue || data.catValue || "MEDI",
          recvdQty: detail.recvdQty,
          acceptQty: detail.acceptQty || detail.recvdQty,
          unitPrice: detail.unitPrice,
          pGrpID: detail.pGrpID || null,
          pGrpName: detail.pGrpName || "",
          productCode: detail.productCode || "",
          mfID: detail.mfID || null,
          pUnitID: detail.pUnitID || null,
          pUnitName: detail.pUnitName || "",
          pUnitsPerPack: detail.pUnitsPerPack || 1,
          pkgID: detail.pkgID || null,
          batchNo: detail.batchNo || "",
          expiryDate: detail.expiryDate ? new Date(detail.expiryDate).toISOString() : new Date().toISOString(),
          tax: detail.tax || 0,
          sellUnitPrice: detail.sellUnitPrice || detail.unitPrice,
          freeItems: detail.freeItems || 0,
          productValue: detail.productValue || 0,
          productNotes: detail.productNotes || "",
          psGrpID: detail.psGrpID || null,
          chargeablePercent: detail.chargeablePercent || 0,
          discAmt: detail.discAmt || 0,
          discPercentage: detail.discPercentage || 0,
          expiryYN: detail.expiryYN || "N",
          isFreeItemYN: detail.isFreeItemYN || "N",
          itemMrpValue: detail.itemMrpValue || 0,
          itemTotalProfit: detail.itemTotalProfit || 0,
          itemTotalVat: detail.itemTotalVat || 0,
          manufacturerCode: detail.manufacturerCode || "",
          manufacturerID: detail.manufacturerID || null,
          manufacturerName: detail.manufacturerName || "",
          mrpAbated: detail.mrpAbated || 0,
          mrp: detail.mrp || detail.unitPrice,
          poDetID: detail.poDetID || null,
          requiredUnitQty: detail.requiredUnitQty || detail.recvdQty,
          taxAfterDiscOnMrpYN: detail.taxAfterDiscOnMrpYN || "N",
          taxAfterDiscYN: detail.taxAfterDiscYN || "N",
          taxCode: detail.taxCode || "",
          taxID: detail.taxID || null,
          taxModeCode: detail.taxModeCode || "",
          taxModeDescription: detail.taxModeDescription || "",
          taxModeID: detail.taxModeID || "",
          taxName: detail.taxName || "",
          taxOnFreeItemsYN: detail.taxOnFreeItemsYN || "N",
          taxOnMrpYN: detail.taxOnMrpYN || "N",
          taxOnUnitPriceYN: detail.taxOnUnitPriceYN || "Y",
          catDesc: detail.catDesc || data.catDesc || "REVENUE",
          mfName: detail.mfName || "",
          pkgName: detail.pkgName || "",
          productName: detail.productName || "",
          psGrpName: detail.psGrpName || "",
          refNo: detail.refNo || "",
          hsnCode: detail.hsnCode || "",
          cgstPerValue: detail.cgstPerValue || 0,
          cgstTaxAmt: detail.cgstTaxAmt || 0,
          sgstPerValue: detail.sgstPerValue || 0,
          sgstTaxAmt: detail.sgstTaxAmt || 0,
          taxableAmt: detail.taxableAmt || 0,
          defaultPrice: detail.defaultPrice || detail.unitPrice || 0,
          rActiveYN: detail.rActiveYN || "Y",
          rCreatedBy: detail.rCreatedBy || "",
          rCreatedDate: detail.rCreatedDate || "",
          rUpdatedBy: detail.rUpdatedBy || "",
          rUpdatedDate: detail.rUpdatedDate || "",
          rNotes: detail.rNotes || "",
        };
      });

      const grnMastData: GrnMastDto = {
        grnID: masterGrnID,
        deptID: data.deptID,
        deptName: selectedDept?.label || "",
        grnDate: data.grnDate ? new Date(data.grnDate).toISOString() : new Date().toISOString(),
        invoiceNo: data.invoiceNo.trim(),
        invDate: data.invDate ? new Date(data.invDate).toISOString() : new Date().toISOString(),
        supplrID: data.supplrID,
        supplrName: selectedSupplier?.label || "",
        tot: data.tot || 0,
        disc: data.disc || 0,
        netTot: data.netTot || 0,
        auGrpID: data.auGrpID || 18,
        balanceAmt: data.balanceAmt || 0,
        catDesc: data.catDesc || "REVENUE",
        catValue: data.catValue || "MEDI",
        coinAdj: data.coinAdj || 0,
        dcNo: data.dcNo || "",
        discPercentageYN: data.discPercentageYN || "N",
        grnApprovedYN: data.grnApprovedYN || "N",
        grnApprovedBy: isBeingApproved ? data.grnApprovedBy || "" : data.grnApprovedBy || "",
        grnApprovedID: isBeingApproved ? data.grnApprovedID || null : data.grnApprovedID || null,
        grnApprovedDate: isBeingApproved ? currentTime : null,
        grnStatusCode: isBeingApproved ? "APPR" : data.grnStatusCode || "PEND",
        grnStatus: isBeingApproved ? "Approved" : data.grnStatus || "Pending",
        otherAmt: data.otherAmt || 0,
        poCoinAdjAmt: data.poCoinAdjAmt || 0,
        poDate: data.poDate ? new Date(data.poDate).toISOString() : null,
        poDiscAmt: data.poDiscAmt || 0,
        poID: data.poID || null,
        poNo: data.poNo || "",
        poTotalAmt: data.poTotalAmt || 0,
        taxAmt: data.taxAmt || 0,
        transDeptID: data.transDeptID || null,
        transDeptName: data.transDeptName || "",
        grnCode: data.grnCode || "",
        grnType: data.grnType || "Invoice",
        totalTaxableAmt: data.totalTaxableAmt || 0,
        netCGSTTaxAmt: data.netCGSTTaxAmt || 0,
        netSGSTTaxAmt: data.netSGSTTaxAmt || 0,
        rActiveYN: data.rActiveYN || "Y",
        rCreatedBy: "",
        rCreatedDate: "",
        rUpdatedBy: "",
        rUpdatedDate: "",
        rNotes: data.rNotes || "",
      };

      const formattedData: GrnDto = {
        grnMastDto: grnMastData,
        grnDetailDto: processedGrnDetails,
      };

      const response = await createGrn(formattedData);
      if (response.success) {
        const successMessage = isEditMode
          ? `GRN updated successfully${isBeingApproved ? " and approved. Stock has been updated." : "."}`
          : `GRN created successfully with ${formattedData.grnDetailDto?.length || 0} product(s)${isBeingApproved ? " and approved. Stock has been updated." : "."}`;

        showAlert("Success", successMessage, "success");
        onClose();
      } else {
        throw new Error(response.errorMessage || "Failed to save GRN");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      showAlert("Error", isEditMode ? `Failed to update GRN: ${errorMessage}` : `Failed to create GRN: ${errorMessage}`, "error");
    }
  };

  const handleClear = () => {
    reset();
    setAllGrnDetails([]);
    setIssueDepartments([]);
    setOriginalGrnID(0);
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
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={SaveIcon}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isEditMode ? "Updating..." : "Creating..."}
          successText={isEditMode ? "Updated!" : "Created!"}
          disabled={isSubmitting}
        />
      </Box>
    );
  }, [handleSubmit, onSubmit, onClose, isEditMode, isSubmitting, isApproved]);

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={`Goods Receive Note (GRN) ${isEditMode ? `- Edit GRN ${originalGrnID}` : "- New"}`}
      maxWidth="xl"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <Box sx={{ width: "100%" }}>
        {isApproved && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<ApproveIcon />}>
            This GRN has been approved and cannot be modified. Stock has been updated.
          </Alert>
        )}

        {isEditMode && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Editing GRN {originalGrnID} - Changes will update existing records
          </Alert>
        )}

        {issueDepartments.length > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Issue Departments Active:</strong> {issueDepartments.length} departments configured for this GRN
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              {issueDepartments.slice(0, 3).map((dept) => (
                <Chip key={dept.id} label={`${dept.deptName}: ${dept.quantity}`} size="small" color="success" variant="outlined" />
              ))}
              {issueDepartments.length > 3 && <Chip label={`+${issueDepartments.length - 3} more`} size="small" color="default" variant="outlined" />}
            </Stack>
          </Alert>
        )}

        <Accordion expanded={expandedSections.basic} onChange={() => handleSectionToggle("basic")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <DeptIcon color="primary" />
              <Typography variant="h6" color="primary">
                Basic GRN Information
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="grnCode"
                  control={control}
                  type="text"
                  label="GRN Code"
                  disabled={isEditMode}
                  size="small"
                  helperText={isEditMode ? "Code cannot be changed" : isGeneratingCode ? "Generating..." : "Auto-generated"}
                  adornment={
                    !isEditMode && <CustomButton size="small" variant="outlined" text="Generate" onClick={handleGenerateCode} disabled={!watcheddeptID || isGeneratingCode} />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="deptID"
                  control={control}
                  type="select"
                  label="Department"
                  size="small"
                  options={departments}
                  onChange={handleDepartmentChange}
                  disabled={isEditMode}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="supplrID" control={control} type="select" label="Supplier" size="small" options={suppliers} onChange={handleSupplierChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="grnDate" control={control} type="datepicker" label="GRN Date" size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="grnType" control={control} type="select" label="GRN Type" size="small" options={[{ value: "Invoice", label: "Invoice" }]} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="dcNo" control={control} type="text" label="DC Number" size="small" />
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
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="invoiceNo" control={control} type="text" label="Invoice Number" size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="invDate" control={control} type="datepicker" label="Invoice Date" size="small" />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <UnifiedGrnDetailsComponent
          grnDetails={allGrnDetails}
          onGrnDetailsChange={handleUnifiedGrnDetailsChange}
          control={control}
          setValue={setValue}
          watch={watch}
          disabled={isSubmitting}
          grnApproved={isApproved}
          grnID={originalGrnID}
          catValue={watch("catValue") || "MEDI"}
          issueDepartments={issueDepartments}
          onIssueDepartmentChange={handleIssueDepartmentChange}
          onPoDataFetched={handlePoDataFetched}
        />

        <GRNTotalsAndActionsSection
          grnDetails={allGrnDetails}
          control={control}
          setValue={setValue}
          watch={watch}
          onDeleteAll={handleDeleteAll}
          onShowHistory={handleShowHistory}
          onNewIssueDepartment={handleNewIssueDepartment}
          onApplyDiscount={handleApplydiscount}
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
                  <EnhancedFormField name="discPercentageYN" control={control} type="switch" label="Discount as Percentage" onChange={handleDiscountPercentageChange} />
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ApproveIcon color="success" fontSize="small" />
                    <EnhancedFormField name="grnApprovedYN" control={control} type="switch" color="success" label="Approve GRN" onChange={handleApprovalChange} />
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {getValues("rActiveYN") === "Y" ? <ViewIcon color="warning" fontSize="small" /> : <HideIcon color="warning" fontSize="small" />}
                    <EnhancedFormField
                      name="rActiveYN"
                      control={control}
                      type="switch"
                      color="warning"
                      label={getValues("rActiveYN") === "Y" ? "Visible" : "Hidden"}
                      onChange={handleActiveStatusChange}
                    />
                  </Box>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Additional configuration options for discount calculations and GRN status management.
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

        <Accordion expanded={expandedSections.financial} onChange={() => handleSectionToggle("financial")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" color="primary">
                Notes & Comments
              </Typography>
              <Chip label="Optional" size="small" color="default" variant="outlined" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <EnhancedFormField name="rNotes" control={control} type="textarea" label="Notes" placeholder="Enter any additional notes or comments for this GRN..." fullWidth />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </GenericDialog>
  );
};

export default ComprehensiveGrnFormDialog;
