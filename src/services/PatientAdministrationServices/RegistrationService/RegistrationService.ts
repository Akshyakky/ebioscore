// service/RegistrationService/RegistrationService.ts

import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import { PatientDemographicDetails } from "@/interfaces/PatientAdministration/registrationFormData";
import { CommonApiService } from "@/services/CommonApiService";
import { store } from "@/store";

// Initialize ApiService with the base URL for the patient administration API
const apiService = new CommonApiService({
  baseURL: APIConfig.patientAdministrationURL,
});

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

export const getLatestUHID = async (endpoint: string): Promise<string> => {
  return apiService.get<string>(`Registration/${endpoint}`, getToken());
};

export const searchPatients = async (endpoint: string, searchTerm: string): Promise<{ data: any[]; success: boolean }> => {
  return apiService.get<{ data: any[]; success: boolean }>(`Registration/${endpoint}`, getToken(), { searchTerm });
};

export const searchPatientDetails = async (searchTerm: string): Promise<OperationResult<PatientRegistrationDto[]>> => {
  return apiService.get<OperationResult<PatientRegistrationDto[]>>("Registration/SearchPatientDetails", getToken(), { query: searchTerm });
};

export const PatientDemoGraph = async (pChartID: number): Promise<OperationResult<PatientDemographicDetails>> => {
  return apiService.get<OperationResult<PatientDemographicDetails>>(`Registration/PatientDemoGraph/${pChartID}`, getToken());
};

// Exporting the service as an object
export const RegistrationService = {
  getLatestUHID,
  searchPatients,
  searchPatientDetails,
  PatientDemoGraph,
};
