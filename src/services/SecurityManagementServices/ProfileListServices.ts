import { store } from "@/store";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "@/apiConfig";
import { ProfileDetailDto, ProfileListSearchResult, ProfileMastDto, ReportPermission } from "@/interfaces/SecurityManagement/ProfileListData";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { ModuleOperation } from "@/pages/securityManagement/CommonPage/OperationPermissionDetails";

const apiService = new CommonApiService({
  baseURL: APIConfig.securityManagementURL,
});
const getToken = () => store.getState().auth.token!;

export const saveOrUpdateProfile = async (profileMastDto: ProfileMastDto): Promise<OperationResult<ProfileMastDto>> => {
  return apiService.post<OperationResult<ProfileMastDto>>("Profile/SaveOrUpdateProfile", profileMastDto, getToken());
};

export const saveOrUpdateProfileDetail = async (profileDetailDto: ProfileDetailDto): Promise<OperationResult<ProfileDetailDto>> => {
  return apiService.post<OperationResult<ProfileDetailDto>>("Profile/SaveOrUpdateProfileDetail", profileDetailDto, getToken());
};

export const getAllProfileDetails = async (): Promise<OperationResult<ProfileListSearchResult[]>> => {
  return apiService.get<OperationResult<ProfileListSearchResult[]>>("Profile/GetAllProfileDetails", getToken());
};

export const getProfileModuleOperations = async (subID: number, compID: number, profileID: number): Promise<OperationResult<ModuleOperation[]>> => {
  return apiService.get<OperationResult<ModuleOperation[]>>("SecurityManagement/GetProfileModuleOperations", getToken(), { subID, compID, profileID });
};

export const getProfileReportOperations = async (subID: number, compID: number, profileID: number): Promise<OperationResult<ReportPermission[]>> => {
  return apiService.get<OperationResult<ReportPermission[]>>("SecurityManagement/GetProfileReportOperations", getToken(), { subID, compID, profileID });
};

export const updateProfileActiveStatus = async (profileID: number, rActiveYN: boolean): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(`Profile/UpdateProfileActiveStatus/${profileID}`, rActiveYN, getToken());
};

export const ProfileService = {
  saveOrUpdateProfile,
  saveOrUpdateProfileDetail,
  getAllProfileDetails,
  getProfileModuleOperations,
  getProfileReportOperations,
  updateProfileActiveStatus,
};
