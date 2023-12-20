// AppModifyListService.ts
import axios from "axios";
import { APIConfig } from "../../apiConfig";

interface AppModifyList {
  id: number;
  value: string;
  label: string;
  defaultYn: string;
}
interface APIResponse {
  amlId: number;
  amlCode: string;
  amlName: string;
  defaultYn: string;
}
const fetchAppModifyList = async (
  token: string,
  endpoint: string,
  fieldCode: string
): Promise<AppModifyList[]> => {
  try {
    const url = `${APIConfig.commonURL}AppModify/${endpoint}?fieldCode=${fieldCode}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get<APIResponse[]>(url, { headers });
    return response.data.map((item) => ({
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
export const AppModifyList = {
  fetchAppModifyList,
};
