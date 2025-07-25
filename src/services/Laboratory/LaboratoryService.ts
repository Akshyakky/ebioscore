import { APIConfig } from "@/apiConfig";
import { InvestigationListDto, LCompAgeRangeDto, LComponentDto, LComponentEntryTypeDto, LInvMastDto, LTemplateGroupDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { GetLabRegistersListDto, InvStatusResponseDto, SampleStatusUpdateRequestDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
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
    super(new CommonApiService({ baseURL: APIConfig.laboratoryURL }), "LaboratoryResultEntry");
  }
  async getLabRegisters(bchID: number): Promise<OperationResult<GetLabRegistersListDto[]>> {
    return this.apiService.get<OperationResult<GetLabRegistersListDto[]>>(`${this.baseEndpoint}/GetRegisters?serviceType=${bchID}`, this.getToken());
  }
  async getInvestigationsStatus(labRegId: number, serviceTypeId): Promise<OperationResult<InvStatusResponseDto[]>> {
    return this.apiService.get<OperationResult<InvStatusResponseDto[]>>(
      `${this.baseEndpoint}/GetInvestigationsStatus?serviceTypeId=${serviceTypeId}&labRegId=${labRegId}`,
      this.getToken()
    );
  }
  async updateSampleCollectionStatus(sampleStatusUpdateRequestDto: SampleStatusUpdateRequestDto[]): Promise<OperationResult<SampleStatusUpdateRequestDto[]>> {
    return this.apiService.post<OperationResult<SampleStatusUpdateRequestDto[]>>(
      `${this.baseEndpoint}/UpdateSampleCollectionStatus`,
      sampleStatusUpdateRequestDto,
      this.getToken()
    );
  }
}
export const laboratoryService = new ExtendedLaboratoryService();
