import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { RoomGroupDto } from "../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import { store } from "../../../store/store";
import { CommonApiService } from "../../CommonApiService";

const apiService = new CommonApiService({
  baseURL: APIConfig.hospitalAdministrations,
});

const getToken = () => store.getState().userDetails.token!;

export const saveRoomGroup = async (
  roomGroupDto: RoomGroupDto
): Promise<OperationResult<RoomGroupDto>> => {
  debugger;
  return apiService.post<OperationResult<RoomGroupDto>>(
    "RoomGroup/SaveRoomGroup",
    roomGroupDto,
    getToken()
  );
};

export const getAllRoomGroup = async (): Promise<
  OperationResult<RoomGroupDto[]>
> => {
  return apiService.get<OperationResult<RoomGroupDto[]>>(
    "RoomGroup/GetAllRoomGroup",
    getToken()
  );
};

export const getRoomGroupById = async (
  rGrpID: number
): Promise<OperationResult<RoomGroupDto>> => {
  return apiService.get<OperationResult<RoomGroupDto>>(
    `RoomGroup/GetRoomGroupById/${rGrpID}`,
    getToken()
  );
};

export const updateRoomGroupActiveStatus = async (
  rGrpID: number,
  rActive: boolean
): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(
    `RoomGroup/UpdateRoomGroupActiveStatus/${rGrpID}`,
    { rActive }, // Make sure the payload matches the API expectation
    getToken()
  );
};

export const RoomGroupService = {
  saveRoomGroup,
  getAllRoomGroup,
  getRoomGroupById,
  updateRoomGroupActiveStatus,
};
