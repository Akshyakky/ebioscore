import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "../CommonApiService";
import { store } from "@/store";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";

// Initialize ApiService with the base URL for the common API
const apiService = new CommonApiService({ baseURL: APIConfig.commonURL });

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

interface APIResponse {
  deptID: string;
  deptName: string;
}

const fetchDepartments = async (endpoint: string, compId: number): Promise<DropdownOption[]> => {
  try {
    const response = await apiService.get<APIResponse[]>(`Department/${endpoint}`, getToken(), { compId });

    return response.map((item) => ({
      value: item.deptID,
      label: item.deptName,
    }));
  } catch (error) {
    console.error(`Error fetching Department values:`, error);
    throw error;
  }
};

export const DepartmentService = {
  fetchDepartments,
};
