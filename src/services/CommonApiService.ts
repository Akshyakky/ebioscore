import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { handleError } from "./CommonServices/HandlerError";

export interface ApiConfig {
  baseURL: string;
}

type HttpMethod = "get" | "post" | "put" | "delete";

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
      "Time-Zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return { ...headers, ...additionalHeaders };
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    token?: string,
    additionalHeaders?: Record<string, string>,
    params?: Record<string, any>
  ): Promise<AxiosResponse<T>> {
    const config: AxiosRequestConfig = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: this.getHeaders(token, additionalHeaders),
      data,
      params,
    };
    return axios(config);
  }

  private async makeRequest<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    token?: string,
    additionalHeaders?: Record<string, string>,
    params?: Record<string, any>
  ): Promise<T> {
    try {
      const response = await this.request<T>(
        method,
        endpoint,
        data,
        token,
        additionalHeaders,
        params
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  public async get<T>(
    endpoint: string,
    token?: string,
    params?: Record<string, any>,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>(
      "get",
      endpoint,
      undefined,
      token,
      additionalHeaders,
      params
    );
  }

  public async post<T>(
    endpoint: string,
    data: unknown,
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>(
      "post",
      endpoint,
      data,
      token,
      additionalHeaders
    );
  }

  public async put<T>(
    endpoint: string,
    data: unknown,
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>("put", endpoint, data, token, additionalHeaders);
  }

  public async delete<T>(
    endpoint: string,
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>(
      "delete",
      endpoint,
      undefined,
      token,
      additionalHeaders
    );
  }
}
