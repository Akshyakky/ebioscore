// src/hooks/patient/PatientAdministration/usePatientSearch.ts
import { useState, useCallback, useEffect } from "react";
import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { debounce } from "@/utils/Common/debounceUtils";
import { PatientOption } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { useLoading } from "@/hooks/Common/useLoading";

interface UsePatientSearchProps {
  debounceTimeMs?: number;
  minSearchLength?: number;
}

interface UsePatientSearchResult {
  inputValue: string;
  setInputValue: (value: string) => void;
  options: PatientOption[];
  isLoading: boolean;
  selectedPatient: PatientOption | null;
  setSelectedPatient: (patient: PatientOption | null) => void;
  clearSearch: () => void;
}

/**
 * Custom hook for patient search functionality
 * @param debounceTimeMs - Debounce time in milliseconds (default: 500)
 * @param minSearchLength - Minimum search term length before search is performed (default: 2)
 */
export const usePatientSearch = ({ debounceTimeMs = 500, minSearchLength = 2 }: UsePatientSearchProps = {}): UsePatientSearchResult => {
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<PatientOption[]>([]);
  const { isLoading, setLoading } = useLoading();
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  // Create a debounced function to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < minSearchLength) {
        setOptions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await RegistrationService.searchPatients(searchTerm);

        if (response.success && response.data) {
          const patientOptions: PatientOption[] = response.data.map((patient: any) => ({
            pChartID: patient.pChartID,
            pChartCode: patient.pChartCode,
            pfName: patient.pfName || "",
            plName: patient.plName || "",
            pAddPhone1: patient.pAddPhone1,
            pDob: patient.pDob,
            fullName: `${patient.pfName || ""} ${patient.plName || ""}`.trim(),
          }));

          setOptions(patientOptions);
        } else {
          setOptions([]);
        }
      } catch (error) {
        console.error("Error searching for patients:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, debounceTimeMs),
    [minSearchLength, debounceTimeMs]
  );

  useEffect(() => {
    debouncedSearch(inputValue);

    return () => {
      debouncedSearch.cancel();
    };
  }, [inputValue, debouncedSearch]);

  const clearSearch = useCallback(() => {
    setSelectedPatient(null);
    setInputValue("");
    setOptions([]);
  }, []);

  return {
    inputValue,
    setInputValue,
    options,
    isLoading,
    selectedPatient,
    setSelectedPatient,
    clearSearch,
  };
};
