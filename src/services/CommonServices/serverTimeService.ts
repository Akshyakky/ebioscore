// src/services/serverTimeService.ts
import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { CommonApiService } from "../CommonApiService";

export interface ServerTimeResponse {
  currentTimeUtc: string;
  serverLocalTime: string;
  serverTimeZone: string;
  serverTimeZoneOffset: string;
}

const apiService = new CommonApiService({ baseURL: APIConfig.commonURL });

export const fetchServerTime = async (): Promise<OperationResult<ServerTimeResponse>> => {
  const url = "ServerTime";
  return apiService.get<OperationResult<ServerTimeResponse>>(url);
};
