// BillingService.ts
import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { DropdownOption } from "../../interfaces/common/DropdownOption";

interface MemSchemeAPIResponse {
  patMemID: string;
  patMemName: string;
}

interface PaymentSource {
  pTypeID: string;
  pTypeName: string;
}

const fetchPicValues = async (
  token: string,
  endpoint: string
): Promise<DropdownOption[]> => {
  try {
    const url = `${APIConfig.billingURL}BillingDropDowns/${endpoint}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get<PaymentSource[]>(url, { headers });
    return response.data.map((item) => ({
      value: item.pTypeID,
      label: item.pTypeName,
    }));
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
