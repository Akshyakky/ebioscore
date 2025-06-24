// src/interfaces/InventoryManagement/GRNDto.ts - Enhanced Version

import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

// Updated GRN Master DTO to match backend exactly with additional fields
export interface GRNMastDto extends BaseDto {
  grnID: number;
  deptID: number;
  deptName: string;
  grnDate: string;
  invoiceNo: string;
  invDate: string;
  supplrID: number;
  supplrName: string;
  tot?: number;
  disc?: number;
  netTot?: number;
  auGrpID?: number;
  balanceAmt?: number;
  catDesc?: string;
  catValue?: string;
  coinAdj?: number;
  dcNo?: string;
  discPercentageYN?: string;
  grnApprovedBy?: string;
  grnApprovedID?: number;
  grnApprovedYN: string;
  grnStatusCode?: string;
  grnStatus?: string;
  otherAmt?: number;
  poCoinAdjAmt?: number;
  poDate?: string;
  poDiscAmt?: number;
  poID?: number;
  poNo?: string;
  poTotalAmt?: number;
  taxAmt?: number;
  transDeptID?: number;
  transDeptName?: string;
  grnCode?: string;
  grnType?: string;
  totalTaxableAmt?: number;
  netCGSTTaxAmt?: number;
  netSGSTTaxAmt?: number;

  // Additional fields for enhanced functionality
  hideYN?: string;
  issueDeptID?: number;
  issueDeptName?: string;
  totalItems?: number;
  totalQty?: number;
  discountType?: "AMOUNT" | "PERCENTAGE";
  taxAfterDiscountYN?: string;
  roundingAdjustment?: number;
  approvalDate?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  qualityCheckYN?: string;
  qualityCheckBy?: string;
  qualityCheckDate?: string;

  grnDetails?: GRNDetailDto[];
}

// Enhanced GRN Detail DTO with all required fields
export interface GRNDetailDto extends BaseDto {
  grnDetID: number;
  grnID: number;
  serialNo: number;
  pGrpID?: number;
  pGrpName?: string;
  productID: number;
  productCode?: string;
  productName?: string;
  catValue: string;
  catDesc?: string;
  mfID?: number;
  mfName?: string;
  pUnitID?: number;
  pUnitName?: string;
  pUnitsPerPack?: number;
  pkgID?: number;
  pkgName?: string;
  batchNo?: string;
  referenceNo?: string;
  expiryDate?: string;
  unitPrice?: number;
  sellingPrice?: number;
  packPrice?: number;
  tax?: number;
  sellUnitPrice?: number;
  requiredPack?: number;
  requiredQty?: number;
  recvdPack?: number;
  recvdQty?: number;
  acceptQty?: number;
  freeItems?: number;
  rejectedQty?: number;
  productValue?: number;
  discAmt?: number;
  discPercentage?: number;
  taxAfterDiscYN?: string;
  taxAfterDiscOnMrpYN?: string;
  includeTaxYN?: string;
  gstPercentage?: number;
  cgstPerValue?: number;
  cgstTaxAmt?: number;
  sgstPerValue?: number;
  sgstTaxAmt?: number;
  igstPerValue?: number;
  igstTaxAmt?: number;
  taxableAmt?: number;
  totalTaxAmt?: number;

  // Additional product fields
  manufacturerID?: number;
  manufacturerCode?: string;
  manufacturerName?: string;
  mrp?: number;
  mrpAbated?: number;
  itemMrpValue?: number;
  itemTotalProfit?: number;
  itemTotalVat?: number;
  defaultPrice: number;

  // PO related fields
  poDetID?: number;
  poQty?: number;
  poRate?: number;
  poValue?: number;

  // Quality and compliance fields
  expiryYN?: string;
  isFreeItemYN?: string;
  prescriptionYN?: string;
  qualityCheckYN?: string;
  qualityStatus?: string;
  qualityRemarks?: string;

  // Tax configuration fields
  taxID?: number;
  taxCode?: string;
  taxName?: string;
  taxModeCode?: string;
  taxModeDescription?: string;
  taxModeID?: string;
  taxOnFreeItemsYN?: string;
  taxOnMrpYN?: string;
  taxOnUnitPriceYN?: string;

  // HSN and compliance
  hsnCode?: string;
  psGrpID?: number;
  psGrpName?: string;
  chargeablePercent?: number;

  // Additional tracking fields
  lotNo?: string;
  vendorBatchNo?: string;
  shelfLife?: number;
  storageCondition?: string;
  productNotes?: string;

  // Frontend calculation fields
  _recievedQty: number;
  _serialNo: number;
  _pastReceivedPack: number;
  _unitPrice: number;
  _sellingUnitPrice: number;
  _calculatedValue: number;
  _totalWithTax: number;
}

// Combined DTO for API operations
export interface GRNDto {
  gRNMastDto: GRNMastDto;
  gRNDetailsDto: GRNDetailDto[];
}

// Enhanced search request with more filter options
export interface GRNSearchRequest {
  dateFilterType?: string;
  startDate?: string;
  endDate?: string;
  supplierID?: number;
  departmentID?: number;
  issueDepartmentID?: number;
  invoiceNo?: string;
  grnCode?: string;
  grnType?: string;
  grnStatus?: string;
  approvedStatus?: string;
  qualityStatus?: string;
  productID?: number;
  batchNo?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortAscending?: boolean;
  includeDetails?: boolean;
}

// Combined interface with all details for frontend operations
export interface GRNWithAllDetailsDto extends GRNMastDto {
  grnDetails: GRNDetailDto[];
}

// Validation interfaces
export interface GRNValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Excel upload interface
export interface GRNExcelUploadResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  errors: string[];
  data: GRNDetailDto[];
}

// History tracking interface
export interface GRNHistoryDto {
  historyID: number;
  grnID: number;
  action: string;
  actionBy: string;
  actionDate: string;
  oldValues?: string;
  newValues?: string;
  remarks?: string;
}

// Department transfer interface
export interface GRNDepartmentTransfer {
  grnID: number;
  fromDeptID: number;
  fromDeptName: string;
  toDeptID: number;
  toDeptName: string;
  transferDate: string;
  transferBy: string;
  transferReason: string;
  transferredItems: number[];
}

// Quality check interface
export interface GRNQualityCheck {
  grnID: number;
  checkDate: string;
  checkBy: string;
  status: "PASS" | "FAIL" | "CONDITIONAL";
  remarks: string;
  checkedItems: {
    grnDetID: number;
    status: "PASS" | "FAIL" | "CONDITIONAL";
    remarks: string;
  }[];
}

// Enhanced helper functions for GRN operations
export const GRNHelpers = {
  /**
   * Calculate product value for a GRN detail with all considerations
   */
  calculateProductValue: (detail: Partial<GRNDetailDto>): number => {
    const qty = detail.acceptQty || detail.recvdQty || 0;
    const price = detail.unitPrice || 0;
    const discount = detail.discAmt || 0;
    const discountPercentage = detail.discPercentage || 0;

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
    detail: Partial<GRNDetailDto>
  ): {
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    taxableAmount: number;
    totalTax: number;
    totalWithTax: number;
  } => {
    const productValue = GRNHelpers.calculateProductValue(detail);
    const cgstRate = detail.cgstPerValue || 0;
    const sgstRate = detail.sgstPerValue || 0;
    const igstRate = detail.igstPerValue || 0;

    const taxableAmount = productValue;
    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const sgstAmount = (taxableAmount * sgstRate) / 100;
    const igstAmount = (taxableAmount * igstRate) / 100;
    const totalTax = cgstAmount + sgstAmount + igstAmount;

    return {
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      igstAmount: Math.round(igstAmount * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalWithTax: Math.round((taxableAmount + totalTax) * 100) / 100,
    };
  },

  /**
   * Calculate comprehensive GRN totals
   */
  calculateGRNTotals: (
    details: GRNDetailDto[],
    discount: number = 0,
    otherCharges: number = 0,
    coinAdjustment: number = 0
  ): {
    total: number;
    netTotal: number;
    totalTaxable: number;
    totalCGST: number;
    totalSGST: number;
    totalIGST: number;
    totalTax: number;
    grandTotal: number;
    totalItems: number;
    totalQty: number;
  } => {
    let total = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalItems = details.length;
    let totalQty = 0;

    details.forEach((detail) => {
      const productValue = GRNHelpers.calculateProductValue(detail);
      const taxAmounts = GRNHelpers.calculateTaxAmounts(detail);

      total += productValue;
      totalTaxable += taxAmounts.taxableAmount;
      totalCGST += taxAmounts.cgstAmount;
      totalSGST += taxAmounts.sgstAmount;
      totalIGST += taxAmounts.igstAmount;
      totalQty += detail.acceptQty || detail.recvdQty || 0;
    });

    const netTotal = total - discount;
    const totalTax = totalCGST + totalSGST + totalIGST;
    const grandTotal = netTotal + totalTax + otherCharges + coinAdjustment;

    return {
      total: Math.round(total * 100) / 100,
      netTotal: Math.round(netTotal * 100) / 100,
      totalTaxable: Math.round(totalTaxable * 100) / 100,
      totalCGST: Math.round(totalCGST * 100) / 100,
      totalSGST: Math.round(totalSGST * 100) / 100,
      totalIGST: Math.round(totalIGST * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      totalItems,
      totalQty,
    };
  },

  /**
   * Validate GRN master data with enhanced checks
   */
  validateGRNMaster: (grn: Partial<GRNMastDto>): GRNValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validations
    if (!grn.deptID || grn.deptID <= 0) {
      errors.push("Department is required");
    }

    if (!grn.deptName || grn.deptName.trim() === "") {
      errors.push("Department name is required");
    }

    if (!grn.supplrID || grn.supplrID <= 0) {
      errors.push("Supplier is required");
    }

    if (!grn.supplrName || grn.supplrName.trim() === "") {
      errors.push("Supplier name is required");
    }

    if (!grn.invoiceNo || grn.invoiceNo.trim() === "") {
      errors.push("Invoice number is required");
    }

    if (!grn.grnDate) {
      errors.push("GRN date is required");
    }

    if (!grn.invDate) {
      errors.push("Invoice date is required");
    }

    // Date validations
    if (grn.grnDate && grn.invDate) {
      const grnDate = new Date(grn.grnDate);
      const invDate = new Date(grn.invDate);

      if (grnDate < invDate) {
        warnings.push("GRN date is earlier than invoice date");
      }

      const today = new Date();
      if (grnDate > today) {
        warnings.push("GRN date is in the future");
      }
    }

    // Business rule validations
    if (grn.disc && grn.tot && grn.disc > grn.tot) {
      errors.push("Discount cannot be greater than total amount");
    }

    // PO validations
    if (grn.poID && grn.poID > 0 && (!grn.poNo || grn.poNo.trim() === "")) {
      warnings.push("PO number is recommended when PO ID is specified");
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
  validateGRNDetail: (detail: Partial<GRNDetailDto>, index: number): GRNValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validations
    if (!detail.productID || detail.productID <= 0) {
      errors.push(`Product is required for item ${index + 1}`);
    }

    if (!detail.catValue || detail.catValue.trim() === "") {
      errors.push(`Category value is required for item ${index + 1}`);
    }

    if (!detail.recvdQty || detail.recvdQty <= 0) {
      errors.push(`Received quantity must be greater than 0 for item ${index + 1}`);
    }

    if (!detail.unitPrice || detail.unitPrice <= 0) {
      errors.push(`Unit price must be greater than 0 for item ${index + 1}`);
    }

    // Business rule validations
    if (detail.acceptQty && detail.recvdQty && detail.acceptQty > detail.recvdQty) {
      errors.push(`Accept quantity cannot be greater than received quantity for item ${index + 1}`);
    }

    if (detail.freeItems && detail.recvdQty && detail.freeItems > detail.recvdQty) {
      warnings.push(`Free items quantity seems high for item ${index + 1}`);
    }

    if (detail.discAmt && detail.unitPrice && detail.recvdQty) {
      const productValue = detail.unitPrice * (detail.recvdQty || 0);
      if (detail.discAmt > productValue) {
        errors.push(`Discount amount cannot be greater than product value for item ${index + 1}`);
      }
    }

    if (detail.discPercentage && detail.discPercentage > 100) {
      errors.push(`Discount percentage cannot be greater than 100% for item ${index + 1}`);
    }

    // Expiry date validation
    if (detail.expiryDate && detail.expiryYN === "Y") {
      const expiryDate = new Date(detail.expiryDate);
      const today = new Date();

      if (expiryDate <= today) {
        warnings.push(`Product ${index + 1} has expired or expires soon`);
      }

      // Check if expiry is within 6 months
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      if (expiryDate <= sixMonthsFromNow) {
        warnings.push(`Product ${index + 1} expires within 6 months`);
      }
    }

    // Tax validation
    if (detail.cgstPerValue && detail.sgstPerValue) {
      const totalTax = (detail.cgstPerValue || 0) + (detail.sgstPerValue || 0);
      if (totalTax > 50) {
        warnings.push(`Tax rate seems high (${totalTax}%) for item ${index + 1}`);
      }
    }

    // Price validation
    if (detail.unitPrice && detail.mrp && detail.unitPrice > detail.mrp) {
      warnings.push(`Unit price is higher than MRP for item ${index + 1}`);
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
  validateCompleteGRN: (grn: Partial<GRNWithAllDetailsDto>): GRNValidationResult => {
    const masterValidation = GRNHelpers.validateGRNMaster(grn);
    const allErrors = [...masterValidation.errors];
    const allWarnings = [...(masterValidation.warnings || [])];

    // Validate details
    if (!grn.grnDetails || grn.grnDetails.length === 0) {
      allErrors.push("At least one product detail is required");
    } else {
      grn.grnDetails.forEach((detail, index) => {
        const detailValidation = GRNHelpers.validateGRNDetail(detail, index);
        allErrors.push(...detailValidation.errors);
        allWarnings.push(...(detailValidation.warnings || []));
      });

      // Check for duplicate products
      const productIds = grn.grnDetails.map((d) => d.productID);
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

  /**
   * Generate GRN summary for reporting
   */
  generateGRNSummary: (grn: GRNWithAllDetailsDto) => {
    const totals = GRNHelpers.calculateGRNTotals(grn.grnDetails || [], grn.disc || 0, grn.otherAmt || 0, grn.coinAdj || 0);

    return {
      grnCode: grn.grnCode,
      grnDate: grn.grnDate,
      supplierName: grn.supplrName,
      departmentName: grn.deptName,
      invoiceNo: grn.invoiceNo,
      invoiceDate: grn.invDate,
      status: grn.grnApprovedYN === "Y" ? "Approved" : "Pending",
      ...totals,
      createdBy: grn.rCreatedBy,
      createdDate: grn.rCreatedDate,
      approvedBy: grn.grnApprovedBy,
      approvedDate: grn.approvalDate,
    };
  },
};
