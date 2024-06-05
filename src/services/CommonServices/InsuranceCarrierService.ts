import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { DropdownOption } from "../../interfaces/common/DropdownOption";

interface APIResponse {
  insurID: string;
  insurName: string;
}

const fetchInsuranceOptions = async (
  token: string,
  endpoint: string
): Promise<DropdownOption[]> => {
  try {
    const url = `${APIConfig.commonURL}InsuranceCarrier/${endpoint}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get<APIResponse[]>(url, { headers });
    return response.data.map((item) => ({
      value: item.insurID,
      label: item.insurName,
    }));
  } catch (error) {
    console.error("Error fetching insurance options:", error);
    throw error;
  }
};

export const InsuranceCarrierService = {
  fetchInsuranceOptions,
};
