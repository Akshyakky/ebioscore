import React, { createContext, useState, useCallback } from "react";
import { useLoading } from "./LoadingContext";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import { notifyError } from "@/utils/Common/toastManager";
import { searchPatientDetails } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";

interface PatientSearchContextProps {
  searchResults: PatientRegistrationDto[];
  performSearch: (searchTerm: string) => Promise<void>;
}

export const PatientSearchContext = createContext<PatientSearchContextProps>({
  searchResults: [],
  performSearch: async () => {},
});

interface PatientSearchProviderProps {
  children: React.ReactNode;
}

export const PatientSearchProvider: React.FC<PatientSearchProviderProps> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<PatientRegistrationDto[]>([]);
  const { setLoading } = useLoading();
  const { token } = useAppSelector((state: RootState) => state.auth);

  const performSearch = useCallback(
    async (searchTerm: string): Promise<void> => {
      if (!token) {
        notifyError("User is not authenticated.");
        return;
      }

      setLoading(true);
      try {
        const result = await searchPatientDetails(searchTerm);
        if (result.success) {
          setSearchResults(result.data || []);
        } else {
          notifyError("Search failed. Please try again.");
        }
      } catch (error: any) {
        console.error("Error performing search", error);
        notifyError("An error occurred during the search.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return <PatientSearchContext.Provider value={{ searchResults, performSearch }}>{children}</PatientSearchContext.Provider>;
};
