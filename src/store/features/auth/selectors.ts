// src/store/features/auth/selectors.ts

import { RootState } from "@/store";

export const selectUser = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.token);
export const selectUserCompanyInfo = (state: RootState) => ({
  compID: state.auth.compID,
  compName: state.auth.compName,
  compCode: state.auth.compCode,
});
