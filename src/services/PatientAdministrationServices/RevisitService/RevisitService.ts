import axios from "axios";
import { APIConfig } from "../../../apiConfig";
import {
  DateFilterType,
  GetPatientVisitHistory,
  revisitFormData,
} from "../../../interfaces/PatientAdministration/revisitFormData";
import { OperationResult } from "../../../interfaces/Common/OperationResult";

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
export const getWaitingPatientDetails = async (
  token: string,
  attendingPhysicianID?: number,
  dateFilterType?: DateFilterType,
  startDate?: Date,
  endDate?: Date
): Promise<OperationResult<any[]>> => {
  const url = `${APIConfig.patientAdministrationURL}Revisit/GetWaitingPatientDetails`;

  // Prepare query parameters
  const params = new URLSearchParams();
  if (attendingPhysicianID !== undefined)
    params.append("AttendingPhysicianID", attendingPhysicianID.toString());
  if (dateFilterType !== undefined)
    params.append("dateFilterType", dateFilterType);
  if (startDate !== undefined)
    params.append("startDate", startDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
  if (endDate !== undefined)
    params.append("endDate", endDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD

  const headers = { Authorization: `Bearer ${token}` };

  try {
    const response = await axios.get(`${url}?${params}`, { headers });
    return response.data; // Assuming the API returns data in the expected format
  } catch (error) {
    console.error(`Error fetching waiting patient details: ${error}`);
    throw error;
  }
};
export const cancelVisit = async (
  token: string,
  opVID: number,
  modifiedBy: string
): Promise<OperationResult<void>> => {
  try {
    const url = `${APIConfig.patientAdministrationURL}Revisit/CancelVisit/${opVID}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post(url, { modifiedBy }, { headers });

    return {
      success: response.data.Success,
      errorMessage: response.data.ErrorMessage,
      affectedRows: response.data.AffectedRows,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 400) {
        return {
          success: false,
          errorMessage: error.response.data.ErrorMessage,
        };
      }
    }
    console.error("An unexpected error occurred:", error);
    return {
      success: false,
      errorMessage: "An unexpected error occurred",
    };
  }
};
export const RevisitService = {
  getPatientHistoryByPChartID,
  saveOPVisits,
  getLastVisitDetailsByPChartID,
  getWaitingPatientDetails,
  cancelVisit,
};
