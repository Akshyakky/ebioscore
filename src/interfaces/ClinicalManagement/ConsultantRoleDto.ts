import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface ConsultantRoleDto extends BaseDto {
  crID: number;
  crName: string;
  rActiveYN: string;
}
