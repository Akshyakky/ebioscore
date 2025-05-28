import { APIConfig } from "@/apiConfig";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { ContactListData } from "@/interfaces/HospitalAdministration/ContactListData";
import { CommonApiService } from "@/services/CommonApiService";
import { store } from "@/store";

// Initialize the API service with the base URL from the configuration
const apiService = new CommonApiService({
  baseURL: APIConfig.hospitalAdministrations,
});

// Get the authentication token from the store
const getToken = () => store.getState().auth.token!;

// Fetch active specialties
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

// Generate a contact code based on the provided prefix and padding length
const generateContactCode = async (prefix: string, padLength: number = 5): Promise<OperationResult<string>> => {
  try {
    // Sending the API request to generate the contact code
    const response = await apiService.get<OperationResult<string>>(`ContactList/GenerateContactCode`, getToken(), { prefix, padLength });

    // Ensure the response structure has success and data
    if (response) {
      return response;
    } else {
      console.error("Failed to generate code. Response is missing 'success' or 'data':", response);
      throw new Error("Failed to generate code");
    }
  } catch (error) {
    console.error("Error generating contact code:", error);
    throw new Error("Failed to generate contact code");
  }
};

// Search for contact list details based on a search term
const searchContactListDetails = async (searchTerm: string): Promise<{ data: any[]; success: boolean }> => {
  try {
    const response = await apiService.get<{ data: any[]; success: boolean }>("ContactList/SearchContactList", getToken(), { searchTerm });
    return response;
  } catch (error) {
    console.error("Error searching contact list details:", error);
    throw new Error("Failed to search contact list details");
  }
};

// Fetch contact details based on conID
const fetchContactDetails = async (conID: number): Promise<ContactListData> => {
  try {
    const response = await apiService.get<OperationResult<ContactListData>>(`ContactList/GetContactDetails/${conID}`, getToken());

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.errorMessage || "Failed to fetch contact details");
    }
  } catch (error) {
    console.error("Error fetching contact details:", error);
    throw new Error("Failed to fetch contact details");
  }
};

// Export the service methods to be used in other parts of the application
export const ContactListService = {
  fetchActiveSpecialties,
  searchContactListDetails,
  fetchContactDetails,
  generateContactCode,
};
