import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "../CommonApiService";
import { store } from "@/store";
import { BServiceGrpDto } from "@/interfaces/Billing/BServiceGrpDto";
import { OperationResult } from "@/interfaces/Common/OperationResult";

const apiService = new CommonApiService({ baseURL: APIConfig.billingURL });

const getToken = () => store.getState().auth.token!;

export const saveBServiceGrp = async (bServiceGrpDto: BServiceGrpDto): Promise<OperationResult<BServiceGrpDto>> => {
  return apiService.post<OperationResult<any>>("ServiceGroup/SaveBServiceGrp", bServiceGrpDto, getToken());
};

export const getAllBServiceGrps = async (): Promise<OperationResult<any[]>> => {
  return apiService.get<OperationResult<any[]>>("ServiceGroup/GetAllBServiceGrps", getToken());
};

export const getBServiceGrpById = async (sGrpID: number): Promise<OperationResult<any>> => {
  return apiService.get<OperationResult<any>>(`ServiceGroup/GetBServiceGrpById/${sGrpID}`, getToken());
};

export const updateBServiceGrpActiveStatus = async (sGrpID: number, rActiveYN: boolean): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(`ServiceGroup/UpdateBServiceGrpActiveStatus/${sGrpID}`, rActiveYN, getToken());
};

export const ServiceGroupListCodeService = {
  saveBServiceGrp,
  getAllBServiceGrps,
  getBServiceGrpById,
  updateBServiceGrpActiveStatus,
};
