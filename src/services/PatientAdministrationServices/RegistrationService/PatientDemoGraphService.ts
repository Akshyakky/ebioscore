import { CommonApiService } from "../../CommonApiService";
import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { PatientDemoGraph } from "../../../interfaces/PatientAdministration/patientDemoGraph";
import { store } from "@/store";

// Initialize ApiService with the base URL for the patient administration API
const apiService = new CommonApiService({
  baseURL: APIConfig.patientAdministrationURL,
});

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

export const getPatientDemographicsByPChartID = async (pChartID: number): Promise<OperationResult<PatientDemoGraph>> => {
  return apiService.get<OperationResult<PatientDemoGraph>>(`PatientDemoGraph/GetPatientDemographics/${pChartID}`, getToken());
};

export const savePatientDemographics = async (patientDetails: PatientDemoGraph): Promise<OperationResult<boolean>> => {
  return apiService.post<OperationResult<boolean>>("PatientDemoGraph/SavePatientDemographics", patientDetails, getToken());
};

// Exporting the service as an object
export const PatientDemoGraphService = {
  getPatientDemographicsByPChartID,
  savePatientDemographics,
};
