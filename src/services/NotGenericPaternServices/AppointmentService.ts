import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { CommonApiService } from "@/services/CommonApiService";
import { store } from "@/store";

const commonApiService = new CommonApiService({
  baseURL: APIConfig.frontOffice,
});

const getToken = () => store.getState().auth.token!;

export const AppointmentService = {
  fetchAppointmentsByDateAndType: async (startDate: string, endDate: string, hpID?: number, rlID?: number): Promise<OperationResult<any[]>> => {
    const url = `AppointBooking/GetAppointBookingsByDateAndType?startDate=${startDate}&endDate=${endDate}${hpID ? `&hpID=${hpID}` : rlID ? `&rlID=${rlID}` : ""}`;
    return commonApiService.get<OperationResult<any[]>>(url, getToken());
  },

  fetchAppointmentConsultants: async (): Promise<OperationResult<any[]>> => {
    const url = `AppointBooking/GetAllAppointmentConsultants`;
    return commonApiService.get<OperationResult<any[]>>(url, getToken());
  },

  fetchAllResources: async (): Promise<OperationResult<any[]>> => {
    const url = `ResourceList/GetAll`;
    return commonApiService.get<OperationResult<any[]>>(url, getToken());
  },

  saveAppointBooking: async (appointBookingDto: AppointBookingDto): Promise<OperationResult<AppointBookingDto>> => {
    const url = `AppointBooking/SaveAppointBooking`;
    return commonApiService.post<OperationResult<AppointBookingDto>>(url, appointBookingDto, getToken());
  },

  getAppointBookingById: async (abID: number): Promise<OperationResult<AppointBookingDto>> => {
    const url = `AppointBooking/GetAppointBookingById/${abID}`;
    return commonApiService.get<OperationResult<AppointBookingDto>>(url, getToken());
  },

  updateAppointBookingActiveStatus: async (abID: number, isActive: boolean): Promise<OperationResult<boolean>> => {
    const url = `AppointBooking/UpdateAppointBookingActiveStatus/${abID}`;
    return commonApiService.put<OperationResult<boolean>>(url, isActive, getToken());
  },

  updateAppointmentTimes: async (abID: number, abDate: string, abTime: string, abEndTime: string): Promise<OperationResult<AppointBookingDto>> => {
    const url = `AppointBooking/UpdateAppointmentTimes`;
    return commonApiService.put<OperationResult<AppointBookingDto>>(url, { abID, abDate, abTime, abEndTime }, getToken());
  },

  searchAppointments: async (searchTerm: string | null = null, page: number = 1, pageSize: number = 10): Promise<OperationResult<PaginatedList<AppointBookingDto>>> => {
    let url = `AppointBooking/SearchAppointments?page=${page}&pageSize=${pageSize}`;
    if (searchTerm !== null) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    return commonApiService.get<OperationResult<PaginatedList<AppointBookingDto>>>(url, getToken());
  },

  generateAppointmentSlip: async (abID: number): Promise<Blob> => {
    const url = `AppointBooking/GenerateAppointmentSlip/${abID}`;
    return commonApiService.getBlob(url, getToken());
  },
};
