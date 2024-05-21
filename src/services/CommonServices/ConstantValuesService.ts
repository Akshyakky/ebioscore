// ConstantValues.ts
import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { DropdownOption } from "../../interfaces/Common/DropdownOption";

interface APIResponse {
  consValue: string;
  consDesc: string;
}
const fetchConstantValues = async (
  token: string,
  endpoint: string,
  consCode: string
): Promise<DropdownOption[]> => {
  try {
    const url = `${APIConfig.commonURL}ConstantValues/${endpoint}?consCode=${consCode}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get<APIResponse[]>(url, { headers });
    return response.data.map((item) => ({
      value: item.consValue,
      label: item.consDesc,
    }));
  } catch (error) {
    console.log(`Error fetching ${consCode} values:`, error);

    throw error;
  }
};

export const ConstantValues = {
  fetchConstantValues,
};
