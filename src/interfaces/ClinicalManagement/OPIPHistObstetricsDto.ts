// src/interfaces/ClinicalManagement/OPIPHistPSHDto.ts

import { RecordFields } from "../Common/RecordFields";

export interface OPIPHistObstetricsDto extends RecordFields {
  opipOBID: number;
  opipNo: number;
  opvID: number;
  pChartID: number;
  opipCaseNo: number;
  patOPIP: string;
  opipDate: string;

  pOTName?: string;
  obDesc?: string;
  obDate?: string;
  foetalAgeWeek?: number;
  foetalAgeDay?: number;
  pSRoucename?: string;
  deliveryName?: string;
  bStatusName?: string;
  bGender?: string;
  bBirthWeight?: number;
  feedName?: string;
  labHours?: number;
  labourName?: string;
  paediatricianID?: number;
  paediatricianName?: string;
  aTName?: string;
  bComments?: string;
  complication?: string;
  presentCondition?: string;
}
