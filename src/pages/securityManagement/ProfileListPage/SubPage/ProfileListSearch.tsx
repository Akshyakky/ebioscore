import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";

import React, { useCallback } from "react";

interface ProfileListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (profileMastDto: ProfileMastDto) => void;
  profileMastService: ReturnType<typeof createEntityService<ProfileMastDto>>;
}

const ProfileListSearch: React.FC<ProfileListSearchProps> = ({ open, onClose, onSelect, profileMastService }) => {
  const fetchItems = useCallback(async () => {
    try {
      const result = await profileMastService.getAll();
      return result.success ? result.data ?? [] : [];
    } catch (error) {
      console.error("Error fetching Profile:", error);
      showAlert("Error", "Failed to Profile.", "error");
      return [];
    }
  }, [profileMastService]);

  const updateActiveStatus = useCallback(
    async (id: number, status: boolean) => {
      try {
        const result = await profileMastService.updateActiveStatus(id, status);
        if (result) {
          showAlert("Success", "Status updated successfully.", "success");
        }
        return result.success;
      } catch (error) {
        console.error("Error updating Profile active status:", error);
        showAlert("Error", "Failed to update status.", "error");
        return false;
      }
    },
    [profileMastService]
  );
  const getItemId = (item: ProfileMastDto) => item.profileID;
  const getItemActiveStatus = (item: ProfileMastDto) => item.rActiveYN === "Y";
  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "profileCode", header: "Profile Code", visible: true },
    { key: "profileName", header: "Profile Name", visible: true },
  ];
  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="PROFILE LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter profile code or name"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default ProfileListSearch;
