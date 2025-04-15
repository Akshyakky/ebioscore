import { RecordFields } from "../Common/RecordFields";
export interface OTProcedureListDto extends RecordFields {
  procedureID: number;
  procedureName: string;
  procedureNameLong?: string;
  procedureCode: string;
  chargeID: number;
  procType?: string;
}
