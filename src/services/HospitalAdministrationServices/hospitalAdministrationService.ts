import { AppModifiedMast, AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { DeptUnitListDto } from "@/interfaces/HospitalAdministration/DeptUnitListDto";
import { DeptUnitAllocationDto } from "@/interfaces/HospitalAdministration/DeptUnitAllocationDto";
import { InsuranceListDto } from "@/interfaces/HospitalAdministration/InsuranceListDto";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { WardCategoryDto } from "@/interfaces/HospitalAdministration/WardCategoryDto";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const roomGroupService = createEntityService<RoomGroupDto>("RoomGroup", "hospitalAdministrations");
export const roomListService = createEntityService<RoomListDto>("RoomList", "hospitalAdministrations");
export const wrBedService = createEntityService<WrBedDto>("WrBed", "hospitalAdministrations");
export const wardCategoryService = createEntityService<WardCategoryDto>("WardCategory", "hospitalAdministrations");
export const insuranceListService = createEntityService<InsuranceListDto>("InsuranceList", "hospitalAdministrations");
export const appModifiedListService = createEntityService<AppModifyFieldDto>("AppModifiedList", "hospitalAdministrations");
export const appModifiedMastService = createEntityService<AppModifiedMast>("AppModifiedMast", "hospitalAdministrations");
export const deptUnitListService = createEntityService<DeptUnitListDto>("DeptUnitList", "hospitalAdministrations");
export const deptUnitAllocationService = createEntityService<DeptUnitAllocationDto>("DeptUnitAllocation", "hospitalAdministrations");
