import { BreakConDetailDto, BreakConSuspendDto, BreakListData, BreakListDto } from "@/interfaces/FrontOffice/BreakListDto";
import { ReasonListDto } from "@/interfaces/FrontOffice/ReasonListDto";
import { ResourceListDto } from "@/interfaces/FrontOffice/ResourceListDto";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const reasonListService = createEntityService<ReasonListDto>("ReasonList", "frontOffice");
export const resourceListService = createEntityService<ResourceListDto>("ResourceList", "frontOffice");
export const breakConSuspendService = createEntityService<BreakConSuspendDto>("BreakConSuspend", "frontOffice");
export const breakConDetailsService = createEntityService<BreakConDetailDto>("BreakConDetail", "frontOffice");
export const breakListService = createEntityService<BreakListData>("BreakList", "frontOffice");
export const breakService = createEntityService<BreakListDto>("Break", "frontOffice");
