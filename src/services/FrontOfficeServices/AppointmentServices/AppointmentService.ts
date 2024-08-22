import { get } from "../../apiService";
import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { AppointmentBookingDTO } from "../../../interfaces/FrontOffice/AppointmentBookingDTO";
import axios from "axios";
import { handleError } from "../../CommonServices/HandlerError";
import { store } from "../../../store/store";

export const fetchAppointmentsByDate = async (
  startDate: string,
  endDate: string
): Promise<OperationResult<AppointmentBookingDTO[]>> => {
  const url = `AppointBooking/GetAppointBookingsByDate?startDate=${startDate}&endDate=${endDate}`;
  return get<AppointmentBookingDTO[]>(url, APIConfig.frontOffice);
};

export const fetchAppointmentConsultants = async (): Promise<
  OperationResult<any[]>
> => {
  try {
    const token = store.getState().userDetails.token;
    const url = `${APIConfig.frontOffice}AppointBooking/GetAllAppointmentConsultants`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get<OperationResult<any[]>>(url, { headers });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const fetchAllResources = async (): Promise<OperationResult<any[]>> => {
  try {
    const token = store.getState().userDetails.token;
    const url = `${APIConfig.frontOffice}ResourceList/GetAllResourceLists`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get<OperationResult<any[]>>(url, { headers });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const AppointmentService = {
  fetchAppointmentsByDate,
};
