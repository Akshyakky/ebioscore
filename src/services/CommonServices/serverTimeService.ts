// src/services/serverTimeService.ts
import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { get } from "../apiService";

export interface ServerTimeResponse {
  currentTimeUtc: string;
  serverLocalTime: string;
  serverTimeZone: string;
  serverTimeZoneOffset: string;
}

export const fetchServerTime = async (): Promise<OperationResult<ServerTimeResponse>> => {
  const url = "/ServerTime";
  return get<ServerTimeResponse>(url, APIConfig.commonURL);
};
