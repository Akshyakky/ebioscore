import { CommonApiService } from "../../CommonApiService";
import { PatientRegistrationDto } from "../../../interfaces/PatientAdministration/PatientFormData";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { APIConfig } from "../../../apiConfig";
import { store } from "@/store";

const apiService = new CommonApiService({
  baseURL: APIConfig.patientAdministrationURL,
});
const getToken = () => store.getState().auth.token!;
export const savePatient = async (patientRegistrationDto: PatientRegistrationDto): Promise<OperationResult<number>> => {
  return apiService.post<OperationResult<number>>("Patient/SavePatientRegistration", patientRegistrationDto, getToken());
};
export const getPatientDetails = async (pChartID: number): Promise<OperationResult<PatientRegistrationDto>> => {
  return apiService.get<OperationResult<PatientRegistrationDto>>(`Patient/GetPatientDetails/${pChartID}`, getToken());
};
export const PatientService = {
  savePatient,
  getPatientDetails,
};
