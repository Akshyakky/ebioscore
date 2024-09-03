import React, { createContext, useState, useCallback } from "react";
import { PatientRegistrationDto } from "../interfaces/PatientAdministration/PatientFormData";
import { searchPatientDetails } from "../services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { useLoading } from "./LoadingContext";
import { RootState } from "../store/reducers";
import { useSelector } from "react-redux";
import { notifyError } from "../utils/Common/toastManager";

interface PatientSearchContextProps {
  searchResults: PatientRegistrationDto[];
  performSearch: (searchTerm: string) => Promise<void>;
}

export const PatientSearchContext = createContext<PatientSearchContextProps>({
  searchResults: [],
  performSearch: async () => { },
});

interface PatientSearchProviderProps {
  children: React.ReactNode;
}

export const PatientSearchProvider: React.FC<PatientSearchProviderProps> = ({
  children,
}) => {
  const [searchResults, setSearchResults] = useState<PatientRegistrationDto[]>(
    []
  );
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo?.token;

  const performSearch = useCallback(
    async (searchTerm: string): Promise<void> => {
      debugger
      if (!token) {
        notifyError("User is not authenticated.");
        return;
      }

      setLoading(true);
      try {
        debugger
        const result = await searchPatientDetails(token, searchTerm);
        console.log("Fetched result:", result); // Debug log
        if (result.success) {
          setSearchResults(result.data || []);
          console.log("Search results updated:", result.data); // Debug log
        } else {
          console.error("Search was not successful");
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

  return (
    <PatientSearchContext.Provider value={{ searchResults, performSearch }}>
      {children}
    </PatientSearchContext.Provider>
  );
};
