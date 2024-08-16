// ReasonListService.ts
import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { ReasonListData } from "../../interfaces/FrontOffice/ReasonListData";

// Service to save reason list data
const saveReasonList = async (
  token: string,
  reasonListData: ReasonListData
): Promise<OperationResult<ReasonListData>> => {
  try {
    const url = `${APIConfig.frontOffice}ReasonList/SaveReasonList`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post<OperationResult<ReasonListData>>(
      url,
      reasonListData,
      { headers }
    );

    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(response.data.errorMessage || "Failed to save reason list.");
      }
      return response.data;
    } else {
      throw new Error("Invalid response format received.");
    }
  } catch (error: any) {
    console.error("Error saving reason list:", error.response?.data || error.message);
    return handleError<ReasonListData>(error);
  }
};

// Service to get all reason lists
const getAllReasonLists = async (token: string): Promise<OperationResult<ReasonListData[]>> => {
  try {
    const url = `${APIConfig.frontOffice}ReasonList/GetAllReasonLists`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get<OperationResult<ReasonListData[]>>(url, { headers });

    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(response.data.errorMessage || "Failed to fetch reason lists.");
      }
      return response.data;
    } else {
      throw new Error("Invalid response format received.");
    }
  } catch (error: any) {
    console.error("Error fetching reason lists:", error.response?.data || error.message);
    return handleError<ReasonListData[]>(error);
  }
};

// Helper function to handle errors
const handleError = <T>(error: any): OperationResult<T> => {
  const errorMessage = error.response?.data?.errorMessage || error.message || "An error occurred";
  return {
    success: false,
    data: {} as T,
    errorMessage: errorMessage,
  };
};

export const ReasonListService = {
  saveReasonList,
  getAllReasonLists,
};
