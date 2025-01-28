// src/store/features/admissionSearch/admissionSelectors.ts
import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectAdmissionSearchState = (state: RootState) => state.admissionSearch;

export const selectAllAdmissions = createSelector([selectAdmissionSearchState], (state) => state.admissions);

export const selectSearchTerm = createSelector([selectAdmissionSearchState], (state) => state.searchTerm);

export const selectIsLoading = createSelector([selectAdmissionSearchState], (state) => state.isLoading);

export const selectError = createSelector([selectAdmissionSearchState], (state) => state.error);

export const selectFilteredAdmissions = createSelector([selectAllAdmissions, selectSearchTerm], (admissions, searchTerm) => {
  if (!searchTerm.trim()) return admissions;

  const searchLower = searchTerm.toLowerCase().trim();
  return admissions.filter((admission) => {
    const ipAdmission = admission.ipAdmissionDto;
    const bedDetails = admission.wrBedDetailsDto;

    const searchFields = [
      ipAdmission?.admitCode,
      ipAdmission?.pChartCode,
      ipAdmission?.pfName,
      ipAdmission?.plName,
      ipAdmission?.pTitle,
      ipAdmission?.deptName,
      bedDetails?.rGrpName,
      bedDetails?.bedName,
    ];

    return searchFields.some((field) => field?.toLowerCase().includes(searchLower));
  });
});
