// src/store/features/admissionSearch/admissionSearchSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import { AdmissionSearchState } from "./types";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";

const initialState: AdmissionSearchState = {
  admissions: [],
  searchTerm: "",
  isLoading: false,
  error: null,
  selectedAdmission: null,
};

export const fetchCurrentAdmissions = createAsyncThunk<AdmissionDto[], void, { rejectValue: string }>("admissionSearch/fetchCurrentAdmissions", async (_, { rejectWithValue }) => {
  try {
    const response = await extendedAdmissionService.getCurrentAdmissions();
    if (!response.success || !response.data) {
      throw new Error(response.errorMessage || "Failed to fetch admissions");
    }
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return rejectWithValue(errorMessage);
  }
});

const admissionSearchSlice = createSlice({
  name: "admissionSearch",
  initialState,
  reducers: {
    setSearchTerm(state: AdmissionSearchState, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    setSelectedAdmission(state: AdmissionSearchState, action: PayloadAction<AdmissionDto | null>) {
      state.selectedAdmission = action.payload;
    },
    clearSearch(state: AdmissionSearchState) {
      state.searchTerm = "";
    },
    resetAdmissionSearch: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentAdmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentAdmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admissions = action.payload;
      })
      .addCase(fetchCurrentAdmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unknown error occurred";
      });
  },
});

export const { setSearchTerm, setSelectedAdmission, clearSearch, resetAdmissionSearch } = admissionSearchSlice.actions;

export default admissionSearchSlice.reducer;
