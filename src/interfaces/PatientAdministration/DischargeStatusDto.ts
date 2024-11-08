import { RecordFields } from "../Common/RecordFields";

export interface DischargeStatusDto extends RecordFields {
  dsID: number;
  dsCode: string;
  dsName: string;
  modifyYN: string;
  defaultYN: string;
}
