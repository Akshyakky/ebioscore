// RegistrationService.ts
import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { ApiPatientData } from "../../models/PatientAdministration/ApiPatientData";
import { transformToApiData } from "../../utils/PatientAdministration/RegDataToApi";
import { RegsitrationFormData } from "../../interfaces/PatientAdministration/registrationFormData";

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

export const saveRegistration = async (
  token: string,
  formData: RegsitrationFormData
): Promise<any> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}SavePatientRegistration`;
    //const apiData: ApiPatientData = transformToApiData(formData);
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post(url, formData, { headers });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Type guard for AxiosError
      if (error.response && error.response.status === 400) {
        // Handle validation error
        throw error.response.data;
      }
    }
    // Handle other types of errors
    console.error("An unexpected error occurred:", error);
    throw new Error("An unexpected error occurred");
  }
};

export const RegistrationService = {
  getLatestUHID,
  saveRegistration,
};
