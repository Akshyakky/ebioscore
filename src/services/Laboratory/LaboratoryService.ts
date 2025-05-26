import { investigationDto, LComponentEntryTypeDto } from "@/interfaces/Laboratory/LInvMastDto";
import { LTemplateGroupDto } from "@/interfaces/Laboratory/LTemplateGroupDto";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const investigationlistService = createEntityService<investigationDto>("InvestigationList", "laboratoryURL");
export const componentEntryTypeService = createEntityService<LComponentEntryTypeDto>("LComponentEntryType", "laboratoryURL");
export const templategroupService = createEntityService<LTemplateGroupDto>("LTemplateGroup", "laboratoryURL");
