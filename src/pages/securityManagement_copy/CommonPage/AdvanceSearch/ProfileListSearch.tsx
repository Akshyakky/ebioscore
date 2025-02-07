import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { ProfileListSearchContext } from "@/context/SecurityManagement/ProfileListSearchContext";
import { ProfileListSearchResult } from "@/interfaces/SecurityManagement/ProfileListData";
import React, { useCallback, useContext, useState } from "react";

interface ProfileListSearchProps {
  open: boolean;
  onClose: () => void;
  onEditProfile: (profile: ProfileListSearchResult) => void;
}

const ProfileListSearch: React.FC<ProfileListSearchProps> = ({ open, onClose, onEditProfile }) => {
  const { fetchAllProfiles } = useContext(ProfileListSearchContext);
  const [profiles, setProfiles] = useState<ProfileListSearchResult[]>([]);

  const fetchItems = useCallback(async () => {
    const fetchedProfiles = await fetchAllProfiles();
    setProfiles(fetchedProfiles);
    return fetchedProfiles;
  }, [fetchAllProfiles]);

  const updateActiveStatus = async (id: number, status: boolean) => {
    // const result = await ProfileService.updateProfileActiveStatus(id, status);
    // if (result.success) {
    //   await fetchItems();
    // }
    // return result.success;
  };

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "profileCode", header: "Profile Code", visible: true },
    { key: "profileName", header: "Profile Name", visible: true },
    { key: "rNotes", header: "Notes", visible: true },
  ];

  return <></>;
};

export default ProfileListSearch;
