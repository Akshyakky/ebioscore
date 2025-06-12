import { APIConfig } from "@/apiConfig";
import { store } from "@/store";
import { CommonApiService } from "../CommonApiService";

const apiService = new CommonApiService({ baseURL: APIConfig.commonURL });

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

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
  getActiveModules: async (userID: number): Promise<ModuleDto[]> => {
    try {
      return await apiService.get<ModuleDto[]>("module/GetModules", getToken(), {
        userID,
      });
    } catch (error) {
      console.error("Error fetching active modules:", error);
      throw new Error("Failed to load modules");
    }
  },

  getActiveSubModules: async (userID: number): Promise<SubModuleDto[]> => {
    try {
      return await apiService.get<SubModuleDto[]>("module/GetSubModules", getToken(), {
        userID,
      });
    } catch (error) {
      console.error("Error fetching active submodules:", error);
      throw new Error("Failed to load submodules");
    }
  },
};

export default moduleService;
