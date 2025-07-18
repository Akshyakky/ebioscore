// src/pages/billing/Billing/MainPage/constants.ts

import { BillingFormData } from "./types";

export const BILLING_CONSTANTS = {
  MAX_SERVICES_PER_BILL: 100,
  MAX_PRODUCTS_PER_BILL: 100,
  DEFAULT_QUANTITY: 1,
  DEFAULT_DISCOUNT: 0,
  MAX_DISCOUNT_PERCENTAGE: 100,
  MIN_QUANTITY: 0,
  CURRENCY: "INR",
  LOCALE: "en-IN",
} as const;

export const DEFAULT_FORM_VALUES: BillingFormData = {
  pChartID: 0,
  pChartCode: "",
  pFName: "",
  pLName: "",
  pMName: "",
  pTitle: "",
  billID: 0,
  billCode: "",
  billDate: new Date(),
  pTypeID: 0,
  pTypeName: "",
  pTypeCode: "",
  patOPIP: "O",
  billStatus: "A",
  physicianID: undefined,
  physicianName: undefined,
  referralID: undefined,
  referralName: undefined,
  referral2ID: undefined,
  referralName2: undefined,
  billMisc: "",
  admitID: 0,
  opipCaseNo: 0,
  opIPNo: 0,
  disapprovedEmpID: undefined,
  disapproveEmpName: undefined,
  groupDisc: 0,
  langType: undefined,
  patMemID: undefined,
  patMemName: undefined,
  pckAmount: undefined,
  pckCode: undefined,
  pckID: undefined,
  pckName: undefined,
  strProfitOrLoss: undefined,
  profitOrLoss: undefined,
  sourceID: 0,
  source: undefined,
  oldPChartID: 0,
  drBillID: 0,
  transferYN: "N",
  billGrossAmt: 0,
  billDiscAmt: 0,
  visitReferenceCode: "",
  billServices: [],
  billProducts: [],
  rActiveYN: "Y",
  rNotes: "",
};

export const GRID_CONFIG = {
  ROWS_PER_PAGE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
  MIN_HEIGHT: "300px",
  MAX_HEIGHT: "600px",
} as const;

export const ALERT_MESSAGES = {
  SUCCESS: {
    BILL_SAVED: "Bill saved successfully",
    SERVICE_ADDED: "Service added",
    PRODUCT_ADDED: "Product added",
    BATCH_ADDED: "Batch added",
    VISIT_SELECTED: "Visit selected",
  },
  ERROR: {
    BILL_SAVE_FAILED: "Failed to save bill",
    SERVICE_LOAD_FAILED: "Failed to load services",
    PRODUCT_LOAD_FAILED: "Failed to load products",
    INVALID_QUANTITY: "Quantity cannot exceed available stock",
    NEGATIVE_QUANTITY: "Quantity cannot be negative",
  },
  WARNING: {
    NO_BATCHES: "No batches available for this product",
    SELECT_DEPARTMENT: "Please select a department first",
    INVALID_OPERATION: "Cannot decrease values that are already zero",
  },
} as const;
