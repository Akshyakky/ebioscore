import { CommonApiService } from "../CommonApiService";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { APIConfig } from "../../apiConfig";
import { DeptUserDto } from "../../interfaces/Billing/DeptUserDto";
import { store } from "@/store";
const apiService = new CommonApiService({ baseURL: APIConfig.commonURL });
const apiCategory = "DeptUser";

const getToken = () => store.getState().auth.token!;
export const getDeptUsersByDeptId = async (deptID: number): Promise<OperationResult<any>> => {
  return apiService.get<OperationResult<any>>(`${apiCategory}/GetDeptUsersByDeptId/${deptID}`, getToken());
};
export const saveDeptUser = async (deptUserDto: DeptUserDto): Promise<OperationResult<DeptUserDto>> => {
  return apiService.post<OperationResult<DeptUserDto>>(`${apiCategory}/SaveDeptUser`, deptUserDto, getToken());
};

export const updateDeptUserToggleStatus = async (deptUserID: number, activeStatus: boolean, fieldName: string): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(
    `${apiCategory}/UpdateDeptUserToggleFieldsStatus/${deptUserID}?fieldName=${encodeURIComponent(fieldName)}`,
    activeStatus,
    getToken()
  );
};

export const DeptUserListService = {
  getDeptUsersByDeptId,
  saveDeptUser,
  updateDeptUserToggleStatus,
};
