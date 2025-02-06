import { investigationDto, LComponentDto, LComponentEntryTypeDto, LInvMastDto } from "@/interfaces/Laboratory/LInvMastDto";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const investigationlistService = createEntityService<investigationDto>("InvestigationList", "laboratoryURL");
export const componentEntryTypeService = createEntityService<LComponentEntryTypeDto>("LComponentEntryType", "laboratoryURL");
