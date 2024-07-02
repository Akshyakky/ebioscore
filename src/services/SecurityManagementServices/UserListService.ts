import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { UserListData } from "../../interfaces/SecurityManagement/UserListData";

const getActiveWorkingUsers = async (
  token: string
): Promise<OperationResult<UserListData[]>> => {
  try {
    const url = `${APIConfig.securityManagementURL}User/GetActiveWorkingUsers`;
    const headers = {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    };
    const response = await axios.get<OperationResult<UserListData[]>>(url, {
      headers,
    });
    console.log("Fetched data from API:", response.data);  // Log fetched data
    return response.data;
  } catch (error) {
    return handleError<UserListData[]>(error);
  }
};

const getAllUsers = async (
  token: string
): Promise<OperationResult<UserListData[]>> => {
  try {
    const url = `${APIConfig.securityManagementURL}User/GetAllUsers`;
    const headers = {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    };
    const response = await axios.get<OperationResult<UserListData[]>>(url, {
      headers,
    });
    console.log("Fetched data from GetAllUsers API:", response.data);  // Log fetched data
    return response.data;
  } catch (error) {
    return handleError<UserListData[]>(error);
  }
};

const saveUser = async (
  token: string,
  userData: UserListData
): Promise<OperationResult<UserListData>> => {
  try {
    const url = `${APIConfig.securityManagementURL}User/SaveUser`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post<OperationResult<UserListData>>(url, userData, {
      headers,
    });
    return response.data;
  } catch (error) {
    return handleError<UserListData>(error);
  }
};

const handleError = <T>(error: any): OperationResult<T> => {
  let errorMessage = "An unknown error occurred.";
  if (axios.isAxiosError(error)) {
    if (error.response) {
      errorMessage = error.response.data.errorMessage || error.response.data.message || errorMessage;
    } else if (error.request) {
      errorMessage = "No response received from the server.";
    } else {
      errorMessage = error.message;
    }
  } else {
    errorMessage = error.message || errorMessage;
  }
  return {
    success: false,
    errorMessage: errorMessage,
  } as OperationResult<T>;
};

export const UserListService = {
  getActiveWorkingUsers,
  getAllUsers,
  saveUser,
};
