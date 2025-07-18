import { APIConfig } from "@/apiConfig";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { store } from "@/store";
import { CommonApiService } from "../CommonApiService";

const commonApiService = new CommonApiService({ baseURL: APIConfig.commonURL });

const getToken = () => store.getState().auth.token!;

const fetchConstantValues = async (endpoint: string, consCode: string): Promise<DropdownOption[]> => {
  try {
    const token = getToken();
    const response = await commonApiService.get<any[]>(`ConstantValues/${endpoint}?consCode=${consCode}`, token);
    return response.map((item) => ({
      value: item.consValue,
      label: item.consDesc,
    }));
  } catch (error) {
    throw error;
  }
};

export const ConstantValues = {
  fetchConstantValues,
};
