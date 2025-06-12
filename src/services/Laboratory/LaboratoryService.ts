import { InvestigationListDto, LCompAgeRangeDto, LComponentDto, LInvMastDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { LComponentEntryTypeDto } from "@/interfaces/Laboratory/LInvMastDto";
import { LTemplateGroupDto } from "@/interfaces/Laboratory/LTemplateGroupDto";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const componentEntryTypeService = createEntityService<LComponentEntryTypeDto>("LComponentEntryType", "laboratoryURL");
export const templategroupService = createEntityService<LTemplateGroupDto>("LTemplateGroup", "laboratoryURL");
export const lInvMastService = createEntityService<LInvMastDto>("LInvMast", "laboratoryURL");
export const lComponentService = createEntityService<LComponentDto>("LComponent", "laboratoryURL");
export const investigationlistService = createEntityService<InvestigationListDto>("InvestigationList", "laboratoryURL");
export const lCompAgeRangeService = createEntityService<LCompAgeRangeDto>("LCompAgeRange", "laboratoryURL");
