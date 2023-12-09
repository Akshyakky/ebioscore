// types.ts

// State Type
export interface UserState {
  userID: number | null;
  token: string | null;
}

// Action Types
export const SET_USER_DETAILS = 'SET_USER_DETAILS';

interface SetUserDetailsAction {
  type: typeof SET_USER_DETAILS;
  payload: UserState; // payload is of type UserState
}

export type UserDetailsAction = SetUserDetailsAction;
