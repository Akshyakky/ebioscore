import { CommonApiService } from "../../CommonApiService";
import { APIConfig } from "../../../apiConfig";
import { DropdownOption } from "../../../interfaces/Common/DropdownOption";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { ContactListData } from "../../../interfaces/HospitalAdministration/ContactListData";
import { store } from "@/store";

const apiService = new CommonApiService({
  baseURL: APIConfig.hospitalAdministrations,
});

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

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
};
