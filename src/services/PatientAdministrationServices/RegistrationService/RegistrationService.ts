// service/RegistrationService/RegistrationService.ts
import axios from "axios";
import { APIConfig } from "../../../apiConfig";
import {
  PatientDemographicDetails,
  PatientSearchResult,
  RegsitrationFormData,
} from "../../../interfaces/PatientAdministration/registrationFormData";
import { NextOfKinKinFormState } from "../../../interfaces/PatientAdministration/NextOfKinData";
import { InsuranceFormState } from "../../../interfaces/PatientAdministration/InsuranceDetails";
import { OperationResult } from "../../../interfaces/Common/OperationResult";

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
    return response.data;
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
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post(url, formData, { headers });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 400) {
        throw error.response.data;
      }
    }
    console.error("An unexpected error occurred:", error);
    throw new Error("An unexpected error occurred");
  }
};

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
      if (error.response && error.response.status === 400) {
        throw error.response.data;
      }
    }
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
      if (error.response && error.response.status === 400) {
        throw error.response.data;
      }
    }
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

export const getPatNokDetails = async (
  token: string,
  pChartID: number
): Promise<{ data: NextOfKinKinFormState[]; success: boolean }> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}PatNok/GetNokDetailsByPChartID/${pChartID}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching patient Nok details: ${error}`);
    throw error;
  }
};

export const getPatientInsuranceDetails = async (
  token: string,
  pChartID: number
): Promise<{ data: InsuranceFormState[]; success: boolean }> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}OPIPInsurances/GetOPIPInsuranceByPCharID/${pChartID}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching patient insurance details: ${error}`);
    throw error;
  }
};

export const searchPatientDetails = async (
  token: string,
  searchTerm: string
): Promise<{ data: any[]; success: boolean }> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}Registration/SearchPatientDetails`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(url, {
      headers,
      params: { query: searchTerm },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 400) {
        throw error.response.data;
      }
    }
    console.error(`Error during patient details search: ${error}`);
    throw new Error("An error occurred during patient details search");
  }
};

export const PatientDemoGraph = async (
  token: string,
  pChartID: number
): Promise<OperationResult<PatientDemographicDetails>> => {
  const url = `${APIConfig.patientAdministrationURL}Registration/PatientDemoGraph/${pChartID}`;
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const response = await axios.get(url, { headers });
    return {
      success: true,
      data: response.data as PatientDemographicDetails,
    };
  } catch (error) {
    console.error(`Error during fetching patient demographics: ${error}`);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
};

export const RegistrationService = {
  getLatestUHID,
  searchPatients,
  saveRegistration,
  saveNokDetails,
  savePatientInsuranceDetails,
  getPatientDetails,
  getPatNokDetails,
  getPatientInsuranceDetails,
  searchPatientDetails,
  PatientDemoGraph,
};
