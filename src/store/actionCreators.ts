// actionCreators.ts

import { LOGOUT } from './userTypes';

// Action creator for logout
export const logout = () => {
  return {
    type: LOGOUT
  };
};
