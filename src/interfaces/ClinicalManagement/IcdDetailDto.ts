import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface IcdDetailDto extends BaseDto {
  icddId: number;
  icdmId: number;
  icddCode: string;
  icddName: string;
  icddCustYN: string;
  icddVer?: string;
  icddNameGreek?: string;
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes?: string;
}
