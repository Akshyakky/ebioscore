import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "../CommonApiService";
import { store } from "@/store";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { DepartmentDto } from "@/interfaces/Billing/DepartmentDto";

const apiService = new CommonApiService({ baseURL: APIConfig.commonURL });

const getToken = () => store.getState().auth.token!;

export const saveDepartmentList = async (departmentDto: DepartmentDto): Promise<OperationResult<DepartmentDto>> => {
  return apiService.post<OperationResult<DepartmentDto>>("Department/SaveDepartment", departmentDto, getToken());
};
export const getAllDepartments = async (): Promise<OperationResult<DepartmentDto[]>> => {
  return apiService.get<OperationResult<DepartmentDto[]>>("Department/GetAllDepartments", getToken());
};
export const updateDepartmentActiveStatus = async (deptID: number, rActive: boolean): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(`Department/UpdateDepartmentActiveStatus/${deptID}`, rActive, getToken());
};

export const DepartmentListService = {
  saveDepartmentList,
  getAllDepartments,
  updateDepartmentActiveStatus,
};
