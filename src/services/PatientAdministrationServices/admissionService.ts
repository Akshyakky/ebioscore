import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { BaseDto, GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import { AdmissionHistoryDto } from "@/interfaces/PatientAdministration/AdmissionHistoryDto";
import { CommonApiService } from "../CommonApiService";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { APIConfig } from "@/apiConfig";

export enum AdmissionStatus {
  ADMITTED = "ADMITTED",
  DISCHARGED = "DISCHARGED",
  TRANSFERRED = "TRANSFERRED",
  EXPIRED = "EXPIRED",
}

interface PatientAdmissionStatusResponse extends BaseDto {
  isAdmitted: boolean;
  admissionData?: AdmissionDto;
  patientData?: PatientRegistrationDto;
  admissionHistory: AdmissionHistoryDto[];
}

class ExtendedAdmissionService extends GenericEntityService<AdmissionDto> {
  private readonly defaultStatusResponse: PatientAdmissionStatusResponse = {
    isAdmitted: false,
    admissionHistory: [],
  };

  constructor(apiService: CommonApiService, entityName: string) {
    super(apiService, entityName);
  }

  async admitPatient(admissionData: AdmissionDto): Promise<OperationResult<AdmissionDto>> {
    return this.apiService.post<OperationResult<AdmissionDto>>(`${this.baseEndpoint}/Admit`, admissionData, this.getToken());
  }

  async generateAdmitCode(): Promise<OperationResult<string>> {
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GenerateAdmitCode`, this.getToken());
  }

  async getCurrentAdmissions(): Promise<OperationResult<AdmissionDto[]>> {
    const response = await this.apiService.get<OperationResult<AdmissionDto[]>>(`${this.baseEndpoint}/GetCurrentAdmissions`, this.getToken());

    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async getAdmissionHistory(admitId: number): Promise<OperationResult<AdmissionHistoryDto[]>> {
    const response = await this.apiService.get<OperationResult<AdmissionHistoryDto[]>>(`${this.baseEndpoint}/AdmissionHistory/${admitId}`, this.getToken());

    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async getPatientAdmissionStatus(pChartID: number): Promise<OperationResult<PatientAdmissionStatusResponse>> {
    try {
      // Check current admission status
      const admissionResponse = await this.apiService.get<OperationResult<AdmissionDto>>(`${this.baseEndpoint}/GetCurrentAdmission/${pChartID}`, this.getToken());

      if (admissionResponse.success && admissionResponse.data) {
        // Get admission history if patient is currently admitted
        const historyResponse = await this.getAdmissionHistory(admissionResponse.data.ipAdmissionDto.admitID);

        return {
          success: true,
          data: {
            ...this.defaultStatusResponse,
            isAdmitted: true,
            admissionData: admissionResponse.data,
            admissionHistory: historyResponse.data ?? [],
          },
        };
      }

      // If not admitted, get patient details
      const patientResponse = await this.apiService.get<OperationResult<PatientRegistrationDto>>(`Patient/GetPatientDetails/${pChartID}`, this.getToken());

      if (patientResponse.success && patientResponse.data) {
        return {
          success: true,
          data: {
            ...this.defaultStatusResponse,
            patientData: patientResponse.data,
          },
        };
      }

      return {
        success: false,
        errorMessage: "Patient data not found",
        data: this.defaultStatusResponse,
      };
    } catch (error) {
      console.error("Error checking patient admission status:", error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to check patient admission status",
        data: this.defaultStatusResponse,
      };
    }
  }

  formatAdmissionHistoryForDisplay(history: AdmissionHistoryDto[]): AdmissionHistoryDto[] {
    const safeHistory = history ?? [];

    return safeHistory.map((record) => ({
      ...record,
      admitDate: new Date(record.admitDate),
      dischargeDate: record.dischargeDate ? new Date(record.dischargeDate) : undefined,
      attendingPhysicianName: this.formatPhysicianName(record.attendingPhysicianName, record.speciality),
      wardName: this.formatLocation(record.wardName, record.roomName),
      status: this.formatAdmissionStatus(record.status as AdmissionStatus),
    }));
  }

  private formatPhysicianName(name: string, speciality: string): string {
    return `${name} (${speciality})`;
  }

  private formatLocation(ward: string, room: string): string {
    return `${ward} - ${room}`;
  }

  private formatAdmissionStatus(status: AdmissionStatus): string {
    const statusMap: Record<AdmissionStatus, string> = {
      [AdmissionStatus.ADMITTED]: "Currently Admitted",
      [AdmissionStatus.DISCHARGED]: "Discharged",
      [AdmissionStatus.TRANSFERRED]: "Transferred",
      [AdmissionStatus.EXPIRED]: "Expired",
    };
    return statusMap[status] ?? status;
  }
}

export const extendedAdmissionService = new ExtendedAdmissionService(
  new CommonApiService({
    baseURL: APIConfig.patientAdministrationURL,
  }),
  "Admission"
);
