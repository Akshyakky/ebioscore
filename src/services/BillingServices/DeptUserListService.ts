import { CommonApiService } from "../CommonApiService";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { APIConfig } from "../../apiConfig";
import { store } from "../../store/store";
import { DeptUserDto } from "../../interfaces/Billing/DeptUserDto";
const apiService = new CommonApiService({ baseURL: APIConfig.commonURL });

const getToken = () => store.getState().userDetails.token!;
export const getDeptUsersByDeptId = async (
  deptID: number
): Promise<OperationResult<any>> => {
  return apiService.get<OperationResult<any>>(
    `DeptUser/GetDeptUsersByDeptId/${deptID}`,
    getToken()
  );
};

export const DeptUserListService = {
  getDeptUsersByDeptId,
};
