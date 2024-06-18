import React, { createContext, useState } from "react";
import { PatientSearchResult } from "../interfaces/PatientAdministration/registrationFormData";
import { RegistrationService } from "../services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { useLoading } from "./LoadingContext";
import { RootState } from "../store/reducers";
import { useSelector } from "react-redux";
import { notifyError } from "../utils/Common/toastManager";

interface PatientSearchContextProps {
  searchResults: PatientSearchResult[];
  performSearch: (searchTerm: string) => Promise<void>;
}

export const PatientSearchContext = createContext<PatientSearchContextProps>({
  searchResults: [],
  performSearch: async () => {},
});

interface PatientSearchProviderProps {
  children: React.ReactNode;
}

export const PatientSearchProvider = ({
  children,
}: PatientSearchProviderProps) => {
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const performSearch = async (searchTerm: string): Promise<void> => {
    setLoading(true);
    try {
      const result = await RegistrationService.searchPatientDetails(
        token,
        searchTerm
      );
      if (result.success) {
        setSearchResults(result.data);
      } else {
        // Handle the case where success is false
        console.error("Search was not successful");
        notifyError("Search failed. Please try again.");
      }
    } catch (error) {
      console.error("Error performing search", error);
      notifyError("An error occurred during the search.");
      // Handle the error appropriately
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatientSearchContext.Provider value={{ searchResults, performSearch }}>
      {children}
    </PatientSearchContext.Provider>
  );
};
