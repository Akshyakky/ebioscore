import { RecordFields } from "../Common/RecordFields";

export interface OPIPLifestyleDto extends RecordFields {
  opipLSID: number;
  pChartID: number;
  opipNo?: number;
  opvID?: number;
  opipCaseNo?: number;
  patOpip?: string;
  dietType: string;
  smokingStatus: string;
  alcoholStatus: string;
  exerciseFrequency: string;
}
