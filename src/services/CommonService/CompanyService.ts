import axios from "axios";
import { APIConfig } from "../../apiConfig";

const getCompanies = async () => {
  try {
    const response = await axios.get(`${APIConfig.moduleURL}GetCompanies`);
    // Add response validation or transformation here if needed
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios errors specifically
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        console.error("Error response:", error.response.data);
        throw new Error("Error fetching companies: " + error.response.status);
      } else if (error.request) {
        // No response was received
        console.error("No response:", error.request);
        throw new Error("No response from server");
      } else {
        // Something went wrong in setting up the request
        console.error("Error message:", error.message);
        throw new Error("Error setting up request");
      }
    } else {
      // Handle non-Axios errors
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
};

export const CompanyService = {
  getCompanies,
};
