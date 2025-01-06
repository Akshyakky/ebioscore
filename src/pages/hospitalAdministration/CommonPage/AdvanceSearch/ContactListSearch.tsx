import React, { useContext, useCallback, useEffect, useState } from "react";
import { ContactListSearchContext } from "../../../../context/hospitalAdministration/ContactListSearchContext";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { debounce } from "../../../../utils/Common/debounceUtils";
import { ContactListSearchResult } from "@/interfaces/HospitalAdministration/ContactListData";

interface ContactListSearchProps {
  open: boolean;
  onClose: () => void;
  onEditContactList: (conID: number) => void;
}

const ContactListSearch: React.FC<ContactListSearchProps> = ({ open, onClose, onEditContactList }) => {
  const { performSearch, searchResults } = useContext(ContactListSearchContext);
  const [isInitialSearchDone, setIsInitialSearchDone] = useState(false);

  useEffect(() => {
    if (!isInitialSearchDone) {
      performSearch("");
      setIsInitialSearchDone(true);
    }
  }, [isInitialSearchDone]);

  const fetchItems = useCallback(async () => {
    await performSearch("");
    setIsInitialSearchDone(true);
    return searchResults;
  }, [searchResults]);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      performSearch(searchQuery);
    }, 500),
    [performSearch]
  );

  const handleSelect = (item: ContactListSearchResult) => {
    onEditContactList(item.conID);
    onClose();
  };

  const columns = [
    { key: "conName", header: "Name", visible: true },
    { key: "deptName", header: "Department", visible: true },
    { key: "conEmpYN", header: "Employee", visible: true },
    { key: "rActive", header: "Record Status", visible: true },
  ];

  return (
    <GenericAdvanceSearch<ContactListSearchResult>
      open={open}
      onClose={onClose}
      onSelect={handleSelect}
      title="Contact List Search"
      fetchItems={fetchItems}
      updateActiveStatus={() => Promise.resolve(true)}
      columns={columns}
      getItemId={(item) => item.conID}
      getItemActiveStatus={() => true}
      searchPlaceholder="Enter name or mobile number"
      onSearch={debouncedSearch}
      isEditButtonVisible={true}
      isActionVisible={true}
    />
  );
};

export default ContactListSearch;
