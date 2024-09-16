import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { RoomListDto } from "../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import { store } from "../../../store/store";
import { CommonApiService } from "../../CommonApiService";

const apiService = new CommonApiService({
  baseURL: APIConfig.hospitalAdministrations,
});

const getToken = () => store.getState().userDetails.token!;

export const saveRoomList = async (
  roomListDto: RoomListDto
): Promise<OperationResult<RoomListDto>> => {
  debugger;
  return apiService.post<OperationResult<RoomListDto>>(
    "RoomList/SaveRoomList",
    roomListDto,
    getToken()
  );
};

export const getAllRoomList = async (): Promise<
  OperationResult<RoomListDto[]>
> => {
  debugger;
  return apiService.get<OperationResult<RoomListDto[]>>(
    "RoomList/GetAllRoomList",
    getToken()
  );
};

export const getRoomListById = async (
  rlID: number
): Promise<OperationResult<RoomListDto>> => {
  return apiService.get<OperationResult<RoomListDto>>(
    `RoomList/GetRoomListById/${rlID}`,
    getToken()
  );
};

export const updateRoomListActiveStatus = async (
  rlID: number,
  rActive: boolean
): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(
    `RoomList/UpdateRoomListActiveStatus/${rlID}`,
    { rActive },
    getToken()
  );
};

export const RoomListService = {
  saveRoomList,
  getAllRoomList,
  getRoomListById,
  updateRoomListActiveStatus,
};
