import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { InsuranceListDto } from "../../../interfaces/HospitalAdministration/InsuranceListDto";
import { store } from "../../../store/store";
import { CommonApiService } from "../../CommonApiService";

const apiService = new CommonApiService({
  baseURL: APIConfig.hospitalAdministrations,
});

const getToken = () => store.getState().userDetails.token!;

export const saveInsuranceList = async (
  insuranceListDto: InsuranceListDto
): Promise<OperationResult<InsuranceListDto>> => {
  return apiService.post<OperationResult<any>>(
    "InsuranceList/SaveInsuranceList",
    insuranceListDto,
    getToken()
  );
};

export const getAllInsuranceList = async (): Promise<
  OperationResult<any[]>
> => {
  return apiService.get<OperationResult<any[]>>(
    "InsuranceList/GetAllInsuranceList",
    getToken()
  );
};

export const getInsuranceListById = async (
  insurID: number
): Promise<OperationResult<any>> => {
  return apiService.get<OperationResult<any>>(
    `InsuranceList/GetInsuranceListById/${insurID}`,
    getToken()
  );
};

export const updateInsuranceListActiveStatus = async (
  insurID: number,
  rActive: boolean
): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(
    `InsuranceList/UpdateInsuranceListActiveStatus/${insurID}`,
    rActive,
    getToken()
  );
};

export const InsuranceListService = {
  saveInsuranceList,
  getAllInsuranceList,
  getInsuranceListById,
  updateInsuranceListActiveStatus,
};
