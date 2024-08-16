import { get } from "../../apiService";
import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { AppointmentBookingDTO } from "../../../interfaces/FrontOffice/AppointmentBookingDTO";

export const fetchAppointmentsByDate = async (
  startDate: string,
  endDate: string
): Promise<OperationResult<AppointmentBookingDTO[]>> => {
  const url = `AppointBooking/GetAppointBookingsByDate?startDate=${startDate}&endDate=${endDate}`;
  return get<AppointmentBookingDTO[]>(url, APIConfig.frontOffice);
};

export const AppointmentService = {
  fetchAppointmentsByDate,
};
