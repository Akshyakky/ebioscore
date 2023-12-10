import axios from "axios";
import { APIConfig } from "../apiConfig";

const API_BASE_URL = `${APIConfig.commonURL}`;

// Define the structure of your Module and SubModule DTOs
export interface ModuleDto {
  auGrpID: number;
  title: string;
  link: string;
  iCon: string;
  // Add other properties as needed
}

export interface SubModuleDto {
  auGrpID: number;
  title: string;
  link: string;
  iCon: string;
  // Add other properties as needed
}

const moduleService = {
  getActiveModules: async (
    userID: number,
    token: string
  ): Promise<ModuleDto[]> => {
    const url = `${API_BASE_URL}GetModules`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get<ModuleDto[]>(url, {
      params: { userID },
      headers,
    });
    return response.data;
  },

  getActiveSubModules: async (
    userID: number,
    token: string
  ): Promise<SubModuleDto[]> => {
    const url = `${API_BASE_URL}GetSubModules`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get<SubModuleDto[]>(url, {
      params: { userID },
      headers,
    });
    return response.data;
  },
};

export default moduleService;
