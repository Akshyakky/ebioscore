import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "../CommonApiService";
import { store } from "@/store";
import { BPayTypeDto } from "@/interfaces/Billing/BPayTypeDto";
import { OperationResult } from "@/interfaces/Common/OperationResult";

const apiService = new CommonApiService({ baseURL: APIConfig.billingURL });

const getToken = () => store.getState().auth.token!;

export const saveBPayType = async (bPayTypeDto: BPayTypeDto): Promise<OperationResult<BPayTypeDto>> => {
  return apiService.post<OperationResult<any>>("PaymentTypes/SaveBPayType", bPayTypeDto, getToken());
};

export const getAllBPayTypes = async (): Promise<OperationResult<any[]>> => {
  return apiService.get<OperationResult<any[]>>("PaymentTypes/GetAllBPayTypes", getToken());
};

export const getBPayTypeById = async (payID: number): Promise<OperationResult<any>> => {
  return apiService.get<OperationResult<any>>(`PaymentTypes/GetBPayTypeById/${payID}`, getToken());
};

export const updateBPayTypeActiveStatus = async (payID: number, rActive: boolean): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(`PaymentTypes/UpdateBPayTypeActiveStatus/${payID}`, rActive, getToken());
};

// Exporting the service as an object
export const PaymentTypesService = {
  saveBPayType,
  getAllBPayTypes,
  getBPayTypeById,
  updateBPayTypeActiveStatus,
};
