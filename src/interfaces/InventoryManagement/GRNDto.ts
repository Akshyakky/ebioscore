import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

// Updated GRN Master DTO to match backend exactly
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
  grnDetails?: GRNDetailDto[];
}

// Updated GRN Detail DTO to match backend exactly
export interface GRNDetailDto extends BaseDto {
  grnDetID: number;
  grnID: number;
  pGrpID?: number;
  pGrpName?: string;
  productID: number;
  productCode?: string;
  catValue: string;
  mfID?: number;
  pUnitID?: number;
  pUnitName?: string;
  pUnitsPerPack?: number;
  pkgID?: number;
  batchNo?: string;
  expiryDate?: string;
  unitPrice?: number;
  tax?: number;
  sellUnitPrice?: number;
  recvdQty?: number;
  acceptQty?: number;
  freeItems?: number;
  productValue?: number;
  productNotes?: string;
  psGrpID?: number;
  chargeablePercent?: number;
  discAmt?: number;
  discPercentage?: number;
  expiryYN?: string;
  isFreeItemYN?: string;
  itemMrpValue?: number;
  itemTotalProfit?: number;
  itemTotalVat?: number;
  manufacturerCode?: string;
  manufacturerID?: number;
  manufacturerName?: string;
  mrpAbated?: number;
  mrp?: number;
  poDetID?: number;
  requiredUnitQty?: number;
  taxAfterDiscOnMrpYN?: string;
  taxAfterDiscYN?: string;
  taxCode?: string;
  taxID?: number;
  taxModeCode?: string;
  taxModeDescription?: string;
  taxModeID?: string;
  taxName?: string;
  taxOnFreeItemsYN?: string;
  taxOnMrpYN?: string;
  taxOnUnitPriceYN?: string;
  catDesc?: string;
  mfName?: string;
  pkgName?: string;
  productName?: string;
  psGrpName?: string;
  refNo?: string;
  hsnCode?: string;
  cgstPerValue?: number;
  cgstTaxAmt?: number;
  sgstPerValue?: number;
  sgstTaxAmt?: number;
  taxableAmt?: number;
  defaultPrice: number;

  // Additional fields for frontend calculations
  _recievedQty: number;
  _serialNo: number;
  _pastReceivedPack: number;
  _unitPrice: number;
  _sellingUnitPrice: number;
}

// Combined DTO for API operations
export interface GRNDto {
  gRNMastDto: GRNMastDto;
  gRNDetailsDto: GRNDetailDto[];
}

// Search request interface matching backend
export interface GRNSearchRequest {
  dateFilterType?: string;
  startDate?: string;
  endDate?: string;
  supplierID?: number;
  departmentID?: number;
  invoiceNo?: string;
  grnCode?: string;
  grnStatus?: string;
  approvedStatus?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortAscending?: boolean;
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

// Helper functions for GRN operations
export const GRNHelpers = {
  /**
   * Calculate product value for a GRN detail
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

    return Math.max(0, productValue);
  },

  /**
   * Calculate tax amounts for a GRN detail
   */
  calculateTaxAmounts: (
    detail: Partial<GRNDetailDto>
  ): {
    cgstAmount: number;
    sgstAmount: number;
    taxableAmount: number;
    totalTax: number;
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
    };
  },

  /**
   * Calculate totals for entire GRN
   */
  calculateGRNTotals: (
    details: GRNDetailDto[],
    discount: number = 0
  ): {
    total: number;
    netTotal: number;
    totalTaxable: number;
    totalCGST: number;
    totalSGST: number;
    totalTax: number;
  } => {
    let total = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    details.forEach((detail) => {
      const productValue = GRNHelpers.calculateProductValue(detail);
      const taxAmounts = GRNHelpers.calculateTaxAmounts(detail);

      total += productValue;
      totalTaxable += taxAmounts.taxableAmount;
      totalCGST += taxAmounts.cgstAmount;
      totalSGST += taxAmounts.sgstAmount;
    });

    const netTotal = total - discount;
    const totalTax = totalCGST + totalSGST;

    return {
      total: Math.round(total * 100) / 100,
      netTotal: Math.round(netTotal * 100) / 100,
      totalTaxable: Math.round(totalTaxable * 100) / 100,
      totalCGST: Math.round(totalCGST * 100) / 100,
      totalSGST: Math.round(totalSGST * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
    };
  },

  /**
   * Validate GRN master data
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

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Validate GRN detail data
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
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Validate complete GRN data
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
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  },
};
