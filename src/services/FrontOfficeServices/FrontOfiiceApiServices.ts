// export const breakListService = createEntityService<BreakListData>(
//   "BreakList",
//   "frontOffice"

import { BreakConSuspendData } from "@/interfaces/FrontOffice/BreakConSuspendData";
import { BreakConDetailData } from "@/interfaces/FrontOffice/BreakListData";
import { ReasonListData } from "@/interfaces/FrontOffice/ReasonListData";
import { ResourceListData } from "@/interfaces/FrontOffice/ResourceListData";
import { createEntityService } from "@/utils/Common/serviceFactory";

// );
export const reasonListService = createEntityService<ReasonListData>("ReasonList", "frontOffice");
export const resourceListService = createEntityService<ResourceListData>("ResourceList", "frontOffice");
export const breakConSuspendService = createEntityService<BreakConSuspendData>("BreakConSuspend", "frontOffice");
export const breakConDetailsService = createEntityService<BreakConDetailData>("BreakConDetail", "frontOffice");
