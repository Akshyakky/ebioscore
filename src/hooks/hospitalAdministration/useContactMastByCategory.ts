import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { ContactMastDto } from "@/interfaces/HospitalAdministration/ContactListData";
import { useAlert } from "@/providers/AlertProvider";
import { contactMastService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { useCallback, useEffect, useState } from "react";

interface useContactMastByCategoryOptions {
  consValue: string;
  cacheDuration?: number;
  showErrorAlerts?: boolean;
  autoFetch?: boolean;
}

const DEFAULT_OPTIONS: useContactMastByCategoryOptions = {
  consValue: "",
  cacheDuration: 15 * 60 * 1000,
  showErrorAlerts: true,
  autoFetch: true,
};

/**
 * Custom hook to fetch filtered contactMast dropdown values based on consValue
 */
const useContactMastByCategory = (options: useContactMastByCategoryOptions) => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const userInfo = useAppSelector((state: RootState) => state.auth);
  const compID = userInfo.compID!;

  const [state, setState] = useState<{
    data: DropdownOption[];
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
  }>({
    data: [],
    isLoading: false,
    error: null,
    lastFetched: null,
  });

  const { showAlert } = useAlert();

  const isDataStale = useCallback(() => {
    if (!state.lastFetched) return true;
    return Date.now() - state.lastFetched > mergedOptions.cacheDuration!;
  }, [state.lastFetched, mergedOptions.cacheDuration]);

  const fetchContacts = useCallback(async () => {
    if (!compID || !mergedOptions.consValue) return;
    if (state.isLoading) return;
    if (!isDataStale() && state.data.length > 0) return;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await contactMastService.getAll();

      let formattedData: DropdownOption[] = [];
      if (response.success && response.data) {
        formattedData = response.data
          .filter((contact) => contact.consValue === mergedOptions.consValue)
          .map((item: ContactMastDto) => ({
            value: (item.conID || 0).toString(),
            label: `${item.conFName} ${item.conLName}` || "",
            ...item,
          }));
      }

      setState({
        data: formattedData,
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
      });
    } catch (error) {
      console.error(`Error fetching contacts for consValue ${mergedOptions.consValue}:`, error);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: prev.data,
      }));

      if (mergedOptions.showErrorAlerts) {
        showAlert("Error", `Failed to load contacts for ${mergedOptions.consValue}. Please try again.`, "error");
      }
    }
  }, [compID, mergedOptions.consValue, mergedOptions.showErrorAlerts, isDataStale]);

  useEffect(() => {
    if (mergedOptions.autoFetch && compID && mergedOptions.consValue) {
      fetchContacts();
    }
  }, [fetchContacts, compID, mergedOptions.autoFetch, mergedOptions.consValue]);

  const refreshContacts = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts: state.data,
    isLoading: state.isLoading,
    hasError: !!state.error,
    error: state.error,
    isStale: isDataStale(),
    refreshContacts,
    getStatus: () => ({
      isLoading: state.isLoading,
      hasError: !!state.error,
      error: state.error,
      lastFetched: state.lastFetched,
      dataCount: state.data.length,
    }),
  };
};

export default useContactMastByCategory;
