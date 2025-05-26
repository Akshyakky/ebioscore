import { BreakConSuspendData } from "@/interfaces/FrontOffice/BreakConSuspendData";
import { BreakConDetailData } from "@/interfaces/FrontOffice/BreakListData";
import { ReasonListData } from "@/interfaces/FrontOffice/ReasonListData";
import { ResourceListData } from "@/interfaces/FrontOffice/ResourceListData";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { useMemo } from "react";

export const reasonListService = useMemo(() => createEntityService<ReasonListData>("ReasonList", "frontOffice"), []);
export const resourceListService = useMemo(() => createEntityService<ResourceListData>("ResourceList", "frontOffice"), []);
export const breakConSuspendService = useMemo(() => createEntityService<BreakConSuspendData>("BreakConSuspend", "frontOffice"), []);
export const breakConDetailsService = useMemo(() => createEntityService<BreakConDetailData>("BreakConDetail", "frontOffice"), []);
