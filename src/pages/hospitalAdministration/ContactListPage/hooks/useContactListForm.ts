import { useLoading } from "@/hooks/Common/useLoading";
import { ContactListData, ContactMastData } from "@/interfaces/HospitalAdministration/ContactListData";
import { OperationResult } from "@/services/GenericEntityService/GenericEntityService";
import { ContactListService } from "@/services/HospitalAdministrationServices/ContactListService/ContactListService";
import { ContactService } from "@/services/HospitalAdministrationServices/ContactListService/ContactService";
import { useCallback, useState } from "react";

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
        setError("Failed to fetch contact list");
        setContactList([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getContactById = useCallback(async (conID: number): Promise<ContactListData | null> => {
    try {
      setLoading(true);
      const response = await ContactListService.fetchContactDetails(conID);
      if (response) {
        return response;
      } else {
        throw new Error("Failed to fetch contact details");
      }
    } catch (err) {
      setError("Failed to fetch contact details");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveContact = useCallback(
    async (contactData: ContactListData): Promise<OperationResult<ContactListData>> => {
      try {
        setLoading(true);
        const response = await contactService.saveContactList(contactData);
        if (response.success) {
          await fetchContactList();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          errorMessage: "Failed to save contact",
          data: {} as ContactListData,
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchContactList]
  );

  const deleteContact = useCallback(
    async (conID: number): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await contactService.delete(conID);
        if (response.success) {
          await fetchContactList();
          return true;
        } else {
          setError(response.errorMessage || "Failed to delete contact");
          return false;
        }
      } catch (err) {
        setError("Failed to delete contact");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchContactList]
  );

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
    generateContactCode,
    searchContacts,
  };
};
