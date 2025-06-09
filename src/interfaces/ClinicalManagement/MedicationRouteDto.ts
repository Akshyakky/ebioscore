import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface MedicationRouteDto extends BaseDto {
  mRouteID: number;
  mRouteName: string;
  mRouteCode?: string;
  mRSnomedCode?: string;
  defaultYN: string;
  modifyYN: string;
}
