import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { ResourceListData } from "../../interfaces/FrontOffice/ResourceListData";

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

    const response = await axios.post<OperationResult<ResourceListData>>(
      url,
      resourceListData,
      { headers }
    );

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

// Service to fetch a resource list by ID
const getResourceById = async (
  token: string,
  id: number
): Promise<OperationResult<ResourceListData>> => {
  try {
    const url = `${APIConfig.frontOffice}ResourceList/GetResourceListById/${id}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get<OperationResult<ResourceListData>>(url, { headers });

    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(response.data.errorMessage || "Failed to fetch resource list.");
      }
      return response.data;
    } else {
      throw new Error("Invalid response format received.");
    }
  } catch (error: any) {
    console.error("Error fetching resource list:", error.response?.data || error.message);
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

const updateResourceActiveStatus = async (
  token: string,
  resourceId: number,
  isActive: boolean
): Promise<OperationResult<boolean>> => {
  try {
    const url = `${APIConfig.frontOffice}ResourceList/UpdateResourceActiveStatus/${resourceId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const body = {
      isActive,
    };

    const response = await axios.put<OperationResult<boolean>>(
      url,
      body,
      { headers }
    );

    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(response.data.errorMessage || "Failed to update resource status.");
      }
      return response.data;
    } else {
      throw new Error("Invalid response format received.");
    }
  } catch (error: any) {
    console.error("Error updating resource active status:", error.response?.data || error.message);
    return handleError<boolean>(error);
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

export const ResourceListService = {
  saveResourceList,
  getResourceById,
  getAllResourceLists,
  updateResourceActiveStatus
};
