// src/store/features/auth/types.ts
export interface UserState {
  userID: number | null;
  token: string | null;
  adminYN: string | null;
  userName: string | null;
  compID: number;
  compName: string | null;
  compCode: string | null;
  tokenExpiry: number | null;
}
