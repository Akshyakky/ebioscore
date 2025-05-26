import { AppModifiedMast, AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { DeptUnitListDto } from "@/interfaces/HospitalAdministration/DeptUnitListDto";
import { InsuranceListDto } from "@/interfaces/HospitalAdministration/InsuranceListDto";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { WardCategoryDto } from "@/interfaces/HospitalAdministration/WardCategoryDto";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { useMemo } from "react";

export const roomGroupService = useMemo(() => createEntityService<RoomGroupDto>("RoomGroup", "hospitalAdministrations"), []);
export const roomListService = useMemo(() => createEntityService<RoomListDto>("RoomList", "hospitalAdministrations"), []);
export const wrBedService = useMemo(() => createEntityService<WrBedDto>("WrBed", "hospitalAdministrations"), []);
export const wardCategoryService = useMemo(() => createEntityService<WardCategoryDto>("WardCategory", "hospitalAdministrations"), []);
export const insuranceListService = useMemo(() => createEntityService<InsuranceListDto>("InsuranceList", "hospitalAdministrations"), []);
export const appModifiedListService = useMemo(() => createEntityService<AppModifyFieldDto>("AppModifiedList", "hospitalAdministrations"), []);
export const appModifiedMastService = useMemo(() => createEntityService<AppModifiedMast>("AppModifiedMast", "hospitalAdministrations"), []);
export const deptUnitListService = useMemo(() => createEntityService<DeptUnitListDto>("DeptUnitList", "hospitalAdministrations"), []);
