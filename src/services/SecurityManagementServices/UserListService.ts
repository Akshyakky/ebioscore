import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import {
  UserListData,
  UserPermissionDto,
} from "../../interfaces/SecurityManagement/UserListData";

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
    console.log("Fetched data from API:", response.data);
    return response.data;
  } catch (error) {
    return handleError<UserListData[]>(error); // Correct usage of handleError
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
    console.log("Fetched data from GetAllUsers API:", response.data);
    return response.data;
  } catch (error) {
    return handleError<UserListData[]>(error); // Correct usage of handleError
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
    const response = await axios.post<OperationResult<UserListData>>(
      url,
      userData,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    return handleError<UserListData>(error); // Correct usage of handleError
  }
};

const saveOrUpdateUserPermission = async (
  token: string,
  userPermission: UserPermissionDto
): Promise<OperationResult<UserPermissionDto>> => {
  try {
    const url = `${APIConfig.securityManagementURL}User/SaveOrUpdateAppUserAccess`;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post<OperationResult<UserPermissionDto>>(
      url,
      userPermission,
      { headers }
    );

    if (response.data.success) {
      console.log(
        "User permission saved or updated successfully:",
        response.data.data
      );
    } else {
      console.error(
        "Failed to save or update user permission:",
        response.data.errorMessage
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error saving or updating user permission:", error);
    return handleError<UserPermissionDto>(error); // Correct usage of handleError
  }
};

const saveOrUpdateUserReportPermission = async (
  token: string,
  userReportPermission: UserPermissionDto
): Promise<OperationResult<UserPermissionDto>> => {
  try {
    const url = `${APIConfig.securityManagementURL}User/SaveOrUpdateAppReportAccess`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post<OperationResult<UserPermissionDto>>(
      url,
      userReportPermission,
      { headers }
    );

    if (response.data.success) {
      console.log(
        "User report permission saved or updated successfully:",
        response.data.data
      );
    } else {
      console.error(
        "Failed to save or update user report permission:",
        response.data.errorMessage
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error saving or updating user report permission:", error);
    return handleError<UserPermissionDto>(error); // Correct usage of handleError
  }
};

const getUserDetails = async (
  token: string,
  appID: number
): Promise<OperationResult<UserListData>> => {
  try {
    const url = `${APIConfig.securityManagementURL}User/GetUserDetails/${appID}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    };

    const response = await axios.get<OperationResult<UserListData>>(url, {
      headers,
    });

    console.log("Fetched user details from API:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return handleError<UserListData>(error);
  }
};

const updateUserActiveStatus = async (
  token: string,
  appID: number,
  isActive: boolean
): Promise<OperationResult<any>> => {
  try {
    const url = `${APIConfig.securityManagementURL}User/UpdateUserActiveStatus/${appID}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post<OperationResult<any>>(url, isActive, {
      // Send boolean directly
      headers,
    });

    if (response.data.success) {
      console.log(
        "User active status updated successfully:",
        response.data.data
      );
    } else {
      console.error(
        "Failed to update user active status:",
        response.data.errorMessage
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error updating user active status:", error);
    return handleError<any>(error); // Use your handleError function
  }
};

const handleError = <T>(error: any): OperationResult<T> => {
  let errorMessage = "An unknown error occurred.";
  if (axios.isAxiosError(error)) {
    if (error.response) {
      errorMessage =
        error.response.data.errorMessage ||
        error.response.data.message ||
        errorMessage;
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
  saveOrUpdateUserPermission,
  saveOrUpdateUserReportPermission,
  getUserDetails,
  updateUserActiveStatus,
};