import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "../CommonApiService";
import { store } from "@/store";

const commonApiService = new CommonApiService({ baseURL: APIConfig.commonURL });

const getToken = () => store.getState().auth.token!;

interface AppModifyList {
  id: number;
  value: string;
  label: string;
  defaultYn: string;
}

const fetchAppModifyList = async (endpoint: string, fieldCode: string): Promise<AppModifyList[]> => {
  try {
    const token = getToken();
    const response = await commonApiService.get<any[]>(`AppModify/${endpoint}?fieldCode=${fieldCode}`, token);
    return response.map((item) => ({
      value: item.amlCode,
      label: item.amlName,
      defaultYn: item.defaultYn,
      id: item.amlId,
    }));
  } catch (error) {
    console.log(`Error fetching ${fieldCode} values:`, error);
    throw error;
  }
};

export const AppModifyListService = {
  fetchAppModifyList,
};
