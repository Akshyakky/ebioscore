// services/DepartmentService.ts
import axios from "axios";
import { APIConfig } from "../../apiConfig";

interface DepartmentDto {
  label: string;
  value: string;
}

interface APIResponse {
  deptID: string;
  deptName: string;
}

const fetchDepartments = async (
  token: string,
  endpoint: string,
  compId: number
): Promise<DepartmentDto[]> => {
  try {
    const url = `${APIConfig.commonURL}Department/${endpoint}?compId=${compId}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get<APIResponse[]>(url, { headers });
    return response.data.map((item) => ({
      value: item.deptID,
      label: item.deptName,
    }));
  } catch (error) {
    console.log(`Error fetching Department values:`, error);

    throw error;
  }
};
export const DepartmentService = {
  fetchDepartments,
};
