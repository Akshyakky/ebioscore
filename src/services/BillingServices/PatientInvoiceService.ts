import { CommonApiService } from "../CommonApiService";
import { BPatTypeDto } from "../../interfaces/Billing/BPatTypeDto";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { APIConfig } from "../../apiConfig";
import { store } from "../../store/store";

// Initialize ApiService with the base URL for the billing API
const apiService = new CommonApiService({ baseURL: APIConfig.billingURL });

// Function to get the token from the store
const getToken = () => store.getState().userDetails.token!;

export const saveBPatType = async (
  bPatTypeDto: BPatTypeDto
): Promise<OperationResult<BPatTypeDto>> => {
  return apiService.post<OperationResult<any>>(
    "PatientInvoiceCode/SaveBPatType",
    bPatTypeDto,
    getToken()
  );
};

export const getAllBPatTypes = async (): Promise<OperationResult<any[]>> => {
  return apiService.get<OperationResult<any[]>>(
    "PatientInvoiceCode/GetAllBPatTypes",
    getToken()
  );
};

export const getBPatTypeById = async (
  pTypeID: number
): Promise<OperationResult<any>> => {
  return apiService.get<OperationResult<any>>(
    `PatientInvoiceCode/GetBPatTypeById/${pTypeID}`,
    getToken()
  );
};

export const updateBPatTypeActiveStatus = async (
  pTypeID: number,
  rActive: boolean
): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(
    `PatientInvoiceCode/UpdateBPatTypeActiveStatus/${pTypeID}`,
    rActive,
    getToken()
  );
};

// Exporting the service as an object
export const PatientInvoiceCodeService = {
  saveBPatType,
  getAllBPatTypes,
  getBPatTypeById,
  updateBPatTypeActiveStatus,
};
