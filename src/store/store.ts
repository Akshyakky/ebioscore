// store.ts
import { createStore, combineReducers } from 'redux';
import userDetailsReducer from './userReducer';
import { UserState } from './userTypes';

const rootReducer = combineReducers({
  userDetails: userDetailsReducer,
});

export type RootState = {
  userDetails: UserState;
};

const store = createStore(rootReducer);

export default store;
