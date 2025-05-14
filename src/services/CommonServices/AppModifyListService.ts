import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "../CommonApiService";
import { store } from "@/store";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { createEntityService } from "@/utils/Common/serviceFactory";

const commonApiService = new CommonApiService({ baseURL: APIConfig.commonURL });

const getToken = () => store.getState().auth.token!;
export const appModifyFieldService = createEntityService<AppModifyFieldDto>("AppModify", "commonURL");
interface AppModifyList {
  id: number;
  value: number | string;
  label: string;
  defaultYn: string;
  code: string;
}

const fetchAppModifyList = async (endpoint: string, fieldCode: string): Promise<AppModifyList[]> => {
  try {
    const token = getToken();
    const response = await commonApiService.get<any[]>(`AppModify/${endpoint}?fieldCode=${fieldCode}`, token);
    return response.map((item) => ({
      value: item.amlCode,
      label: item.amlName,
      defaultYn: item.defaultYN,
      id: item.amlID,
      code: item.amlCode,
    }));
  } catch (error) {
    console.log(`Error fetching ${fieldCode} values:`, error);
    throw error;
  }
};

export const AppModifyListService = {
  fetchAppModifyList,
};
