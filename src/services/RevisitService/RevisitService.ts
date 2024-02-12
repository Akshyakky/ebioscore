import axios from "axios";
import { APIConfig } from "../../apiConfig";
import {
  GetPatientVisitHistory,
  revisitFormData,
} from "../../interfaces/PatientAdministration/revisitFormData";
import { OperationResult } from "../../interfaces/Common/OperationResult";

export const getPatientHistoryByPChartID = async (
  token: string,
  pChartID: number
): Promise<{ data: GetPatientVisitHistory[]; success: boolean }> => {
  const url = `${APIConfig.patientAdministrationURL}Revisit/GetPatientHistoryByPChartID/${pChartID}`;
  const headers = { Authorization: `Bearer ${token}}` };
  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching patient visit history: ${error}`);
    throw error;
  }
};

export const saveOPVisits = async (
  token: string,
  opVisitsData: revisitFormData
): Promise<OperationResult<revisitFormData>> => {
  const url = `${APIConfig.patientAdministrationURL}Revisit/SaveVisitDetails`;
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const response = await axios.post(url, opVisitsData, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error saving OP visits data: ${error}`);
    throw error;
  }
};
export const getLastVisitDetailsByPChartID = async (
  token: string,
  pChartID: number
) => {
  const url = `${APIConfig.patientAdministrationURL}Revisit/GetLastVisitDetails/${pChartID}`;
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const response = await axios.get(url, { headers });
    return response.data; // Assuming the API returns OperationResult<dynamic>
  } catch (error) {
    console.error(`Error fetching last visit details: ${error}`);
    throw error;
  }
};
export const RevisitService = {
  getPatientHistoryByPChartID,
  saveOPVisits,
  getLastVisitDetailsByPChartID,
};
