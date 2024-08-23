import { CommonApiService } from "../CommonApiService";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { APIConfig } from "../../apiConfig";
import { store } from "../../store/store";
import { DepartmentDto } from "./../../interfaces/Billing/DepartmentDto";

const apiService = new CommonApiService({ baseURL: APIConfig.commonURL });

const getToken = () => store.getState().userDetails.token!;

export const saveDepartmentList = async (
  departmentDto: DepartmentDto
): Promise<OperationResult<DepartmentDto>> => {
  return apiService.post<OperationResult<DepartmentDto>>(
    "Department/SaveDepartment",
    departmentDto,
    getToken()
  );
};
export const DepartmentListService = {
  saveDepartmentList,
};
