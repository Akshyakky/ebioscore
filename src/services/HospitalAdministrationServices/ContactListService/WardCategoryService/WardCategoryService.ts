import { APIConfig } from "../../../../apiConfig";
import { OperationResult } from "../../../../interfaces/Common/OperationResult";
import { WardCategoryDto } from "../../../../interfaces/HospitalAdministration/WardCategoryDto";
import { store } from "../../../../store/store";
import { CommonApiService } from "../../../CommonApiService";

const apiService = new CommonApiService({
  baseURL: APIConfig.hospitalAdministrations,
});

const getToken = () => store.getState().userDetails.token!;

export const saveWardCategory = async (
  wardCategoryDto: WardCategoryDto
): Promise<OperationResult<WardCategoryDto>> => {
  return apiService.post<OperationResult<any>>(
    "WardCategory/SaveWardCategory",
    wardCategoryDto,
    getToken()
  );
};

export const getAllWardCategory = async (): Promise<OperationResult<any[]>> => {
  return apiService.get<OperationResult<any[]>>(
    "WardCategory/GetAllWardCategory",
    getToken()
  );
};

export const getWardCategoryById = async (
  wCatID: number
): Promise<OperationResult<any>> => {
  return apiService.get<OperationResult<any>>(
    `WardCategory/GetWardCategoryById/${wCatID}`,
    getToken()
  );
};

export const updateWardCategoryActiveStatus = async (
  wCatID: number,
  rActive: boolean
): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(
    `WardCategory/UpdateWardCategoryActiveStatus/${wCatID}`,
    rActive,
    getToken()
  );
};

export const WardCategoryService = {
  saveWardCategory,
  getAllWardCategory,
  getWardCategoryById,
  updateWardCategoryActiveStatus,
};
