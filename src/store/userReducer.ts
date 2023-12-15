// userReducer.ts
import {
  UserState,
  UserDetailsAction,
  SET_USER_DETAILS,
  LOGOUT,
} from "./userTypes";
import { AnyAction } from "redux";

const initialState: UserState = {
  userID: null,
  token: null,
  adminYN: null,
  userName: null,
};

const userReducer = (
  state: UserState = initialState,
  action: AnyAction
): UserState => {
  switch (action.type) {
    case SET_USER_DETAILS:
      return {
        ...state,
        userID: action.payload.userID,
        token: action.payload.token,
        adminYN: action.payload.adminYN,
        userName: action.payload.userName,
      };
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export default userReducer;
