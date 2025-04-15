import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "../CommonApiService";
import { store } from "@/store";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { OperationResult } from "@/interfaces/Common/OperationResult";

// Initialize ApiService with the base URL for the common API
const apiService = new CommonApiService({ baseURL: APIConfig.commonURL });

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

interface PhyAPIResponse {
  consultantID: string;
  consultantName: string;
  consultantCDID: string; // cdID
}

interface RefAPIResponse {
  referralId: string;
  referralName: string;
}

const fetchAttendingPhysician = async (endpoint: string, compId: number): Promise<DropdownOption[]> => {
  const response = await apiService.get<OperationResult<PhyAPIResponse[]>>(`HospitalAdministration/${endpoint}`, getToken(), { compId });
  if (response.success) {
    const data = response.data ?? [];
    return data.map((item) => ({
      value: `${item.consultantID}-${item.consultantCDID}`,
      label: item.consultantName,
    }));
  } else {
    throw new Error(response.errorMessage || "Unknown error occurred");
  }
};

const fetchRefferalPhy = async (endpoint: string, compId: number): Promise<DropdownOption[]> => {
  const response = await apiService.get<OperationResult<RefAPIResponse[]>>(`HospitalAdministration/${endpoint}`, getToken(), { compId });

  if (response.success) {
    const data = response.data ?? [];
    return data.map((item) => ({
      value: item.referralId,
      label: item.referralName,
    }));
  } else {
    throw new Error(response.errorMessage || "Unknown error occurred");
  }
};

const fetchAvailableAttendingPhysicians = async (pChartID: number): Promise<DropdownOption[]> => {
  const response = await apiService.get<OperationResult<PhyAPIResponse[]>>("HospitalAdministration/GetAvailableConsultantsForPatientToday", getToken(), { pChartID });

  if (response.success) {
    const data = response.data ?? [];
    return data.map((item) => ({
      value: `${item.consultantID}-${item.consultantCDID}`,
      label: item.consultantName,
    }));
  } else {
    throw new Error(response.errorMessage || "Unknown error occurred");
  }
};

export const ContactMastService = {
  fetchAttendingPhysician,
  fetchRefferalPhy,
  fetchAvailableAttendingPhysicians,
};
