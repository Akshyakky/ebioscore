// RegistrationService.ts
import axios from "axios";
import { APIConfig } from "../../apiConfig";
import {
  PatientSearchResult,
  RegsitrationFormData,
} from "../../interfaces/PatientAdministration/registrationFormData";
import { NextOfKinKinFormState } from "../../interfaces/PatientAdministration/NextOfKinData";
import { InsuranceFormState } from "../../interfaces/PatientAdministration/InsuranceDetails";

export const getLatestUHID = async (
  token: string,
  endpoint: string
): Promise<string> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}Registration/${endpoint}`;
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

export const searchPatients = async (
  token: string,
  endpoint: string,
  searchTerm: string
): Promise<{ data: PatientSearchResult[]; success: boolean }> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}Registration/${endpoint}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(url, {
      headers,
      params: { searchTerm },
    });
    debugger;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 400) {
        throw error.response.data;
      }
    }
    console.error(`Error during patient search: ${error}`);
    throw new Error("An error occurred during patient search");
  }
};

export const saveRegistration = async (
  token: string,
  formData: RegsitrationFormData
): Promise<any> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}Registration/SavePatientRegistration`;
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

// Add the saveNokDetails method to your RegistrationService

export const saveNokDetails = async (
  token: string,
  nokData: NextOfKinKinFormState
): Promise<any> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}PatNok/SaveNokDetails`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post(url, nokData, { headers });
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

export const savePatientInsuranceDetails = async (
  token: string,
  insuranceData: InsuranceFormState
): Promise<any> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}OPIPInsurances/AddOrUpdateOPIPInsurance`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post(url, insuranceData, { headers });
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

export const getPatientDetails = async (
  token: string,
  pChartID: number
): Promise<{ data: RegsitrationFormData; success: boolean }> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}Registration/GetPatientDetails/${pChartID}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(url, { headers });

    return response.data;
  } catch (error) {
    console.error(`Error fetching patient details: ${error}`);
    throw error;
  }
};

// Add saveNokDetails to the exported object
export const RegistrationService = {
  getLatestUHID,
  searchPatients,
  saveRegistration,
  saveNokDetails,
  savePatientInsuranceDetails,
  getPatientDetails,
};
