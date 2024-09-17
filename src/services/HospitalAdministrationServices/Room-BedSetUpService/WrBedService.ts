import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { WrBedDto } from "../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import { store } from "../../../store/store";
import { CommonApiService } from "../../CommonApiService";

const apiService = new CommonApiService({
  baseURL: APIConfig.hospitalAdministrations,
});

const getToken = () => store.getState().userDetails.token!;

export const saveWrBed = async (
  wrBedDto: WrBedDto
): Promise<OperationResult<WrBedDto>> => {
  debugger;
  return apiService.post<OperationResult<WrBedDto>>(
    "WrBed/SaveWrBed",
    wrBedDto,
    getToken()
  );
};

export const getAllWrBeds = async (): Promise<OperationResult<WrBedDto[]>> => {
  return apiService.get<OperationResult<WrBedDto[]>>(
    "WrBed/GetAllWrBed",
    getToken()
  );
};

export const getWrBedById = async (
  bedID: number
): Promise<OperationResult<WrBedDto>> => {
  return apiService.get<OperationResult<WrBedDto>>(
    `WrBed/GetWrBedById/${bedID}`,
    getToken()
  );
};

export const updateWrBedActiveStatus = async (
  bedID: number,
  rActive: boolean
): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(
    `WrBed/UpdateWrBedActiveStatus/${bedID}`,
    { rActive },
    getToken()
  );
};

export const WrBedService = {
  saveWrBed,
  getAllWrBeds,
  getWrBedById,
  updateWrBedActiveStatus,
};
