import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface UserListDto extends BaseDto {
  appID: number;
  appUserName: string;
  appGeneralCode: string;
  conID: number;
  appUcatCode: string;
  appUcatType: string;
  adminUserYN: string;
  conCompId?: number;
  digSignPath: string;
  appCode: string;
  appUAccess?: string;
  profileID: number;
  profileName?: string;
  rActiveYN: string;
  rNotes?: string;
  transferYN?: string;
}

export interface UserListPermissionDto {
  accessDetailID: number;
  accessID: number;
  accessName: string;
  allowAccess: string;
}
