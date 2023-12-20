// userTypes.ts

// State Type
export interface UserState {
  userID: number | null;
  token: string | null;
  adminYN: string | null;
  userName: string | null;
  compID:number|null;
}

// Action Types
export const SET_USER_DETAILS = "SET_USER_DETAILS";
export const LOGOUT = "LOGOUT";

export interface SetUserDetailsAction {
  type: typeof SET_USER_DETAILS;
  payload: UserState; // payload is of type UserState
}
// Define the Logout action interface
export interface LogoutAction {
  type: typeof LOGOUT;
}

export type UserDetailsAction = SetUserDetailsAction | LogoutAction;
