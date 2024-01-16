// hooks/usePatientAutocomplete.ts
import { formatDate } from "../utils/Common/dateUtils";
import { RegistrationService } from "../services/RegistrationService/RegistrationService";

export const usePatientAutocomplete = (token: any) => {
  // No need for useState here if suggestions are not stored in the hook

  const fetchPatientSuggestions = async (input: string): Promise<string[]> => {
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
      return []; // Return an empty array in case of an error
    }
  };

  return {
    fetchPatientSuggestions,
  };
};
