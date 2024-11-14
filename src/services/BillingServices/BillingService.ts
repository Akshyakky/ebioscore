import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "../../apiConfig";
import { DropdownOption } from "../../interfaces/Common/DropdownOption";
import { store } from "@/store";

const apiService = new CommonApiService({ baseURL: APIConfig.billingURL });

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

interface MemSchemeAPIResponse {
  patMemID: string;
  patMemName: string;
}
interface PaymentSource {
  pTypeID: string;
  pTypeName: string;
}

const fetchPicValues = async (endpoint: string): Promise<DropdownOption[]> => {
  try {
    const response = await apiService.get<PaymentSource[]>(`BillingDropDowns/${endpoint}`, getToken());
    return response.map((item) => ({
      value: item.pTypeID,
      label: item.pTypeName,
    }));
  } catch (error) {
    throw error;
  }
};

const fetchMembershipScheme = async (endpoint: string, compId: number): Promise<DropdownOption[]> => {
  try {
    const response = await apiService.get<MemSchemeAPIResponse[]>(`BillingDropDowns/${endpoint}`, getToken(), { compId });
    return response.map((item) => ({
      value: item.patMemID,
      label: item.patMemName,
    }));
  } catch (error) {
    throw error;
  }
};

export const BillingService = {
  fetchPicValues,
  fetchMembershipScheme,
};
