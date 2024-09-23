import React from "react";
import { ProfileMastDto } from "../../../../interfaces/SecurityManagement/ProfileListData";
import { profileMastService } from "../../../../services/GenericEntityService/GenericEntityService";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";

interface ProfileListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (profileMastDto: ProfileMastDto) => void;
}

const ProfileListSearch: React.FC<ProfileListSearchProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const fetchItems = async () => {
    try {
      const items = await profileMastService.getAll();
      return items.data || [];
    } catch (error) {
      return [];
    }
  };
  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      return await profileMastService.updateActiveStatus(id, status);
    } catch (error) {
      console.error("Error updating Profle List active status:", error);
      return false;
    }
  };
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
