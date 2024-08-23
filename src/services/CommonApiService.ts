import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { handleError } from "./CommonServices/HandlerError";

export interface ApiConfig {
  baseURL: string;
}

export class CommonApiService {
  private baseURL: string;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
  }

  private getHeaders(
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (additionalHeaders) {
      Object.assign(headers, additionalHeaders);
    }

    return headers;
  }

  private async request<T>(
    method: "get" | "post" | "put" | "delete",
    endpoint: string,
    data?: any,
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Promise<AxiosResponse<T>> {
    const config: AxiosRequestConfig = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: this.getHeaders(token, additionalHeaders),
      data,
    };

    return axios(config);
  }

  public async get<T>(
    endpoint: string,
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const response = await this.request<T>(
        "get",
        endpoint,
        undefined,
        token,
        additionalHeaders
      );
      return response.data;
    } catch (error) {
      return handleError(error).data;
    }
  }

  public async post<T>(
    endpoint: string,
    data: any,
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const response = await this.request<T>(
        "post",
        endpoint,
        data,
        token,
        additionalHeaders
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  public async put<T>(
    endpoint: string,
    data: any,
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const response = await this.request<T>(
        "put",
        endpoint,
        data,
        token,
        additionalHeaders
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  public async delete<T>(
    endpoint: string,
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const response = await this.request<T>(
        "delete",
        endpoint,
        undefined,
        token,
        additionalHeaders
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}
