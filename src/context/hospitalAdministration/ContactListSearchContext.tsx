import { createContext, useState } from "react";
import { ContactListSearchResult } from "../../interfaces/HospitalAdministration/ContactListData";
import { useLoading } from "../LoadingContext";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { notifyError } from "../../utils/Common/toastManager";
import { ContactListService } from "../../services/HospitalAdministrationServices/ContactListService/ContactListService";

interface ContactListSearchContextProps {
  searchResults: ContactListSearchResult[];
  performSearch: (searchTerm: string) => Promise<void>;
}

export const ContactListSearchContext =
  createContext<ContactListSearchContextProps>({
    searchResults: [],
    performSearch: async () => { },
  });

interface ContextListSearchProviderProps {
  children: React.ReactNode;
}

export const ContactListSearchProvider = ({
  children,
}: ContextListSearchProviderProps) => {
  const [searchResults, setSearchResults] = useState<ContactListSearchResult[]>(
    []
  );
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const performSearch = async (searchterm: string): Promise<void> => {
    setLoading(true);
    try {
      const result = await ContactListService.searchContactListDetails(
        token,
        searchterm
      );
      if (result.success) {
        setSearchResults(result.data);
      } else {
        console.error("Search was not successful");
        notifyError("Search failed. Please try again.");
      }
    } catch (error) {
      console.error("Error performing search", error);
      notifyError("An error occurred during the search.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <ContactListSearchContext.Provider value={{ searchResults, performSearch }}>
      {children}
    </ContactListSearchContext.Provider>
  );
};
