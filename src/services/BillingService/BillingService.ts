// BillingService.ts
import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { DropdownOption } from "../../interfaces/Common/DropdownOption";

interface MemSchemeAPIResponse {
  patMemID: string;
  patMemName: string;
}

const fetchPicValues = async (
  token: string,
  endpoint: string
): Promise<string> => {
  try {
    const url = `${APIConfig.billingURL}BillingDropDowns/${endpoint}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching pic values:", error);
    throw error;
  }
};

const fetchMembershipScheme = async (
  token: string,
  endpoint: string,
  compId: number
): Promise<DropdownOption[]> => {
  const url = `${APIConfig.billingURL}BillingDropDowns/${endpoint}?compId=${compId}`;
  const headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get<MemSchemeAPIResponse[]>(url, { headers });
  return response.data.map((item) => ({
    value: item.patMemID,
    label: item.patMemName,
  }));
};

export const BillingService = {
  fetchPicValues,
  fetchMembershipScheme,
};
