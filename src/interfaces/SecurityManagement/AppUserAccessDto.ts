import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface AppUserAccessDto extends BaseDto {
  auAccessID: number;
  appID: number;
  appUName: string;
  aOprID: number;
  allowYN: string;
  profileID: number;
}
