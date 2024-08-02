// userTypes.ts
export interface UserState {
  userID: number | null;
  token: string | null;
  adminYN: string | null;
  userName: string | null;
  compID: number | null;
  compName: string | null;
  compCode: string | null;
  tokenExpiry: number | null; // UNIX timestamp in milliseconds
}

export const SET_USER_DETAILS = "SET_USER_DETAILS";
export const LOGOUT = "LOGOUT";

export interface SetUserDetailsAction {
  type: typeof SET_USER_DETAILS;
  payload: UserState;
}

export interface LogoutAction {
  type: typeof LOGOUT;
}

export type UserDetailsAction = SetUserDetailsAction | LogoutAction;
