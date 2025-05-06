export interface ContactMastData {
  conID: number;
  conCode: string;
  conTitle: string;
  conFName: string;
  conLName?: string;
  conMName?: string;
  conDob: Date;
  conGender?: string;
  conSSNID?: string;
  conBldGrp?: string;
  conCat: string;
  conEmpYN: string;
  rActiveYN: string;
  rNotes?: string;
  conEmpStatus?: string;
  consValue: string;
  allergicToAllergence?: string;
  allergicToMedicine?: string;
  aPHYRMID: number;
  aPhyRoomName?: string;
  deptID: number;
  deptName?: string;
  designation?: string;
  emergenContactName?: string;
  iPP: number;
  oPP: number;
  isAuthorizedUserYN?: string;
  isContractYN?: string;
  isSuperSpecialtyYN?: string;
  isEmployeeYN?: string;
  isRefferalYN?: string;
  isAppointmentYN?: string;
  isUserRequiredYN?: string;
  maritalStatus?: string;
  tINNo?: string;
  accCode?: string;
  accPayCode?: string;
  gESYCode?: string;
  digSignPath?: string;
  stampPath?: string;
  payPolicy: number;
  transferYN?: string;
}

export interface ContactAddressData {
  cAddID: number;
  conID: number;
  conCode: string;
  cAddType?: string;
  cAddMail?: string;
  cAddPostCode?: string;
  cAddPSSID?: string;
  rNotes: string;
  rActiveYN: string;
  cAddCity?: string;
  cAddCountry?: string;
  cAddEmail?: string;
  cAddPhone1?: string;
  cAddPhone2?: string;
  cAddPhone3?: string;
  cAddState?: string;
  cAddStreet1?: string;
  cAddStreet?: string;
  transferYN: string;
}
export interface ContactDetailsData {
  cdID: number;
  conID: number;
  facID: number;
  facName: string;
  conType: string;
  rNotes: string;
  rActiveYN: string;
  transferYN: string;
}

export interface ContactListData {
  contactMastDto: ContactMastData;
  contactAddressDto: ContactAddressData;
  contactDetailsDto: ContactDetailsData[];
}

export interface ContactListSearchResult {
  conID: number;
  conCode: string;
  conName: string;
  conCat: string;
  deptName: string;
  conEmpYN: string;
  refferalYN: string;
  rActiveYN: string;
}
