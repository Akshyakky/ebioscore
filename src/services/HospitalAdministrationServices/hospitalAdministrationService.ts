import {
  RoomGroupDto,
  RoomListDto,
  WrBedDto,
} from "../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import { WardCategoryDto } from "../../interfaces/HospitalAdministration/WardCategoryDto";
import { createEntityService } from "../../utils/Common/serviceFactory";

export const roomGroupService = createEntityService<RoomGroupDto>(
  "RoomGroup",
  "hospitalAdministrations"
);
export const roomListService = createEntityService<RoomListDto>(
  "RoomList",
  "hospitalAdministrations"
);
export const wrBedService = createEntityService<WrBedDto>(
  "WrBed",
  "hospitalAdministrations"
);
export const wardCategoryService = createEntityService<WardCategoryDto>(
  "WardCategory",
  "hospitalAdministrations"
);

// If you need any extended services for hospital administration, you can add them here
// For example:
// class ExtendedRoomService extends GenericEntityService<RoomListDto> {
//   async getAvailableRooms(): Promise<RoomListDto[]> {
//     return this.apiService.get<RoomListDto[]>(
//       `${this.baseEndpoint}/GetAvailableRooms`,
//       this.getToken()
//     );
//   }
// }
//
// export const extendedRoomService = new ExtendedRoomService(
//   new CommonApiService({
//     baseURL: APIConfig.hospitalAdministrations,
//   }),
//   "RoomList"
// );
