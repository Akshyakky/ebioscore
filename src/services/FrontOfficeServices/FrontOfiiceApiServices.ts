import { BreakConDetailData, BreakConSuspendData, BreakListData, BreakListDto } from "@/interfaces/FrontOffice/BreakListData";
import { ReasonListData } from "@/interfaces/FrontOffice/ReasonListData";
import { ResourceListData } from "@/interfaces/FrontOffice/ResourceListData";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const reasonListService = createEntityService<ReasonListData>("ReasonList", "frontOffice");
export const resourceListService = createEntityService<ResourceListData>("ResourceList", "frontOffice");
export const breakConSuspendService = createEntityService<BreakConSuspendData>("BreakConSuspend", "frontOffice");
export const breakConDetailsService = createEntityService<BreakConDetailData>("BreakConDetail", "frontOffice");
export const breakListService = createEntityService<BreakListData>("BreakList", "frontOffice");
export const breakService = createEntityService<BreakListDto>("Break", "frontOffice");
