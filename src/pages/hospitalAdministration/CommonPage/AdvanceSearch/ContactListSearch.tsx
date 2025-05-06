import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { ContactMastData } from "@/interfaces/HospitalAdministration/ContactListData";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";
import React, { useCallback, useMemo } from "react";

interface ContactListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (contactMastDataDto: ContactMastData) => void;
}

const ContactListSearch: React.FC<ContactListSearchProps> = ({ open, onClose, onSelect }) => {
  const contactListService = useMemo(() => createEntityService<ContactMastData>("ContactList", "hospitalAdministrations"), []);
  const fetchItems = useCallback(async () => {
    try {
      const result: any = await contactListService.getAll();
      console.log(result);
      return result.success ? result.data : [];
    } catch (error) {
      console.error("Error fetching User:", error);
      showAlert("Error", "Failed to User.", "error");
      return [];
    }
  }, [contactListService]);

  const updateActiveStatus = useCallback(
    async (id: number, status: boolean) => {
      try {
        const result = await contactListService.updateActiveStatus(id, status);
        if (result) {
          showAlert("Success", "Status updated successfully.", "success");
        }
        return result.success;
      } catch (error) {
        console.error("Error updating User active status:", error);
        showAlert("Error", "Failed to update user status.", "error");
        return false;
      }
    },
    [contactListService]
  );

  const getItemId = (item: ContactMastData) => item.conID;
  const getItemActiveStatus = (item: ContactMastData) => item.rActiveYN === "Y";
  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "conFName", header: "Name", visible: true },
    { key: "conEmpYN", header: "Employee", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="CONTACT LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Search User"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default ContactListSearch;
