import React, { createContext, useState, useEffect } from "react";
import { useLoading } from "../LoadingContext";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { notifyError } from "../../utils/Common/toastManager";
import { ProfileListSearchResult } from "../../interfaces/SecurityManagement/ProfileListData";
import { ProfileService } from "../../services/SecurityManagementServices/ProfileListServices";

interface ProfileListSearchContextProps {
  searchResults: ProfileListSearchResult[];
  performSearch: (searchTerm: string) => Promise<void>;
  fetchAllProfiles: () => Promise<void>;
  updateProfileStatus: (profileID: number, status: string) => void;
}

export const ProfileListSearchContext =
  createContext<ProfileListSearchContextProps>({
    searchResults: [],
    performSearch: async () => {},
    fetchAllProfiles: async () => {},
    updateProfileStatus: () => {},
  });

interface ProfileListSearchProviderProps {
  children: React.ReactNode;
}

export const ProfileListSearchProvider = ({
  children,
}: ProfileListSearchProviderProps) => {
  const [allProfiles, setAllProfiles] = useState<ProfileListSearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<ProfileListSearchResult[]>(
    []
  );
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo?.token;

  const fetchAllProfiles = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const profiles = await ProfileService.getAllProfileDetails(token);
      console.log("Fetched profiles:", profiles);
      if (profiles && profiles.length > 0) {
        const mappedResults: ProfileListSearchResult[] = profiles.map(
          (profile: ProfileListSearchResult) => ({
            profileID: profile.profileID,
            profileCode: profile.profileCode,
            profileName: profile.profileName,
            status: profile.status,
            rNotes: profile.rNotes,
          })
        );
        setAllProfiles(mappedResults);
        setSearchResults(mappedResults);
      } else {
        console.error("Failed to fetch profiles: no data found");
        notifyError("Failed to fetch profiles. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching profiles", error);
      notifyError("An error occurred while fetching profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProfiles();
  }, [token]);

  const performSearch = async (searchTerm: string): Promise<void> => {
    if (searchTerm.trim() === "") {
      setSearchResults(allProfiles);
    } else {
      const filteredResults = allProfiles.filter(
        (profile) =>
          profile.profileName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          profile.profileCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredResults);
    }
  };

  const updateProfileStatus = (profileID: number, status: string) => {
    const updatedProfiles = allProfiles.map((profile) =>
      profile.profileID === profileID ? { ...profile, status } : profile
    );
    setAllProfiles(updatedProfiles);
    setSearchResults(updatedProfiles);
  };

  return (
    <ProfileListSearchContext.Provider
      value={{
        searchResults,
        performSearch,
        fetchAllProfiles,
        updateProfileStatus,
      }}
    >
      {children}
    </ProfileListSearchContext.Provider>
  );
};
