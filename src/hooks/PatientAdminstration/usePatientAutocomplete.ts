// hooks/usePatientAutocomplete.ts
import { formatDate } from "../../utils/Common/dateUtils";
import { RegistrationService } from "../../services/RegistrationService/RegistrationService";
import { notifyError } from "../../utils/Common/toastManager";

export const usePatientAutocomplete = (token: any) => {
  const fetchPatientSuggestions = async (input: string): Promise<string[]> => {
    if (!input.trim()) {
      return [];
    }

    try {
      const results = await RegistrationService.searchPatients(
        token,
        "PatientAutocompleteSearch",
        input
      );
      return results.data.map(
        (result) =>
          `${result.pChartCode} | ${result.pfName} ${
            result.plName
          } | ${formatDate(result.pDob)} | ${result.pAddPhone1}`
      );
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      notifyError("Error fetching patient suggestions.");
      return []; // Return an empty array in case of an error
    }
  };

  return {
    fetchPatientSuggestions,
  };
};
