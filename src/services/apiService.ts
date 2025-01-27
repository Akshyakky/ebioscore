import axios, { AxiosResponse } from "axios";
import { store } from "@/store";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { handleError } from "./CommonServices/HandlerError";

// Function to create an axios instance with a specific base URL
const createApiClient = (baseURL: string) => {
  const token = store.getState().auth.token!;
  return axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });
};

export const get = async <T>(url: string, baseURL: string): Promise<OperationResult<T>> => {
  const client = createApiClient(baseURL);
  try {
    const response: AxiosResponse<T> = await client.get<T>(url);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const post = async <T, D>(url: string, data: D, baseURL: string): Promise<OperationResult<T>> => {
  const client = createApiClient(baseURL);
  try {
    const response: AxiosResponse<T> = await client.post<T>(url, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
};

// Similarly for put and delete
export const put = async <T, D>(url: string, data: D, baseURL: string): Promise<OperationResult<T>> => {
  const client = createApiClient(baseURL);
  try {
    const response: AxiosResponse<T> = await client.put<T>(url, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const del = async <T>(url: string, baseURL: string): Promise<OperationResult<T>> => {
  const client = createApiClient(baseURL);
  try {
    const response: AxiosResponse<T> = await client.delete<T>(url);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const postWithoutToken = async <T, D>(url: string, data: D, baseURL: string): Promise<OperationResult<T>> => {
  const client = axios.create({
    baseURL: baseURL,
    timeout: 10000,
  });

  try {
    const response: AxiosResponse<T> = await client.post<T>(url, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
};
