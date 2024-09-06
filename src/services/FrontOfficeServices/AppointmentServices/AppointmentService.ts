import { CommonApiService } from "../../CommonApiService";
import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { store } from "../../../store/store";
import { AppointBookingDto } from "../../../interfaces/FrontOffice/AppointBookingDto";

const commonApiService = new CommonApiService({
  baseURL: APIConfig.frontOffice,
});

const getToken = () => store.getState().userDetails.token!;

export const AppointmentService = {
  fetchAppointmentsByDateAndType: async (
    startDate: string,
    endDate: string,
    hpID?: number,
    rlID?: number
  ): Promise<OperationResult<any[]>> => {
    const url = `AppointBooking/GetAppointBookingsByDateAndType?startDate=${startDate}&endDate=${endDate}${
      hpID ? `&hpID=${hpID}` : rlID ? `&rlID=${rlID}` : ""
    }`;
    return commonApiService.get<OperationResult<any[]>>(url, getToken());
  },

  fetchAppointmentConsultants: async (): Promise<OperationResult<any[]>> => {
    const url = `AppointBooking/GetAllAppointmentConsultants`;
    return commonApiService.get<OperationResult<any[]>>(url, getToken());
  },

  fetchAllResources: async (): Promise<OperationResult<any[]>> => {
    const url = `ResourceList/GetAllResourceLists`;
    return commonApiService.get<OperationResult<any[]>>(url, getToken());
  },

  saveAppointBooking: async (
    appointBookingDto: AppointBookingDto
  ): Promise<OperationResult<AppointBookingDto>> => {
    const url = `AppointBooking/SaveAppointBooking`;
    return commonApiService.post<OperationResult<AppointBookingDto>>(
      url,
      appointBookingDto,
      getToken()
    );
  },

  getAppointBookingById: async (
    abID: number
  ): Promise<OperationResult<AppointBookingDto>> => {
    const url = `AppointBooking/GetAppointBookingById/${abID}`;
    return commonApiService.get<OperationResult<AppointBookingDto>>(
      url,
      getToken()
    );
  },

  updateAppointBookingActiveStatus: async (
    abID: number,
    isActive: boolean
  ): Promise<OperationResult<boolean>> => {
    const url = `AppointBooking/UpdateAppointBookingActiveStatus/${abID}`;
    return commonApiService.put<OperationResult<boolean>>(
      url,
      isActive,
      getToken()
    );
  },
};
