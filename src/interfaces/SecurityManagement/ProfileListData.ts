export interface ProfileMastDto {
  profileID: number;
  profileCode: string;
  profileName: string;
  rActiveYN: string;
  compID: number;
  rNotes: string;
}

export interface ProfileDetailDto {
  profDetID: number;
  profileID: number;
  profileName: string;
  aOPRID: number;
  rActiveYN: string;
  compID: number;
  rNotes: string;
  reportYN: string;
}

export interface ProfileListSearchResult {
  profileID: number;
  profileCode: string;
  profileName: string;
  status: string;
  rNotes: string;
}
