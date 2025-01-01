import { CommonApiService } from "../../CommonApiService";
import { APIConfig } from "../../../apiConfig";
import { DropdownOption } from "../../../interfaces/Common/DropdownOption";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { store } from "@/store";
import { ContactListData } from "../../../interfaces/HospitalAdministration/ContactListData";

const apiService = new CommonApiService({
  baseURL: APIConfig.hospitalAdministrations,
});

const getToken = () => store.getState().auth.token!;
interface GetNextCodeParams {
  prefix: string;
  padLength?: number;
}

const getNextCode = async ({ prefix, padLength }: GetNextCodeParams): Promise<OperationResult<string>> => {
  try {
    const response = await apiService.get<OperationResult<string>>("ContactList/GetNextCode", getToken(), { prefix, padLength });
    return response;
  } catch (error: any) {
    console.error("Error generating next code:", error);
    return {
      success: false,
      errorMessage: error.message || "An error occurred while generating the code",
      data: undefined,
    };
  }
};

const fetchActiveSpecialties = async (compId: number): Promise<DropdownOption[]> => {
  try {
    const response = await apiService.get<any[]>(`ContactList/GetActiveSpecialities`, getToken(), { compId });
    return response.map((item: any) => ({
      value: item.facId,
      label: item.facName,
    }));
  } catch (error) {
    console.error("Error fetching active specialties:", error);
    throw error;
  }
};

const saveContactList = async (contactListDto: ContactListData): Promise<OperationResult<ContactListData>> => {
  return apiService.post<OperationResult<ContactListData>>("ContactList/SaveContactList", contactListDto, getToken());
};

const searchContactListDetails = async (searchTerm: string): Promise<{ data: any[]; success: boolean }> => {
  return apiService.get<{ data: any[]; success: boolean }>("ContactList/SearchContactList", getToken(), { searchTerm });
};

const fetchContactDetails = async (conID: number): Promise<ContactListData> => {
  const response = await apiService.get<OperationResult<ContactListData>>(`ContactList/GetContactDetails/${conID}`, getToken());
  if (response.success && response.data) {
    return response.data;
  } else {
    throw new Error(response.errorMessage || "Failed to fetch contact details");
  }
};

export const ContactListService = {
  fetchActiveSpecialties,
  saveContactList,
  searchContactListDetails,
  fetchContactDetails,
  getNextCode,
};
