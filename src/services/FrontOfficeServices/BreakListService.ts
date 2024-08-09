import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { BreakListData } from "../../interfaces/frontOffice/BreakListData";

const handleError = <T>(error: any): OperationResult<T> => {
  const errorMessage =
    error.response?.data?.errors?.[0]?.errorMessage || error.message || "An error occurred";
  console.error("Error details:", {
    data: error.response?.data,
    status: error.response?.status,
    headers: error.response?.headers,
    message: error.message,
  });
  return {
    success: false,
    data: {} as T,
    errorMessage,
  };
};

// Service to save break list data
const saveBreakList = async (

  token: string,
  breakListData: BreakListData
): Promise<OperationResult<BreakListData>> => {
  debugger 
  try {
    const url = `${APIConfig.frontOffice}BreakList/SaveBreakList`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post<OperationResult<BreakListData>>(
      url,
      breakListData,
      { headers }
    );

    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(response.data.errorMessage || "Failed to save break list.");
      }
      return response.data;
    } else {
      throw new Error("Invalid response format received.");
    }
  } catch (error: any) {
    return handleError<BreakListData>(error);
  }
};

// Service to fetch a break list by ID
const getBreakListById = async (
  token: string,
  id: number
): Promise<OperationResult<BreakListData>> => {
  try {
    const url = `${APIConfig.frontOffice}BreakList/GetBreakListById/${id}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get<OperationResult<BreakListData>>(url, { headers });

    if (!response.data.success) {
      throw new Error(response.data.errorMessage || "Failed to fetch break list.");
    }

    return response.data;
  } catch (error) {
    return handleError<BreakListData>(error);
  }
};

// Service to fetch all break lists
const getAllBreakLists = async (
  token: string
): Promise<OperationResult<any[]>> => {
  try {
    const url = `${APIConfig.frontOffice}BreakList/GetAllBreakLists`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get<OperationResult<any[]>>(url, { headers });
debugger
    if (!response.data.success) {
      throw new Error(response.data.errorMessage || "Failed to fetch break lists.");
    }

    return response.data;
  } catch (error: any) {
    return handleError(error);
  }
};

// Service to update break list active status
const updateBreakListActiveStatus = async (
  token: string,
  breakListId: number,
  isActive: boolean
): Promise<OperationResult<boolean>> => {
  try {
    const url = `${APIConfig.frontOffice}BreakList/UpdateBreakListActiveStatus/${breakListId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const body = {
      isActive,
    };

    const response = await axios.put<OperationResult<boolean>>(url, body, { headers });

    if (!response.data.success) {
      throw new Error(response.data.errorMessage || "Failed to update break list status.");
    }

    return response.data;
  } catch (error: any) {
    return handleError<boolean>(error);
  }
};

export const BreakListService = {
  saveBreakList,
  getBreakListById,
  getAllBreakLists,
  updateBreakListActiveStatus,
};
