import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "../../apiConfig";
import { AdmissionDto } from "../../interfaces/PatientAdministration/AdmissionDto";

class ExtendedAdmissionService extends GenericEntityService<AdmissionDto> {
  constructor(apiService: CommonApiService, entityName: string) {
    super(apiService, entityName);
  }

  async admitPatient(admissionData: AdmissionDto): Promise<AdmissionDto> {
    return this.apiService.post<AdmissionDto>(`${this.baseEndpoint}/Admit`, admissionData, this.getToken());
  }

  async generateAdmitCode(): Promise<string> {
    return this.apiService.get<string>(`${this.baseEndpoint}/GenerateAdmitCode`, this.getToken());
  }
}

export const extendedAdmissionService = new ExtendedAdmissionService(
  new CommonApiService({
    baseURL: APIConfig.patientAdministrationURL,
  }),
  "Admission"
);
