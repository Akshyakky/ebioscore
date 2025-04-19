import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "../CommonApiService";
import { store } from "@/store";
import { OperationResult } from "@/interfaces/Common/OperationResult";

const commonApiService = new CommonApiService({
  baseURL: APIConfig.commonURL,
});

const getToken = () => store.getState().auth.token!;

export const GetAlertBypChartID = async (pChartID: number): Promise<OperationResult<any[]>> => {
  return commonApiService.get<OperationResult<any[]>>(`Alert/GetAlertBypChartID/${pChartID}`, getToken());
};

export const UpdateAlertActiveStatus = async (oPIPAlertID: number, rActive: boolean): Promise<OperationResult<boolean>> => {
  return commonApiService.put<OperationResult<boolean>>(`Alert/UpdateAlertActiveStatus/${oPIPAlertID}`, rActive, getToken());
};

export const AlertManagerServices = {
  GetAlertBypChartID,
  UpdateAlertActiveStatus,
};
