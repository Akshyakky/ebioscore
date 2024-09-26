import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "../../apiConfig";
import { createEntityService } from "../../utils/Common/serviceFactory";
import { AdmissionDto } from "../../interfaces/PatientAdministration/AdmissionDto";

export const admissionService = createEntityService<AdmissionDto>(
  "Admission",
  "patientAdministrationURL"
);

class ExtendedAdmissionService extends GenericEntityService<AdmissionDto> {
  async admit(admissionData: AdmissionDto): Promise<AdmissionDto> {
    return this.apiService.post<AdmissionDto>(
      `${this.baseEndpoint}/Admit`,
      admissionData,
      this.getToken()
    );
  }
}

export const extendedAdmissionService = new ExtendedAdmissionService(
  new CommonApiService({
    baseURL: APIConfig.patientAdministrationURL,
  }),
  "Admission"
);
