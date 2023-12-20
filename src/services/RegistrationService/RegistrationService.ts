// RegistrationService.ts
import axios from "axios";
import { APIConfig } from "../../apiConfig";

const getLatestUHID = async (
  token: string,
  endpoint: string
): Promise<string> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}${endpoint}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(url, {
      headers,
    });

    return response.data; // Axios automatically parses the JSON response
  } catch (error) {
    console.error(
      `There was a problem fetching the latest UHID from ${endpoint}:`,
      error
    );
    throw error;
  }
};

export const RegistrationService = {
  getLatestUHID,
};
