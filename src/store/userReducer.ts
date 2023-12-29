// userReducer.ts
import { UserState, SET_USER_DETAILS, LOGOUT } from "./userTypes";
import { AnyAction } from "redux";

const initialState: UserState = {
  userID: null,
  token: null,
  adminYN: null,
  userName: null,
  compID: null,
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
        compID: action.payload.compID,
      };
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export default userReducer;
