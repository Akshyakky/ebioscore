import { investigationDto, LComponentEntryTypeDto } from "@/interfaces/Laboratory/LInvMastDto";
import { LTemplateGroupDto } from "@/interfaces/Laboratory/LTemplateGroupDto";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { useMemo } from "react";

export const investigationlistService = useMemo(() => createEntityService<investigationDto>("InvestigationList", "laboratoryURL"), []);
export const componentEntryTypeService = useMemo(() => createEntityService<LComponentEntryTypeDto>("LComponentEntryType", "laboratoryURL"), []);
export const templategroupService = useMemo(() => createEntityService<LTemplateGroupDto>("LTemplateGroup", "laboratoryURL"), []);
