// src/pages/billing/Billing/MainPage/utils/billingUtils.ts
import { BillSaveRequest } from "@/interfaces/Billing/BillingDto";
import { BillingFormData, BillProductData, BillServiceData } from "../types";

/**
 * Calculate total amounts for bill services and products
 */
export const calculateBillTotals = (services: BillServiceData[], products: BillProductData[]) => {
  let totalGrossAmount = 0;
  let totalDiscountAmount = 0;

  // Calculate services totals
  services.forEach((service) => {
    const quantity = service.chUnits || 1;
    const drAmt = service.dCValue || 0;
    const hospAmt = service.hCValue || 0;
    const drDiscAmt = service.dValDisc || 0;
    const hospDiscAmt = service.hValDisc || 0;

    const grossAmount = quantity * (drAmt + hospAmt);
    const discountAmount = drDiscAmt + hospDiscAmt;

    totalGrossAmount += grossAmount;
    totalDiscountAmount += discountAmount;
  });

  // Calculate products totals
  products.forEach((product) => {
    const quantity = product.selectedQuantity || 1;
    const hospAmt = product.hValue || 0;
    const hospDiscAmt = product.hValDisc || 0;

    const grossAmount = quantity * hospAmt;
    const discountAmount = hospDiscAmt;

    totalGrossAmount += grossAmount;
    totalDiscountAmount += discountAmount;
  });

  return { totalGrossAmount, totalDiscountAmount };
};

/**
 * Format currency value
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Validate quantity against available stock
 */
export const validateQuantity = (enteredQty: number, availableQty: number): { isValid: boolean; message?: string } => {
  if (enteredQty < 0) {
    return {
      isValid: false,
      message: "Quantity cannot be negative",
    };
  }

  if (enteredQty > availableQty) {
    return {
      isValid: false,
      message: `Quantity cannot exceed available stock (${availableQty})`,
    };
  }

  return { isValid: true };
};

/**
 * Prepare bill save request from form data
 */
export const prepareBillSaveRequest = (data: BillingFormData): BillSaveRequest => {
  return {
    bill: {
      billID: data.billID,
      billCode: data.billCode,
      billDate: data.billDate,
      pChartID: data.pChartID,
      pTypeID: data.pTypeID,
      pTypeCode: data.pTypeCode,
      pTitle: data.pTitle,
      patOPIP: data.patOPIP,
      pTypeName: data.pTypeName,
      billGrossAmt: data.billGrossAmt,
      billDiscAmt: data.billDiscAmt,
      billStatus: data.billStatus,
      physicianID: data.physicianID,
      physicianName: data.physicianName,
      referralID: data.referralID,
      referralName: data.referralName,
      referral2ID: data.referral2ID,
      referralName2: data.referralName2,
      billMisc: data.billMisc,
      admitID: data.admitID,
      opipCaseNo: data.opipCaseNo,
      opIPNo: data.opIPNo,
      groupDisc: data.groupDisc,
      pckAmount: data.pckAmount,
      pckCode: data.pckCode,
      pckID: data.pckID,
      pckName: data.pckName,
      sourceID: data.sourceID,
      source: data.source,
      pFName: data.pFName,
      pLName: data.pLName,
      pMName: data.pMName,
      oldPChartID: data.oldPChartID,
      drBillID: data.drBillID,
      rActiveYN: data.rActiveYN,
      transferYN: data.transferYN,
      rNotes: data.rNotes,
    },
    billServices: data.billServices,
    billProducts: data.billProducts,
    billPaymentDetails: data.billPaymentDetails,
  } as unknown as BillSaveRequest;
};

/**
 * Calculate service totals with breakdown
 */
export const calculateServiceTotals = (service: BillServiceData) => {
  const quantity = service.chUnits || 1;
  const drAmt = service.dCValue || 0;
  const hospAmt = service.hCValue || 0;
  const drDiscAmt = service.dValDisc || 0;
  const hospDiscAmt = service.hValDisc || 0;

  const grossAmount = quantity * (drAmt + hospAmt);
  const totalDiscount = drDiscAmt + hospDiscAmt;
  const netAmount = grossAmount - totalDiscount;

  return {
    grossAmount,
    drDiscAmt,
    hospDiscAmt,
    totalDiscount,
    netAmount,
  };
};

/**
 * Calculate product totals
 */
export const calculateProductTotals = (product: BillProductData) => {
  const quantity = product.selectedQuantity || 1;
  const hospAmt = product.hValue || 0;
  const hospDiscAmt = product.hValDisc || 0;

  const grossAmount = quantity * hospAmt;
  const netAmount = grossAmount - hospDiscAmt;

  return {
    grossAmount,
    discountAmount: hospDiscAmt,
    netAmount,
  };
};

/**
 * Filter services based on search term
 */
export const filterServices = (services: any[], searchTerm: string) => {
  if (!searchTerm || !services) return [];

  const searchLower = searchTerm.toLowerCase();
  return services.filter(
    (service) =>
      service.chargeCode.toLowerCase().includes(searchLower) ||
      service.chargeDesc.toLowerCase().includes(searchLower) ||
      (service.cShortName && service.cShortName.toLowerCase().includes(searchLower))
  );
};

/**
 * Filter products based on search term
 */
export const filterProducts = (products: any[], searchTerm: string) => {
  if (!searchTerm || !products) return [];

  const searchLower = searchTerm.toLowerCase();
  return products.filter((product) => product.productCode.toLowerCase().includes(searchLower) || product.productName.toLowerCase().includes(searchLower));
};
