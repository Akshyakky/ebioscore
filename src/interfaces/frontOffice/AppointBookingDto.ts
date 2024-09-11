export interface AppointBookingDto {
  abID: number;
  abFName: string;
  abLName?: string;
  abMName?: string;
  hplID: number;
  providerName: string;
  rlID: number;
  rlName: string;
  arlID?: number;
  arlName?: string;
  abDuration: number;
  abDurDesc: string;
  abDate: string; // Use string for dates in TS, convert to Date when needed
  abTime: string; // Use string for times in TS, convert to Date when needed
  pChartID: number;
  pChartCode?: string;
  abPType: string;
  abStatus: string;
  appPhone1?: string;
  appPhone2?: string;
  patRegisterYN: "Y" | "N"; // Use string union for char
  oTBookNo: number;
  atID?: number;
  atName?: string;
  pNatID?: number;
  pNatName?: string;
  patOPIP: "O" | "I"; // Assuming 'O' for outpatient, 'I' for inpatient
  admitID?: number;
  wNameID?: number;
  wName?: string;
  wCatID?: number;
  wCatName?: string;
  roomID?: number;
  roomName?: string;
  bedID?: number;
  bedName?: string;
  crID?: number;
  crName?: string;
  rActiveYN: "Y" | "N";
  rCreatedID: number;
  rCreatedBy: string;
  rCreatedOn: string;
  rModifiedID: number;
  rModifiedBy: string;
  rModifiedOn: string;
  rNotes?: string;
  abEndTime: string;
  procNotes?: string;
  arlInstructions?: string;
  abTitle?: string;
  cancelReason?: string;
  city?: string;
  compID?: number;
  compCode?: string;
  compName?: string;
  dob?: string;
  email?: string;
  pChartCompID?: number;
  rSchdleID?: number;
  rschdleBy?: string;
  pssnId?: string;
  intIdPsprt?: string;
  transferYN: "Y" | "N";
  oldPChartID?: number;
  status: string; // Computed property in C#, include as regular property in TS
}
