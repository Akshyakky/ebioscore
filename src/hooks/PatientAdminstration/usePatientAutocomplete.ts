// hooks/usePatientAutocomplete.ts

import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { formatDate } from "@/utils/Common/dateUtils";

export const usePatientAutocomplete = () => {
  const fetchPatientSuggestions = async (input: string): Promise<string[]> => {
    if (!input.trim()) {
      return [];
    }

    try {
      const results = await RegistrationService.searchPatients(input);
      return results.data.map((result) => `${result.pChartCode} | ${result.pfName} ${result.plName} | ${formatDate(result.pDob)} | ${result.pAddPhone1}`);
    } catch (error) {
      return [];
    }
  };

  return {
    fetchPatientSuggestions,
  };
};
