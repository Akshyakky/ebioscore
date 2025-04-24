import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { BreakConDetailData } from "@/interfaces/FrontOffice/BreakListData";
import { CommonApiService } from "@/services/CommonApiService";
import { store } from "@/store";

const commonApiService = new CommonApiService({
  baseURL: APIConfig.frontOffice,
});

const getToken = () => store.getState().auth.token!;

export const saveBreakConDetail = async (resourceListData: BreakConDetailData): Promise<OperationResult<BreakConDetailData>> => {
  return commonApiService.post<OperationResult<BreakConDetailData>>("BreakConDetail/SaveBreakConDetail", resourceListData, getToken());
};

export const getAllBreakConDetails = async (): Promise<OperationResult<any[]>> => {
  return commonApiService.get<OperationResult<any[]>>("BreakConDetail/GetAllBreakConDetails", getToken());
};

export const updateBreakConDetailActiveStatus = async (bCDID: number, isActive: boolean): Promise<OperationResult<boolean>> => {
  return commonApiService.put<OperationResult<boolean>>(`BreakConDetail/UpdateBreakConDetailActiveStatus/${bCDID}`, isActive, getToken());
};

export const getBreakConDetailById = async (bLID: number): Promise<OperationResult<any>> => {
  return commonApiService.get<OperationResult<any>>(`BreakConDetail/GetBreakConDetailById/${bLID}`, getToken());
};

export const BreakListConDetailsService = {
  saveBreakConDetail,
  getAllBreakConDetails,
  updateBreakConDetailActiveStatus,
  getBreakConDetailById,
};
