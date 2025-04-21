import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface MedicationListDto extends BaseDto {
  mlID: number;
  mlCode: string;
  mGrpID: number;
  mfID: number;
  mfName: string;
  medText: string;
  medText1: string | null;
  mGenID: number;
  mGenCode: string;
  mGenName: string;
  productID?: number | null;
  calcQtyYN: string;
  rActiveYN: string;
}
