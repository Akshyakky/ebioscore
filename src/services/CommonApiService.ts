import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { format, toZonedTime } from "date-fns-tz";
import { handleError } from "./CommonServices/HandlerError";

export interface ApiConfig {
  baseURL: string;
}

type HttpMethod = "get" | "post" | "put" | "delete";

export class CommonApiService {
  private baseURL: string;
  private timeZone: string;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  private getHeaders(token?: string, additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Time-Zone": this.timeZone,
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return { ...headers, ...additionalHeaders };
  }

  private formatDateWithTimeZone(date: Date): string {
    const zonedDate = toZonedTime(date, this.timeZone);
    return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX", {
      timeZone: this.timeZone,
    });
  }

  private processData(data: any): any {
    if (data instanceof Date) {
      return this.formatDateWithTimeZone(data);
    } else if (Array.isArray(data)) {
      return data.map((item) => this.processData(item));
    } else if (typeof data === "object" && data !== null) {
      const processedData: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        processedData[key] = this.processData(value);
      }
      return processedData;
    }
    return data;
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
      data: this.processData(data),
      params: this.processData(params),
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
      const response = await this.request<T>(method, endpoint, data, token, additionalHeaders, params);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  public async get<T>(endpoint: string, token?: string, params?: Record<string, any>, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>("get", endpoint, undefined, token, additionalHeaders, params);
  }

  public async post<T>(endpoint: string, data: unknown, token?: string, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>("post", endpoint, data, token, additionalHeaders);
  }

  public async put<T>(endpoint: string, data: unknown, token?: string, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>("put", endpoint, data, token, additionalHeaders);
  }

  public async delete<T>(endpoint: string, token?: string, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>("delete", endpoint, undefined, token, additionalHeaders);
  }

  public async getBlob(endpoint: string, token?: string, params?: Record<string, any>, additionalHeaders?: Record<string, string>): Promise<Blob> {
    try {
      const config: AxiosRequestConfig = {
        method: "get",
        url: `${this.baseURL}${endpoint}`,
        headers: this.getHeaders(token, additionalHeaders),
        params: this.processData(params),
        responseType: "blob",
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}
