import axios from "axios";
import { APIConfig } from "../../apiConfig";

const API_BASE_URL = `${APIConfig.moduleURL}`;

export interface ModuleDto {
  auGrpID: number;
  title: string;
  link: string;
  iCon: string;
}

export interface SubModuleDto {
  userID: number;
  auGrpID: number;
  subID: number;
  title: string;
  link: string;
  iCon: string;
}

export interface ReportPermissionDto {
  permissionID: number;
  permissionName: string;
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
    try {
      const response = await axios.get<ModuleDto[]>(url, {
        params: { userID },
        headers,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to load modules");
    }
  },

  getActiveSubModules: async (
    userID: number,
    token: string
  ): Promise<SubModuleDto[]> => {
    const url = `${API_BASE_URL}GetSubModules`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const response = await axios.get<SubModuleDto[]>(url, {
        params: { userID },
        headers,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to load submodules");
    }
  },
};

export default moduleService;
