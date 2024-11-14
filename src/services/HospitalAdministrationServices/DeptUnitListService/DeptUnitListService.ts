import { store } from "@/store";
import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { DeptUnitListDto } from "../../../interfaces/HospitalAdministration/DeptunitListDto";
import { CommonApiService } from "../../CommonApiService";

const apiService = new CommonApiService({
  baseURL: APIConfig.hospitalAdministrations,
});

const getToken = () => store.getState().auth.token!;

export const saveDeptUnitList = async (deptUnitListDto: DeptUnitListDto): Promise<OperationResult<DeptUnitListDto>> => {
  return apiService.post<OperationResult<DeptUnitListDto>>("DeptUnitList/SaveDeptUnitList", deptUnitListDto, getToken());
};

export const getAllDeptUnitList = async (): Promise<OperationResult<DeptUnitListDto[]>> => {
  return apiService.get<OperationResult<DeptUnitListDto[]>>("DeptUnitList/GetAllDeptUnitList", getToken());
};

export const getDeptUnitListById = async (dulID: number): Promise<OperationResult<DeptUnitListDto>> => {
  return apiService.get<OperationResult<DeptUnitListDto>>(`DeptUnitList/GetDeptUnitListById/${dulID}`, getToken());
};

export const updateDeptUnitListActiveStatus = async (dulID: number, rActive: boolean): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(
    `DeptUnitList/UpdateDeptUnitListActiveStatus/${dulID}`,
    rActive, // Make sure the payload matches the API expectation
    getToken()
  );
};

export const DeptUnitListService = {
  saveDeptUnitList,
  getAllDeptUnitList,
  getDeptUnitListById,
  updateDeptUnitListActiveStatus,
};
