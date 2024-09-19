import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface ProductGroupDto extends BaseDto {
  pgGrpCode: string;
  pgGrpName: string;
  // Add other specific properties
}
