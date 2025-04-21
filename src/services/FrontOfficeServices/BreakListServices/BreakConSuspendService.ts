import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { BreakConSuspendData } from "@/interfaces/FrontOffice/BreakConSuspendData";
import { CommonApiService } from "@/services/CommonApiService";
import { store } from "@/store";

const commonApiService = new CommonApiService({
  baseURL: APIConfig.frontOffice,
});

const getToken = () => store.getState().auth.token!;

export const saveBreakConSuspend = async (resourceListData: BreakConSuspendData): Promise<OperationResult<BreakConSuspendData>> => {
  return commonApiService.post<OperationResult<any>>("BreakConSuspend/SaveBreakConSuspend", resourceListData, getToken());
};

export const getAllBreakConSuspends = async (): Promise<OperationResult<any[]>> => {
  return commonApiService.get<OperationResult<any[]>>("BreakConSuspend/GetAllBreakConSuspends", getToken());
};

export const getBreakConSuspendById = async (bCSID: number): Promise<OperationResult<any>> => {
  return commonApiService.get<OperationResult<any>>(`BreakConSuspend/GetBreakConSuspendById/${bCSID}`, getToken());
};

export const updateBreakConSuspendActiveStatus = async (bCSID: number, isActive: boolean): Promise<OperationResult<boolean>> => {
  return commonApiService.put<OperationResult<boolean>>(`BreakConSuspend/UpdateBreakConSuspendActiveStatus/${bCSID}`, isActive, getToken());
};

export const BreakConSuspendService = {
  saveBreakConSuspend,
  getAllBreakConSuspends,
  getBreakConSuspendById,
  updateBreakConSuspendActiveStatus,
};
