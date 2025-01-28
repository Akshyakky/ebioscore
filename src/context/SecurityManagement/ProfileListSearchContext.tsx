import { ProfileListSearchResult } from "@/interfaces/SecurityManagement/ProfileListData";
import React, { createContext, useCallback } from "react";
import { useLoading } from "../LoadingContext";
import { ProfileService } from "@/services/SecurityManagementServices/ProfileListServices";
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
      const profilesResult = await ProfileService.getAllProfileDetails();
      if (profilesResult.success && profilesResult.data) {
        return profilesResult.data;
      } else {
        notifyError(profilesResult.errorMessage || "Failed to fetch profiles. Please try again.");
        return [];
      }
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
