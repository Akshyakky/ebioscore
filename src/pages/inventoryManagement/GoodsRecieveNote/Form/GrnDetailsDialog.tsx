// import CustomButton from "@/components/Button/CustomButton";
// import SmartButton from "@/components/Button/SmartButton";
// import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
// import GenericDialog from "@/components/GenericDialog/GenericDialog";
// import { GrnDetailDto, GrnDto, GrnMastDto } from "@/interfaces/InventoryManagement/GRNDto";
// import { PurchaseOrderDetailDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
// import { useAlert } from "@/providers/AlertProvider";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   CheckCircle as ApproveIcon,
//   Clear as ClearIcon,
//   Business as DeptIcon,
//   ExpandMore as ExpandMoreIcon,
//   Receipt as InvoiceIcon,
//   Save as SaveIcon,
//   Warning as WarningIcon,
// } from "@mui/icons-material";
// import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Chip, FormControlLabel, Grid, Stack, Switch, Typography } from "@mui/material";
// import dayjs from "dayjs";
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

// import GrnDetailsComponent from "./GrnDetailsComponent";
// import GRNTotalsAndActionsSection from "./GRNTotalsAndActionsSection";

// import { useGrn } from "../hooks/useGrnhooks";
// import { IssueDepartmentData } from "./NewIssueDepartmentDialog";
// import PurchaseOrderSection from "./purchaseOrderSection";

// // Helper functions for GRN calculations
// const GRNHelpers = {
//   /**
//    * Calculate product value for a GRN detail with all considerations
//    */
//   calculateProductValue: (detail: Partial<GrnDetailDto>): number => {
//     const qty = detail.AcceptQty || detail.RecvdQty || 0;
//     const price = detail.UnitPrice || 0;
//     const discount = detail.DiscAmt || 0;
//     const discountPercentage = detail.DiscPercentage || 0;

//     let productValue = qty * price;

//     // Apply discount
//     if (discount > 0) {
//       productValue -= discount;
//     } else if (discountPercentage > 0) {
//       productValue -= (productValue * discountPercentage) / 100;
//     }

//     return Math.max(0, Math.round(productValue * 100) / 100);
//   },

//   /**
//    * Calculate comprehensive tax amounts
//    */
//   calculateTaxAmounts: (
//     detail: Partial<GrnDetailDto>
//   ): {
//     cgstAmount: number;
//     sgstAmount: number;
//     taxableAmount: number;
//     totalTax: number;
//     totalWithTax: number;
//   } => {
//     const productValue = GRNHelpers.calculateProductValue(detail);
//     const cgstRate = detail.CgstPerValue || 0;
//     const sgstRate = detail.SgstPerValue || 0;

//     const taxableAmount = productValue;
//     const cgstAmount = (taxableAmount * cgstRate) / 100;
//     const sgstAmount = (taxableAmount * sgstRate) / 100;
//     const totalTax = cgstAmount + sgstAmount;

//     return {
//       cgstAmount: Math.round(cgstAmount * 100) / 100,
//       sgstAmount: Math.round(sgstAmount * 100) / 100,
//       taxableAmount: Math.round(taxableAmount * 100) / 100,
//       totalTax: Math.round(totalTax * 100) / 100,
//       totalWithTax: Math.round((taxableAmount + totalTax) * 100) / 100,
//     };
//   },

//   /**
//    * Calculate comprehensive GRN totals
//    */
//   calculateGRNTotals: (
//     details: GrnDetailDto[],
//     discount: number = 0,
//     otherCharges: number = 0,
//     coinAdjustment: number = 0
//   ): {
//     total: number;
//     netTotal: number;
//     totalTaxable: number;
//     totalCGST: number;
//     totalSGST: number;
//     totalTax: number;
//     grandTotal: number;
//     totalItems: number;
//     totalQty: number;
//   } => {
//     let total = 0;
//     let totalTaxable = 0;
//     let totalCGST = 0;
//     let totalSGST = 0;
//     let totalItems = details.length;
//     let totalQty = 0;

//     details.forEach((detail) => {
//       const productValue = GRNHelpers.calculateProductValue(detail);
//       const taxAmounts = GRNHelpers.calculateTaxAmounts(detail);

//       total += productValue;
//       totalTaxable += taxAmounts.taxableAmount;
//       totalCGST += taxAmounts.cgstAmount;
//       totalSGST += taxAmounts.sgstAmount;
//       totalQty += detail.AcceptQty || detail.RecvdQty || 0;
//     });

//     const netTotal = total - discount;
//     const totalTax = totalCGST + totalSGST;
//     const grandTotal = netTotal + totalTax + otherCharges + coinAdjustment;

//     return {
//       total: Math.round(total * 100) / 100,
//       netTotal: Math.round(netTotal * 100) / 100,
//       totalTaxable: Math.round(totalTaxable * 100) / 100,
//       totalCGST: Math.round(totalCGST * 100) / 100,
//       totalSGST: Math.round(totalSGST * 100) / 100,
//       totalTax: Math.round(totalTax * 100) / 100,
//       grandTotal: Math.round(grandTotal * 100) / 100,
//       totalItems,
//       totalQty,
//     };
//   },

//   validateGRNMaster: (grn: Partial<GrnMastDto>): { isValid: boolean; errors: string[]; warnings?: string[] } => {
//     const errors: string[] = [];
//     const warnings: string[] = [];
//     if (!grn.DeptID || grn.DeptID <= 0) {
//       errors.push("Department is required");
//     }

//     if (!grn.DeptName || grn.DeptName.trim() === "") {
//       errors.push("Department name is required");
//     }

//     if (!grn.SupplrID || grn.SupplrID <= 0) {
//       errors.push("Supplier is required");
//     }

//     if (!grn.SupplrName || grn.SupplrName.trim() === "") {
//       errors.push("Supplier name is required");
//     }

//     if (!grn.InvoiceNo || grn.InvoiceNo.trim() === "") {
//       errors.push("Invoice number is required");
//     }

//     if (!grn.GrnDate) {
//       errors.push("GRN date is required");
//     }

//     if (!grn.InvDate) {
//       errors.push("Invoice date is required");
//     }

//     if (grn.GrnDate && grn.InvDate) {
//       const grnDate = new Date(grn.GrnDate);
//       const invDate = new Date(grn.InvDate);
//       if (grnDate < invDate) {
//         warnings.push("GRN date is earlier than invoice date");
//       }

//       const today = new Date();
//       if (grnDate > today) {
//         warnings.push("GRN date is in the future");
//       }
//     }

//     if (grn.Disc && grn.Tot && grn.Disc > grn.Tot) {
//       errors.push("Discount cannot be greater than total amount");
//     }

//     return {
//       isValid: errors.length === 0,
//       errors,
//       warnings,
//     };
//   },

//   /**
//    * Validate GRN detail data with comprehensive checks
//    */
//   validateGRNDetail: (detail: Partial<GrnDetailDto>, index: number): { isValid: boolean; errors: string[]; warnings?: string[] } => {
//     const errors: string[] = [];
//     const warnings: string[] = [];

//     // Required field validations
//     if (!detail.ProductID || detail.ProductID <= 0) {
//       errors.push(`Product is required for item ${index + 1}`);
//     }

//     if (!detail.catValue || detail.catValue.trim() === "") {
//       errors.push(`Category value is required for item ${index + 1}`);
//     }

//     if (!detail.RecvdQty || detail.RecvdQty <= 0) {
//       errors.push(`Received quantity must be greater than 0 for item ${index + 1}`);
//     }

//     if (!detail.UnitPrice || detail.UnitPrice <= 0) {
//       errors.push(`Unit price must be greater than 0 for item ${index + 1}`);
//     }

//     // Business rule validations
//     if (detail.AcceptQty && detail.RecvdQty && detail.AcceptQty > detail.RecvdQty) {
//       errors.push(`Accept quantity cannot be greater than received quantity for item ${index + 1}`);
//     }

//     if (detail.FreeItems && detail.RecvdQty && detail.FreeItems > detail.RecvdQty) {
//       warnings.push(`Free items quantity seems high for item ${index + 1}`);
//     }

//     if (detail.DiscAmt && detail.UnitPrice && detail.RecvdQty) {
//       const productValue = detail.UnitPrice * (detail.RecvdQty || 0);
//       if (detail.DiscAmt > productValue) {
//         errors.push(`Discount amount cannot be greater than product value for item ${index + 1}`);
//       }
//     }

//     if (detail.DiscPercentage && detail.DiscPercentage > 100) {
//       errors.push(`Discount percentage cannot be greater than 100% for item ${index + 1}`);
//     }

//     return {
//       isValid: errors.length === 0,
//       errors,
//       warnings,
//     };
//   },

//   validateCompleteGRN: (grn: Partial<GrnMastDto & { GrnDetails: GrnDetailDto[] }>): { isValid: boolean; errors: string[]; warnings?: string[] } => {
//     const masterValidation = GRNHelpers.validateGRNMaster(grn);
//     const allErrors = [...masterValidation.errors];
//     const allWarnings = [...(masterValidation.warnings || [])];
//     if (!grn.GrnDetails || grn.GrnDetails.length === 0) {
//       allErrors.push("At least one product detail is required");
//     } else {
//       grn.GrnDetails.forEach((detail, index) => {
//         const detailValidation = GRNHelpers.validateGRNDetail(detail, index);
//         allErrors.push(...detailValidation.errors);
//         allWarnings.push(...(detailValidation.warnings || []));
//       });

//       // Check for duplicate products
//       const productIds = grn.GrnDetails.map((d) => d.ProductID);
//       const duplicates = productIds.filter((id, index) => productIds.indexOf(id) !== index);
//       if (duplicates.length > 0) {
//         allWarnings.push("Duplicate products detected in the GRN");
//       }
//     }

//     return {
//       isValid: allErrors.length === 0,
//       errors: allErrors,
//       warnings: allWarnings,
//     };
//   },
// };

// const grnSchema = z.object({
//   grnID: z.number().default(0),
//   grnCode: z.string().optional(),
//   deptID: z.number().min(1, "Department is required"),
//   deptName: z.string().min(1, "Department name is required"),
//   supplrID: z.number().min(1, "Supplier is required"),
//   supplrName: z.string().min(1, "Supplier name is required"),
//   grnDate: z.union([z.date(), z.any()]).refine((date) => (date ? dayjs(date).isValid() : false), { message: "Valid GRN date is required" }),
//   invoiceNo: z.string().optional(),
//   invDate: z.union([z.date(), z.any()]).refine((date) => (date ? dayjs(date).isValid() : false), { message: "Valid invoice date is required" }),
//   grnType: z.string().default("Invoice"),
//   grnStatus: z.string().default("Pending"),
//   grnStatusCode: z.string().default("PEND"),
//   grnApprovedYN: z.string().default("N"),
//   grnApprovedBy: z.string().optional(),
//   grnApprovedID: z.number().optional(),
//   poNo: z.string().optional(),
//   poID: z.number().optional(),
//   poDate: z.union([z.date(), z.any()]).optional().nullable(),
//   poTotalAmt: z.number().optional().default(0),
//   poDiscAmt: z.number().optional().default(0),
//   poCoinAdjAmt: z.number().optional().default(0),
//   dcNo: z.string().optional(),
//   tot: z.number().optional().default(0),
//   disc: z.number().optional().default(0),
//   netTot: z.number().optional().default(0),
//   taxAmt: z.number().optional().default(0),
//   totalTaxableAmt: z.number().optional().default(0),
//   netCGSTTaxAmt: z.number().optional().default(0),
//   netSGSTTaxAmt: z.number().optional().default(0),
//   balanceAmt: z.number().optional().default(0),
//   otherAmt: z.number().optional().default(0),
//   coinAdj: z.number().optional().default(0),
//   transDeptID: z.number().optional(),
//   transDeptName: z.string().optional(),
//   catValue: z.string().default("MEDI"),
//   catDesc: z.string().default("REVENUE"),
//   auGrpID: z.number().default(18),
//   discPercentageYN: z.string().default("N"),
//   GrnDetails: z.array(z.any()).default([]),
//   RActiveYN: z.string().default("Y"),
//   RNotes: z.string().optional().nullable(),
// });

// type GrnFormData = z.infer<typeof grnSchema>;

// interface ComprehensiveGrnFormDialogProps {
//   open: boolean;
//   onClose: () => void;

//   grn: GrnDto | null;
//   departments: { value: string; label: string }[];
//   suppliers: { value: string; label: string }[];
//   products: { value: string; label: string }[];
// }

// const ComprehensiveGrnFormDialog: React.FC<ComprehensiveGrnFormDialogProps> = ({ open, onClose, grn, departments, suppliers }) => {
//   const [isGeneratingCode, setIsGeneratingCode] = useState(false);
//   const [grnDetails, setGrnDetails] = useState<GrnDetailDto[]>([]); // For manually added products
//   const [poGrnDetails, setPOGrnDetails] = useState<GrnDetailDto[]>([]); // For PO-based products
//   const [issueDepartments, setIssueDepartments] = useState<IssueDepartmentData[]>([]); // Issue departments
//   const [selectedProductForIssue, setSelectedProductForIssue] = useState<GrnDetailDto | null>(null);

//   const [expandedSections, setExpandedSections] = useState({
//     basic: true,
//     invoice: true,
//     po: false,
//     manual: true,
//     financial: false,
//     configuration: false,
//   });

//   const isEditMode = !!grn && grn.grnMastDto.grnID > 0;
//   const isApproved = grn?.grnMastDto.grnApprovedBy === "Y";
//   const { generateGrnCode } = useGrn();
//   const { showAlert } = useAlert();

//   const {
//     control,
//     handleSubmit,
//     reset,
//     setValue,
//     watch,
//     trigger,
//     getValues,
//     formState: { isSubmitting, errors },
//   } = useForm<GrnFormData>({
//     resolver: zodResolver(grnSchema),
//     mode: "onChange",
//   });

//   const watchedDeptID = watch("deptID");
//   const watchedSupplierID = watch("supplrID");
//   const watchedGrnCode = watch("grnCode");
//   const watchedInvoiceNo = watch("invoiceNo");
//   const watchedDiscount = watch("disc");
//   const watchedDeptName = watch("deptName");

//   const isMandatoryFieldsFilled = !!(watchedDeptID && watchedSupplierID && watchedGrnCode && watchedInvoiceNo);

//   // Combine both arrays for total calculations
//   const allGrnDetails = useMemo(() => [...poGrnDetails, ...grnDetails], [poGrnDetails, grnDetails]);

//   useEffect(() => {
//     if (open) {
//       if (grn) {
//         const formData: GrnFormData = {
//           grnID: grn.grnMastDto.grnID || 0,
//           grnCode: grn.grnMastDto.grnCode || "",
//           deptID: grn.grnMastDto.deptID || 0,
//           deptName: grn.grnMastDto.deptName || "",
//           supplrID: grn.grnMastDto.supplrID || 0,
//           supplrName: grn.grnMastDto.supplrName || "",
//           grnDate: grn.grnMastDto.grnDate ? new Date(grn.grnMastDto.grnDate) : new Date(),
//           invoiceNo: grn.grnMastDto.invoiceNo || "",
//           invDate: grn.grnMastDto.invDate ? new Date(grn.grnMastDto.invDate) : new Date(),
//           grnType: grn.grnMastDto.grnType || "Invoice",
//           grnStatus: grn.grnMastDto.grnStatus || "Pending",
//           grnStatusCode: grn.grnMastDto.grnStatusCode || "PEND",
//           grnApprovedYN: grn.grnMastDto.grnApprovedYN || "N",
//           grnApprovedBy: grn.grnMastDto.grnApprovedBy || "",
//           grnApprovedID: grn.grnMastDto.grnApprovedID || 0,
//           poNo: grn.grnMastDto.poNo || "",
//           poID: grn.grnMastDto.poID || 0,
//           poDate: grn.grnMastDto.poDate ? new Date(grn.grnMastDto.poDate) : null,
//           poTotalAmt: grn.grnMastDto.poTotalAmt || 0,
//           poDiscAmt: grn.grnMastDto.poDiscAmt || 0,
//           poCoinAdjAmt: grn.grnMastDto.poCoinAdjAmt || 0,
//           dcNo: grn.grnMastDto.dcNo || "",
//           tot: grn.grnMastDto.tot || 0,
//           disc: grn.grnMastDto.disc || 0,
//           netTot: grn.grnMastDto.netTot || 0,
//           taxAmt: grn.grnMastDto.taxAmt || 0,
//           totalTaxableAmt: grn.grnMastDto.totalTaxableAmt || 0,
//           netCGSTTaxAmt: grn.grnMastDto.netCGSTTaxAmt || 0,
//           netSGSTTaxAmt: grn.grnMastDto.netSGSTTaxAmt || 0,
//           balanceAmt: grn.grnMastDto.balanceAmt || 0,
//           otherAmt: grn.grnMastDto.otherAmt || 0,
//           coinAdj: grn.grnMastDto.coinAdj || 0,
//           transDeptID: grn.grnMastDto.transDeptID || 0,
//           transDeptName: grn.grnMastDto.transDeptName || "",
//           catValue: grn.grnMastDto.catValue || "MEDI",
//           catDesc: grn.grnMastDto.catDesc || "REVENUE",
//           auGrpID: grn.grnMastDto.auGrpID || 18,
//           discPercentageYN: grn.grnMastDto.discPercentageYN || "N",
//         };

//         reset(formData);
//         const poBasedDetails = (grn.grnMastDto.GrnDetails || []).filter((detail) => detail.PoDetID && detail.PoDetID > 0);
//         const manualDetails = (grn.grnMastDto.GrnDetails || []).filter((detail) => !detail.PoDetID || detail.PoDetID === 0);

//         setPOGrnDetails(poBasedDetails);
//         setGrnDetails(manualDetails);
//         setIssueDepartments([]);
//       } else {
//         reset();
//         setGrnDetails([]);
//         setPOGrnDetails([]);
//         setIssueDepartments([]);
//       }
//     }
//   }, [open, grn, reset]);

//   const handleGenerateCode = useCallback(async () => {
//     if (!watchedDeptID) {
//       showAlert("Warning", "Please select a department first", "warning");
//       return;
//     }
//     try {
//       setIsGeneratingCode(true);
//       const newCode = await generateGrnCode(watchedDeptID);
//       setValue("grnCode", newCode, { shouldValidate: true, shouldDirty: true });
//       trigger();
//     } catch (error) {
//       showAlert("Error", "Failed to generate GRN code", "error");
//     } finally {
//       setIsGeneratingCode(false);
//     }
//   }, [watchedDeptID, generateGrnCode, setValue, trigger, showAlert]);

//   useEffect(() => {
//     if (!isEditMode && watchedDeptID && !watchedGrnCode) {
//       handleGenerateCode();
//     }
//   }, [watchedDeptID, isEditMode, watchedGrnCode, handleGenerateCode]);

//   const handleDepartmentChange = useCallback(
//     (value: any) => {
//       const selectedDept = departments.find((dept) => dept.value === value.toString());
//       if (selectedDept) {
//         setValue("deptID", Number(selectedDept.value), { shouldValidate: true, shouldDirty: true });
//         setValue("deptName", selectedDept.label, { shouldValidate: true, shouldDirty: true });
//         trigger();
//       }
//     },
//     [departments, setValue, trigger]
//   );

//   const handleSupplierChange = useCallback(
//     (newValue: any) => {
//       let selectedSupplier = null;
//       if (newValue && typeof newValue === "object" && newValue.value) {
//         selectedSupplier = suppliers.find((s) => s.value == newValue.value);
//       } else if (newValue) {
//         selectedSupplier = suppliers.find((s) => s.value == newValue);
//       }
//       if (selectedSupplier) {
//         setValue("supplrID", Number(selectedSupplier.value), { shouldValidate: true, shouldDirty: true });
//         setValue("supplrName", selectedSupplier.label, { shouldValidate: true, shouldDirty: true });
//       } else {
//         setValue("supplrID", 0, { shouldValidate: true, shouldDirty: true });
//         setValue("supplrName", "", { shouldValidate: true, shouldDirty: true });
//       }
//       trigger("supplrID");
//     },
//     [suppliers, setValue, trigger]
//   );

//   const calculateTotals = useCallback(
//     (allDetails: GrnDetailDto[]) => {
//       const itemsTotal = allDetails.reduce((sum, detail) => {
//         const receivedQty = detail.RecvdQty || 0;
//         const unitPrice = detail.UnitPrice || 0;
//         return sum + receivedQty * unitPrice;
//       }, 0);
//       setValue("tot", parseFloat(itemsTotal.toFixed(2)), { shouldDirty: true });
//       const discountValue = watchedDiscount || 0;
//       const otherCharges = getValues("otherAmt") || 0;
//       const coinAdjustment = getValues("coinAdj") || 0;
//       const totals = GRNHelpers.calculateGRNTotals(allDetails, discountValue, otherCharges, coinAdjustment);
//       setValue("netTot", totals.netTotal);
//       setValue("totalTaxableAmt", totals.totalTaxable);
//       setValue("netCGSTTaxAmt", totals.totalCGST);
//       setValue("netSGSTTaxAmt", totals.totalSGST);
//       setValue("taxAmt", totals.totalTax);
//       setValue("balanceAmt", totals.grandTotal);
//       trigger();
//     },
//     [setValue, trigger, watchedDiscount, getValues]
//   );

//   const handleManualGrnDetailsChange = useCallback(
//     (details: GrnDetailDto[]) => {
//       setGrnDetails(details);
//       calculateTotals([...poGrnDetails, ...details]);
//     },
//     [poGrnDetails, calculateTotals]
//   );

//   const handlePOGrnDetailsChange = useCallback(
//     (details: GrnDetailDto[]) => {
//       setPOGrnDetails(details);
//       calculateTotals([...details, ...grnDetails]);
//     },
//     [grnDetails, calculateTotals]
//   );

//   const handlePoDataFetched = useCallback(
//     (mast: PurchaseOrderMastDto | null, details: PurchaseOrderDetailDto[]) => {
//       if (mast && details.length > 0) {
//         showAlert("Success", `PO ${mast.pOCode} selected with ${details.length} items.`, "success");
//         if (!watchedSupplierID && mast.supplierID) {
//           handleSupplierChange(mast.supplierID);
//         }
//       } else if (mast) {
//         showAlert("Info", `PO ${mast.pOCode} selected, but it has no item details.`, "info");
//         setPOGrnDetails([]);
//       } else {
//         setPOGrnDetails([]);
//         showAlert("Info", "PO selection cleared.", "info");
//       }
//     },
//     [showAlert, watchedSupplierID, handleSupplierChange]
//   );

//   const handleIssueDepartmentChange = useCallback((departments: IssueDepartmentData[]) => {
//     setIssueDepartments(departments);
//   }, []);

//   const handleDeleteAll = useCallback(() => {
//     setGrnDetails([]);
//     setPOGrnDetails([]);
//     setIssueDepartments([]);
//     calculateTotals([]);
//     showAlert("Success", "All products removed from GRN", "success");
//   }, [calculateTotals, showAlert]);

//   const handleShowHistory = useCallback(() => {
//     showAlert("Info", "History functionality to be implemented", "info");
//   }, [showAlert]);

//   const handleNewIssueDepartment = useCallback(() => {}, []);

//   const handleApplyDiscount = useCallback(() => {
//     calculateTotals(allGrnDetails);
//     showAlert("Success", "Discount applied and totals recalculated", "success");
//   }, [allGrnDetails, calculateTotals, showAlert]);

//   const onFormSubmit = async (data: GrnFormData) => {
//     debugger;
//     if (!allGrnDetails || allGrnDetails.length === 0) {
//       showAlert("Validation Error", "Please add at least one product to the GRN", "warning");
//       return;
//     }

//     const validationResult = GRNHelpers.validateCompleteGRN({ ...data, GrnDetails: allGrnDetails });
//     if (!validationResult.isValid) {
//       showAlert("Validation Error", validationResult.errors.join(", "), "error");
//       return;
//     }
//   };

//   const handleClear = () => {
//     reset();
//     setGrnDetails([]);
//     setPOGrnDetails([]);
//     setIssueDepartments([]);
//   };

//   const handleSectionToggle = (section: keyof typeof expandedSections) => {
//     setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
//   };

//   const dialogActions = useMemo(() => {
//     return (
//       <Box sx={{ display: "flex", gap: 1 }}>
//         <CustomButton variant="outlined" text={isEditMode ? "Reset" : "Clear"} icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || isApproved} color="inherit" />
//         <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} />

//         <SmartButton
//           text={isEditMode ? "Update GRN" : "Create GRN"}
//           onClick={handleSubmit(onFormSubmit)}
//           variant="contained"
//           color="primary"
//           icon={SaveIcon}
//           asynchronous={true}
//           showLoadingIndicator={true}
//           loadingText={isEditMode ? "Updating..." : "Creating..."}
//           successText={isEditMode ? "Updated!" : "Created!"}
//           disabled={isSubmitting || !isMandatoryFieldsFilled || isApproved}
//         />
//       </Box>
//     );
//   }, [handleSubmit, onFormSubmit, onClose, isEditMode, isSubmitting, isMandatoryFieldsFilled, isApproved]);

//   return (
//     <GenericDialog
//       open={open}
//       onClose={onClose}
//       title="Goods Receive Note (GRN)"
//       maxWidth="xl"
//       fullWidth
//       disableBackdropClick={isSubmitting}
//       disableEscapeKeyDown={isSubmitting}
//       actions={dialogActions}
//     >
//       <Box sx={{ width: "100%" }}>
//         <form id="grn-form" onSubmit={handleSubmit(onFormSubmit)}>
//           {isApproved && (
//             <Alert severity="info" sx={{ mb: 2 }} icon={<ApproveIcon />}>
//               This GRN has been approved and cannot be modified. Stock has been updated.
//             </Alert>
//           )}

//           <Accordion expanded={expandedSections.basic} onChange={() => handleSectionToggle("basic")}>
//             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//               <Box display="flex" alignItems="center" gap={1}>
//                 <DeptIcon color="primary" />
//                 <Typography variant="h6" color="primary">
//                   Basic GRN Information
//                 </Typography>
//                 <Chip label="Required" size="small" color="error" variant="outlined" />
//               </Box>
//             </AccordionSummary>
//             <AccordionDetails>
//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 12, md: 3 }}>
//                   <EnhancedFormField
//                     name="GrnCode"
//                     control={control}
//                     type="text"
//                     label="GRN Code"
//                     required
//                     disabled={isEditMode || isApproved}
//                     size="small"
//                     helperText={isEditMode ? "Code cannot be changed" : isGeneratingCode ? "Generating..." : "Auto-generated"}
//                     adornment={
//                       !isEditMode &&
//                       !isApproved && <CustomButton size="small" variant="outlined" text="Generate" onClick={handleGenerateCode} disabled={!watchedDeptID || isGeneratingCode} />
//                     }
//                   />
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 3 }}>
//                   <EnhancedFormField
//                     name="DeptID"
//                     control={control}
//                     type="select"
//                     label="Department"
//                     required
//                     size="small"
//                     options={departments}
//                     onChange={handleDepartmentChange}
//                     disabled={isEditMode || isApproved}
//                   />
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 3 }}>
//                   <EnhancedFormField
//                     name="SupplrID"
//                     control={control}
//                     type="select"
//                     label="Supplier"
//                     required
//                     size="small"
//                     options={suppliers}
//                     onChange={handleSupplierChange}
//                     disabled={isApproved}
//                   />
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 3 }}>
//                   <EnhancedFormField name="GrnDate" control={control} type="datepicker" label="GRN Date" required size="small" disabled={isApproved} />
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 3 }}>
//                   <EnhancedFormField
//                     name="GrnType"
//                     control={control}
//                     type="select"
//                     label="GRN Type"
//                     size="small"
//                     disabled={isApproved}
//                     options={[{ value: "Invoice", label: "Invoice" }]}
//                   />
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 3 }}>
//                   <EnhancedFormField name="dcNo" control={control} type="text" label="DC Number" size="small" disabled={isApproved} />
//                 </Grid>
//               </Grid>
//             </AccordionDetails>
//           </Accordion>

//           <Accordion expanded={expandedSections.invoice} onChange={() => handleSectionToggle("invoice")}>
//             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//               <Box display="flex" alignItems="center" gap={1}>
//                 <InvoiceIcon color="primary" />
//                 <Typography variant="h6" color="primary">
//                   Invoice Information
//                 </Typography>
//                 <Chip label="Required" size="small" color="error" variant="outlined" />
//               </Box>
//             </AccordionSummary>
//             <AccordionDetails>
//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <EnhancedFormField name="InvoiceNo" control={control} type="text" label="Invoice Number" required size="small" disabled={isApproved} />
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <EnhancedFormField name="InvDate" control={control} type="datepicker" label="Invoice Date" required size="small" disabled={isApproved} />
//                 </Grid>
//               </Grid>
//             </AccordionDetails>
//           </Accordion>

//           <PurchaseOrderSection
//             expanded={expandedSections.po}
//             onChange={() => handleSectionToggle("po")}
//             isApproved={isApproved}
//             watchedDeptID={watchedDeptID}
//             watchedDeptName={watchedDeptName}
//             onPoDataFetched={handlePoDataFetched}
//             onGRNDataFetched={handlePOGrnDetailsChange}
//             issueDepartments={issueDepartments}
//             onIssueDepartmentChange={handleIssueDepartmentChange}
//           />

//           <GrnDetailsComponent
//             grnDetails={grnDetails}
//             onGrnDetailsChange={handleManualGrnDetailsChange}
//             disabled={isSubmitting}
//             grnApproved={isApproved}
//             expanded={expandedSections.manual}
//             onToggle={() => handleSectionToggle("manual")}
//             issueDepartments={issueDepartments}
//             onIssueDepartmentChange={handleIssueDepartmentChange}
//           />

//           <GRNTotalsAndActionsSection
//             grnDetails={allGrnDetails}
//             control={control}
//             setValue={setValue}
//             watch={watch}
//             onDeleteAll={handleDeleteAll}
//             onShowHistory={handleShowHistory}
//             onNewIssueDepartment={handleNewIssueDepartment}
//             onApplyDiscount={handleApplyDiscount}
//             disabled={isSubmitting}
//             isApproved={isApproved}
//             issueDepartments={issueDepartments}
//             onIssueDepartmentChange={handleIssueDepartmentChange}
//             selectedProductForIssue={selectedProductForIssue}
//             onSelectedProductForIssueChange={setSelectedProductForIssue}
//           />

//           <Accordion expanded={expandedSections.configuration} onChange={() => handleSectionToggle("configuration")}>
//             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//               <Box display="flex" alignItems="center" gap={1}>
//                 <WarningIcon color="primary" />
//                 <Typography variant="h6" color="primary">
//                   Advanced Configuration
//                 </Typography>
//                 <Chip label="Optional" size="small" color="default" variant="outlined" />
//               </Box>
//             </AccordionSummary>
//             <AccordionDetails>
//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Stack spacing={2}>
//                     <FormControlLabel
//                       control={
//                         <Switch
//                           checked={getValues("discPercentageYN") === "Y"}
//                           onChange={(e) => setValue("discPercentageYN", e.target.checked ? "Y" : "N")}
//                           disabled={isApproved}
//                         />
//                       }
//                       label="Discount as Percentage"
//                     />
//                   </Stack>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Typography variant="body2" color="text.secondary">
//                     Additional configuration options for discount calculations.
//                   </Typography>

//                   {issueDepartments.length > 0 && (
//                     <Box sx={{ mt: 2 }}>
//                       <Typography variant="subtitle2" gutterBottom>
//                         Issue Departments Summary:
//                       </Typography>
//                       <Stack spacing={1}>
//                         {issueDepartments.map((dept) => (
//                           <Chip key={dept.id} label={`${dept.productName} → ${dept.deptName} (${dept.quantity})`} size="small" variant="outlined" color="primary" />
//                         ))}
//                       </Stack>
//                     </Box>
//                   )}
//                 </Grid>
//               </Grid>
//             </AccordionDetails>
//           </Accordion>
//         </form>
//       </Box>
//     </GenericDialog>
//   );
// };

// export default ComprehensiveGrnFormDialog;
