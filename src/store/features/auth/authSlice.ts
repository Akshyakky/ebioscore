// src/store/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserState } from "./types";

const initialState: UserState = {
  userID: null,
  token: null,
  adminYN: null,
  userName: null,
  compID: null,
  compName: null,
  compCode: null,
  tokenExpiry: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserDetails: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    logout: () => initialState,
  },
});

export const { setUserDetails, logout } = authSlice.actions;
export default authSlice.reducer;
