import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "../../apiConfig";
import { AdmissionDto } from "../../interfaces/PatientAdministration/AdmissionDto";
import { OperationResult } from "../../interfaces/Common/OperationResult";

class ExtendedAdmissionService extends GenericEntityService<AdmissionDto> {
  constructor(apiService: CommonApiService, entityName: string) {
    super(apiService, entityName);
  }

  async admitPatient(admissionData: AdmissionDto): Promise<AdmissionDto> {
    return this.apiService.post<AdmissionDto>(`${this.baseEndpoint}/Admit`, admissionData, this.getToken());
  }

  async generateAdmitCode(): Promise<OperationResult<any>> {
    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GenerateAdmitCode`, this.getToken());
  }
}

export const extendedAdmissionService = new ExtendedAdmissionService(
  new CommonApiService({
    baseURL: APIConfig.patientAdministrationURL,
  }),
  "Admission"
);
