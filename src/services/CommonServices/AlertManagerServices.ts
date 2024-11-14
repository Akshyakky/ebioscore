import { store } from "@/store";
import { APIConfig } from "../../apiConfig";
import { AlertDto } from "../../interfaces/Common/AlertManager";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { CommonApiService } from "../CommonApiService";

const commonApiService = new CommonApiService({
  baseURL: APIConfig.commonURL,
});

const getToken = () => store.getState().auth.token!;

export const saveAlert = async (alertData: AlertDto): Promise<OperationResult<AlertDto>> => {
  return commonApiService.post<OperationResult<any>>("Alert/SaveAlert", alertData, getToken());
};

export const GetAlertBypChartID = async (pChartID: number): Promise<OperationResult<any>> => {
  return commonApiService.get<OperationResult<any>>(`Alert/GetAlertBypChartID/${pChartID}`, getToken());
};

export const UpdateAlertActiveStatus = async (oPIPAlertID: number, rActive: boolean): Promise<OperationResult<boolean>> => {
  return commonApiService.put<OperationResult<boolean>>(`Alert/UpdateAlertActiveStatus/${oPIPAlertID}`, rActive, getToken());
};

export const AlertManagerServices = {
  saveAlert,
  GetAlertBypChartID,
  UpdateAlertActiveStatus,
};
