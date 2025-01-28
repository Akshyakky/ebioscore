import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "../CommonApiService";
import { store } from "@/store";
import { BreakConSuspendData } from "@/interfaces/frontOffice/BreakConSuspendData";
import { OperationResult } from "@/interfaces/Common/OperationResult";

const commonApiService = new CommonApiService({
  baseURL: APIConfig.frontOffice,
});

const getToken = () => store.getState().auth.token!;

export const saveBreakConSuspend = async (breakListData: BreakConSuspendData): Promise<OperationResult<BreakConSuspendData>> => {
  return commonApiService.post<OperationResult<any>>("BreakConSuspend/SaveBreakConSuspend", breakListData, getToken());
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
