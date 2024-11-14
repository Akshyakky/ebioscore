// src/store/features/admissionSearch/types.ts
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";

export interface AdmissionSearchState {
  admissions: AdmissionDto[];
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  selectedAdmission: AdmissionDto | null;
}
