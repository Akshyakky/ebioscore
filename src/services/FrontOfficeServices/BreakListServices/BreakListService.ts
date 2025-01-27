import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { BreakListData } from "@/interfaces/frontOffice/BreakListData";
import { CommonApiService } from "@/services/CommonApiService";
import { store } from "@/store";

const commonApiService = new CommonApiService({
  baseURL: APIConfig.frontOffice,
});

const getToken = () => store.getState().auth.token!;

export const saveBreakList = async (breakListDto: BreakListData): Promise<OperationResult<BreakListData>> => {
  return commonApiService.post<OperationResult<BreakListData>>("BreakList/SaveBreakList", breakListDto, getToken());
};

export const getBreakListById = async (bLID: number): Promise<OperationResult<any>> => {
  return commonApiService.get<OperationResult<any>>(`BreakList/GetBreakListById/${bLID}`, getToken());
};

export const getAllBreakLists = async (): Promise<OperationResult<any[]>> => {
  return commonApiService.get<OperationResult<any[]>>("BreakList/GetAllBreakLists", getToken());
};

export const updateBreakListActiveStatus = async (bLID: number, isActive: boolean): Promise<OperationResult<boolean>> => {
  return commonApiService.put<OperationResult<boolean>>(`BreakList/UpdateBreakListActiveStatus/${bLID}`, isActive, getToken());
};

export const getActiveBreaks = async (startDate: Date, endDate: Date, hplId?: number): Promise<OperationResult<any[]>> => {
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  if (hplId !== undefined) {
    params.append("hplId", hplId.toString());
  }

  return commonApiService.get<OperationResult<any[]>>(`BreakList/GetActiveBreaks?${params.toString()}`, getToken());
};

export const BreakListService = {
  saveBreakList,
  getBreakListById,
  getAllBreakLists,
  updateBreakListActiveStatus,
  getActiveBreaks,
};
