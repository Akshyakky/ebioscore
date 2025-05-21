// src/store/features/ui/loadingSelectors.ts
import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectLoadingState = (state: RootState) => state.loading;

export const selectIsLoading = createSelector([selectLoadingState], (state) => state.isLoading);
