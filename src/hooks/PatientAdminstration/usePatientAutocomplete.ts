// hooks/usePatientAutocomplete.ts
import { formatDate } from "../../utils/Common/dateUtils";
import { RegistrationService } from "../../services/PatientAdministrationServices/RegistrationService/RegistrationService";

export const usePatientAutocomplete = () => {
  debugger;
  const fetchPatientSuggestions = async (input: string): Promise<string[]> => {
    if (!input.trim()) {
      return [];
    }

    try {
      const results = await RegistrationService.searchPatients(
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
      return [];
    }
  };

  return {
    fetchPatientSuggestions,
  };
};
