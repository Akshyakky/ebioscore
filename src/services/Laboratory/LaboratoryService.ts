import { APIConfig } from "@/apiConfig";
import { InvestigationListDto, LCompAgeRangeDto, LComponentDto, LComponentEntryTypeDto, LInvMastDto, LTemplateGroupDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { GetLabRegistersListDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { CommonApiService } from "../CommonApiService";
import { GenericEntityService, OperationResult } from "../GenericEntityService/GenericEntityService";

export const componentEntryTypeService = createEntityService<LComponentEntryTypeDto>("LComponentEntryType", "laboratoryURL");
export const templategroupService = createEntityService<LTemplateGroupDto>("LTemplateGroup", "laboratoryURL");
export const lInvMastService = createEntityService<LInvMastDto>("LInvMast", "laboratoryURL");
export const lComponentService = createEntityService<LComponentDto>("LComponent", "laboratoryURL");
export const investigationlistService = createEntityService<InvestigationListDto>("InvestigationList", "laboratoryURL");
export const lCompAgeRangeService = createEntityService<LCompAgeRangeDto>("LCompAgeRange", "laboratoryURL");

class ExtendedLaboratoryService extends GenericEntityService<any> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.laboratoryURL }), "Laboratory");
  }
  async getLabRegisters(bchID: number): Promise<OperationResult<GetLabRegistersListDto[]>> {
    return this.apiService.get<OperationResult<GetLabRegistersListDto[]>>(`${this.baseEndpoint}/GetRegisters/${bchID}`, this.getToken());
  }
}
export const laboratoryService = new ExtendedLaboratoryService();
