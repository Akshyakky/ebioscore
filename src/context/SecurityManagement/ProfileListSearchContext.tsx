import { ProfileListSearchResult } from "@/interfaces/SecurityManagement/ProfileListData";
import React, { createContext, useCallback } from "react";
import { useLoading } from "../LoadingContext";
import { notifyError } from "@/utils/Common/toastManager";

interface ProfileListSearchContextProps {
  fetchAllProfiles: () => Promise<ProfileListSearchResult[]>;
}

export const ProfileListSearchContext = createContext<ProfileListSearchContextProps>({
  fetchAllProfiles: async () => [],
});

interface ProfileListSearchProviderProps {
  children: React.ReactNode;
}

export const ProfileListSearchProvider = ({ children }: ProfileListSearchProviderProps) => {
  const { setLoading } = useLoading();

  const fetchAllProfiles = useCallback(async (): Promise<ProfileListSearchResult[]> => {
    setLoading(true);
    try {
      return [];
    } catch (error) {
      notifyError("An error occurred while fetching profiles.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ProfileListSearchContext.Provider
      value={{
        fetchAllProfiles,
      }}
    >
      {children}
    </ProfileListSearchContext.Provider>
  );
};
