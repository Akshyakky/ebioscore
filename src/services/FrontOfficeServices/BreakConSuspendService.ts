import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { BreakConSuspendData } from "../../interfaces/frontOffice/BreakConSuspendData";

// Handle errors
const handleError = <T>(error: any): OperationResult<T> => {
  return {
    success: false,
    data: {} as T,
    errorMessage: error.message || "An error occurred",
  };
};

// Service to save break connection suspend details
const saveBreakConSuspend = async (
  token: string,
  breakConSuspendData: BreakConSuspendData
): Promise<OperationResult<BreakConSuspendData>> => {
  try {
    const url = `${APIConfig.frontOffice}BreakConSuspend/SaveBreakConSuspend`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post<OperationResult<BreakConSuspendData>>(
      url,
      breakConSuspendData,
      { headers }
    );

    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(
          response.data.errorMessage ||
            "Failed to save break connection suspend detail."
        );
      }
      return response.data;
    } else {
      throw new Error("Invalid response format received.");
    }
  } catch (error: any) {
    console.error(
      "Error saving break connection suspend:",
      error.response?.data || error.message
    );
    return handleError<BreakConSuspendData>(error);
  }
};

// Service to get all break connection suspend details
const getAllBreakConSuspends = async (
  token: string
): Promise<OperationResult<BreakConSuspendData[]>> => {
  try {
    const url = `${APIConfig.frontOffice}BreakConSuspend/GetAllBreakConSuspends`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get<OperationResult<BreakConSuspendData[]>>(
      url,
      { headers }
    );
    if (!response.data.success) {
      throw new Error(
        response.data.errorMessage ||
          "Failed to fetch break connection suspend details."
      );
    }

    return response.data;
  } catch (error: any) {
    return handleError<BreakConSuspendData[]>(error);
  }
};

// Service to get a specific break connection suspend detail by ID
const getBreakConSuspendById = async (
  token: string,
  bCSID: number
): Promise<OperationResult<BreakConSuspendData>> => {
  try {
    const url = `${APIConfig.frontOffice}BreakConSuspend/GetBreakConSuspendById/${bCSID}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get<OperationResult<BreakConSuspendData>>(
      url,
      { headers }
    );
    if (!response.data.success) {
      throw new Error(
        response.data.errorMessage ||
          "Failed to fetch break connection suspend detail."
      );
    }

    return response.data;
  } catch (error: any) {
    return handleError<BreakConSuspendData>(error);
  }
};

// Service to update the active status of a break connection suspend detail
const updateBreakConSuspendActiveStatus = async (
  token: string,
  bCSID: number,
  isActive: boolean
): Promise<OperationResult<any>> => {
  try {
    const url = `${APIConfig.frontOffice}BreakConSuspend/UpdateBreakConSuspendActiveStatus/${bCSID}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.put<OperationResult<any>>(
      url,
      { isActive },
      { headers }
    );
    if (!response.data.success) {
      throw new Error(
        response.data.errorMessage ||
          "Failed to update break connection suspend active status."
      );
    }

    return response.data;
  } catch (error: any) {
    return handleError<any>(error);
  }
};

export const BreakConSuspendService = {
  saveBreakConSuspend,
  getAllBreakConSuspends,
  getBreakConSuspendById,
  updateBreakConSuspendActiveStatus,
};
