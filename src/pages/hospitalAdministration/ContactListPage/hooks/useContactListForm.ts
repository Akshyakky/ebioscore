import { useState, useCallback } from "react";
import { useLoading } from "@/hooks/Common/useLoading";
import { ContactService } from "@/services/HospitalAdministrationServices/ContactListService/ContactService";
import { ContactListService } from "@/services/HospitalAdministrationServices/ContactListService/ContactListService";
import { ContactListData, ContactMastData } from "@/interfaces/HospitalAdministration/ContactListData";
import { OperationResult, PaginatedList } from "@/services/GenericEntityService/GenericEntityService";

const contactService = new ContactService();

export const useContactList = () => {
  const [contactList, setContactList] = useState<ContactMastData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setLoading } = useLoading();

  const fetchContactList = useCallback(
    async (name?: string, conCode?: string, conCat?: string, phoneNumber?: string, fromDate?: Date, toDate?: Date, pageIndex: number = 1, pageSize: number = 100) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await contactService.searchContactList(name, conCode, conCat, phoneNumber, fromDate, toDate, pageIndex, pageSize);

        if (response.success && response.data) {
          setContactList(response.data.items || []);
        } else {
          setError(response.errorMessage || "Failed to fetch contact list");
          setContactList([]);
        }
      } catch (err) {
        console.error("Error fetching contact list:", err);
        setError("Failed to fetch contact list");
        setContactList([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getContactById = useCallback(
    async (conID: number): Promise<ContactListData | null> => {
      try {
        setLoading(true);
        const response = await ContactListService.fetchContactDetails(conID);

        if (response) {
          return response;
        } else {
          throw new Error("Failed to fetch contact details");
        }
      } catch (err) {
        console.error("Error fetching contact by ID:", err);
        setError("Failed to fetch contact details");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const saveContact = useCallback(
    async (contactData: ContactListData): Promise<OperationResult<ContactListData>> => {
      try {
        setLoading(true);
        const response = await contactService.saveContactList(contactData);

        if (response.success) {
          // Refresh the list after successful save
          await fetchContactList();
        }

        return response;
      } catch (err) {
        console.error("Error saving contact:", err);
        return {
          success: false,
          errorMessage: "Failed to save contact",
          data: null,
        };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, fetchContactList]
  );

  const deleteContact = useCallback(
    async (conID: number): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await contactService.delete(conID);

        if (response.success) {
          // Refresh the list after successful delete
          await fetchContactList();
          return true;
        } else {
          setError(response.errorMessage || "Failed to delete contact");
          return false;
        }
      } catch (err) {
        console.error("Error deleting contact:", err);
        setError("Failed to delete contact");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, fetchContactList]
  );

  //   const updateContactStatus = useCallback(
  //     async (conID: number, status: string): Promise<boolean> => {
  //       try {
  //         setLoading(true);
  //         const response = await contactService.updateStatus(conID, status);

  //         if (response.success) {
  //           // Refresh the list after successful update
  //           await fetchContactList();
  //           return true;
  //         } else {
  //           setError(response.errorMessage || "Failed to update contact status");
  //           return false;
  //         }
  //       } catch (err) {
  //         console.error("Error updating contact status:", err);
  //         setError("Failed to update contact status");
  //         return false;
  //       } finally {
  //         setLoading(false);
  //       }
  //     },
  //     [setLoading, fetchContactList]
  //   );

  const generateContactCode = useCallback(async (prefix: string, padLength: number = 5): Promise<string | null> => {
    try {
      const response = await ContactListService.generateContactCode(prefix, padLength);

      if (response && typeof response === "string") {
        return response;
      } else if (response && "success" in response && response.success && "data" in response) {
        return response.data as string;
      } else {
        return null;
      }
    } catch (err) {
      console.error("Error generating contact code:", err);
      return null;
    }
  }, []);

  const searchContacts = useCallback(async (searchTerm: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ContactListService.searchContactListDetails(searchTerm);

      if (response.success && response.data) {
        setContactList(response.data);
      } else {
        setContactList([]);
      }
    } catch (err) {
      console.error("Error searching contacts:", err);
      setError("Failed to search contacts");
      setContactList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    contactList,
    isLoading,
    error,
    fetchContactList,
    getContactById,
    saveContact,
    deleteContact,
    // updateContactStatus,
    generateContactCode,
    searchContacts,
  };
};
