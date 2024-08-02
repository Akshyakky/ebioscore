// reducers.ts
import { combineReducers } from "redux";
import userReducer from "./userReducer";
import { UserState } from "./userTypes";

export interface RootState {
  userDetails: UserState;
}

const rootReducer = combineReducers({
  userDetails: userReducer,
});

export default rootReducer;
