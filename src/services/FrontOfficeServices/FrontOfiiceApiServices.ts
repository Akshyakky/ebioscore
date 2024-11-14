import { ReasonListData } from "@/interfaces/frontOffice/ReasonListData";
import { createEntityService } from "../../utils/Common/serviceFactory";
import { ResourceListData } from "@/interfaces/frontOffice/ResourceListData";
import { BreakConSuspendData } from "@/interfaces/frontOffice/BreakConSuspendData";
import { BreakConDetailData } from "@/interfaces/frontOffice/BreakListData";

// export const breakListService = createEntityService<BreakListData>(
//   "BreakList",
//   "frontOffice"
// );
export const reasonListService = createEntityService<ReasonListData>("ReasonList", "frontOffice");
export const resourceListService = createEntityService<ResourceListData>("ResourceList", "frontOffice");
export const breakConSuspendService = createEntityService<BreakConSuspendData>("BreakConSuspend", "frontOffice");
export const breakConDetailsService = createEntityService<BreakConDetailData>("BreakConDetail", "frontOffice");
