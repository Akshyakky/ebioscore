import { BreakConSuspendData } from "../../interfaces/frontOffice/BreakConSuspendData";
import { BreakListData } from "../../interfaces/frontOffice/BreakListData";
import { ReasonListData } from "../../interfaces/frontOffice/ReasonListData";
import { ResourceListData } from "../../interfaces/frontOffice/ResourceListData";
import { createEntityService } from "../../utils/Common/serviceFactory";

export const breakListService = createEntityService<BreakListData>(
  "BreakList",
  "frontOffice"
);
export const reasonListService = createEntityService<ReasonListData>(
  "ReasonList",
  "frontOffice"
);
export const resourceListService = createEntityService<ResourceListData>(
  "ResourceList",
  "frontOffice"
);
export const breakConSuspendService = createEntityService<BreakConSuspendData>(
  "BreakConSuspend",
  "frontOffice"
);
