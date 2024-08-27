import { CommonApiService } from "../../CommonApiService";
import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { AppointmentBookingDTO } from "../../../interfaces/FrontOffice/AppointmentBookingDTO";
import { store } from "../../../store/store";

const commonApiService = new CommonApiService({
  baseURL: APIConfig.frontOffice,
});

const getToken = () => store.getState().userDetails.token!;

export const fetchAppointmentsByDate = async (
  startDate: string,
  endDate: string
): Promise<OperationResult<AppointmentBookingDTO[]>> => {
  const url = `AppointBooking/GetAppointBookingsByDate?startDate=${startDate}&endDate=${endDate}`;
  return commonApiService.get<OperationResult<AppointmentBookingDTO[]>>(
    url,
    getToken()
  );
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
  fetchAppointmentsByDate,
  fetchAppointmentConsultants,
  fetchAllResources,
};
