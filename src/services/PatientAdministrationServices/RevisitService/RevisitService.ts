import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { DateFilterType, GetPatientVisitHistory, OPVisitDto } from "@/interfaces/PatientAdministration/revisitFormData";
import { CommonApiService } from "@/services/CommonApiService";
import { store } from "@/store";

// Initialize ApiService with the base URL for the patient administration API
const apiService = new CommonApiService({
  baseURL: APIConfig.patientAdministrationURL,
});

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

export const getPatientHistoryByPChartID = async (pChartID: number): Promise<{ data: GetPatientVisitHistory[]; success: boolean }> => {
  return apiService.get<{ data: GetPatientVisitHistory[]; success: boolean }>(`Revisit/GetPatientHistoryByPChartID/${pChartID}`, getToken());
};

export const saveOPVisits = async (opVisitsData: OPVisitDto): Promise<OperationResult<OPVisitDto>> => {
  return apiService.post<OperationResult<OPVisitDto>>("Revisit/SaveVisitDetails", opVisitsData, getToken());
};

export const getLastVisitDetailsByPChartID = async (pChartID: number): Promise<OperationResult<any>> => {
  return apiService.get<OperationResult<any>>(`Revisit/GetLastVisitDetails/${pChartID}`, getToken());
};

export const getWaitingPatientDetails = async (
  attendingPhysicianID?: number,
  dateFilterType?: DateFilterType,
  startDate?: Date,
  endDate?: Date
): Promise<OperationResult<any[]>> => {
  const params: Record<string, string> = {};
  if (attendingPhysicianID !== undefined) {
    params.AttendingPhysicianID = attendingPhysicianID.toString();
  }
  params.dateFilterType = dateFilterType ?? DateFilterType.Today;
  if (startDate) {
    params.startDate = startDate.toISOString().split("T")[0] ?? "";
  }
  if (endDate) {
    params.endDate = endDate.toISOString().split("T")[0] ?? "";
  }

  return apiService.get<OperationResult<any[]>>("Revisit/GetWaitingPatientDetails", getToken(), params);
};

export const cancelVisit = async (opVID: number, modifiedBy: string): Promise<OperationResult<void>> => {
  return apiService.post<OperationResult<void>>(`Revisit/CancelVisit/${opVID}`, { modifiedBy }, getToken());
};

export const RevisitService = {
  getPatientHistoryByPChartID,
  saveOPVisits,
  getLastVisitDetailsByPChartID,
  getWaitingPatientDetails,
  cancelVisit,
};
