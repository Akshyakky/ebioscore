// userDetailsReducer.ts
import { UserState, UserDetailsAction, SET_USER_DETAILS } from './userTypes';

const initialState: UserState = {
  userID: null,
  token: null,
};

const userDetailsReducer = (state: UserState = initialState, action: UserDetailsAction): UserState => {
  switch (action.type) {
    case SET_USER_DETAILS:
      return {
        ...state,
        userID: action.payload.userID,
        token: action.payload.token,
      };
    default:
      return state;
  }
};

export default userDetailsReducer;
