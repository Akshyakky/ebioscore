import { APIConfig } from "../../apiConfig";
import { ServiceTypeDto } from "../../interfaces/Billing/BChargeType";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { store } from "../../store/store";
import { CommonApiService } from "../CommonApiService";

const apiService = new CommonApiService({ baseURL: APIConfig.billingURL });

const getToken = () => store.getState().userDetails.token!;

export const saveServiceType = async (
  serviceTypeDto: ServiceTypeDto
): Promise<OperationResult<ServiceTypeDto>> => {
  return apiService.post<OperationResult<any>>(
    "ServiceType/SaveServiceType",
    serviceTypeDto,
    getToken()
  );
};

export const getAllServiceType = async (): Promise<OperationResult<any[]>> => {
  debugger;
  return apiService.get<OperationResult<any[]>>(
    "ServiceType/GetAllServiceType",
    getToken()
  );
};

export const getServiceTypeById = async (
  bchID: number
): Promise<OperationResult<any>> => {
  return apiService.get<OperationResult<any>>(
    `ServiceType/GetServiceTypeById/${bchID}`,
    getToken()
  );
};

export const updateServiceTypeActiveStatus = async (
  bchID: number,
  rActiveYN: boolean
): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(
    `ServiceType/UpdateServiceTypeActiveStatus/${bchID}`,
    rActiveYN,
    getToken()
  );
};

export const ServiceTypeService = {
  saveServiceType,
  getAllServiceType,
  getServiceTypeById,
  updateServiceTypeActiveStatus,
};
