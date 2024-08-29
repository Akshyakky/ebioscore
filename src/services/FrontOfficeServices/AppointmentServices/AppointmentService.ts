import { CommonApiService } from "../../CommonApiService";
import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { store } from "../../../store/store";

const commonApiService = new CommonApiService({
  baseURL: APIConfig.frontOffice,
});

const getToken = () => store.getState().userDetails.token!;

export const fetchAppointmentsByDateAndType = async (
  startDate: string,
  endDate: string,
  hpID?: number,
  rlID?: number
): Promise<OperationResult<any[]>> => {
  const url = `AppointBooking/GetAppointBookingsByDateAndType?startDate=${startDate}&endDate=${endDate}${
    hpID ? `&hpID=${hpID}` : rlID ? `&rlID=${rlID}` : ""
  }`;
  return commonApiService.get<OperationResult<any[]>>(url, getToken());
};

export const fetchAppointmentConsultants = async (): Promise<
  OperationResult<any[]>
> => {
  const url = `AppointBooking/GetAllAppointmentConsultants`;
  return commonApiService.get<OperationResult<any[]>>(url, getToken());
};

export const fetchAllResources = async (): Promise<OperationResult<any[]>> => {
  const url = `ResourceList/GetAllResourceLists`;
  return commonApiService.get<OperationResult<any[]>>(url, getToken());
};

export const AppointmentService = {
  fetchAppointmentsByDateAndType,
  fetchAppointmentConsultants,
  fetchAllResources,
};
