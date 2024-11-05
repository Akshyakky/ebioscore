import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "../../apiConfig";
import { AdmissionDto } from "../../interfaces/PatientAdministration/AdmissionDto";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { PatientRegistrationDto } from "../../interfaces/PatientAdministration/PatientFormData";

class ExtendedAdmissionService extends GenericEntityService<AdmissionDto> {
  constructor(apiService: CommonApiService, entityName: string) {
    super(apiService, entityName);
  }

  async admitPatient(admissionData: AdmissionDto): Promise<OperationResult<AdmissionDto>> {
    return this.apiService.post<OperationResult<AdmissionDto>>(`${this.baseEndpoint}/Admit`, admissionData, this.getToken());
  }

  async generateAdmitCode(): Promise<OperationResult<any>> {
    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GenerateAdmitCode`, this.getToken());
  }

  async getCurrentAdmissions(): Promise<OperationResult<AdmissionDto[]>> {
    return this.apiService.get<OperationResult<AdmissionDto[]>>(`${this.baseEndpoint}/GetCurrentAdmissions`, this.getToken());
  }

  async getPatientAdmissionStatus(pChartID: number): Promise<
    OperationResult<{
      isAdmitted: boolean;
      admissionData?: AdmissionDto;
      patientData?: PatientRegistrationDto;
    }>
  > {
    try {
      // Check current admission status
      const admissionResponse = await this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GetCurrentAdmission/${pChartID}`, this.getToken());

      if (admissionResponse.success && admissionResponse.data) {
        return {
          success: true,
          data: {
            isAdmitted: true,
            admissionData: admissionResponse.data,
          },
        };
      }

      // If not admitted, get patient details
      const patientResponse = await this.apiService.get<OperationResult<PatientRegistrationDto>>(`Patient/GetPatientDetails/${pChartID}`, this.getToken());

      if (patientResponse.success && patientResponse.data) {
        return {
          success: true,
          data: {
            isAdmitted: false,
            patientData: patientResponse.data,
          },
        };
      }

      return {
        success: false,
        errorMessage: "Patient data not found",
      };
    } catch (error) {
      console.error("Error checking patient admission status:", error);
      return {
        success: false,
        errorMessage: "Failed to check patient admission status",
      };
    }
  }
}

export const extendedAdmissionService = new ExtendedAdmissionService(
  new CommonApiService({
    baseURL: APIConfig.patientAdministrationURL,
  }),
  "Admission"
);
