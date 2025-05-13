import React, { useState, useCallback } from "react";
import { ContactService } from "@/services/HospitalAdministrationServices/ContactListService/ContactService";
import { ContactMastData } from "@/interfaces/HospitalAdministration/ContactListData";
import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { Column } from "@/components/CustomGrid/CustomGrid";
import { showAlert } from "@/utils/Common/showAlert";

interface ContactListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: ContactMastData) => void;
}

const ContactListSearch: React.FC<ContactListSearchProps> = ({ open, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const contactService = new ContactService();

  const fetchContacts = useCallback(async () => {
    try {
      const result = await contactService.searchContactList(
        searchTerm, // name
        "", // conCode
        "", // conCat
        "", // phoneNumber
        undefined, // fromDate
        undefined, // toDate
        1, // pageIndex
        100 // pageSize
      );

      if (result.success && result.data) {
        return result.data.items || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
  }, [searchTerm]);

  const updateActiveStatus = useCallback(async (id: number, status: boolean) => {
    try {
      const result = await contactService.updateActiveStatus(id, status);
      if (result) {
        showAlert("Success", "Status updated successfully.", "success");
      }
      return result.success;
    } catch (error) {
      console.error("Error updating status:", error);
      return false;
    }
  }, []);

  const columns: Column<ContactMastData>[] = [
    {
      key: "conCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
    },
    {
      key: "conTitle",
      header: "Title",
      visible: true,
      sortable: true,
    },
    {
      key: "conFName",
      header: "First Name",
      visible: true,
      sortable: true,
      filterable: true,
    },
    {
      key: "conLName",
      header: "Last Name",
      visible: true,
      sortable: true,
    },
    {
      key: "conGender",
      header: "Gender",
      visible: true,
      sortable: true,
    },
    {
      key: "conCat",
      header: "Category",
      visible: true,
      sortable: true,
    },
    {
      key: "deptName",
      header: "Department",
      visible: true,
      sortable: true,
    },
    {
      key: "aPhyRoomName",
      header: "Room",
      visible: true,
      sortable: true,
    },
  ];

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const customFilter = useCallback((item: ContactMastData, searchValue: string) => {
    const searchLower = searchValue.toLowerCase();
    return (
      item.conCode?.toLowerCase().includes(searchLower) ||
      false ||
      item.conFName?.toLowerCase().includes(searchLower) ||
      false ||
      item.conLName?.toLowerCase().includes(searchLower) ||
      false ||
      item.conTitle?.toLowerCase().includes(searchLower) ||
      false ||
      item.deptName?.toLowerCase().includes(searchLower) ||
      false
    );
  }, []);

  return (
    <GenericAdvanceSearch<ContactMastData>
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Contact List Search"
      fetchItems={fetchContacts}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={(item) => item.conID}
      getItemActiveStatus={(item) => item.rActiveYN === "Y"}
      searchPlaceholder="Search by name, code, department..."
      onSearch={handleSearch}
      dialogProps={{
        maxWidth: "lg",
        fullWidth: true,
        dialogContentSx: { minHeight: "600px" },
      }}
      isEditButtonVisible={true}
      isStatusVisible={true}
      isActionVisible={true}
      showExportCSV={true}
      showExportPDF={true}
      pagination={true}
      customFilter={customFilter}
    />
  );
};

export default ContactListSearch;
