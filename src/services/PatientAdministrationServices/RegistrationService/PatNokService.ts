import { CommonApiService } from "../../CommonApiService";
import { PatNokDetailsDto } from "../../../interfaces/PatientAdministration/PatNokDetailsDto";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { APIConfig } from "../../../apiConfig";
import { store } from "@/store";

const apiService = new CommonApiService({
  baseURL: APIConfig.patientAdministrationURL,
});

const getToken = () => store.getState().auth.token!;
export const getNokDetailsByPChartID = async (pChartID: number): Promise<OperationResult<PatNokDetailsDto[]>> => {
  return apiService.get<OperationResult<PatNokDetailsDto[]>>(`PatNok/GetNokDetailsByPChartID/${pChartID}`, getToken());
};
export const saveNokDetails = async (patNokDetailsDto: PatNokDetailsDto): Promise<OperationResult<PatNokDetailsDto>> => {
  return apiService.post<OperationResult<PatNokDetailsDto>>("PatNok/SaveNokDetails", patNokDetailsDto, getToken());
};
export const PatNokService = {
  getNokDetailsByPChartID,
  saveNokDetails,
};
