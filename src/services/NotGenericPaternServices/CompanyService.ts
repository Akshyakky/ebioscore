import { APIConfig } from "@/apiConfig";
import { ApiConfig, CommonApiService } from "@/services/CommonApiService";
import { Company } from "@/types/Common/Company.type";

// Create API configuration
const apiConfig: ApiConfig = {
  baseURL: APIConfig.commonURL,
};

// Initialize the CommonApiService with our configuration
const apiService = new CommonApiService(apiConfig);

/**
 * Retrieves the list of companies from the API
 * @returns Promise containing an array of Company objects
 */
const getCompanies = async (): Promise<Company[]> => {
  try {
    // Using the CommonApiService to make the request
    // Note: No token is needed as this is called from the login page
    const response = await apiService.get<Company[]>("company/GetCompanies");
    return response;
  } catch (error) {
    // The CommonApiService already handles basic error logging
    // We can add additional company-specific error handling here if needed
    console.error("Failed to retrieve companies:", error);
    throw error; // Re-throw to allow the calling component to handle the error
  }
};

export const CompanyService = {
  getCompanies,
};
