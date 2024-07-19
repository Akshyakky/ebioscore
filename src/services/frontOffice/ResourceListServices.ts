import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { ResourceListData } from "../../interfaces/frontOffice/ResourceListData";

// Service to save resource list data
const saveResourceList = async (
  token: string,
  resourceListData: ResourceListData
): Promise<OperationResult<ResourceListData>> => {
  try {
    if (!resourceListData.rLCode || !resourceListData.rLName) {
      throw new Error("Resource Code and Resource Name are required fields.");
    }

    const url = `${APIConfig.frontOffice}ResourceList/SaveResourceList`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    console.log("Sending resource data:", JSON.stringify(resourceListData, null, 2));

    const response = await axios.post<OperationResult<ResourceListData>>(
      url,
      resourceListData,
      { headers }
    );

    console.log("Received response:", response.data);

    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(response.data.errorMessage || "Failed to save resource list.");
      }
      return response.data;
    } else {
      throw new Error("Invalid response format received.");
    }
  } catch (error: any) {
    console.error("Error saving or updating resource list:", error.response?.data || error.message);
    return handleError<ResourceListData>(error);
  }
};

// Service to fetch all resource lists
const getAllResourceLists = async (token: string): Promise<OperationResult<ResourceListData[]>> => {
  try {
    const url = `${APIConfig.frontOffice}ResourceList/GetAllResourceLists`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get<OperationResult<ResourceListData[]>>(url, { headers });

    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(response.data.errorMessage || "Failed to fetch resource lists.");
      }
      return response.data;
    } else {
      throw new Error("Invalid response format received.");
    }
  } catch (error: any) {
    console.error("Error fetching resource lists:", error.response?.data || error.message);
    return handleError<ResourceListData[]>(error);
  }
};

// Error handling utility
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

export const ResourceListService = {
  saveResourceList,
  getAllResourceLists,
};
